import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  activeTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => Promise<void>;
  colors: ThemeColors;
}

interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Brand colors
  primary: string;
  secondary: string;
  accent: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Other
  overlay: string;
  divider: string;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: '#FFFFFF',
  
  text: '#2D3142',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  
  primary: '#FF6B35',
  secondary: '#5B9FED',
  accent: '#FFD166',
  
  success: '#06D6A0',
  warning: '#FFD166',
  error: '#EF476F',
  info: '#5B9FED',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  divider: '#E5E7EB',
};

const darkColors: ThemeColors = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  card: '#242424',
  
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#6B7280',
  
  primary: '#FF6B35',
  secondary: '#5B9FED',
  accent: '#FFD166',
  
  success: '#06D6A0',
  warning: '#FFD166',
  error: '#EF476F',
  info: '#5B9FED',
  
  border: '#374151',
  borderLight: '#1F2937',
  
  overlay: 'rgba(0, 0, 0, 0.7)',
  divider: '#374151',
};

const THEME_STORAGE_KEY = '@staked/theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  
  const activeTheme = theme === 'system' 
    ? (systemColorScheme ?? 'light')
    : theme;
  
  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        activeTheme,
        setTheme, 
        colors 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for theme-aware styling
export const useThemeStyles = () => {
  const { activeTheme, colors } = useTheme();
  
  return {
    isDark: activeTheme === 'dark',
    colors,
    // Common style helpers
    container: {
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    text: {
      color: colors.text,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
  };
};