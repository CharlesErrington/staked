import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  push_token?: string;
  email_notifications: boolean;
  push_notifications: boolean;
  timezone: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (user: User, session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  loadStoredSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setSession: (session) => set({ session }),
  
  setLoading: (isLoading) => set({ isLoading }),

  signIn: async (user, session) => {
    // Store session in AsyncStorage
    await AsyncStorage.setItem('@session', JSON.stringify(session));
    await AsyncStorage.setItem('@user', JSON.stringify(user));
    
    set({ 
      user, 
      session, 
      isAuthenticated: true,
      isLoading: false 
    });
  },

  signOut: async () => {
    // Clear stored session
    await AsyncStorage.multiRemove(['@session', '@user']);
    
    set({ 
      user: null, 
      session: null, 
      isAuthenticated: false,
      isLoading: false 
    });
  },

  updateUser: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      set({ user: updatedUser });
      AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
    }
  },

  loadStoredSession: async () => {
    try {
      const [sessionString, userString] = await AsyncStorage.multiGet(['@session', '@user']);
      
      if (sessionString[1] && userString[1]) {
        const session = JSON.parse(sessionString[1]);
        const user = JSON.parse(userString[1]);
        
        // Check if session is expired
        if (session.expires_at > Date.now()) {
          set({ 
            session, 
            user, 
            isAuthenticated: true,
            isLoading: false 
          });
        } else {
          // Session expired, clear it
          await AsyncStorage.multiRemove(['@session', '@user']);
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading stored session:', error);
      set({ isLoading: false });
    }
  },
}));