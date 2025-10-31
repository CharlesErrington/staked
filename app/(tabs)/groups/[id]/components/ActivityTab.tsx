import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { activityService } from "../../../../services/ActivityService";
import type { GroupedActivity } from "../../../../services/ActivityService";

interface ActivityTabProps {
  groupId: string;
}

export default function ActivityTab({ groupId }: ActivityTabProps) {
  const [groupedActivities, setGroupedActivities] = useState<GroupedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [groupId]);

  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await activityService.getGroupActivityGrouped(groupId, 50);

    if (data && !error) {
      setGroupedActivities(data);
    } else {
      console.error('Failed to fetch activities:', error);
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Format as "Nov 25th"
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const suffix = getDaySuffix(day);

    return `${month} ${day}${suffix}`;
  };

  const getDaySuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getActivityIcon = (actionType: string): string => {
    switch (actionType) {
      case 'member_joined': return '👋';
      case 'member_left': return '👋';
      case 'habit_created': return '📝';
      case 'habit_completed': return '✅';
      case 'habit_missed': return '❌';
      case 'habit_skipped': return '⏭️';
      case 'debt_created': return '💰';
      case 'debt_settled': return '💸';
      case 'group_updated': return '⚙️';
      default: return '📌';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color="#90B2AC" />
      </View>
    );
  }

  if (groupedActivities.length === 0) {
    return (
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-1 items-center justify-center py-12">
          <Text className="text-text-secondary text-center">
            No activity yet.{'\n'}Start tracking habits to see activity here!
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {groupedActivities.map((group) => (
        <View key={group.date} className="mb-6">
          {/* Date Header */}
          <View className="mb-3 mt-4">
            <Text className="text-sm font-bold text-text-primary uppercase">
              {formatDate(group.date)}
            </Text>
          </View>

          {/* Activities for this date */}
          <View className="space-y-3">
            {group.activities.map((activity) => (
              <View
                key={activity.id}
                className="flex-row items-start py-3 px-4 bg-white rounded-lg border border-gray-100"
              >
                {/* Icon */}
                <Text className="text-2xl mr-3">
                  {getActivityIcon(activity.action_type)}
                </Text>

                {/* Content */}
                <View className="flex-1">
                  <Text className="text-sm text-text-primary">
                    <Text className="font-semibold">
                      {activity.user?.username || 'Someone'}
                    </Text>
                    {': '}
                    <Text>{activity.description}</Text>
                  </Text>
                  <Text className="text-xs text-text-secondary mt-1">
                    {formatTime(activity.created_at)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Load More Placeholder */}
      {groupedActivities.length >= 20 && (
        <View className="py-4 items-center">
          <Text className="text-text-secondary text-sm">
            Pull to refresh for more activity
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
