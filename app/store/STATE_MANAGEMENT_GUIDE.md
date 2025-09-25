# State Management Architecture Guide

## Overview
This application uses a hybrid state management approach:
- **Zustand** for client-side state (auth, UI, local data)
- **React Query (TanStack Query)** for server state (API data, caching)
- **React Context** for theme and other cross-cutting concerns

## Architecture Principles

### 1. Separation of Concerns
- **Server State**: Data from API (users, habits, groups, payments)
- **Client State**: UI state, form data, user preferences
- **Navigation State**: Handled by Expo Router

### 2. Single Source of Truth
- Each piece of state has one authoritative source
- Derived state is computed, not stored
- Avoid duplicating state across stores

## Zustand Store Architecture

### Store Structure
```
stores/
├── authStore.ts        # Authentication & session
├── appStore.ts         # App-wide UI state
├── habitStore.ts       # Habit-related client state
├── groupStore.ts       # Group-related client state
└── notificationStore.ts # Notification preferences
```

### Store Patterns

#### Basic Store Template
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoreState {
  // State
  data: DataType;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  updateData: (data: Partial<DataType>) => void;
  clearData: () => void;
  
  // Computed/Derived
  get isValid(): boolean;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      data: null,
      loading: false,
      error: null,
      
      // Actions
      fetchData: async () => {
        set({ loading: true, error: null });
        try {
          const data = await api.getData();
          set({ data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
      
      updateData: (updates) => {
        set((state) => ({
          data: { ...state.data, ...updates }
        }));
      },
      
      clearData: () => {
        set({ data: null, error: null });
      },
      
      // Computed
      get isValid() {
        return get().data !== null && !get().error;
      }
    }),
    {
      name: 'store-name',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        // Only persist specific fields
        data: state.data 
      }),
    }
  )
);
```

### Action Naming Conventions
- **Fetch**: `fetchX` - Async data fetching
- **Load**: `loadX` - Load from storage/cache
- **Set**: `setX` - Direct state update
- **Update**: `updateX` - Partial state update
- **Clear**: `clearX` - Reset to initial state
- **Toggle**: `toggleX` - Boolean state toggle

### Store Composition
```typescript
// Combining stores
export const useAppState = () => {
  const auth = useAuthStore();
  const app = useAppStore();
  const habits = useHabitStore();
  
  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    theme: app.theme,
    habits: habits.habits,
  };
};
```

## React Query Patterns

### Query Keys
```typescript
// Consistent query key structure
export const queryKeys = {
  habits: {
    all: ['habits'] as const,
    list: (filters: HabitFilters) => ['habits', 'list', filters] as const,
    detail: (id: string) => ['habits', 'detail', id] as const,
  },
  groups: {
    all: ['groups'] as const,
    list: () => ['groups', 'list'] as const,
    detail: (id: string) => ['groups', 'detail', id] as const,
    members: (id: string) => ['groups', id, 'members'] as const,
  },
};
```

### Custom Hooks
```typescript
// Query hook
export const useHabits = (filters?: HabitFilters) => {
  return useQuery({
    queryKey: queryKeys.habits.list(filters),
    queryFn: () => api.habits.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutation hook
export const useCreateHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.habits.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.habits.all 
      });
    },
  });
};
```

### Optimistic Updates
```typescript
export const useUpdateHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.habits.update,
    onMutate: async (updatedHabit) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.habits.detail(updatedHabit.id) 
      });
      
      // Snapshot previous value
      const previousHabit = queryClient.getQueryData(
        queryKeys.habits.detail(updatedHabit.id)
      );
      
      // Optimistically update
      queryClient.setQueryData(
        queryKeys.habits.detail(updatedHabit.id),
        updatedHabit
      );
      
      return { previousHabit };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousHabit) {
        queryClient.setQueryData(
          queryKeys.habits.detail(variables.id),
          context.previousHabit
        );
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.habits.all 
      });
    },
  });
};
```

## State Flow Patterns

### Form State Management
```typescript
// Local form state with validation
const useFormState = () => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const validate = () => {
    // Validation logic
  };
  
  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };
  
  return { values, errors, touched, handleChange, validate };
};
```

### Real-time State Sync
```typescript
// Supabase real-time subscription
export const useRealtimeHabits = (groupId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const subscription = supabase
      .channel(`habits:${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habits',
        filter: `group_id=eq.${groupId}`,
      }, (payload) => {
        // Update cache with real-time data
        queryClient.invalidateQueries({
          queryKey: queryKeys.habits.list({ groupId })
        });
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [groupId]);
};
```

## Performance Optimization

### Selective Re-renders
```typescript
// Use selector pattern
const useUserName = () => {
  return useAuthStore((state) => state.user?.name);
};

// Shallow equality check
const useHabitIds = () => {
  return useHabitStore(
    (state) => state.habits.map(h => h.id),
    shallow
  );
};
```

### Memoization
```typescript
// Memoize expensive computations
const useFilteredHabits = (filter: string) => {
  const habits = useHabitStore((state) => state.habits);
  
  return useMemo(() => {
    return habits.filter(h => 
      h.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [habits, filter]);
};
```

## Testing State

### Store Testing
```typescript
describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState(initialState);
  });
  
  it('should login user', async () => {
    const { login } = useAuthStore.getState();
    await login('email@test.com', 'password');
    
    const { user, isAuthenticated } = useAuthStore.getState();
    expect(isAuthenticated).toBe(true);
    expect(user).toBeDefined();
  });
});
```

### Query Testing
```typescript
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useHabits', () => {
  it('should fetch habits', async () => {
    const { result } = renderHook(() => useHabits(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

## Migration Strategy

### From Redux to Zustand
1. Map Redux state shape to Zustand stores
2. Convert actions to Zustand methods
3. Replace selectors with Zustand selectors
4. Remove Redux boilerplate

### From Context to Zustand
1. Extract context state to Zustand store
2. Replace Provider with store hook
3. Update consumers to use store hook
4. Remove context boilerplate

## Best Practices

### Do's
- Keep stores focused and small
- Use TypeScript for type safety
- Implement proper error handling
- Cache server state with React Query
- Use optimistic updates for better UX
- Persist only necessary state

### Don'ts
- Don't duplicate server state in Zustand
- Avoid deeply nested state
- Don't mutate state directly
- Avoid circular dependencies between stores
- Don't persist sensitive data
- Don't overuse global state