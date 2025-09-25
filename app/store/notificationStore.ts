import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export interface NotificationPreferences {
  enabled: boolean;
  dailyReminders: boolean;
  missedHabitAlerts: boolean;
  paymentReminders: boolean;
  groupUpdates: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reminderTime: string; // HH:MM format
}

interface NotificationStoreState {
  // Preferences
  preferences: NotificationPreferences;
  
  // Permission state
  permissionStatus: Notifications.PermissionStatus | null;
  pushToken: string | null;
  
  // Actions
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  setPermissionStatus: (status: Notifications.PermissionStatus) => void;
  setPushToken: (token: string | null) => void;
  requestPermission: () => Promise<boolean>;
  scheduleReminder: (habitId: string, time: Date) => Promise<void>;
  cancelReminder: (habitId: string) => Promise<void>;
  
  // Computed
  get hasPermission(): boolean;
  get canSendNotifications(): boolean;
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  dailyReminders: true,
  missedHabitAlerts: true,
  paymentReminders: true,
  groupUpdates: true,
  soundEnabled: true,
  vibrationEnabled: true,
  reminderTime: '09:00',
};

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: defaultPreferences,
      permissionStatus: null,
      pushToken: null,
      
      // Actions
      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates }
        }));
      },
      
      setPermissionStatus: (status) => {
        set({ permissionStatus: status });
      },
      
      setPushToken: (token) => {
        set({ pushToken: token });
      },
      
      requestPermission: async () => {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          set({ permissionStatus: status });
          return status === 'granted';
        } catch (error) {
          console.error('Failed to request notification permission:', error);
          return false;
        }
      },
      
      scheduleReminder: async (habitId, time) => {
        if (!get().canSendNotifications) return;
        
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Habit Reminder',
              body: 'Time to check in on your habit!',
              data: { habitId },
            },
            trigger: {
              date: time,
              repeats: true,
            },
          });
        } catch (error) {
          console.error('Failed to schedule reminder:', error);
        }
      },
      
      cancelReminder: async (habitId) => {
        try {
          // Cancel all notifications with this habitId
          const scheduled = await Notifications.getAllScheduledNotificationsAsync();
          const toCancel = scheduled.filter(n => n.content.data?.habitId === habitId);
          
          for (const notification of toCancel) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          }
        } catch (error) {
          console.error('Failed to cancel reminder:', error);
        }
      },
      
      // Computed
      get hasPermission() {
        return get().permissionStatus === 'granted';
      },
      
      get canSendNotifications() {
        const state = get();
        return state.hasPermission && state.preferences.enabled;
      }
    }),
    {
      name: 'notification-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist preferences and token
        preferences: state.preferences,
        pushToken: state.pushToken,
      }),
    }
  )
);