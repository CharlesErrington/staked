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
    console.log('🔵 Starting signup process for:', data.email);
    try {
      // 1. Create auth user
      console.log('🔵 Step 1: Creating auth user...');
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
        console.error('❌ Auth signup error:', authError);
        return this.createResponse(null, authError);
      }

      if (!authData.user) {
        console.error('❌ No user returned from signup');
        return this.createResponse(null, new ServiceError('User creation failed'));
      }

      console.log('✅ Auth user created:', authData.user.id, authData.user.email);
      
      // 2. Wait a moment for the auth user to be fully created
      console.log('🔵 Step 2: Waiting for auth user to be fully created...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Create user profile in database
      console.log('🔵 Step 3: Creating user profile in database...');
      // Try to insert the profile - if it fails, the trigger might have already created it
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          username: data.username,
          full_name: data.fullName,
          email_notifications: true,
          push_notifications: true,
          timezone: 'America/New_York',
        })
        .select()
        .single();
      
      console.log('🔵 Profile insert result:', { profile, profileError });

      let userProfile = profile;

      // If insert failed, try to get the existing profile (trigger might have created it)
      if (profileError && profileError.code === '23505') { // Unique violation
        console.log('🔵 Profile already exists (trigger may have created it), fetching...');
        const { data: existingProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        userProfile = existingProfile;
        console.log('🔵 Fetched existing profile:', existingProfile);
      } else if (profileError) {
        console.error('❌ Failed to create user profile:', profileError);
        console.log('🔵 Continuing anyway - profile might be created by trigger');
      } else {
        console.log('✅ Profile created successfully:', profile);
      }
      
      const authState: AuthState = {
        user: authData.user,
        session: authData.session,
        profile: userProfile,
        isAuthenticated: !!authData.session,
        isLoading: false,
      };

      console.log('🔵 Final signup authState:', authState);
      return this.createResponse(authState, null);
    } catch (error) {
      return this.createResponse(null, error as Error);
    }
  }
  
  // Sign in existing user
  async signIn(data: SignInData): Promise<ServiceResponse<AuthState>> {
    console.log('🟢 Starting signin process for:', data.email);
    try {
      console.log('🟢 Step 1: Signing in with password...');
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) {
        console.error('❌ Signin error:', error);
        return this.createResponse(null, error);
      }

      if (!authData.user || !authData.session) {
        console.error('❌ No user or session returned from signin');
        return this.createResponse(null, new ServiceError('Sign in failed'));
      }

      console.log('✅ Auth signin successful:', authData.user.id, authData.user.email);
      
      // Store session
      console.log('🟢 Step 2: Storing session...');
      await this.storeSession(authData.session);

      // Fetch user profile
      console.log('🟢 Step 3: Fetching user profile...');
      let profile = await this.fetchUserProfile(authData.user.id);
      console.log('🟢 Profile fetch result:', profile);
      
      // If profile doesn't exist, create it (handles failed signups)
      if (!profile) {
        console.log('⚠️ No profile found, attempting to create one...');
        const { data: newProfile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            username: authData.user.user_metadata?.username || authData.user.email!.split('@')[0],
            full_name: authData.user.user_metadata?.full_name,
          })
          .select()
          .single();
        
        if (!profileError && newProfile) {
          profile = newProfile;
          console.log('✅ Profile created during signin:', newProfile);
        } else if (profileError) {
          console.error('❌ Failed to create profile during signin:', profileError);
        }
      }
      
      const authState: AuthState = {
        user: authData.user,
        session: authData.session,
        profile,
        isAuthenticated: true,
        isLoading: false,
      };

      console.log('🟢 Final signin authState:', authState);
      return this.createResponse(authState, null);
    } catch (error) {
      return this.createResponse(null, error as Error);
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
        return this.createResponse(null, error);
      }
      
      return this.createResponse({ url: data.url }, null);
    } catch (error) {
      return this.createResponse(null, error as Error);
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
        // Fallback to stored session
        const storedSession = await this.getStoredSession();
        return this.createResponse(storedSession, null);
      }
      
      return this.createResponse(session, null);
    } catch (error) {
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
        return this.createResponse(null, error);
      }
      
      // Update cached profile
      await this.storeProfile(data);
      
      return this.createResponse(data, null);
    } catch (error) {
      return this.createResponse(null, error as Error);
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
        return this.createResponse(null, uploadError);
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
        return this.createResponse(null, updateError);
      }
      
      return this.createResponse(publicUrl, null);
    } catch (error) {
      return this.createResponse(null, error as Error);
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
      await AsyncStorage.multiRemove([this.SESSION_KEY, this.PROFILE_KEY]);
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
        return this.createResponse(null, error);
      }
      
      // Username exists
      return this.createResponse(false, null);
    } catch (error) {
      return this.createResponse(null, error as Error);
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