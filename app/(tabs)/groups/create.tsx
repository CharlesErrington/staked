import React, { useState } from "react";
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { groupService } from "../../services/GroupService";
import { authService } from "../../services/AuthService";

export default function CreateGroupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMembers: "10",
    currency: "USD",
  });

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const { data: session } = await authService.getSession();
      if (!session?.user) {
        Alert.alert("Error", "You must be logged in to create a group");
        router.push("/(auth)/welcome");
        return;
      }

      // Create the group
      const { data, error } = await groupService.createGroup({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        created_by: session.user.id,
        max_members: parseInt(formData.maxMembers) || 10,
        currency_code: formData.currency,
        settings: {
          allow_late_checkins: false,
          late_penalty_multiplier: 1.5,
          notification_time: "09:00",
          timezone: "UTC",
        }
      });

      if (error) {
        Alert.alert("Error", "Failed to create group. Please try again.");
        console.error("Create group error:", error);
      } else if (data) {
        // Navigate to the new group
        router.replace(`/(tabs)/groups/${data.id}`);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Create group error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-text-primary mb-2">
              Create a Group
            </Text>
            <Text className="text-text-secondary">
              Start a habit tracking group with your friends
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-text-primary mb-2">
                Group Name*
              </Text>
              <Input
                placeholder="e.g., Morning Workout Crew"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                autoCapitalize="words"
                maxLength={50}
              />
              <Text className="text-xs text-text-secondary mt-1">
                {formData.name.length}/50 characters
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-text-primary mb-2">
                Description
              </Text>
              <Input
                placeholder="What's this group about?"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
                maxLength={200}
                className="min-h-[80px] py-2"
              />
              <Text className="text-xs text-text-secondary mt-1">
                {formData.description.length}/200 characters
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-text-primary mb-2">
                Maximum Members
              </Text>
              <Input
                placeholder="10"
                value={formData.maxMembers}
                onChangeText={(text) => setFormData({ ...formData, maxMembers: text.replace(/[^0-9]/g, '') })}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text className="text-xs text-text-secondary mt-1">
                You can change this later
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-text-primary mb-2">
                Currency
              </Text>
              <View className="flex-row gap-2">
                {["USD", "EUR", "GBP", "CAD", "AUD"].map((currency) => (
                  <Button
                    key={currency}
                    variant={formData.currency === currency ? "primary" : "secondary"}
                    size="sm"
                    onPress={() => setFormData({ ...formData, currency })}
                  >
                    {currency}
                  </Button>
                ))}
              </View>
              <Text className="text-xs text-text-secondary mt-1">
                Used for financial stakes
              </Text>
            </View>

            <View className="bg-primary-50 p-4 rounded-lg mt-4">
              <Text className="text-sm text-primary-700 font-medium mb-2">
                What happens next?
              </Text>
              <Text className="text-xs text-primary-600">
                • You'll be the group admin{"\n"}
                • You can invite friends with a unique code{"\n"}
                • Add habits that everyone will track{"\n"}
                • Set financial stakes for accountability
              </Text>
            </View>

            <View className="flex-row gap-3 mt-6">
              <Button
                variant="secondary"
                onPress={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleCreateGroup}
                disabled={loading || !formData.name.trim()}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}