import { BaseService, ServiceResponse } from './base/BaseService';
import { supabase } from '../config/supabase';
import type { Habit, HabitCheckIn } from '../store/habitStore';

export interface CreateHabitPayload {
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
  habitId: string;
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
  
  // Get all habits for a group
  async getGroupHabits(groupId: string): Promise<ServiceResponse<Habit[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          profiles:created_by (
            id,
            username,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });
      
      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  // Get user's habits across all groups
  async getUserHabits(userId: string): Promise<ServiceResponse<Habit[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          groups!inner (
            id,
            name,
            group_members!inner (
              user_id
            )
          )
        `)
        .eq('groups.group_members.user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  // Create a new habit
  async createHabit(payload: CreateHabitPayload): Promise<ServiceResponse<Habit>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const habitData = {
        ...payload,
        created_by: userData.user.id,
        is_active: true,
        group_id: payload.groupId,
      };
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(habitData)
        .select()
        .single();
      
      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  // Update a habit
  async updateHabit(
    habitId: string,
    payload: UpdateHabitPayload
  ): Promise<ServiceResponse<Habit>> {
    return this.update(habitId, payload);
  }
  
  // Archive/deactivate a habit
  async archiveHabit(habitId: string): Promise<ServiceResponse<Habit>> {
    return this.update(habitId, { is_active: false });
  }
  
  // Check in for a habit
  async checkIn(payload: CheckInPayload): Promise<ServiceResponse<HabitCheckIn>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const checkInData = {
        habit_id: payload.habitId,
        user_id: userData.user.id,
        completed_at: payload.completedAt || new Date().toISOString(),
        note: payload.note,
      };
      
      const { data, error } = await supabase
        .from('habit_check_ins')
        .insert(checkInData)
        .select()
        .single();
      
      return this.createResponse(data, error);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }
  
  // Get check-ins for a habit
  async getCheckIns(
    habitId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ServiceResponse<HabitCheckIn[]>> {
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
      return this.createResponse(null, error);
    }
  }
  
  // Get user's check-ins for today
  async getTodayCheckIns(userId: string): Promise<ServiceResponse<HabitCheckIn[]>> {
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
      return this.createResponse(null, error);
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
        return this.createResponse(null, error);
      }
      
      if (!checkIns || checkIns.length === 0) {
        return this.createResponse({
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
      
      return this.createResponse({
        habitId,
        totalCheckIns: checkIns.length,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        completionRate: Math.round(completionRate),
        lastCheckIn: checkIns[checkIns.length - 1]?.completed_at,
      }, null);
    } catch (error) {
      return this.createResponse(null, error);
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