import { supabase } from '../config/supabase';
import { BaseService, ServiceResponse, ServiceError } from './base/BaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User, AuthError } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
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
  metadata?: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService extends BaseService {
  private readonly SESSION_KEY = '@staked/session';
  private readonly PROFILE_KEY = '@staked/profile';
  
  constructor() {
    super('users');
    this.initializeAuth();
    this.handleDeepLink();
  }
  
  // Handle deep links for email confirmation
  private async handleDeepLink() {
    // Check if we have a deep link URL with tokens
    if (typeof window !== 'undefined' && window.location) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        // Set the session from the tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (data?.session) {
          console.log('Session set from email confirmation');
          await this.storeSession(data.session);
        }
      }
    }
  }
  
  // Initialize auth listener
  private async initializeAuth() {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session) {
        await this.storeSession(session);
        
        // Fetch and cache user profile
        if (session.user) {
          await this.fetchUserProfile(session.user.id);
        }
      } else {
        await this.clearSession();
      }
    });
    
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await this.storeSession(session);
    }
  }
  
  // Sign up new user
  async signUp(data: SignUpData): Promise<ServiceResponse<AuthState>> {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.fullName,
          },
        },
      });

      if (authError) {
        return this.createResponse<AuthState>(null, authError);
      }

      if (!authData.user) {
        return this.createResponse<AuthState>(null, new ServiceError('User creation failed'));
      }

      // Wait for database trigger to create profile (trigger: handle_new_user)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch the profile created by database trigger
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      const authState: AuthState = {
        user: authData.user,
        session: authData.session,
        profile: userProfile,
        isAuthenticated: !!authData.session,
        isLoading: false,
      };

      return this.createResponse(authState, null);
    } catch (error) {
      return this.createResponse<AuthState>(null, error as Error);
    }
  }
  
  // Sign in existing user
  async signIn(data: SignInData): Promise<ServiceResponse<AuthState>> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return this.createResponse<AuthState>(null, error);
      }

      if (!authData.user || !authData.session) {
        return this.createResponse<AuthState>(null, new ServiceError('Sign in failed'));
      }

      // Store session
      await this.storeSession(authData.session);

      // Fetch user profile (should exist from signup trigger)
      const profile = await this.fetchUserProfile(authData.user.id);

      // Store profile
      if (profile) {
        await this.storeProfile(profile);
      }

      const authState: AuthState = {
        user: authData.user,
        session: authData.session,
        profile,
        isAuthenticated: true,
        isLoading: false,
      };

      return this.createResponse(authState, null);
    } catch (error) {
      return this.createResponse<AuthState>(null, error as Error);
    }
  }

  // Sign in with OAuth provider
  async signInWithProvider(
    provider: 'google' | 'apple' | 'facebook'
  ): Promise<ServiceResponse<{ url: string }>> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'staked://auth-callback',
        },
      });

      if (error) {
        return this.createResponse<{ url: string }>(null, error);
      }

      return this.createResponse({ url: data.url }, null);
    } catch (error) {
      return this.createResponse<{ url: string }>(null, error as Error);
    }
  }
  
  // Sign out
  async signOut(): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return this.createResponse(null, error);
      }
      
      await this.clearSession();
      return this.createResponse(null, null);
    } catch (error) {
      return this.createResponse(null, error as Error);
    }
  }
  
  // Get current session
  async getSession(): Promise<ServiceResponse<Session | null>> {
    try {
      // First try to get from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        // If there's an error (like invalid refresh token), clear stored data
        console.log('Session error in getSession:', error.message);
        if (error.message.includes('Refresh Token') || error.message.includes('Invalid')) {
          await this.clearSession();
        }
        return this.createResponse(null, error);
      }

      return this.createResponse(session, null);
    } catch (error) {
      console.error('Unexpected error in getSession:', error);
      await this.clearSession();
      return this.createResponse(null, error as Error);
    }
  }
  
  // Refresh session
  async refreshSession(): Promise<ServiceResponse<Session | null>> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        return this.createResponse(null, error);
      }
      
      if (session) {
        await this.storeSession(session);
      }
      
      return this.createResponse(session, null);
    } catch (error) {
      return this.createResponse(null, error as Error);
    }
  }
  
  // Reset password
  async resetPassword(email: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'staked://reset-password',
      });
      
      if (error) {
        return this.createResponse(null, error);
      }
      
      return this.createResponse(null, null);
    } catch (error) {
      return this.createResponse(null, error as Error);
    }
  }
  
  // Update password
  async updatePassword(newPassword: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        return this.createResponse(null, error);
      }
      
      return this.createResponse(null, null);
    } catch (error) {
      return this.createResponse(null, error as Error);
    }
  }
  
  // Update user profile
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<ServiceResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return this.createResponse<UserProfile>(null, error);
      }

      // Update cached profile
      await this.storeProfile(data);

      return this.createResponse(data, null);
    } catch (error) {
      return this.createResponse<UserProfile>(null, error as Error);
    }
  }

  // Upload avatar
  async uploadAvatar(
    userId: string,
    file: File | Blob
  ): Promise<ServiceResponse<string>> {
    try {
      const fileName = `${userId}-${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        return this.createResponse<string>(null, uploadError);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        return this.createResponse<string>(null, updateError);
      }

      return this.createResponse(publicUrl, null);
    } catch (error) {
      return this.createResponse<string>(null, error as Error);
    }
  }
  
  // Fetch user profile from database
  private async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    console.log('🔍 Fetching profile for user ID:', userId);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('❌ Error fetching user profile:', error);
        if (error) {
          console.log('🔍 Profile fetch error details:', { code: error.code, message: error.message, details: error.details });
        }
        return null;
      }

      console.log('✅ Profile fetched successfully:', data);
      await this.storeProfile(data);
      return data;
    } catch (err) {
      console.error('❌ Unexpected error in fetchUserProfile:', err);
      return null;
    }
  }
  
  // Session storage helpers
  private async storeSession(session: Session): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }
  
  private async getStoredSession(): Promise<Session | null> {
    try {
      const sessionString = await AsyncStorage.getItem(this.SESSION_KEY);
      return sessionString ? JSON.parse(sessionString) : null;
    } catch {
      return null;
    }
  }
  
  private async clearSession(): Promise<void> {
    try {
      // Clear custom session keys
      await AsyncStorage.multiRemove([this.SESSION_KEY, this.PROFILE_KEY]);

      // Clear authStore keys
      await AsyncStorage.multiRemove(['@session', '@user']);

      // Clear all Supabase auth keys (they use a pattern like sb-<project-ref>-auth-token)
      const allKeys = await AsyncStorage.getAllKeys();
      const supabaseAuthKeys = allKeys.filter(key => key.includes('sb-') && key.includes('-auth-'));
      if (supabaseAuthKeys.length > 0) {
        await AsyncStorage.multiRemove(supabaseAuthKeys);
      }
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }
  
  // Profile storage helpers
  private async storeProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to store profile:', error);
    }
  }
  
  async getStoredProfile(): Promise<UserProfile | null> {
    try {
      const profileString = await AsyncStorage.getItem(this.PROFILE_KEY);
      return profileString ? JSON.parse(profileString) : null;
    } catch {
      return null;
    }
  }
  
  // Verify username availability
  async checkUsernameAvailability(username: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // No rows returned means username is available
        return this.createResponse(true, null);
      }

      if (error) {
        return this.createResponse<boolean>(null, error);
      }

      // Username exists
      return this.createResponse(false, null);
    } catch (error) {
      return this.createResponse<boolean>(null, error as Error);
    }
  }
  
  // Delete account
  async deleteAccount(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Soft delete in database
      const { error: dbError } = await supabase
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (dbError) {
        return this.createResponse(null, dbError);
      }
      
      // Sign out
      await this.signOut();
      
      return this.createResponse(null, null);
    } catch (error) {
      return this.createResponse(null, error as Error);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();