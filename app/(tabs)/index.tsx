import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useAuthStore } from "../store/authStore";
import { Card } from "../components/ui/Card";

export default function DashboardScreen() {
  const { user } = useAuthStore();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-3xl font-bold text-text-primary mb-2">
          Welcome back, {user?.username || "User"}!
        </Text>
        <Text className="text-text-secondary mb-6">
          Here's your daily overview
        </Text>

        <Card className="mb-4">
          <Text className="text-lg font-semibold text-text-primary mb-2">
            Today's Habits
          </Text>
          <Text className="text-text-secondary">
            No habits to track yet. Join a group to get started!
          </Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold text-text-primary mb-2">
            Recent Activity
          </Text>
          <Text className="text-text-secondary">
            No recent activity
          </Text>
        </Card>

        <Card>
          <Text className="text-lg font-semibold text-text-primary mb-2">
            Your Groups
          </Text>
          <Text className="text-text-secondary">
            You're not in any groups yet
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}