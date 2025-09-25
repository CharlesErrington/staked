import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FAF9F7" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen 
        name="welcome" 
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen 
        name="signin" 
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen 
        name="signup" 
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}