import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Group {
  id: string;
  name: string;
  description?: string;
  code: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  settings: GroupSettings;
}

export interface GroupSettings {
  stakeAmount: number;
  currency: string;
  timezone: string;
  dailyReminderTime?: string;
  allowLateCheckIns: boolean;
  lateCheckInPenalty?: number;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  balance: number;
  isActive: boolean;
}

interface GroupStoreState {
  // Current active group
  activeGroupId: string | null;
  
  // UI State
  showGroupSelector: boolean;
  inviteCode: string | null;
  
  // Actions
  setActiveGroup: (groupId: string | null) => void;
  toggleGroupSelector: () => void;
  setInviteCode: (code: string | null) => void;
  clearGroupState: () => void;
  
  // Computed
  get hasActiveGroup(): boolean;
}

export const useGroupStore = create<GroupStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeGroupId: null,
      showGroupSelector: false,
      inviteCode: null,
      
      // Actions
      setActiveGroup: (groupId) => {
        set({ activeGroupId: groupId, showGroupSelector: false });
      },
      
      toggleGroupSelector: () => {
        set((state) => ({ 
          showGroupSelector: !state.showGroupSelector 
        }));
      },
      
      setInviteCode: (code) => {
        set({ inviteCode: code });
      },
      
      clearGroupState: () => {
        set({ 
          activeGroupId: null,
          showGroupSelector: false,
          inviteCode: null
        });
      },
      
      // Computed
      get hasActiveGroup() {
        return get().activeGroupId !== null;
      }
    }),
    {
      name: 'group-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist active group selection
        activeGroupId: state.activeGroupId,
      }),
    }
  )
);