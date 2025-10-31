import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { habitService, type HabitDB, type HabitCheckInDB } from "../../../../services/HabitService";
import { groupService } from "../../../../services/GroupService";
import { authService } from "../../../../services/AuthService";
import type { GroupMember } from "../../../../services/GroupService";

interface HabitsTabProps {
  groupId: string;
}

interface MemberWithUser extends GroupMember {
  users?: {
    id: string;
    username: string;
    full_name?: string;
  };
}

export default function HabitsTab({ groupId }: HabitsTabProps) {
  const router = useRouter();
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberWithUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()));
  const [habits, setHabits] = useState<HabitDB[]>([]);
  const [checkIns, setCheckIns] = useState<HabitCheckInDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeTab();
  }, [groupId]);

  useEffect(() => {
    if (selectedMember) {
      fetchHabitsAndCheckIns();
    }
  }, [selectedMember, weekStart]);

  const initializeTab = async () => {
    setLoading(true);

    // Get current user
    const { data: session } = await authService.getSession();
    if (!session?.user) return;

    setCurrentUserId(session.user.id);

    // Get all group members
    const { data: groupData } = await groupService.getGroupWithMembers(groupId);
    if (groupData?.members) {
      const membersList = groupData.members as MemberWithUser[];

      // Sort: current user first, then others
      const sorted = [
        ...membersList.filter(m => m.user_id === session.user.id),
        ...membersList.filter(m => m.user_id !== session.user.id)
      ];

      setMembers(sorted);
      setSelectedMember(sorted[0] || null);
    }

    setLoading(false);
  };

  const fetchHabitsAndCheckIns = async () => {
    if (!selectedMember) return;

    // Get member's habits
    const { data: habitsData } = await habitService.getUserHabits(selectedMember.user_id);
    const groupHabits = habitsData?.filter(h => h.group_id === groupId) || [];
    setHabits(groupHabits);

    // Get check-ins for the week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const { data: checkInsData } = await habitService.getWeekCheckIns(
      selectedMember.user_id,
      groupId,
      formatDate(weekStart),
      formatDate(weekEnd)
    );

    setCheckIns(checkInsData || []);
  };

  const handlePreviousWeek = () => {
    const newWeek = new Date(weekStart);
    newWeek.setDate(weekStart.getDate() - 7);
    setWeekStart(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(weekStart);
    newWeek.setDate(weekStart.getDate() + 7);
    setWeekStart(newWeek);
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getCheckInForHabitAndDate = (habitId: string, date: Date): HabitCheckInDB | null => {
    const dateStr = formatDate(date);
    return checkIns.find(ci => ci.habit_id === habitId && ci.check_in_date === dateStr) || null;
  };

  const handleCheckInClick = async (habit: HabitDB, date: Date, currentStatus: string | null) => {
    // Only allow checking own habits
    if (selectedMember?.user_id !== currentUserId) return;

    // Cycle through states: null -> completed -> missed -> excused -> null
    let newStatus: 'completed' | 'missed' | 'excused' | null = null;

    if (currentStatus === null || currentStatus === 'pending') {
      newStatus = 'completed';
    } else if (currentStatus === 'completed') {
      newStatus = 'missed';
    } else if (currentStatus === 'missed') {
      newStatus = 'excused';
    } else {
      newStatus = null;
    }

    if (newStatus) {
      await habitService.checkIn({
        habit_id: habit.id,
        user_id: currentUserId,
        check_in_date: formatDate(date),
        status: newStatus,
      });
    }

    // Refresh check-ins
    fetchHabitsAndCheckIns();
  };

  const getCheckboxColor = (status: string | null) => {
    if (!status || status === 'pending') return 'bg-gray-200';
    if (status === 'completed') return 'bg-green-500';
    if (status === 'missed') return 'bg-red-500';
    if (status === 'excused') return 'bg-blue-500';
    return 'bg-gray-200';
  };

  const canEditHabit = selectedMember?.user_id === currentUserId;
  const isPastWeek = weekStart < getMonday(new Date());
  const canGoNext = true; // Always allow going to future weeks

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color="#90B2AC" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Member Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-shrink-0 border-b border-gray-200"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {members.map((member) => (
          <TouchableOpacity
            key={member.id}
            onPress={() => setSelectedMember(member)}
            className={`mr-3 px-4 py-2 rounded-full ${
              selectedMember?.id === member.id
                ? 'bg-calm-blue-500'
                : 'bg-gray-100'
            }`}
          >
            <Text
              className={`font-medium ${
                selectedMember?.id === member.id
                  ? 'text-white'
                  : 'text-text-primary'
              }`}
            >
              {member.users?.username || 'Unknown'}
              {member.user_id === currentUserId && ' (You)'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Week Navigation */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50">
        <TouchableOpacity
          onPress={handlePreviousWeek}
          disabled={false}
          className="p-2"
        >
          <Text className="text-xl font-bold text-calm-blue-500">←</Text>
        </TouchableOpacity>

        <Text className="font-semibold text-text-primary">
          {formatWeekRange(weekStart)}
        </Text>

        <TouchableOpacity
          onPress={handleNextWeek}
          disabled={!canGoNext}
          className="p-2"
        >
          <Text className={`text-xl font-bold ${canGoNext ? 'text-calm-blue-500' : 'text-gray-300'}`}>
            →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Habits Grid */}
      <ScrollView className="flex-1 px-4">
        {canEditHabit && (
          <TouchableOpacity
            className="my-4 py-3 px-4 bg-calm-blue-500 rounded-lg"
            onPress={() => {
              // TODO: Navigate to create habit screen
              console.log('Add habit - to be implemented');
            }}
          >
            <Text className="text-white font-semibold text-center">+ Add Habit</Text>
          </TouchableOpacity>
        )}

        {habits.length === 0 ? (
          <View className="py-12 items-center">
            <Text className="text-text-secondary text-center">
              {canEditHabit ? 'No habits yet. Add your first habit!' : 'No habits to display.'}
            </Text>
          </View>
        ) : (
          <View className="pb-4">
            {/* Day Headers */}
            <View className="flex-row mb-2">
              <View className="w-32" />
              {getWeekDates().map((date, idx) => (
                <View key={idx} className="w-12 items-center">
                  <Text className="text-xs text-text-secondary font-medium">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                  </Text>
                  <Text className="text-xs text-text-secondary">
                    {date.getDate()}
                  </Text>
                </View>
              ))}
            </View>

            {/* Habit Rows */}
            {habits.map((habit) => (
              <View key={habit.id} className="flex-row items-center mb-3">
                <View className="w-32 pr-2">
                  <Text className="text-sm font-medium text-text-primary" numberOfLines={2}>
                    {habit.name}
                  </Text>
                </View>

                {getWeekDates().map((date, idx) => {
                  const checkIn = getCheckInForHabitAndDate(habit.id, date);
                  const status = checkIn?.status || null;

                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleCheckInClick(habit, date, status)}
                      disabled={!canEditHabit}
                      className="w-12 items-center"
                    >
                      <View className={`w-8 h-8 rounded ${getCheckboxColor(status)}`} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Helper functions
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });

  if (startMonth === endMonth) {
    return `${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()}`;
  }

  return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}`;
}
