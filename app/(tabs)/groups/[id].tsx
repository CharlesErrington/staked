import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { groupService } from "../../services/GroupService";
import type { Group } from "../../services/GroupService";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGroupDetails();
    }
  }, [id]);

  const fetchGroupDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await groupService.getGroupById(id);
      if (data && !error) {
        setGroup(data);
      } else {
        console.error('Failed to fetch group:', error);
        Alert.alert("Error", "Failed to load group details");
        router.back();
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      Alert.alert("Error", "Something went wrong");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInviteCode = async () => {
    if (!group) return;
    
    setGeneratingCode(true);
    try {
      const { data, error } = await groupService.generateInviteCode(group.id);
      if (data && !error) {
        setInviteCode(data.code);
        Alert.alert(
          "Invitation Code Generated",
          `Share this code with friends: ${data.code}`,
          [
            { text: "OK" }
          ]
        );
      } else {
        Alert.alert("Error", "Failed to generate invitation code");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleAddHabit = () => {
    router.push(`/(tabs)/groups/${id}/habits/create`);
  };

  const handleViewMembers = () => {
    router.push(`/(tabs)/groups/${id}/members`);
  };

  const handleViewSettings = () => {
    router.push(`/(tabs)/groups/${id}/settings`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#90B2AC" />
        <Text className="text-text-secondary mt-4">Loading group...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-secondary">Group not found</Text>
        <Button variant="primary" onPress={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-text-primary mb-2">
            {group.name}
          </Text>
          {group.description && (
            <Text className="text-text-secondary">
              {group.description}
            </Text>
          )}
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          <Card className="flex-1 p-3">
            <Text className="text-xs text-text-secondary mb-1">Members</Text>
            <Text className="text-xl font-bold text-text-primary">
              {group.member_count || 0}/{group.max_members}
            </Text>
          </Card>
          <Card className="flex-1 p-3">
            <Text className="text-xs text-text-secondary mb-1">Habits</Text>
            <Text className="text-xl font-bold text-text-primary">
              {group.total_habits || 0}
            </Text>
          </Card>
          <Card className="flex-1 p-3">
            <Text className="text-xs text-text-secondary mb-1">Currency</Text>
            <Text className="text-xl font-bold text-text-primary">
              {group.currency_code}
            </Text>
          </Card>
        </View>

        {/* Admin Actions */}
        {group.is_admin && (
          <Card className="p-4 mb-6">
            <Text className="text-sm font-semibold text-text-primary mb-3">
              Admin Actions
            </Text>
            <View className="gap-2">
              <Button
                variant="secondary"
                size="sm"
                onPress={handleGenerateInviteCode}
                disabled={generatingCode}
              >
                {generatingCode ? "Generating..." : "Generate Invite Code"}
              </Button>
              {inviteCode && (
                <View className="bg-primary-50 p-3 rounded mt-2">
                  <Text className="text-xs text-primary-600 mb-1">
                    Share this code:
                  </Text>
                  <Text className="text-lg font-mono font-bold text-primary-700">
                    {inviteCode}
                  </Text>
                  <Text className="text-xs text-primary-600 mt-1">
                    Valid for 7 days
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <View className="gap-3 mb-6">
          <Button variant="primary" onPress={handleAddHabit}>
            Add Habit
          </Button>
          <Button variant="secondary" onPress={handleViewMembers}>
            View Members ({group.member_count || 0})
          </Button>
          {group.is_admin && (
            <Button variant="secondary" onPress={handleViewSettings}>
              Group Settings
            </Button>
          )}
        </View>

        {/* Today's Habits Section */}
        <Card className="p-4 mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">
            Today's Habits
          </Text>
          <View className="items-center py-8">
            <Text className="text-text-secondary mb-4">
              No habits yet
            </Text>
            <Button variant="primary" size="sm" onPress={handleAddHabit}>
              Add First Habit
            </Button>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4">
          <Text className="text-lg font-semibold text-text-primary mb-3">
            Recent Activity
          </Text>
          <Text className="text-text-secondary text-center py-4">
            No recent activity
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}