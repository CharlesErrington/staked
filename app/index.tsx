import { Redirect } from "expo-router";
import { useAuthStore } from "./store/authStore";

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  
  // Redirect to appropriate screen based on auth status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/welcome" />;
  }
}