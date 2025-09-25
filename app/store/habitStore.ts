import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetCount: number;
  groupId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  color?: string;
  icon?: string;
}

export interface HabitCheckIn {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  note?: string;
}

interface HabitStoreState {
  // Local habit data (drafts, UI state)
  draftHabit: Partial<Habit> | null;
  selectedHabitId: string | null;
  filterMode: 'all' | 'active' | 'completed';
  
  // Actions
  setDraftHabit: (draft: Partial<Habit> | null) => void;
  updateDraftHabit: (updates: Partial<Habit>) => void;
  selectHabit: (habitId: string | null) => void;
  setFilterMode: (mode: 'all' | 'active' | 'completed') => void;
  clearDraft: () => void;
  
  // Computed
  get hasDraft(): boolean;
}

export const useHabitStore = create<HabitStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      draftHabit: null,
      selectedHabitId: null,
      filterMode: 'all',
      
      // Actions
      setDraftHabit: (draft) => {
        set({ draftHabit: draft });
      },
      
      updateDraftHabit: (updates) => {
        set((state) => ({
          draftHabit: state.draftHabit 
            ? { ...state.draftHabit, ...updates }
            : updates
        }));
      },
      
      selectHabit: (habitId) => {
        set({ selectedHabitId: habitId });
      },
      
      setFilterMode: (mode) => {
        set({ filterMode: mode });
      },
      
      clearDraft: () => {
        set({ draftHabit: null });
      },
      
      // Computed
      get hasDraft() {
        return get().draftHabit !== null;
      }
    }),
    {
      name: 'habit-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist draft and filter preferences
        draftHabit: state.draftHabit,
        filterMode: state.filterMode,
      }),
    }
  )
);