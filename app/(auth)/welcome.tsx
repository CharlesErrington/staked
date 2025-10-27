import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-[#FAF9F7]">
      <View className="flex-1 px-6 justify-center">
      <View className="items-center mb-12">
        {/* Logo placeholder - replace with actual logo */}
        <View className="w-32 h-32 bg-orange-500 rounded-3xl mb-6 shadow-lg" />
        
        <Text className="text-4xl font-bold text-text-primary mb-3">
          Staked
        </Text>
        <Text className="text-lg text-text-secondary text-center">
          Build better habits with friends
        </Text>
      </View>

      <View className="space-y-4">
        <Button 
          variant="primary"
          onPress={() => router.push("/(auth)/signin")}
          className="bg-orange-500 rounded-full shadow-soft"
        >
          Sign In
        </Button>

        <Button 
          variant="secondary"
          onPress={() => router.push("/(auth)/signup")}
          className="bg-calm-blue-500 rounded-full"
        >
          Create Account
        </Button>
      </View>

      <Text className="text-center text-text-secondary text-sm mt-8">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
      </View>
    </SafeAreaView>
  );
}