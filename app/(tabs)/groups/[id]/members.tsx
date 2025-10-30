import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { groupService } from "../../../services/GroupService";
import type { GroupMember } from "../../../services/GroupService";

interface MemberWithUser extends GroupMember {
  users?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export default function GroupMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [groupName, setGroupName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMembers();
    }
  }, [id]);

  const fetchMembers = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await groupService.getGroupWithMembers(id);
      if (data && !error) {
        setGroupName(data.group.name);
        setMembers(data.members as MemberWithUser[]);
      } else {
        console.error("Failed to fetch members:", error);
        Alert.alert("Error", "Failed to load members");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-orange-100 text-orange-700";
      case "admin":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 bg-background"
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#90B2AC" />
          <Text className="text-text-secondary mt-4">Loading members...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <Button
              variant="ghost"
              onPress={() => router.back()}
              className="self-start -ml-2 mb-2"
            >
              ← Back
            </Button>
            <Text className="text-2xl font-bold text-text-primary mb-1">
              Group Members
            </Text>
            <Text className="text-text-secondary">
              {groupName} • {members.length} member{members.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Members List */}
          <View className="gap-3">
            {members.map((member) => (
              <Card key={member.id} className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-base font-semibold text-text-primary">
                        {member.users?.username || "Unknown User"}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        <Text className="text-xs font-medium">
                          {getRoleDisplayName(member.role)}
                        </Text>
                      </View>
                    </View>
                    {member.users?.full_name && (
                      <Text className="text-sm text-text-secondary mb-1">
                        {member.users.full_name}
                      </Text>
                    )}
                    <Text className="text-xs text-text-secondary">
                      Balance: ${member.balance.toFixed(2)}
                    </Text>
                    <Text className="text-xs text-text-secondary">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {members.length === 0 && (
            <Card className="p-8">
              <Text className="text-text-secondary text-center">
                No members found
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
