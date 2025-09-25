import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/AuthService";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await authService.signOut();
    await signOut();
    // Navigation will automatically switch to auth stack
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-gray-300 rounded-full mb-4" />
          <Text className="text-2xl font-bold text-text-primary">
            {user?.full_name || user?.username || "User"}
          </Text>
          <Text className="text-text-secondary">
            {user?.email}
          </Text>
        </View>

        <Card className="mb-4">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Account Settings
          </Text>
          <View className="space-y-3">
            <Text className="text-text-primary py-2">Edit Profile</Text>
            <Text className="text-text-primary py-2">Notification Settings</Text>
            <Text className="text-text-primary py-2">Privacy Settings</Text>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Preferences
          </Text>
          <View className="space-y-3">
            <Text className="text-text-primary py-2">Theme</Text>
            <Text className="text-text-primary py-2">Language</Text>
            <Text className="text-text-primary py-2">Time Zone</Text>
          </View>
        </Card>

        <Button 
          variant="ghost" 
          onPress={handleSignOut}
          className="mt-4"
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}