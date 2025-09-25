# Styling Plan - Polish Existing Components

## Current State
We have functional components but they need visual polish to match the Headspace-inspired design system.

## Design System Reference
- Primary: #90B2AC (sage green)
- Secondary: #F5E6D3 (warm beige)
- Accent: #E8B4B8 (soft pink)
- Background: #FAFAFA (off-white)
- Text Primary: #2D3436
- Text Secondary: #636E72
- Success: #00B894
- Error: #FF6B6B
- Warning: #FDCB6E
- Border: #E1E4E8

## Components to Style

### 1. Authentication Screens
#### Welcome Screen
- [ ] Add gradient background or subtle pattern
- [ ] Improve logo/branding placement
- [ ] Enhance button animations
- [ ] Add smooth transitions
- [ ] Polish typography hierarchy

#### Sign In/Sign Up Screens
- [ ] Improve form field styling with better focus states
- [ ] Add input validation visual feedback
- [ ] Enhance error message display
- [ ] Add loading states with skeleton screens
- [ ] Improve button disabled states
- [ ] Add password visibility toggle with icon

### 2. Groups Screens
#### Groups List Screen
- [ ] Polish empty state illustration/design
- [ ] Improve group card design with shadows/elevation
- [ ] Add group type indicators (icons)
- [ ] Enhance member count badge styling
- [ ] Add subtle animations on card press
- [ ] Improve pull-to-refresh indicator
- [ ] Add loading skeleton screens

#### Create Group Screen
- [ ] Enhance form layout with better spacing
- [ ] Improve currency selector (pill buttons)
- [ ] Add character count indicators with progress
- [ ] Polish info card styling
- [ ] Add form validation indicators
- [ ] Improve textarea styling

#### Join Group Screen
- [ ] Style invitation code input (large, centered, monospace)
- [ ] Add visual feedback for code validation
- [ ] Improve helper text styling
- [ ] Add animation when code is complete

#### Group Details Screen
- [ ] Create better header design with cover image area
- [ ] Improve stats cards with icons
- [ ] Add member avatars preview
- [ ] Polish admin actions card
- [ ] Enhance invitation code display
- [ ] Add activity feed styling
- [ ] Create better empty states

### 3. Navigation & Layout
#### Tab Bar
- [ ] Add active tab animations
- [ ] Improve icon styling
- [ ] Add notification badges
- [ ] Polish tab transitions

#### Headers
- [ ] Consistent header styling across screens
- [ ] Add back button animations
- [ ] Improve title typography
- [ ] Add header actions styling

### 4. UI Components
#### Button Component
- [ ] Add press animations (scale/opacity)
- [ ] Improve disabled state styling
- [ ] Add loading spinner integration
- [ ] Create icon button variants
- [ ] Add ripple effect on Android

#### Card Component
- [ ] Add elevation/shadow variants
- [ ] Create pressed state styling
- [ ] Add border variants
- [ ] Improve padding consistency

#### Input Component
- [ ] Add floating label option
- [ ] Improve focus animations
- [ ] Add error state styling
- [ ] Create input with icon variants
- [ ] Add clear button for text inputs

#### Typography Component
- [ ] Define consistent text scales
- [ ] Add text color variants
- [ ] Create heading components
- [ ] Add text truncation options

### 5. Micro-interactions & Animations
- [ ] Page transition animations
- [ ] Pull-to-refresh custom animation
- [ ] Loading states and skeletons
- [ ] Success/error feedback animations
- [ ] Button press feedback
- [ ] Form validation animations
- [ ] Modal presentation animations

### 6. Platform-Specific Polish
#### iOS
- [ ] Proper safe area handling
- [ ] iOS-style navigation transitions
- [ ] Haptic feedback integration

#### Android
- [ ] Material Design touches
- [ ] Proper back button handling
- [ ] Android-style transitions

## Implementation Priority

### Phase 1: Core Component Polish (Day 1)
1. Button animations and states
2. Input field improvements
3. Card styling and shadows
4. Typography consistency

### Phase 2: Screen Polish (Day 1-2)
1. Groups list screen and cards
2. Group details header and layout
3. Auth screens visual improvements
4. Empty states design

### Phase 3: Interactions (Day 2)
1. Loading states and skeletons
2. Pull-to-refresh animations
3. Navigation transitions
4. Form validation feedback

### Phase 4: Final Polish
1. Platform-specific adjustments
2. Accessibility improvements
3. Dark mode preparation
4. Performance optimization

## Style Guidelines

### Spacing System
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px

### Shadows
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.07)
- lg: 0 10px 15px rgba(0,0,0,0.1)
- xl: 0 20px 25px rgba(0,0,0,0.1)

### Animation Durations
- fast: 150ms
- normal: 250ms
- slow: 350ms

### Font Sizes
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px
- 2xl: 24px
- 3xl: 30px

## Success Criteria
- Consistent visual language across all screens
- Smooth animations and transitions
- Clear visual hierarchy
- Accessible color contrasts
- Delightful micro-interactions
- Platform-appropriate styling
- Professional, polished appearance

## Next Steps After Styling
Once the existing components are polished:
1. Implement habit creation with styled components
2. Build check-in system with polished UI
3. Add financial tracking with clear visual indicators
4. Complete remaining screens with consistent styling