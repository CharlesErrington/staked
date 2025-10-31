import { BaseService, ServiceResponse } from "./base/BaseService";
import { supabase } from "../config/supabase";

export interface ActivityLog {
  id: string;
  group_id: string;
  user_id: string;
  action_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  // Enriched from join
  user?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface GroupedActivity {
  date: string; // YYYY-MM-DD format
  activities: ActivityLog[];
}

class ActivityService extends BaseService {
  constructor() {
    super("activity_logs");
  }

  // Get activity logs for a group with pagination
  async getGroupActivity(
    groupId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ServiceResponse<ActivityLog[]>> {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select(
          `
          *,
          user:users(
            id,
            username,
            full_name,
            avatar_url
          )
        `
        )
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return this.createResponse<ActivityLog[]>(null, error);
      }

      return this.createResponse(data, null);
    } catch (error) {
      return this.createResponse<ActivityLog[]>(null, error as Error);
    }
  }

  // Get activity logs grouped by date
  async getGroupActivityGrouped(
    groupId: string,
    limit: number = 50
  ): Promise<ServiceResponse<GroupedActivity[]>> {
    try {
      const { data, error } = await this.getGroupActivity(groupId, limit, 0);

      if (error || !data) {
        return this.createResponse<GroupedActivity[]>(null, error);
      }

      // Group activities by date
      const grouped = new Map<string, ActivityLog[]>();

      data.forEach((activity) => {
        const date = activity.created_at.split("T")[0]; // Extract YYYY-MM-DD
        if (!grouped.has(date)) {
          grouped.set(date, []);
        }
        grouped.get(date)!.push(activity);
      });

      // Convert to array and sort by date descending
      const result: GroupedActivity[] = Array.from(grouped.entries())
        .map(([date, activities]) => ({ date, activities }))
        .sort((a, b) => b.date.localeCompare(a.date));

      return this.createResponse(result, null);
    } catch (error) {
      return this.createResponse<GroupedActivity[]>(null, error as Error);
    }
  }

  // Log an activity (for future use - can be called from triggers or app code)
  async logActivity(
    groupId: string,
    userId: string,
    actionType: string,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<ServiceResponse<ActivityLog>> {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .insert({
          group_id: groupId,
          user_id: userId,
          action_type: actionType,
          description,
          metadata,
        })
        .select()
        .single();

      if (error) {
        return this.createResponse<ActivityLog>(null, error);
      }

      return this.createResponse(data, null);
    } catch (error) {
      return this.createResponse<ActivityLog>(null, error as Error);
    }
  }
}

// Export singleton instance
export const activityService = new ActivityService();
