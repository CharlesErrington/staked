import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useRouter } from "expo-router";
import { authService } from "../services/AuthService";
import { useAuthStore } from "../store/authStore";

export default function SignUpScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Check username availability first
      const usernameCheck = await authService.checkUsernameAvailability(formData.username);
      
      if (usernameCheck.data === false) {
        setErrors({ username: "Username is already taken" });
        setLoading(false);
        return;
      }

      const response = await authService.signUp({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        fullName: formData.fullName,
      });

      console.log('📘 SignUp component - Response received:', response);
      console.log('📘 SignUp component - Profile:', response.data?.profile);
      console.log('📘 SignUp component - Session:', response.data?.session);

      if (response.error) {
        console.error('📘 SignUp component - Error:', response.error);
        Alert.alert("Sign Up Failed", response.error.message);
      } else if (response.data) {
        Alert.alert(
          "Success!", 
          "Your account has been created. Please check your email to verify your account.",
          [
            {
              text: "OK",
              onPress: () => {
                // Auto sign in if session exists
                if (response.data.session) {
                  console.log('📘 SignUp - Auto signing in with session');
                  const user = response.data.profile || {
                    id: response.data.user.id,
                    email: response.data.user.email,
                    username: response.data.user.user_metadata?.username || response.data.user.email.split('@')[0],
                    full_name: response.data.user.user_metadata?.full_name || '',
                    email_notifications: true,
                    push_notifications: true,
                    timezone: 'America/New_York'
                  };
                  console.log('📘 SignUp - Using user object:', user);
                  signIn(user as any, response.data.session as any);
                } else {
                  console.log('📘 SignUp - No session, redirecting to signin');
                  router.replace("/(auth)/signin");
                }
              }
            }
          ]
        );
      }
    } catch (error) {
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
              Create Account
            </Text>
            <Text className="text-text-secondary">
              Join the community and start building better habits
            </Text>
          </View>

          <View className="space-y-4 mb-6">
            <Input
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => updateForm("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Username"
              placeholder="Choose a username"
              value={formData.username}
              onChangeText={(value) => updateForm("username", value)}
              autoCapitalize="none"
              error={errors.username}
            />

            <Input
              label="Full Name (optional)"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(value) => updateForm("fullName", value)}
              error={errors.fullName}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(value) => updateForm("password", value)}
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateForm("confirmPassword", value)}
              secureTextEntry
              error={errors.confirmPassword}
            />
          </View>

          <Button
            variant="primary"
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            className="bg-orange-500 rounded-full mb-6"
          >
            Create Account
          </Button>

          <View className="flex-row justify-center">
            <Text className="text-text-secondary">
              Already have an account?{" "}
            </Text>
            <Text 
              className="text-calm-blue-500 font-semibold"
              onPress={() => router.push("/(auth)/signin")}
            >
              Sign In
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}