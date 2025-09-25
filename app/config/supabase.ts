import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { axiosFetch } from '../utils/axiosFetch';

// Supabase configuration - hardcoded for Expo Go compatibility
const supabaseUrl = 'https://stcvjnmqrdsvwvfhgudu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0Y3Zqbm1xcmRzdnd2ZmhndWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODc4NDUsImV4cCI6MjA3MTE2Mzg0NX0.RN0Ci87SWW38uguIkN0RcVsbeDoGsDAxoHRf3Wu9teA';

// Create Supabase client with axios fetch and AsyncStorage for auth persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: axiosFetch as any,
  }
});

// Type definitions for database tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          full_name?: string;
          avatar_url?: string;
          push_token?: string;
          email_notifications: boolean;
          push_notifications: boolean;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description?: string;
          created_by: string;
          currency_code: string;
          max_members: number;
          is_active: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['groups']['Insert']>;
      };
      // Add more table types as needed
    };
  };
};