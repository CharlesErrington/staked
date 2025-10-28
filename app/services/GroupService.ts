import { BaseService, ServiceResponse } from './base/BaseService';
import { supabase } from '../config/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  currency_code: string;
  max_members: number;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  settings: {
    auto_archive_days: number;
    allow_late_checkins: boolean;
    notification_settings: Record<string, any>;
  };
  // Optional enriched properties from queries/aggregations
  is_admin?: boolean;
  member_count?: number;
  total_habits?: number;
  active_habits?: number;
  next_checkin?: string;
  completion_rate?: number;
  invite_code?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  is_active: boolean;
  joined_at: string;
  left_at?: string;
  balance: number;
  metadata?: Record<string, any>;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  invited_email?: string;
  invited_user_id?: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
  invitation_code: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  currency_code?: string;
  max_members?: number;
  settings?: Partial<Group['settings']>;
}

export interface GroupStats {
  total_members: number;
  active_members: number;
  total_habits: number;
  active_habits: number;
  total_debt: number;
  completion_rate: number;
}

class GroupService extends BaseService {
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  
  constructor() {
    super('groups');
  }
  
  // Create a new group
  async createGroup(payload: CreateGroupPayload): Promise<ServiceResponse<Group>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      // Start a transaction
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          ...payload,
          created_by: userData.user.id,
          currency_code: payload.currency_code || 'USD',
          max_members: payload.max_members || 10,
        })
        .select()
        .single();
      
      if (groupError) {
        return this.createResponse<Group>(null, groupError);
      }

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: userData.user.id,
          role: 'owner',
          is_active: true,
        });

      if (memberError) {
        // Rollback group creation
        await supabase.from('groups').delete().eq('id', group.id);
        return this.createResponse<Group>(null, memberError);
      }

      // Generate permanent invite code for the group
      // Database trigger will auto-generate invitation_code
      const { data: invitation, error: inviteError } = await supabase
        .from('group_invitations')
        .insert({
          group_id: group.id,
          invited_by: userData.user.id,
        })
        .select('invitation_code')
        .single();

      if (inviteError) {
        console.warn('Failed to generate invite code:', inviteError);
      }

      return this.createResponse({
        ...group,
        invite_code: invitation?.invitation_code,
      }, null);
    } catch (error) {
      return this.createResponse<Group>(null, error as Error);
    }
  }
  
  // Get user's groups
  async getUserGroups(userId: string): Promise<ServiceResponse<Group[]>> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(
            user_id,
            is_active
          )
        `)
        .eq('group_members.user_id', userId)
        .eq('group_members.is_active', true)
        .eq('is_active', true)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });


      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse<Group[]>(null, error as Error);
    }
  }

  // Get single group by ID with enriched data
  async getGroupById(id: string): Promise<ServiceResponse<Group>> {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return this.createResponse<Group>(null, new Error('User not authenticated'));
      }

      // Get group details
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError || !group) {
        return this.createResponse<Group>(null, groupError || new Error('Group not found'));
      }

      // Check if user is a member and get their role
      const { data: membership } = await supabase
        .from('group_members')
        .select('role, is_active')
        .eq('group_id', id)
        .eq('user_id', userData.user.id)
        .eq('is_active', true)
        .single();

      // Get member count
      const { count: memberCount } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', id)
        .eq('is_active', true);

      // Get habit stats
      const { data: habits } = await supabase
        .from('habits')
        .select('id, is_active')
        .eq('group_id', id);

      const totalHabits = habits?.length || 0;
      const activeHabits = habits?.filter(h => h.is_active).length || 0;

      // Get permanent invite code (for admins)
      let inviteCode: string | undefined;
      if (membership?.role === 'owner' || membership?.role === 'admin') {
        const { data: invitation } = await supabase
          .from('group_invitations')
          .select('invitation_code')
          .eq('group_id', id)
          .is('invited_email', null)
          .eq('status', 'pending')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        inviteCode = invitation?.invitation_code;
      }

      // Enrich group with computed properties
      const enrichedGroup: Group = {
        ...group,
        is_admin: membership?.role === 'owner' || membership?.role === 'admin',
        member_count: memberCount || 0,
        total_habits: totalHabits,
        active_habits: activeHabits,
        invite_code: inviteCode,
      };

      return this.createResponse(enrichedGroup, null);
    } catch (error) {
      return this.createResponse<Group>(null, error as Error);
    }
  }

  // Get group details with members
  async getGroupWithMembers(groupId: string): Promise<ServiceResponse<{
    group: Group;
    members: GroupMember[];
  }>> {
    try {
      // Get group details
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();


      if (groupError) {
        return this.createResponse<{ group: Group; members: GroupMember[] }>(null, groupError);
      }

      // Get members
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select(`
          *,
          users!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (membersError) {
        return this.createResponse<{ group: Group; members: GroupMember[] }>(null, membersError);
      }

      return this.createResponse({ group, members }, null);
    } catch (error) {
      return this.createResponse<{ group: Group; members: GroupMember[] }>(null, error as Error);
    }
  }
  
  // Join a group
  async joinGroup(groupId: string, userId: string): Promise<ServiceResponse<GroupMember>> {
    try {
      // Check if group exists and is active
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .eq('is_active', true)
        .single();


      if (groupError || !group) {
        return this.createResponse<GroupMember>(null, new Error('Group not found or inactive'));
      }

      // Check member count
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (count && count >= group.max_members) {
        return this.createResponse<GroupMember>(null, new Error('Group is full'));
      }

      // Add member
      const { data, error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member',
          is_active: true,
        })
        .select()
        .single();

      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse<GroupMember>(null, error as Error);
    }
  }
  
  // Leave a group
  async leaveGroup(groupId: string, userId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('group_members')
        .update({
          is_active: false,
          left_at: new Date().toISOString(),
        })
        .eq('group_id', groupId)
        .eq('user_id', userId);
      
      return this.createResponse(null, error);
    } catch (error) {
      return this.createResponse<void>(null, error as Error);
    }
  }

  // Update group settings
  async updateGroupSettings(
    groupId: string,
    updates: Partial<Group>
  ): Promise<ServiceResponse<Group>> {
    return this.update(groupId, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  }
  
  // Archive a group
  async archiveGroup(groupId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          is_archived: true,
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', groupId);
      
      return this.createResponse(null, error);
    } catch (error) {
      return this.createResponse<void>(null, error as Error);
    }
  }

  // Invite user to group by email
  async inviteToGroup(
    groupId: string,
    email: string,
    invitedBy: string
  ): Promise<ServiceResponse<GroupInvitation>> {
    try {
      // Database trigger will auto-generate invitation_code
      const { data, error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: groupId,
          invited_email: email,
          invited_by: invitedBy,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return this.createResponse<GroupInvitation>(null, error);
      }

      // TODO: Send invitation email with code: data.invitation_code

      return this.createResponse(data, null);
    } catch (error) {
      return this.createResponse<GroupInvitation>(null, error as Error);
    }
  }

  // Accept invitation by code
  async acceptInvitation(
    code: string,
    userId: string
  ): Promise<ServiceResponse<GroupMember>> {
    try {
      // Find invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('invitation_code', code)
        .eq('status', 'pending')
        .single();


      if (inviteError || !invitation) {
        return this.createResponse<GroupMember>(null, new Error('Invalid or expired invitation'));
      }

      // Check expiry
      if (new Date(invitation.expires_at) < new Date()) {
        await supabase
          .from('group_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id);

        return this.createResponse<GroupMember>(null, new Error('Invitation has expired'));
      }

      // Join group
      const joinResult = await this.joinGroup(invitation.group_id, userId);

      if (joinResult.error) {
        return joinResult;
      }

      // Update invitation status
      await supabase
        .from('group_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      return joinResult;
    } catch (error) {
      return this.createResponse<GroupMember>(null, error as Error);
    }
  }
  
  // Get group statistics
  async getGroupStats(groupId: string): Promise<ServiceResponse<GroupStats>> {
    try {
      // Get member stats
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);

      if (membersError) {
        return this.createResponse<GroupStats>(null, membersError);
      }

      const totalMembers = members.length;
      const activeMembers = members.filter(m => m.is_active).length;

      // Get habit stats
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('group_id', groupId);

      if (habitsError) {
        return this.createResponse<GroupStats>(null, habitsError);
      }

      const totalHabits = habits.length;
      const activeHabits = habits.filter(h => h.is_active).length;

      // Get debt stats
      const { data: debts, error: debtsError } = await supabase
        .from('debts')
        .select('amount')
        .eq('group_id', groupId)
        .eq('is_settled', false);

      if (debtsError) {
        return this.createResponse<GroupStats>(null, debtsError);
      }

      const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);

      // Calculate completion rate (simplified)
      // TODO: Implement proper completion rate calculation
      const completionRate = 0;

      return this.createResponse({
        total_members: totalMembers,
        active_members: activeMembers,
        total_habits: totalHabits,
        active_habits: activeHabits,
        total_debt: totalDebt,
        completion_rate: completionRate,
      }, null);
    } catch (error) {
      return this.createResponse<GroupStats>(null, error as Error);
    }
  }
  
  // Subscribe to group updates (real-time)
  subscribeToGroup(
    groupId: string,
    callbacks: {
      onMemberChange?: (payload: any) => void;
      onHabitChange?: (payload: any) => void;
      onDebtChange?: (payload: any) => void;
      onGroupUpdate?: (payload: any) => void;
    }
  ): RealtimeChannel {
    // Unsubscribe from existing subscription if any
    this.unsubscribeFromGroup(groupId);
    
    const channel = supabase
      .channel(`group:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
          filter: `group_id=eq.${groupId}`,
        },
        callbacks.onMemberChange || (() => {})
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habits',
          filter: `group_id=eq.${groupId}`,
        },
        callbacks.onHabitChange || (() => {})
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debts',
          filter: `group_id=eq.${groupId}`,
        },
        callbacks.onDebtChange || (() => {})
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'groups',
          filter: `id=eq.${groupId}`,
        },
        callbacks.onGroupUpdate || (() => {})
      )
      .subscribe();
    
    this.subscriptions.set(groupId, channel);
    return channel;
  }
  
  // Unsubscribe from group updates
  unsubscribeFromGroup(groupId: string): void {
    const channel = this.subscriptions.get(groupId);
    if (channel) {
      channel.unsubscribe();
      this.subscriptions.delete(groupId);
    }
  }
  
  // Unsubscribe from all groups
  unsubscribeFromAll(): void {
    this.subscriptions.forEach(channel => channel.unsubscribe());
    this.subscriptions.clear();
  }
}

// Export singleton instance
export const groupService = new GroupService();