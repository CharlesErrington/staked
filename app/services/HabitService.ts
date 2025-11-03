import { BaseService, ServiceResponse } from './base/BaseService';
import { supabase } from '../config/supabase';
import type { Habit as HabitStore, HabitCheckIn as HabitCheckInStore } from '../store/habitStore';

// Re-export types from store for convenience
export type { Habit, HabitCheckIn } from '../store/habitStore';

// Habit Template type (reusable habit definition)
export interface HabitTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  deadline_time: string; // HH:MM:SS format
  deadline_day?: number; // 0-6, only for weekly (0=Sunday, 6=Saturday)
  proof_required: boolean;
  created_at: string;
  updated_at: string;
}

// Database-aligned habit type (uses snake_case for DB fields)
export interface HabitDB {
  id: string;
  habit_template_id?: string;
  name?: string; // Will be deprecated, use template
  description?: string; // Will be deprecated, use template
  frequency?: 'daily' | 'weekly' | 'custom'; // Will be deprecated, use template
  target_count?: number;
  group_id: string;
  user_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  stake_amount: number;
  skips_allowed: number;
  color?: string;
  icon?: string;
  // Joined template data
  habit_templates?: HabitTemplate;
}

// Database-aligned check-in type (uses snake_case for DB fields)
export interface HabitCheckInDB {
  id: string;
  habit_id: string;
  user_id: string;
  check_in_date: string; // YYYY-MM-DD format
  status: 'pending' | 'completed' | 'missed' | 'excused';
  created_at: string;
  note?: string;
}

export interface CreateHabitTemplatePayload {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  deadline_time: string; // HH:MM:SS
  deadline_day?: number; // 0-6 for weekly
  proof_required: boolean;
}

export interface CreateHabitPayload {
  habit_template_id: string;
  group_id: string;
  stake_amount: number;
  skips_allowed: number;
}

// Legacy payload (for backward compatibility)
export interface CreateHabitPayloadLegacy {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetCount: number;
  groupId: string;
  color?: string;
  icon?: string;
  customSchedule?: {
    daysOfWeek?: number[];
    datesOfMonth?: number[];
  };
}

export interface UpdateHabitPayload extends Partial<CreateHabitPayload> {
  isActive?: boolean;
}

export interface CheckInPayload {
  habitId?: string;
  habit_id?: string;
  userId?: string;
  user_id?: string;
  check_in_date?: string;
  status?: 'completed' | 'missed' | 'excused';
  note?: string;
  completedAt?: string;
}

export interface HabitStats {
  habitId: string;
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  lastCheckIn?: string;
}

export class HabitService extends BaseService {
  constructor() {
    super('habits');
  }

  // ===== HABIT TEMPLATE METHODS =====

  // Create a new habit template
  async createHabitTemplate(payload: CreateHabitTemplatePayload): Promise<ServiceResponse<HabitTemplate>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const templateData = {
        ...payload,
        user_id: userData.user.id,
      };

      const { data, error } = await supabase
        .from('habit_templates')
        .insert(templateData)
        .select()
        .single();

      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse<HabitTemplate>(null, error as Error);
    }
  }

  // Get all habit templates for the current user
  async getUserHabitTemplates(): Promise<ServiceResponse<HabitTemplate[]>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('habit_templates')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse<HabitTemplate[]>(null, error as Error);
    }
  }

  // Get a single habit template by ID
  async getHabitTemplateById(templateId: string): Promise<ServiceResponse<HabitTemplate>> {
    try {
      const { data, error } = await supabase
        .from('habit_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse<HabitTemplate>(null, error as Error);
    }
  }

  // Update a habit template
  async updateHabitTemplate(
    templateId: string,
    payload: Partial<CreateHabitTemplatePayload>
  ): Promise<ServiceResponse<HabitTemplate>> {
    try {
      const { data, error } = await supabase
        .from('habit_templates')
        .update(payload)
        .eq('id', templateId)
        .select()
        .single();

      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse<HabitTemplate>(null, error as Error);
    }
  }

  // Delete a habit template
  async deleteHabitTemplate(templateId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('habit_templates')
        .delete()
        .eq('id', templateId);

      return this.createResponse(null, error);
    } catch (error) {
      return this.createResponse<void>(null, error as Error);
    }
  }

  // ===== HABIT METHODS (Updated for templates) =====

  // Get all habits for a group
  async getGroupHabits(groupId: string): Promise<ServiceResponse<HabitDB[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          habit_templates (*)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse<HabitDB[]>(null, error as Error);
    }
  }
  
  // Get user's habits across all groups
  async getUserHabits(userId: string): Promise<ServiceResponse<HabitDB[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          habit_templates (*),
          groups!inner (
            id,
            name,
            group_members!inner (
              user_id
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse<HabitDB[]>(null, error as Error);
    }
  }

  // Create a new habit from a template
  async createHabit(payload: CreateHabitPayload): Promise<ServiceResponse<HabitDB>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const habitData = {
        habit_template_id: payload.habit_template_id,
        group_id: payload.group_id,
        user_id: userData.user.id,
        stake_amount: payload.stake_amount,
        skips_allowed: payload.skips_allowed,
        is_active: true,
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(habitData)
        .select(`
          *,
          habit_templates (*)
        `)
        .single();

      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse<HabitDB>(null, error as Error);
    }
  }

  // Create habit template and habit in one transaction
  async createHabitWithTemplate(
    templatePayload: CreateHabitTemplatePayload,
    group_id: string,
    stake_amount: number,
    skips_allowed: number
  ): Promise<ServiceResponse<HabitDB>> {
    try {
      // First create the template
      const { data: template, error: templateError } = await this.createHabitTemplate(templatePayload);

      if (templateError || !template) {
        return this.createResponse<HabitDB>(null, templateError);
      }

      // Then create the habit linked to the template
      const habitPayload: CreateHabitPayload = {
        habit_template_id: template.id,
        group_id,
        stake_amount,
        skips_allowed,
      };

      return await this.createHabit(habitPayload);
    } catch (error) {
      return this.createResponse<HabitDB>(null, error as Error);
    }
  }

  // Update a habit
  async updateHabit(
    habitId: string,
    payload: UpdateHabitPayload
  ): Promise<ServiceResponse<HabitDB>> {
    return this.update(habitId, payload);
  }

  // Archive/deactivate a habit
  async archiveHabit(habitId: string): Promise<ServiceResponse<HabitDB>> {
    return this.update(habitId, { is_active: false });
  }
  
  // Check in for a habit
  async checkIn(payload: CheckInPayload): Promise<ServiceResponse<HabitCheckInDB>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Support both camelCase and snake_case field names
      const habitId = payload.habit_id || payload.habitId;
      const userId = payload.user_id || payload.userId || userData.user.id;
      const checkInDate = payload.check_in_date;
      const status = payload.status || 'completed';

      if (!habitId) {
        throw new Error('habitId is required');
      }

      // If we have check_in_date and status, use check_ins table (new format)
      if (checkInDate && status) {
        const checkInData = {
          habit_id: habitId,
          user_id: userId,
          check_in_date: checkInDate,
          status: status,
          note: payload.note,
        };

        // Use upsert to update if already exists for this date
        const { data, error } = await supabase
          .from('check_ins')
          .upsert(checkInData, {
            onConflict: 'habit_id,user_id,check_in_date',
          })
          .select()
          .single();

        return this.createResponse(data, error);
      } else {
        // Legacy format using habit_check_ins table
        const checkInData = {
          habit_id: habitId,
          user_id: userId,
          completed_at: payload.completedAt || new Date().toISOString(),
          note: payload.note,
        };

        const { data, error } = await supabase
          .from('habit_check_ins')
          .insert(checkInData)
          .select()
          .single();

        return this.createResponse(data, error);
      }
    } catch (error) {
      return this.createResponse<HabitCheckInDB>(null, error as Error);
    }
  }

  // Get check-ins for a habit
  async getCheckIns(
    habitId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ServiceResponse<HabitCheckInDB[]>> {
    try {
      let query = supabase
        .from('habit_check_ins')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('habit_id', habitId)
        .order('completed_at', { ascending: false });

      if (startDate) {
        query = query.gte('completed_at', startDate);
      }

      if (endDate) {
        query = query.lte('completed_at', endDate);
      }

      const { data, error } = await query;
      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse<HabitCheckInDB[]>(null, error as Error);
    }
  }

  // Get user's check-ins for today
  async getTodayCheckIns(userId: string): Promise<ServiceResponse<HabitCheckInDB[]>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('habit_check_ins')
        .select(`
          *,
          habits!inner (
            id,
            name,
            color,
            icon,
            group_id
          )
        `)
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString())
        .lt('completed_at', tomorrow.toISOString());

      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse<HabitCheckInDB[]>(null, error as Error);
    }
  }
  
  // Get habit statistics
  async getHabitStats(habitId: string, userId: string): Promise<ServiceResponse<HabitStats>> {
    try {
      // Get all check-ins for the user and habit
      const { data: checkIns, error } = await supabase
        .from('habit_check_ins')
        .select('completed_at')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });
      
      if (error) {
        return this.createResponse<HabitStats>(null, error);
      }

      if (!checkIns || checkIns.length === 0) {
        return this.createResponse<HabitStats>({
          habitId,
          totalCheckIns: 0,
          currentStreak: 0,
          longestStreak: 0,
          completionRate: 0,
        }, null);
      }

      // Calculate streaks
      const streaks = this.calculateStreaks(checkIns.map(c => c.completed_at));

      // Calculate completion rate (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentCheckIns = checkIns.filter(
        c => new Date(c.completed_at) >= thirtyDaysAgo
      );
      const completionRate = (recentCheckIns.length / 30) * 100;

      return this.createResponse<HabitStats>({
        habitId,
        totalCheckIns: checkIns.length,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        completionRate: Math.round(completionRate),
        lastCheckIn: checkIns[checkIns.length - 1]?.completed_at,
      }, null);
    } catch (error) {
      return this.createResponse<HabitStats>(null, error as Error);
    }
  }
  
  // Calculate streaks from check-in dates
  private calculateStreaks(dates: string[]): { current: number; longest: number } {
    if (dates.length === 0) {
      return { current: 0, longest: 0 };
    }
    
    const sortedDates = dates
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());
    
    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const dayDiff = Math.floor(
        (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (dayDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (dayDiff > 1) {
        tempStreak = 1;
      }
    }
    
    // Check if current streak is still active (last check-in was today or yesterday)
    const lastCheckIn = sortedDates[sortedDates.length - 1];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceLastCheckIn = Math.floor(
      (today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastCheckIn > 1) {
      currentStreak = 0;
    } else {
      currentStreak = tempStreak;
    }
    
    return { current: currentStreak, longest: longestStreak };
  }

  // Get check-ins for a user's habits for a specific week
  async getWeekCheckIns(
    userId: string,
    groupId: string,
    weekStart: string, // ISO date string YYYY-MM-DD
    weekEnd: string    // ISO date string YYYY-MM-DD
  ): Promise<ServiceResponse<HabitCheckInDB[]>> {
    try {
      // Get user's habits in the group
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (habitsError || !habits || habits.length === 0) {
        return this.createResponse<HabitCheckInDB[]>([], null);
      }

      const habitIds = habits.map(h => h.id);

      // Get check-ins for those habits within the week
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .in('habit_id', habitIds)
        .gte('check_in_date', weekStart)
        .lte('check_in_date', weekEnd)
        .order('check_in_date', { ascending: true });

      if (error) {
        return this.createResponse<HabitCheckInDB[]>(null, error);
      }

      return this.createResponse(data || [], null);
    } catch (error) {
      return this.createResponse<HabitCheckInDB[]>(null, error as Error);
    }
  }

  // Subscribe to habit updates (real-time)
  subscribeToHabitUpdates(
    groupId: string,
    onUpdate: (payload: any) => void
  ) {
    return supabase
      .channel(`habits:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `group_id=eq.${groupId}`,
        },
        onUpdate
      )
      .subscribe();
  }
}

// Export singleton instance
export const habitService = new HabitService();