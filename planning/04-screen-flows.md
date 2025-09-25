# Screen Flows & Navigation - Staked App

## Implementation Status Tracker

### Quick Status Overview
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⏸️ Blocked/Waiting

## Implementation Checklist

### Summary
- **Total Tasks**: 163
- **Completed**: 3
- **Remaining**: 160
- **Phases**: 7

### Phases Overview
1. **Design System Setup** - Colors, typography, components (17 tasks)
2. **Navigation Implementation** - Routing and navigation structure (8 tasks)
3. **Authentication Screens** - Welcome, Sign Up, Sign In, Password Reset (30 tasks)
4. **Core Application Screens** - Dashboard, Groups, Habits, Finances, Profile (51 tasks)
5. **Modal Screens** - Check-in, Invite, Vacation, Payment modals (12 tasks)
6. **Navigation Features** - Deep linking, gestures, states, animations (26 tasks)
7. **Accessibility** - Screen reader, visual, navigation support (19 tasks)

### Phase 1: Design System Setup

#### Color Palette Implementation
- [x] 🟢 Basic Tailwind colors configured
- [ ] 🔴 Add Headspace-inspired primary colors to Tailwind
- [ ] 🔴 Configure semantic color variables
- [ ] 🔴 Create color usage guidelines
- [ ] 🔴 Implement dark mode color variants
- [ ] 🔴 Test color accessibility (WCAG compliance)

#### Typography System
- [ ] 🔴 Configure system font stack
- [ ] 🔴 Define typography scale (headings, body, captions)
- [ ] 🔴 Set line-height and letter-spacing
- [ ] 🔴 Create text component variants
- [ ] 🔴 Implement responsive font sizes

#### Component Styling Standards
- [x] 🟢 Basic button component created
- [ ] 🔴 Refine button variants (primary, secondary, ghost)
- [ ] 🔴 Standardize border radius (rounded-full, rounded-3xl)
- [ ] 🔴 Define shadow system (sm, md, lg)
- [ ] 🔴 Create spacing scale documentation
- [ ] 🔴 Implement focus and hover states

## Design System

### Color Palette (Headspace-Inspired)

#### Primary Colors
- **Vibrant Orange**: `#FF6F00` - Primary actions, CTAs
- **Calm Blue**: `#4A7BA7` - Secondary actions, links
- **Deep Purple**: `#3F3068` - Accent, focus states
- **Soft Teal**: `#A1CED6` - Success states, positive feedback

#### Neutral Colors
- **Off-White**: `#FAF9F7` - Main background
- **Pure White**: `#FFFFFF` - Cards, elevated surfaces
- **Charcoal**: `#2D3142` - Primary text
- **Soft Gray**: `#6B7280` - Secondary text
- **Light Gray**: `#E5E7EB` - Borders, dividers

#### Semantic Colors
- **Success Green**: `#88D8B0` - Completed habits, positive
- **Warning Amber**: `#FFB86C` - Deadlines, cautions
- **Error Coral**: `#FF9B71` - Missed habits, errors
- **Info Lavender**: `#8194FC` - Information, tips

### Typography
- **Font Family**: System fonts (SF Pro on iOS, Roboto on Android)
- **Headings**: Bold, larger sizes with tight letter-spacing
- **Body**: Regular weight, comfortable reading size
- **Captions**: Smaller, lighter weight for secondary info

### Component Styling

#### Buttons
```
Primary: bg-orange-500 rounded-full px-8 py-4 shadow-sm
Secondary: bg-blue-500 rounded-full px-8 py-4
Ghost: border border-gray-300 rounded-full px-8 py-4
```

#### Cards
```
bg-white rounded-3xl p-6 shadow-sm border border-gray-100
```

#### Input Fields
```
bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus:border-blue-500
```

#### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### Animation & Transitions
- **Duration**: 200ms for micro-interactions, 300ms for page transitions
- **Easing**: Cubic-bezier for smooth, natural movement
- **Haptics**: Gentle feedback on important actions

### Phase 2: Navigation Implementation

#### Navigation Setup
- [x] 🟢 Basic Expo Router configured
- [ ] 🔴 Create auth stack navigation
- [ ] 🔴 Create main tab navigator
- [ ] 🔴 Configure modal stack
- [ ] 🔴 Implement deep linking
- [ ] 🔴 Add navigation guards
- [ ] 🔴 Create navigation transitions
- [ ] 🔴 Implement gesture handlers

## Navigation Structure

```
App
├── Auth Stack (Unauthenticated)
│   ├── Welcome Screen
│   ├── Sign In Screen
│   ├── Sign Up Screen
│   └── Forgot Password Screen
│
└── Main Stack (Authenticated)
    ├── Tab Navigator
    │   ├── Home Tab
    │   │   ├── Dashboard Screen
    │   │   └── Quick Check-in Modal
    │   ├── Groups Tab
    │   │   ├── Groups List Screen
    │   │   ├── Group Details Screen
    │   │   │   ├── My Habits Tab
    │   │   │   ├── Members Tab
    │   │   │   ├── Finances Tab
    │   │   │   └── Leaderboard Tab
    │   │   ├── Create Group Screen
    │   │   ├── Join Group Screen
    │   │   └── Group Settings Screen
    │   ├── Habits Tab
    │   │   ├── All Habits Screen
    │   │   ├── Create Habit Screen
    │   │   ├── Edit Habit Screen
    │   │   └── Habit Details Screen
    │   ├── Finances Tab
    │   │   ├── Balance Overview Screen
    │   │   ├── Debt Details Screen
    │   │   ├── Record Payment Screen
    │   │   └── Payment History Screen
    │   └── Profile Tab
    │       ├── Profile Screen
    │       ├── Settings Screen
    │       ├── Notifications Screen
    │       └── Statistics Screen
    │
    └── Modal Stack
        ├── Notification Center
        ├── Invite Members Modal
        ├── Vacation Mode Modal
        └── Payment Confirmation Modal
```

## Authentication Flow

### Phase 3: Authentication Screens Implementation

#### Welcome Screen Tasks
- [ ] 🔴 Create Welcome screen layout
- [ ] 🔴 Add app logo with animations
- [ ] 🔴 Implement tagline typography
- [ ] 🔴 Create "Get Started" button
- [ ] 🔴 Add "I have an account" link
- [ ] 🔴 Implement screen transitions
- [ ] 🔴 Add background gradient/pattern

#### Sign Up Screen Tasks
- [ ] 🔴 Create Sign Up screen layout
- [ ] 🔴 Build email input with validation UI
- [ ] 🔴 Add username input with availability check UI
- [ ] 🔴 Create password strength indicator UI
- [ ] 🔴 Implement terms checkbox
- [ ] 🔴 Add social sign up buttons
- [ ] 🔴 Create loading states
- [ ] 🔴 Implement error displays

#### Sign In Screen Tasks
- [ ] 🔴 Create Sign In screen layout
- [ ] 🔴 Build login form UI
- [ ] 🔴 Add "Remember me" checkbox
- [ ] 🔴 Create "Forgot Password" link
- [ ] 🔴 Implement social sign in buttons
- [ ] 🔴 Add loading animations
- [ ] 🔴 Create error toast components

#### Forgot Password Screen Tasks
- [ ] 🔴 Create password reset layout
- [ ] 🔴 Build email input form
- [ ] 🔴 Add success message display
- [ ] 🔴 Create "Back to Sign In" navigation
- [ ] 🔴 Implement loading states

### 1. Welcome Screen
**Route:** `/auth/welcome`
**Components:**
- App logo and branding
- Tagline: "Track habits together, with stakes"
- "Get Started" button → Sign Up
- "I have an account" link → Sign In

### 2. Sign Up Screen
**Route:** `/auth/signup`
**Components:**
- Email input
- Username input (unique)
- Full name input
- Password input (with strength indicator)
- Confirm password input
- Terms & Privacy checkbox
- "Create Account" button
- "Already have an account?" link → Sign In
- Social sign up options (Google, Apple)

**Validation:**
- Email format validation
- Username availability check
- Password minimum 8 characters
- Password match validation

### 3. Sign In Screen
**Route:** `/auth/signin`
**Components:**
- Email/Username input
- Password input
- "Remember me" checkbox
- "Sign In" button
- "Forgot Password?" link
- "Create Account" link → Sign Up
- Social sign in options

### 4. Forgot Password Screen
**Route:** `/auth/forgot-password`
**Components:**
- Email input
- "Send Reset Link" button
- Success message display
- "Back to Sign In" link

## Main Application Screens

### Phase 4: Core Application Screens

#### Dashboard Implementation
- [ ] 🔴 Create Dashboard layout
- [ ] 🔴 Build welcome message component
- [ ] 🔴 Create today's habits summary card
- [ ] 🔴 Implement quick check-in list
- [ ] 🔴 Build balance overview card
- [ ] 🔴 Create activity feed component
- [ ] 🔴 Add floating action button
- [ ] 🔴 Implement pull-to-refresh

#### Groups Screens
- [ ] 🔴 Create Groups List screen
- [ ] 🔴 Build group card components
- [ ] 🔴 Implement search functionality UI
- [ ] 🔴 Create filter chips
- [ ] 🔴 Build Group Details screen with tabs
- [ ] 🔴 Create Members tab layout
- [ ] 🔴 Build Finances tab layout
- [ ] 🔴 Implement Leaderboard tab
- [ ] 🔴 Create Create Group form
- [ ] 🔴 Build Join Group screen
- [ ] 🔴 Implement Group Settings UI

#### Habits Screens
- [ ] 🔴 Create Habits List screen
- [ ] 🔴 Build habit card components
- [ ] 🔴 Create Habit Creation form
- [ ] 🔴 Build frequency selector UI
- [ ] 🔴 Implement deadline picker
- [ ] 🔴 Create stake amount input
- [ ] 🔴 Build Habit Details screen
- [ ] 🔴 Create check-in history view
- [ ] 🔴 Implement Edit Habit screen
- [ ] 🔴 Build pause/resume UI

#### Financial Screens
- [ ] 🔴 Create Balance Overview screen
- [ ] 🔴 Build debt summary cards
- [ ] 🔴 Create Debt Details view
- [ ] 🔴 Build Record Payment form
- [ ] 🔴 Create payment method selector
- [ ] 🔴 Build Payment History list
- [ ] 🔴 Create payment confirmation modal
- [ ] 🔴 Implement dispute UI

#### Profile & Settings
- [ ] 🔴 Create Profile screen layout
- [ ] 🔴 Build avatar upload UI
- [ ] 🔴 Create Edit Profile form
- [ ] 🔴 Build Settings screen
- [ ] 🔴 Create Notifications settings
- [ ] 🔴 Build Statistics dashboard
- [ ] 🔴 Implement achievement display

### Home Tab

#### Dashboard Screen
**Route:** `/home`
**Components:**
- Welcome message with user name
- Today's habits summary card
  - X habits to complete
  - Y habits completed
  - Z habits missed
- Quick check-in list (scrollable)
  - Habit name
  - Group name
  - Deadline countdown
  - Quick check/cross buttons
- Current balance card
  - Total owed: $X
  - Total owed to you: $Y
- Recent activity feed
- Floating "+" button → Create Habit

**Actions:**
- Tap habit → Habit Details
- Tap group name → Group Details
- Tap balance card → Finances Tab
- Pull to refresh

### Groups Tab

#### Groups List Screen
**Route:** `/groups`
**Components:**
- Search bar
- Filter chips (Active, Archived)
- Groups list cards
  - Group name & member count
  - Your role badge
  - Active habits count
  - Net balance in group
- "Create Group" button
- "Join Group" button

**Actions:**
- Tap group → Group Details
- Long press → Quick actions menu
- Swipe to archive (admin only)

#### Group Details Screen
**Route:** `/groups/:id`
**Components:**
- Group header
  - Name & description
  - Member count
  - Currency
  - Settings icon (admin)
- Tab navigation:

**My Habits Tab:**
- List of your habits in this group
- Add habit button
- Habit cards showing:
  - Name & frequency
  - Stake amount
  - Check-in status
  - Next deadline

**Members Tab:**
- Member list with:
  - Avatar & name
  - Role badge
  - Success rate
  - Current balance
- Invite button (admin)
- Member actions (admin)

**Finances Tab:**
- Group debt matrix
- Your debts in group
- Debts owed to you
- Recent transactions
- "Record Payment" button

**Leaderboard Tab:**
- Period selector (Week/Month/All-time)
- Ranked member list:
  - Rank & avatar
  - Name & success rate
  - Streaks
  - Net earnings

#### Create Group Screen
**Route:** `/groups/create`
**Components:**
- Group name input
- Description textarea
- Currency selector
- Max members selector (1-10)
- "Create Group" button

#### Join Group Screen
**Route:** `/groups/join`
**Components:**
- Invitation code input
- QR code scanner button
- Recent invitations list
- "Join Group" button

#### Group Settings Screen
**Route:** `/groups/:id/settings`
**Components:**
- Edit group details section
- Member management
  - Promote/demote members
  - Remove members
- Notification settings
- Archive group option
- Delete group option (owner only)

### Habits Tab

#### All Habits Screen
**Route:** `/habits`
**Components:**
- Calendar view toggle
- Filter options:
  - Group selector
  - Frequency filter
  - Status filter
- Habits list/calendar
- Habit cards:
  - Name & group
  - Progress bar
  - Streak counter
  - Next check-in
- "Create Habit" floating button

#### Create Habit Screen
**Route:** `/habits/create`
**Components:**
- Group selector (required)
- Habit name input
- Description textarea
- Frequency selector:
  - Daily
  - Weekly (day picker)
  - Monthly (date picker)
  - Custom (interval input)
- Check-in deadline time picker
- Stake amount input
- Start date picker
- End date picker (optional)
- "Create Habit" button

#### Edit Habit Screen
**Route:** `/habits/:id/edit`
**Components:**
- Same as Create Habit
- "Save Changes" button
- "Pause Habit" toggle
- "Delete Habit" button

#### Habit Details Screen
**Route:** `/habits/:id`
**Components:**
- Habit header info
- Statistics cards:
  - Success rate
  - Current streak
  - Total stakes
  - Money lost/gained
- Calendar heat map
- Check-in history list
- "Check In" button (if pending)
- Action buttons:
  - Edit
  - Pause/Resume
  - Set Vacation

### Finances Tab

#### Balance Overview Screen
**Route:** `/finances`
**Components:**
- Total balance card
- Balance by group list
- Recent transactions
- Quick actions:
  - Record payment
  - View all debts
  - Payment history

#### Debt Details Screen
**Route:** `/finances/debts`
**Components:**
- Toggle: Owed to me / I owe
- Debts grouped by person
- Expandable debt items:
  - Person name & avatar
  - Total amount
  - Individual debts list
  - "Record Payment" button

#### Record Payment Screen
**Route:** `/finances/pay`
**Components:**
- Recipient selector
- Amount input
- Payment method selector
- Transaction reference input
- Notes textarea
- Debt breakdown display
- "Send Payment Record" button

#### Payment History Screen
**Route:** `/finances/history`
**Components:**
- Date range filter
- Payment list:
  - Date & time
  - Sender/Receiver
  - Amount
  - Status badge
  - Confirmation actions

### Profile Tab

#### Profile Screen
**Route:** `/profile`
**Components:**
- Avatar & edit button
- Username & full name
- Email
- Statistics summary:
  - Total habits
  - Success rate
  - Current streaks
- Quick links:
  - Settings
  - Notifications
  - Statistics
  - Help & Support
- Sign out button

#### Settings Screen
**Route:** `/profile/settings`
**Components:**
- Account section:
  - Edit profile
  - Change password
  - Email preferences
- Notifications section:
  - Push notifications toggle
  - Email notifications toggle
  - Notification schedule
- Privacy section:
  - Data export
  - Account deletion
- App section:
  - Theme selection
  - Language
  - Timezone

#### Notifications Screen
**Route:** `/profile/notifications`
**Components:**
- Unread/All filter
- Notification list:
  - Icon & title
  - Message preview
  - Timestamp
  - Read indicator
- Mark all read button
- Clear all button

#### Statistics Screen
**Route:** `/profile/stats`
**Components:**
- Period selector
- Overall stats cards
- Charts:
  - Success rate over time
  - Stakes won/lost
  - Habits by category
- Achievements section
- Export data button

### Phase 5: Modal Screens Implementation

#### Modal Components
- [ ] 🔴 Create modal wrapper component
- [ ] 🔴 Build Quick Check-in modal
- [ ] 🔴 Implement check-in countdown timer
- [ ] 🔴 Create Invite Members modal
- [ ] 🔴 Build QR code generator
- [ ] 🔴 Implement share functionality
- [ ] 🔴 Create Vacation Mode modal
- [ ] 🔴 Build date range picker
- [ ] 🔴 Create Payment Confirmation modal
- [ ] 🔴 Implement dispute flow UI
- [ ] 🔴 Add modal animations
- [ ] 🔴 Create backdrop blur effect

## Modal Screens

### Quick Check-in Modal
**Components:**
- Habit name & group
- Deadline countdown
- Large check/cross buttons
- Optional notes input
- Skip button

### Invite Members Modal
**Components:**
- Search users by username/email
- Share invitation link
- QR code display
- Copy invitation code
- Recent invitations list

### Vacation Mode Modal
**Components:**
- Scope selector:
  - All habits
  - Specific group
  - Specific habit
- Date range picker
- Reason textarea
- Affected habits preview
- "Set Vacation" button

### Payment Confirmation Modal
**Components:**
- Payment details:
  - Sender info
  - Amount
  - Date & reference
- Debt reconciliation preview
- "Confirm" button
- "Dispute" button
- Notes display

## Navigation Patterns

### Phase 6: Navigation Features Implementation

#### Deep Linking
- [ ] 🔴 Configure deep link URL scheme
- [ ] 🔴 Implement auth deep links
- [ ] 🔴 Create group invitation links
- [ ] 🔴 Build habit sharing links
- [ ] 🔴 Implement payment confirmation links
- [ ] 🔴 Test universal links (iOS)
- [ ] 🔴 Test app links (Android)

#### Gestures & Interactions
- [ ] 🔴 Implement swipe back navigation
- [ ] 🔴 Add pull-to-refresh on lists
- [ ] 🔴 Create swipe actions for list items
- [ ] 🔴 Implement long press menus
- [ ] 🔴 Add tab double-tap scroll to top
- [ ] 🔴 Create pinch-to-zoom for charts

#### Loading & Error States
- [ ] 🔴 Create skeleton screen components
- [ ] 🔴 Build loading indicators
- [ ] 🔴 Implement empty state designs
- [ ] 🔴 Create network error screens
- [ ] 🔴 Add retry mechanisms
- [ ] 🔴 Build offline mode indicators
- [ ] 🔴 Implement optimistic updates

#### Transitions & Animations
- [ ] 🔴 Configure stack navigation transitions
- [ ] 🔴 Create modal slide animations
- [ ] 🔴 Implement tab switch fades
- [ ] 🔴 Add list item animations
- [ ] 🔴 Create shared element transitions
- [ ] 🔴 Build micro-interactions

### Deep Linking Structure
```
staked://
├── auth/
│   ├── signin
│   └── signup
├── groups/
│   ├── :id
│   ├── create
│   └── join/:code
├── habits/
│   ├── :id
│   └── create
├── finances/
│   ├── pay/:userId
│   └── confirm/:paymentId
└── profile/
    └── settings
```

### Navigation Gestures
- Swipe back: iOS native back
- Pull to refresh: All list screens
- Swipe actions: Archive, delete, quick actions
- Long press: Context menus
- Tab double-tap: Scroll to top

### Loading States
- Skeleton screens for initial loads
- Pull-to-refresh indicators
- Inline loading for actions
- Optimistic updates with rollback

### Error States
- Empty states with actionable CTAs
- Network error with retry
- Form validation inline
- Toast notifications for actions

### Transitions
- Stack navigation: Slide horizontal
- Modal presentation: Slide up
- Tab switches: Fade
- List item selection: Scale + fade

## Accessibility Considerations

### Phase 7: Accessibility Implementation

#### Screen Reader Support
- [ ] 🔴 Add accessibility labels to all buttons
- [ ] 🔴 Create hint text for complex interactions
- [ ] 🔴 Group related elements for cards
- [ ] 🔴 Implement live regions for updates
- [ ] 🔴 Add role descriptions
- [ ] 🔴 Test with VoiceOver (iOS)
- [ ] 🔴 Test with TalkBack (Android)

#### Visual Accessibility
- [ ] 🔴 Implement high contrast mode
- [ ] 🔴 Add dynamic type support
- [ ] 🔴 Create reduced motion settings
- [ ] 🔴 Ensure WCAG AA color contrast
- [ ] 🔴 Add focus indicators
- [ ] 🔴 Implement color-blind modes

#### Navigation Accessibility
- [ ] 🔴 Add skip navigation links
- [ ] 🔴 Implement focus management
- [ ] 🔴 Enable keyboard navigation
- [ ] 🔴 Support external keyboards
- [ ] 🔴 Add voice control support
- [ ] 🔴 Create accessible modals

### Screen Reader Support
- All interactive elements labeled
- Hint text for complex actions
- Grouped elements for cards
- Announcements for state changes

### Visual Accessibility
- High contrast mode support
- Dynamic type support
- Reduced motion option
- Color-blind friendly palettes

### Navigation Accessibility
- Skip links for repetitive content
- Focus management on navigation
- Keyboard navigation support
- Voice control compatibility