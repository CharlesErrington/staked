import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

// Storage keys
export const STORAGE_KEYS = {
  AUTH: '@staked/auth',
  APP: '@staked/app',
  HABITS: '@staked/habits',
  GROUPS: '@staked/groups',
  NOTIFICATIONS: '@staked/notifications',
  THEME: '@staked/theme',
  ONBOARDING: '@staked/onboarding',
} as const;

// Custom storage adapter for Zustand
export const zustandStorage: StateStorage = {
  getItem: async (name: string) => {
    try {
      const value = await AsyncStorage.getItem(name);
      return value ?? null;
    } catch (error) {
      console.error(`Error reading ${name} from storage:`, error);
      return null;
    }
  },
  
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error(`Error writing ${name} to storage:`, error);
    }
  },
  
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error(`Error removing ${name} from storage:`, error);
    }
  },
};

// Storage utilities
export const storage = {
  // Get item with type safety
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },
  
  // Set item with type safety
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  },
  
  // Remove item
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
  
  // Clear all app data
  async clear(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
  
  // Get multiple items
  async getMultiple<T extends Record<string, any>>(
    keys: string[]
  ): Promise<Partial<T>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: any = {};
      
      pairs.forEach(([key, value]) => {
        if (value) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  },
  
  // Set multiple items
  async setMultiple(items: Record<string, any>): Promise<void> {
    try {
      const pairs = Object.entries(items).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
    }
  },
};

// Migration utilities for schema changes
export interface Migration {
  version: number;
  migrate: (oldData: any) => any;
}

export class StorageMigration {
  private migrations: Migration[];
  private storageKey: string;
  private versionKey: string;
  
  constructor(storageKey: string, migrations: Migration[]) {
    this.storageKey = storageKey;
    this.versionKey = `${storageKey}_version`;
    this.migrations = migrations.sort((a, b) => a.version - b.version);
  }
  
  async migrate(): Promise<void> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const latestVersion = this.getLatestVersion();
      
      if (currentVersion >= latestVersion) {
        return; // No migration needed
      }
      
      let data = await storage.get(this.storageKey);
      if (!data) {
        // No data to migrate
        await this.setVersion(latestVersion);
        return;
      }
      
      // Apply migrations sequentially
      for (const migration of this.migrations) {
        if (migration.version > currentVersion) {
          console.log(`Migrating ${this.storageKey} to v${migration.version}`);
          data = migration.migrate(data);
        }
      }
      
      // Save migrated data
      await storage.set(this.storageKey, data);
      await this.setVersion(latestVersion);
      
      console.log(`Migration complete for ${this.storageKey}`);
    } catch (error) {
      console.error(`Migration failed for ${this.storageKey}:`, error);
    }
  }
  
  private async getCurrentVersion(): Promise<number> {
    const version = await storage.get<number>(this.versionKey);
    return version ?? 0;
  }
  
  private async setVersion(version: number): Promise<void> {
    await storage.set(this.versionKey, version);
  }
  
  private getLatestVersion(): number {
    if (this.migrations.length === 0) return 0;
    return Math.max(...this.migrations.map(m => m.version));
  }
}

// Example migrations
export const authStoreMigrations: Migration[] = [
  {
    version: 1,
    migrate: (data) => {
      // Example: Add new field to auth data
      return {
        ...data,
        lastLoginAt: data.lastLoginAt || new Date().toISOString(),
      };
    },
  },
  {
    version: 2,
    migrate: (data) => {
      // Example: Rename field
      const { oldFieldName, ...rest } = data;
      return {
        ...rest,
        newFieldName: oldFieldName,
      };
    },
  },
];

// Initialize migrations on app start
export const initializeStorageMigrations = async () => {
  const migrations = [
    new StorageMigration(STORAGE_KEYS.AUTH, authStoreMigrations),
    // Add more migrations as needed
  ];
  
  for (const migration of migrations) {
    await migration.migrate();
  }
};

// Secure storage for sensitive data (tokens, etc.)
export const secureStorage = {
  async setSecure(key: string, value: string): Promise<void> {
    // In production, use expo-secure-store
    // For now, use AsyncStorage with a warning
    console.warn('Using AsyncStorage for sensitive data. Consider expo-secure-store for production.');
    await AsyncStorage.setItem(key, value);
  },
  
  async getSecure(key: string): Promise<string | null> {
    // In production, use expo-secure-store
    console.warn('Using AsyncStorage for sensitive data. Consider expo-secure-store for production.');
    return AsyncStorage.getItem(key);
  },
  
  async removeSecure(key: string): Promise<void> {
    // In production, use expo-secure-store
    await AsyncStorage.removeItem(key);
  },
};