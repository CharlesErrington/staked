import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  Animated,
  Dimensions
} from "react-native";
import { Button, IconButton } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { groupService } from "../services/GroupService";
import { authService } from "../services/AuthService";
import { useRouter } from "expo-router";
import type { Group } from "../services/GroupService";

const { width } = Dimensions.get('window');

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: session } = await authService.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch groups
  const fetchGroups = async (isRefreshing = false) => {
    if (!userId) return;
    
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data, error } = await groupService.getUserGroups(userId);
      if (data && !error) {
        setGroups(data);
        // Animate groups in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        console.error('Failed to fetch groups:', error);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch groups when userId is available
  useEffect(() => {
    if (userId) {
      fetchGroups();
    }
  }, [userId]);

  const handleCreateGroup = () => {
    router.push('/(tabs)/groups/create');
  };

  const handleJoinGroup = () => {
    router.push('/(tabs)/groups/join');
  };

  const handleGroupPress = (groupId: string) => {
    router.push(`/(tabs)/groups/${groupId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <View className="p-4">
          <View className="h-12 bg-gray-200 rounded-lg mb-6 opacity-50" />
          {[1, 2, 3].map((i) => (
            <View key={i} className="mb-3">
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <View className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <View className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                <View className="flex-row gap-2">
                  <View className="h-3 bg-gray-100 rounded w-16" />
                  <View className="h-3 bg-gray-100 rounded w-16" />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchGroups(true)}
          tintColor="#90B2AC"
          colors={["#90B2AC"]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View className="p-4">
        {/* Header with gradient background */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-bold text-text-primary">
                My Groups
              </Text>
              <Text className="text-text-secondary text-sm mt-1">
                {groups.length > 0 
                  ? `${groups.length} active group${groups.length !== 1 ? 's' : ''}`
                  : 'Start your journey'}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onPress={handleJoinGroup}
                icon={<Text>➕</Text>}
                iconPosition="left"
              >
                Join
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onPress={handleCreateGroup}
                icon={<Text>✨</Text>}
                iconPosition="left"
              >
                Create
              </Button>
            </View>
          </View>
        </View>

        {groups.length === 0 ? (
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Card variant="elevated" className="p-8">
              <View className="items-center">
                <Text className="text-6xl mb-4">🌱</Text>
                <Text className="text-xl font-bold text-text-primary mb-2">
                  Ready to build habits?
                </Text>
                <Text className="text-text-secondary text-center mb-6 px-4">
                  Create your first group or join an existing one to start tracking habits with friends
                </Text>
                <View className="flex-row gap-3">
                  <Button 
                    variant="secondary" 
                    onPress={handleJoinGroup}
                    fullWidth
                  >
                    Join Existing
                  </Button>
                  <Button 
                    variant="primary" 
                    onPress={handleCreateGroup}
                    fullWidth
                  >
                    Create New
                  </Button>
                </View>
              </View>
            </Card>
          </Animated.View>
        ) : (
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="gap-3"
          >
            {groups.map((group, index) => (
              <Animated.View
                key={group.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: slideAnim,
                  }],
                }}
              >
                <Card 
                  variant="elevated"
                  onPress={() => handleGroupPress(group.id)}
                  className="mb-3"
                >
                  <View>
                    {/* Group Header */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-xl font-bold text-text-primary">
                            {group.name}
                          </Text>
                          {group.is_admin && (
                            <View className="bg-primary px-2 py-0.5 rounded-full">
                              <Text className="text-white text-xs font-medium">Admin</Text>
                            </View>
                          )}
                        </View>
                        {group.description && (
                          <Text className="text-text-secondary text-sm" numberOfLines={2}>
                            {group.description}
                          </Text>
                        )}
                      </View>
                      <View className="bg-primary-50 px-3 py-1.5 rounded-full">
                        <Text className="text-primary text-xs font-semibold">
                          {group.member_count || 0}/{group.max_members || 10}
                        </Text>
                      </View>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row gap-3 mb-3">
                      {group.total_habits !== undefined && (
                        <View className="flex-row items-center gap-1">
                          <Text className="text-lg">🎯</Text>
                          <Text className="text-text-secondary text-sm">
                            {group.total_habits} habit{group.total_habits !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}
                      {group.active_habits !== undefined && group.active_habits > 0 && (
                        <View className="flex-row items-center gap-1">
                          <Text className="text-lg">✅</Text>
                          <Text className="text-success text-sm font-medium">
                            {group.active_habits} active
                          </Text>
                        </View>
                      )}
                      {group.currency_code && (
                        <View className="flex-row items-center gap-1">
                          <Text className="text-lg">💰</Text>
                          <Text className="text-text-secondary text-sm">
                            {group.currency_code}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Next Check-in or Activity */}
                    {group.next_checkin && (
                      <View className="border-t border-gray-100 pt-3">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2">
                            <Text className="text-sm">⏰</Text>
                            <Text className="text-text-secondary text-xs">
                              Next check-in
                            </Text>
                          </View>
                          <Text className="text-text-primary text-xs font-medium">
                            {new Date(group.next_checkin).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Progress Indicator */}
                    {group.completion_rate !== undefined && (
                      <View className="mt-3">
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-xs text-text-secondary">Group Progress</Text>
                          <Text className="text-xs font-medium text-primary">
                            {Math.round(group.completion_rate * 100)}%
                          </Text>
                        </View>
                        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <View 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${group.completion_rate * 100}%` }}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                </Card>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Quick Stats Footer */}
        {groups.length > 0 && (
          <View className="mt-6 mb-2">
            <Card variant="outlined" className="p-3">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary">
                    {groups.reduce((acc, g) => acc + (g.total_habits || 0), 0)}
                  </Text>
                  <Text className="text-xs text-text-secondary">Total Habits</Text>
                </View>
                <View className="w-px bg-border" />
                <View className="items-center">
                  <Text className="text-2xl font-bold text-success">
                    {groups.reduce((acc, g) => acc + (g.active_habits || 0), 0)}
                  </Text>
                  <Text className="text-xs text-text-secondary">Active</Text>
                </View>
                <View className="w-px bg-border" />
                <View className="items-center">
                  <Text className="text-2xl font-bold text-accent">
                    {groups.reduce((acc, g) => acc + (g.member_count || 0), 0)}
                  </Text>
                  <Text className="text-xs text-text-secondary">Members</Text>
                </View>
              </View>
            </Card>
          </View>
        )}
      </View>
    </ScrollView>
  );
}