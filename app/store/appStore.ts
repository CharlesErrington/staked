import { create } from 'zustand';

interface Group {
  id: string;
  name: string;
  description?: string;
  currency_code: string;
  member_count: number;
  role: 'owner' | 'admin' | 'member';
  active_habits: number;
  total_owed: number;
  total_owed_to: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

interface AppState {
  // Current context
  currentGroup: Group | null;
  groups: Group[];
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // UI State
  isRefreshing: boolean;
  activeTab: number;
  
  // Actions
  setCurrentGroup: (group: Group | null) => void;
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  removeGroup: (groupId: string) => void;
  
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  
  setRefreshing: (refreshing: boolean) => void;
  setActiveTab: (tab: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentGroup: null,
  groups: [],
  notifications: [],
  unreadCount: 0,
  isRefreshing: false,
  activeTab: 0,

  setCurrentGroup: (currentGroup) => set({ currentGroup }),
  
  setGroups: (groups) => set({ groups }),
  
  addGroup: (group) => set((state) => ({ 
    groups: [...state.groups, group] 
  })),
  
  updateGroup: (groupId, updates) => set((state) => ({
    groups: state.groups.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    ),
    currentGroup: state.currentGroup?.id === groupId 
      ? { ...state.currentGroup, ...updates }
      : state.currentGroup
  })),
  
  removeGroup: (groupId) => set((state) => ({
    groups: state.groups.filter(g => g.id !== groupId),
    currentGroup: state.currentGroup?.id === groupId ? null : state.currentGroup
  })),

  setNotifications: (notifications) => set({ 
    notifications,
    unreadCount: notifications.filter(n => !n.is_read).length
  }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: notification.is_read ? state.unreadCount : state.unreadCount + 1
  })),
  
  markNotificationRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, is_read: true })),
    unreadCount: 0
  })),

  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  
  setActiveTab: (activeTab) => set({ activeTab }),
}));