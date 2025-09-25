# API Design - Staked App

## Implementation Status Tracker

### Quick Status Overview
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⏸️ Blocked/Waiting

## Overview
RESTful API design using Supabase auto-generated endpoints with custom RPC functions for complex operations and real-time subscriptions for live updates.

## Implementation Checklist

### Phase 1: API Infrastructure Setup
- [ ] 🔴 Configure Supabase API settings
- [ ] 🔴 Set up API authentication
- [ ] 🔴 Configure CORS policies
- [ ] 🔴 Set up rate limiting
- [ ] 🔴 Create API documentation structure
- [ ] 🔴 Set up API testing environment
- [ ] 🔴 Configure API monitoring

## Authentication Endpoints

### Phase 2: Authentication API Implementation

#### Auth Setup Tasks
- [ ] 🔴 Configure Supabase Auth settings
- [ ] 🔴 Enable email/password authentication
- [ ] 🔴 Set up JWT token configuration
- [ ] 🔴 Configure refresh token settings
- [ ] 🔴 Set up password policies
- [ ] 🔴 Configure email templates

#### Sign Up Implementation
- [ ] 🔴 Create sign up endpoint handler
- [ ] 🔴 Add email validation
- [ ] 🔴 Add username uniqueness check
- [ ] 🔴 Implement password strength validation
- [ ] 🔴 Create user profile on sign up
- [ ] 🔴 Send verification email
- [ ] 🔴 Document sign up flow

#### Sign In Implementation
- [ ] 🔴 Create sign in endpoint handler
- [ ] 🔴 Implement email/password authentication
- [ ] 🔴 Add rate limiting for failed attempts
- [ ] 🔴 Generate access and refresh tokens
- [ ] 🔴 Handle remember me functionality
- [ ] 🔴 Document sign in flow

#### Password Reset Implementation
- [ ] 🔴 Create forgot password endpoint
- [ ] 🔴 Generate reset tokens
- [ ] 🔴 Send reset email
- [ ] 🔴 Create reset password endpoint
- [ ] 🔴 Validate reset tokens
- [ ] 🔴 Document password reset flow

#### Token Management
- [ ] 🔴 Implement token refresh endpoint
- [ ] 🔴 Add token validation middleware
- [ ] 🔴 Configure token expiration
- [ ] 🔴 Implement logout endpoint
- [ ] 🔴 Add token revocation
- [ ] 🔴 Document token lifecycle

### Sign Up
```typescript
POST /auth/v1/signup
Body: {
  email: string,
  password: string,
  data: {
    username: string,
    full_name: string
  }
}
Response: {
  user: User,
  session: Session
}
```

### Sign In
```typescript
POST /auth/v1/token?grant_type=password
Body: {
  email: string,
  password: string
}
Response: {
  user: User,
  session: Session,
  access_token: string,
  refresh_token: string
}
```

### Sign Out
```typescript
POST /auth/v1/logout
Headers: {
  Authorization: Bearer {access_token}
}
Response: 204 No Content
```

### Refresh Token
```typescript
POST /auth/v1/token?grant_type=refresh_token
Body: {
  refresh_token: string
}
Response: {
  access_token: string,
  refresh_token: string
}
```

## User Management

### Phase 3: User API Implementation

#### User Profile Tasks
- [ ] 🔴 Create get user profile endpoint
- [ ] 🔴 Create update profile endpoint
- [ ] 🔴 Implement avatar upload
- [ ] 🔴 Add username search endpoint
- [ ] 🔴 Create user preferences endpoints
- [ ] 🔴 Implement push token registration
- [ ] 🔴 Add timezone management
- [ ] 🔴 Document user CRUD operations

### Get Current User Profile
```typescript
GET /rest/v1/users?id=eq.{user_id}
Headers: {
  Authorization: Bearer {access_token}
}
Response: {
  id: string,
  email: string,
  username: string,
  full_name: string,
  avatar_url: string,
  push_token: string,
  email_notifications: boolean,
  push_notifications: boolean,
  timezone: string
}
```

### Update User Profile
```typescript
PATCH /rest/v1/users?id=eq.{user_id}
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  full_name?: string,
  avatar_url?: string,
  email_notifications?: boolean,
  push_notifications?: boolean,
  timezone?: string
}
Response: User
```

### Search Users by Username
```typescript
GET /rest/v1/users?username=ilike.%{query}%&select=id,username,full_name,avatar_url
Headers: {
  Authorization: Bearer {access_token}
}
Response: User[]
```

### Register Push Token
```typescript
POST /rest/v1/rpc/register_push_token
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  push_token: string,
  platform: 'ios' | 'android'
}
Response: { success: boolean }
```

## Group Management

### Phase 4: Groups API Implementation

#### Group CRUD Tasks
- [ ] 🔴 Create group creation endpoint
- [ ] 🔴 Implement get user groups endpoint
- [ ] 🔴 Create get group details endpoint
- [ ] 🔴 Add update group endpoint
- [ ] 🔴 Implement archive group function
- [ ] 🔴 Create group search functionality
- [ ] 🔴 Add group statistics endpoint
- [ ] 🔴 Document group operations

#### Member Management Tasks
- [ ] 🔴 Create invite member endpoint
- [ ] 🔴 Implement accept invitation endpoint
- [ ] 🔴 Add invitation code generation
- [ ] 🔴 Create update member role endpoint
- [ ] 🔴 Implement remove member function
- [ ] 🔴 Add leave group endpoint
- [ ] 🔴 Create member list endpoint
- [ ] 🔴 Document member operations

### Create Group
```typescript
POST /rest/v1/groups
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  name: string,
  description: string,
  currency_code: string,
  max_members: number
}
Response: Group
```

### Get User's Groups
```typescript
GET /rest/v1/rpc/get_user_groups
Headers: {
  Authorization: Bearer {access_token}
}
Response: Array<{
  group: Group,
  role: string,
  joined_at: string,
  member_count: number,
  active_habits: number,
  total_debt_owed: number,
  total_debt_owed_to: number
}>
```

### Get Group Details
```typescript
GET /rest/v1/groups?id=eq.{group_id}&select=*,group_members(*,users(*))
Headers: {
  Authorization: Bearer {access_token}
}
Response: {
  id: string,
  name: string,
  description: string,
  currency_code: string,
  created_at: string,
  group_members: Array<{
    id: string,
    role: string,
    joined_at: string,
    users: User
  }>
}
```

### Update Group
```typescript
PATCH /rest/v1/groups?id=eq.{group_id}
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  name?: string,
  description?: string,
  settings?: object
}
Response: Group
```

### Archive Group
```typescript
POST /rest/v1/rpc/archive_group
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id: string
}
Response: { success: boolean }
```

## Group Member Management

### Invite to Group
```typescript
POST /rest/v1/group_invitations
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id: string,
  invited_email?: string,
  invited_user_id?: string
}
Response: {
  id: string,
  invitation_code: string,
  expires_at: string
}
```

### Accept Invitation
```typescript
POST /rest/v1/rpc/accept_invitation
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  invitation_code: string
}
Response: {
  success: boolean,
  group: Group
}
```

### Update Member Role
```typescript
PATCH /rest/v1/group_members?id=eq.{member_id}
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  role: 'admin' | 'member'
}
Response: GroupMember
```

### Remove Member
```typescript
POST /rest/v1/rpc/remove_group_member
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id: string,
  user_id: string,
  archive_debts: boolean
}
Response: { success: boolean }
```

### Leave Group
```typescript
POST /rest/v1/rpc/leave_group
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id: string
}
Response: { success: boolean }
```

## Habit Management

### Phase 5: Habits API Implementation

#### Habit Operations Tasks
- [ ] 🔴 Create habit creation endpoint
- [ ] 🔴 Implement get group habits endpoint
- [ ] 🔴 Add update habit endpoint
- [ ] 🔴 Create pause/resume habit function
- [ ] 🔴 Implement delete habit endpoint
- [ ] 🔴 Add habit statistics endpoint
- [ ] 🔴 Create habit history endpoint
- [ ] 🔴 Document habit CRUD operations

### Create Habit
```typescript
POST /rest/v1/habits
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id: string,
  name: string,
  description: string,
  frequency_type: 'daily' | 'weekly' | 'monthly' | 'custom',
  frequency_value: number,
  frequency_days: number[],
  check_in_deadline: string, // HH:MM format
  stake_amount: number,
  starts_at: string,
  ends_at?: string
}
Response: Habit
```

### Get Group Habits
```typescript
GET /rest/v1/habits?group_id=eq.{group_id}&select=*,users(*)
Headers: {
  Authorization: Bearer {access_token}
}
Response: Array<{
  id: string,
  name: string,
  description: string,
  frequency_type: string,
  check_in_deadline: string,
  stake_amount: number,
  is_active: boolean,
  is_paused: boolean,
  users: User
}>
```

### Update Habit
```typescript
PATCH /rest/v1/habits?id=eq.{habit_id}
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  name?: string,
  description?: string,
  check_in_deadline?: string,
  stake_amount?: number,
  is_active?: boolean
}
Response: Habit
```

### Pause/Resume Habit
```typescript
POST /rest/v1/rpc/toggle_habit_pause
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  habit_id: string,
  is_paused: boolean,
  reason?: string
}
Response: { success: boolean }
```

### Delete Habit
```typescript
DELETE /rest/v1/habits?id=eq.{habit_id}
Headers: {
  Authorization: Bearer {access_token}
}
Response: 204 No Content
```

## Check-in Management

### Phase 6: Check-ins API Implementation

#### Check-in Tasks
- [ ] 🔴 Create get today's check-ins endpoint
- [ ] 🔴 Implement perform check-in function
- [ ] 🔴 Add check-in validation logic
- [ ] 🔴 Create check-in history endpoint
- [ ] 🔴 Add group check-in status endpoint
- [ ] 🔴 Implement bulk check-in endpoint
- [ ] 🔴 Create streak calculation endpoint
- [ ] 🔴 Document check-in workflows

### Get Today's Check-ins
```typescript
GET /rest/v1/rpc/get_todays_checkins
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id?: string
}
Response: Array<{
  habit: Habit,
  check_in: CheckIn | null,
  deadline: string,
  can_check_in: boolean
}>
```

### Perform Check-in
```typescript
POST /rest/v1/rpc/perform_checkin
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  habit_id: string,
  status: 'completed' | 'missed',
  notes?: string
}
Response: {
  success: boolean,
  check_in: CheckIn,
  debt_created?: Debt
}
```

### Get Check-in History
```typescript
GET /rest/v1/check_ins?habit_id=eq.{habit_id}&order=check_in_date.desc&limit=30
Headers: {
  Authorization: Bearer {access_token}
}
Response: CheckIn[]
```

### Get Group Check-in Status
```typescript
GET /rest/v1/rpc/get_group_checkin_status
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id: string,
  date: string
}
Response: Array<{
  user: User,
  habits: Array<{
    habit: Habit,
    check_in: CheckIn | null
  }>
}>
```

## Debt Management

### Phase 7: Financial API Implementation

#### Debt Management Tasks
- [ ] 🔴 Create get user debts endpoint
- [ ] 🔴 Implement debt aggregation logic
- [ ] 🔴 Add net balance calculation
- [ ] 🔴 Create debt details endpoint
- [ ] 🔴 Implement archive debt function
- [ ] 🔴 Add debt history endpoint
- [ ] 🔴 Document debt calculation API

### Get User Debts
```typescript
GET /rest/v1/rpc/get_user_debts
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id?: string
}
Response: {
  debts_owed: Array<{
    creditor: User,
    amount: number,
    currency_code: string,
    debt_count: number
  }>,
  debts_owed_to: Array<{
    debtor: User,
    amount: number,
    currency_code: string,
    debt_count: number
  }>,
  net_balance: number
}
```

### Get Debt Details
```typescript
GET /rest/v1/debts?group_id=eq.{group_id}&is_settled=eq.false&select=*,debtor:users!debtor_id(*),creditor:users!creditor_id(*)
Headers: {
  Authorization: Bearer {access_token}
}
Response: Debt[]
```

### Archive Debt
```typescript
POST /rest/v1/rpc/archive_debt
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  debt_id: string
}
Response: { success: boolean }
```

## Payment Management

#### Payment Operations Tasks
- [ ] 🔴 Create record payment endpoint
- [ ] 🔴 Implement get pending payments endpoint
- [ ] 🔴 Add payment confirmation endpoint
- [ ] 🔴 Create dispute payment function
- [ ] 🔴 Implement payment history endpoint
- [ ] 🔴 Add payment notification logic
- [ ] 🔴 Document payment workflows

### Record Payment
```typescript
POST /rest/v1/payments
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id: string,
  receiver_id: string,
  amount: number,
  currency_code: string,
  payment_method: string,
  transaction_reference?: string,
  notes?: string
}
Response: Payment
```

### Get Pending Payments
```typescript
GET /rest/v1/payments?receiver_id=eq.{user_id}&status=eq.pending&select=*,payer:users!payer_id(*)
Headers: {
  Authorization: Bearer {access_token}
}
Response: Payment[]
```

### Confirm Payment
```typescript
POST /rest/v1/payment_confirmations
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  payment_id: string
}
Response: {
  success: boolean,
  updated_debts: Debt[]
}
```

### Dispute Payment
```typescript
POST /rest/v1/rpc/dispute_payment
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  payment_id: string,
  dispute_reason: string
}
Response: { success: boolean }
```

### Get Payment History
```typescript
GET /rest/v1/payments?or=(payer_id.eq.{user_id},receiver_id.eq.{user_id})&order=created_at.desc
Headers: {
  Authorization: Bearer {access_token}
}
Response: Payment[]
```

## Vacation Mode

### Phase 8: Additional Features Implementation

#### Vacation Mode Tasks
- [ ] 🔴 Create set vacation mode endpoint
- [ ] 🔴 Implement get active vacations endpoint
- [ ] 🔴 Add cancel vacation endpoint
- [ ] 🔴 Create vacation validation logic
- [ ] 🔴 Document vacation mode API

## Additional Features

### Set Vacation Mode
```typescript
POST /rest/v1/vacation_modes
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id?: string,
  habit_id?: string,
  starts_at: string,
  ends_at: string,
  reason?: string
}
Response: VacationMode
```

### Get Active Vacations
```typescript
GET /rest/v1/vacation_modes?user_id=eq.{user_id}&is_active=eq.true
Headers: {
  Authorization: Bearer {access_token}
}
Response: VacationMode[]
```

### Cancel Vacation
```typescript
PATCH /rest/v1/vacation_modes?id=eq.{vacation_id}
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  is_active: false,
  cancelled_at: string
}
Response: VacationMode
```

#### Statistics & Analytics Tasks
- [ ] 🔴 Create user statistics endpoint
- [ ] 🔴 Implement group leaderboard endpoint
- [ ] 🔴 Add habit analytics endpoint
- [ ] 🔴 Create achievement tracking endpoints
- [ ] 🔴 Document analytics API

## Statistics & Analytics

### Get User Statistics
```typescript
GET /rest/v1/rpc/get_user_statistics
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id?: string,
  date_from?: string,
  date_to?: string
}
Response: {
  total_habits: number,
  active_habits: number,
  total_checkins: number,
  successful_checkins: number,
  success_rate: number,
  current_streak: number,
  longest_streak: number,
  total_stake_amount: number,
  total_debt_paid: number,
  total_debt_received: number
}
```

### Get Group Leaderboard
```typescript
GET /rest/v1/rpc/get_group_leaderboard
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  group_id: string,
  period: 'week' | 'month' | 'all_time'
}
Response: Array<{
  user: User,
  rank: number,
  success_rate: number,
  total_checkins: number,
  successful_checkins: number,
  current_streak: number,
  total_earned: number,
  total_lost: number
}>
```

### Get Habit Analytics
```typescript
GET /rest/v1/rpc/get_habit_analytics
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  habit_id: string
}
Response: {
  completion_rate: number,
  checkins_by_day: object,
  checkins_by_week: object,
  total_stake_lost: number,
  average_checkin_time: string,
  streak_data: object
}
```

#### Notifications Tasks
- [ ] 🔴 Create get notifications endpoint
- [ ] 🔴 Implement mark as read endpoint
- [ ] 🔴 Add mark all as read function
- [ ] 🔴 Create unread count endpoint
- [ ] 🔴 Implement notification preferences
- [ ] 🔴 Document notification API

## Notifications

### Get Notifications
```typescript
GET /rest/v1/notifications?user_id=eq.{user_id}&order=created_at.desc&limit=50
Headers: {
  Authorization: Bearer {access_token}
}
Response: Notification[]
```

### Mark Notification as Read
```typescript
PATCH /rest/v1/notifications?id=eq.{notification_id}
Headers: {
  Authorization: Bearer {access_token}
}
Body: {
  is_read: true,
  read_at: string
}
Response: Notification
```

### Mark All as Read
```typescript
POST /rest/v1/rpc/mark_all_notifications_read
Headers: {
  Authorization: Bearer {access_token}
}
Response: { success: boolean, updated_count: number }
```

### Get Unread Count
```typescript
GET /rest/v1/rpc/get_unread_notification_count
Headers: {
  Authorization: Bearer {access_token}
}
Response: { count: number }
```

## Real-time Subscriptions

### Phase 9: Real-time Implementation

#### WebSocket Setup Tasks
- [ ] 🔴 Configure Supabase Realtime
- [ ] 🔴 Set up WebSocket connection handling
- [ ] 🔴 Implement reconnection logic
- [ ] 🔴 Add connection state management
- [ ] 🔴 Create subscription cleanup

#### Channel Implementation Tasks
- [ ] 🔴 Create group updates channel
- [ ] 🔴 Implement check-in updates channel
- [ ] 🔴 Add debt updates channel
- [ ] 🔴 Create payment notifications channel
- [ ] 🔴 Implement notification stream
- [ ] 🔴 Add presence tracking
- [ ] 🔴 Document real-time patterns

### Group Updates Channel
```typescript
// Subscribe to all changes in a group
const groupChannel = supabase
  .channel(`group:${groupId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'group_members',
      filter: `group_id=eq.${groupId}`
    },
    (payload) => {
      // Handle member changes
    }
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'habits',
      filter: `group_id=eq.${groupId}`
    },
    (payload) => {
      // Handle habit changes
    }
  )
  .subscribe()
```

### Check-in Updates
```typescript
// Subscribe to check-in updates for a group
const checkinChannel = supabase
  .channel(`checkins:${groupId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'check_ins',
      filter: `habit_id=in.(${habitIds.join(',')})`
    },
    (payload) => {
      // Handle check-in updates
    }
  )
  .subscribe()
```

### Debt Updates
```typescript
// Subscribe to debt changes for a user
const debtChannel = supabase
  .channel(`debts:${userId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'debts',
      filter: `or=(debtor_id.eq.${userId},creditor_id.eq.${userId})`
    },
    (payload) => {
      // Handle debt updates
    }
  )
  .subscribe()
```

### Payment Notifications
```typescript
// Subscribe to payment updates
const paymentChannel = supabase
  .channel(`payments:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'payments',
      filter: `receiver_id=eq.${userId}`
    },
    (payload) => {
      // Handle new payment notification
    }
  )
  .subscribe()
```

### Notification Stream
```typescript
// Subscribe to new notifications
const notificationChannel = supabase
  .channel(`notifications:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Handle new notification
    }
  )
  .subscribe()
```

### Presence (Online Status)
```typescript
// Track online group members
const presenceChannel = supabase.channel(`presence:${groupId}`)
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState()
    // Update UI with online users
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    // User joined
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    // User left
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
      })
    }
  })
```

## Error Responses

### Phase 10: Error Handling & Documentation

#### Error Handling Tasks
- [ ] 🔴 Define error response format
- [ ] 🔴 Create error code system
- [ ] 🔴 Implement error middleware
- [ ] 🔴 Add error logging
- [ ] 🔴 Create error recovery mechanisms
- [ ] 🔴 Document error scenarios

### Standard Error Format
```typescript
{
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Common Error Codes
- `AUTH001`: Invalid credentials
- `AUTH002`: Token expired
- `AUTH003`: Insufficient permissions
- `GROUP001`: Group not found
- `GROUP002`: Group full
- `GROUP003`: Already a member
- `HABIT001`: Habit not found
- `HABIT002`: Invalid frequency
- `CHECKIN001`: Already checked in
- `CHECKIN002`: Past deadline
- `DEBT001`: Insufficient balance
- `PAYMENT001`: Payment not found
- `PAYMENT002`: Already confirmed

#### Rate Limiting Tasks
- [ ] 🔴 Configure rate limit thresholds
- [ ] 🔴 Implement rate limiting middleware
- [ ] 🔴 Add rate limit headers
- [ ] 🔴 Create rate limit bypass for testing
- [ ] 🔴 Document rate limit behavior

## Rate Limiting

### Default Limits
- Authentication: 5 requests per minute
- Read operations: 100 requests per minute
- Write operations: 30 requests per minute
- Real-time subscriptions: 10 channels per connection

### Headers
```typescript
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

#### API Documentation Tasks
- [ ] 🔴 Generate API documentation
- [ ] 🔴 Create API examples
- [ ] 🔴 Add request/response schemas
- [ ] 🔴 Document authentication flow
- [ ] 🔴 Create API changelog
- [ ] 🔴 Set up API playground

## API Versioning

The API uses URL versioning:
- Current version: `/rest/v1/`
- Legacy support: Minimum 6 months notice before deprecation
- Version header: `X-API-Version: 1`

## SDK Integration

### Phase 11: Client SDK Implementation

#### SDK Setup Tasks
- [ ] 🔴 Install Supabase JavaScript client
- [ ] 🔴 Configure client authentication
- [ ] 🔴 Set up AsyncStorage for React Native
- [ ] 🔴 Create typed API client wrapper
- [ ] 🔴 Add request/response interceptors
- [ ] 🔴 Implement retry logic
- [ ] 🔴 Create custom hooks for API calls
- [ ] 🔴 Document SDK usage patterns

### JavaScript/TypeScript Client
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Example: Fetch user's groups
const { data, error } = await supabase
  .rpc('get_user_groups')
  
// Example: Real-time subscription
const subscription = supabase
  .channel('custom-channel')
  .on('postgres_changes', { /* config */ }, callback)
  .subscribe()
```

### React Native Integration
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```