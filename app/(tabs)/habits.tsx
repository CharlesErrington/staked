import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HabitsScreen() {
  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-background">
        <View className="p-4">
        <Text className="text-2xl font-bold text-text-primary mb-6">
          Habits
        </Text>

        <View className="items-center py-12">
          <Text className="text-lg text-text-secondary mb-4">
            No habits to track
          </Text>
          <Text className="text-text-secondary text-center">
            Join a group to start tracking habits
          </Text>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}