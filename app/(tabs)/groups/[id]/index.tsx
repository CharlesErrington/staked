import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { groupService } from "../../../services/GroupService";
import type { Group } from "../../../services/GroupService";
import HabitsTab from "./components/HabitsTab";
import ActivityTab from "./components/ActivityTab";
import StakesTab from "./components/StakesTab";

type TabType = 'habits' | 'activity' | 'stakes';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('habits');

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
        console.error("Failed to fetch group:", error);
        router.back();
      }
    } catch (error) {
      console.error("Error fetching group:", error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#90B2AC" />
          <Text className="text-text-secondary mt-4">Loading group...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary">Group not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-2"
        >
          <Text className="text-calm-blue-500 font-medium">← Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-text-primary">
          {group.name}
        </Text>

        {group.description && (
          <Text className="text-sm text-text-secondary mt-1">
            {group.description}
          </Text>
        )}
      </View>

      {/* Tab Navigation */}
      <View className="flex-row border-b border-gray-200 bg-white">
        <TabButton
          label="Habits"
          active={activeTab === 'habits'}
          onPress={() => setActiveTab('habits')}
        />
        <TabButton
          label="Recent Activity"
          active={activeTab === 'activity'}
          onPress={() => setActiveTab('activity')}
        />
        <TabButton
          label="Stakes"
          active={activeTab === 'stakes'}
          onPress={() => setActiveTab('stakes')}
        />
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {activeTab === 'habits' && <HabitsTab groupId={id!} />}
        {activeTab === 'activity' && <ActivityTab groupId={id!} />}
        {activeTab === 'stakes' && <StakesTab groupId={id!} />}
      </View>
    </SafeAreaView>
  );
}

// Tab Button Component
function TabButton({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-3 items-center border-b-2 ${
        active ? 'border-calm-blue-500' : 'border-transparent'
      }`}
    >
      <Text
        className={`font-semibold ${
          active ? 'text-calm-blue-500' : 'text-text-secondary'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
