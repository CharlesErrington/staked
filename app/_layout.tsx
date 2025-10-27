import "./utils/setupPolyfills"; // Must be first import
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuthStore } from "./store/authStore";
import { authService } from "./services/AuthService";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  const { isAuthenticated, setUser, setSession, setLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  console.log("RootLayout render - isAuthenticated:", isAuthenticated);

  useEffect(() => {
    // Initialize auth and check for existing session
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const sessionResponse = await authService.getSession();

        if (sessionResponse.data) {
          // Session exists, get user profile
          const profileResponse = await authService.getStoredProfile();
          if (profileResponse) {
            setUser(profileResponse as any);
            setSession(sessionResponse.data as any);
          }
        } else if (sessionResponse.error) {
          // If there's an error getting session (invalid refresh token, etc.), clear everything
          console.log("Session error detected, clearing stored data:", sessionResponse.error.message);
          await authService.signOut();
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear any corrupted data
        await authService.signOut();
      } finally {
        setLoading(false);
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // Log when auth state changes
  useEffect(() => {
    console.log("Auth state changed in layout - isAuthenticated:", isAuthenticated);
  }, [isAuthenticated]);

  if (isInitializing) {
    // Show loading screen while checking auth status
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#FF6F00" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#FAF9F7" },
            }}
          >
            {isAuthenticated ? (
              // Authenticated routes
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                  animation: "fade"
                }}
              />
            ) : (
              // Auth routes
              <Stack.Screen
                name="(auth)"
                options={{
                  headerShown: false,
                  animation: "fade"
                }}
              />
            )}
          </Stack>
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}