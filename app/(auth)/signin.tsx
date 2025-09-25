import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useRouter } from "expo-router";
import { authService } from "../services/AuthService";
import { useAuthStore } from "../store/authStore";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.signIn({ email, password });
      console.log("SignIn response:", response);

      if (response.error) {
        Alert.alert("Sign In Failed", response.error.message);
      } else if (response.data) {
        console.log("SignIn data:", response.data);
        console.log("Profile:", response.data.profile);
        console.log("Session:", response.data.session);

        // Create a user object from auth data if profile is null
        const user = response.data.profile || {
          id: response.data.user.id,
          email: response.data.user.email,
          username: response.data.user.user_metadata?.username || response.data.user.email.split('@')[0],
          full_name: response.data.user.user_metadata?.full_name || '',
          email_notifications: true,
          push_notifications: true,
          timezone: 'America/New_York'
        };

        console.log("About to call signIn with user:", user);
        await signIn(user as any, response.data.session as any);
        console.log("After signIn store update");

        // Force navigation since isAuthenticated is true
        const authState = useAuthStore.getState();
        console.log("Current auth state after signIn:", {
          isAuthenticated: authState.isAuthenticated,
          user: authState.user,
          session: !!authState.session
        });

        // Force navigation to tabs
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("SignIn error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FAF9F7]"
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-8">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-text-primary mb-2">
              Welcome back
            </Text>
            <Text className="text-text-secondary">
              Sign in to continue your journey
            </Text>
          </View>

          <View className="space-y-4 mb-6">
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />
          </View>

          <Button
            variant="primary"
            onPress={handleSignIn}
            loading={loading}
            disabled={loading}
            className="bg-orange-500 rounded-full mb-4"
          >
            Sign In
          </Button>

          <Text 
            className="text-calm-blue-500 text-center mb-6"
            onPress={() => {/* TODO: Implement forgot password */}}
          >
            Forgot your password?
          </Text>

          <View className="flex-row justify-center">
            <Text className="text-text-secondary">
              Don't have an account?{" "}
            </Text>
            <Text 
              className="text-calm-blue-500 font-semibold"
              onPress={() => router.push("/(auth)/signup")}
            >
              Sign Up
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}