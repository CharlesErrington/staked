import React, { useState } from "react";
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { groupService } from "../../services/GroupService";
import { authService } from "../../services/AuthService";

export default function JoinGroupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const handleJoinGroup = async () => {
    const code = inviteCode.trim().toUpperCase();
    
    if (!code) {
      Alert.alert("Error", "Please enter an invitation code");
      return;
    }

    if (code.length !== 6) {
      Alert.alert("Error", "Invitation codes are 6 characters long");
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const { data: session } = await authService.getSession();
      if (!session?.user) {
        Alert.alert("Error", "You must be logged in to join a group");
        router.push("/(auth)/welcome");
        return;
      }

      // Join the group
      const { data, error } = await groupService.joinGroupWithCode(
        code,
        session.user.id
      );

      if (error) {
        if (error.message?.includes("expired")) {
          Alert.alert("Error", "This invitation code has expired");
        } else if (error.message?.includes("already")) {
          Alert.alert("Error", "You're already a member of this group");
        } else if (error.message?.includes("full")) {
          Alert.alert("Error", "This group is full");
        } else if (error.message?.includes("not found")) {
          Alert.alert("Error", "Invalid invitation code");
        } else {
          Alert.alert("Error", "Failed to join group. Please try again.");
        }
        console.error("Join group error:", error);
      } else if (data) {
        // Navigate to the group
        Alert.alert("Success", "You've joined the group!", [
          {
            text: "OK",
            onPress: () => router.replace(`/(tabs)/groups/${data.group_id}`)
          }
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Join group error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatInviteCode = (text: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Limit to 6 characters
    return cleaned.slice(0, 6);
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
              Join a Group
            </Text>
            <Text className="text-text-secondary">
              Enter the invitation code shared by your group admin
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-text-primary mb-2">
                Invitation Code
              </Text>
              <Input
                placeholder="e.g., ABC123"
                value={inviteCode}
                onChangeText={(text) => setInviteCode(formatInviteCode(text))}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
              />
              <Text className="text-xs text-text-secondary mt-1 text-center">
                6-character code (letters and numbers)
              </Text>
            </View>

            <View className="bg-primary-50 p-4 rounded-lg mt-4">
              <Text className="text-sm text-primary-700 font-medium mb-2">
                How to get an invitation code?
              </Text>
              <Text className="text-xs text-primary-600">
                • Ask the group admin to share the code{"\n"}
                • Codes can be found in the group settings{"\n"}
                • Each code expires after 7 days{"\n"}
                • The admin can generate new codes anytime
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
                onPress={handleJoinGroup}
                disabled={loading || inviteCode.length !== 6}
                className="flex-1"
              >
                {loading ? "Joining..." : "Join Group"}
              </Button>
            </View>

            <View className="items-center mt-8">
              <Text className="text-text-secondary mb-3">
                Don't have a code?
              </Text>
              <Button
                variant="ghost"
                onPress={() => router.replace("/(tabs)/groups/create")}
              >
                Create your own group
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}