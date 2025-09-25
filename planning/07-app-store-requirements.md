# App Store Requirements - Staked App

## Implementation Status Tracker

### Quick Status Overview
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⏸️ Blocked/Waiting

### Summary
- **Total Tasks**: 156
- **Completed**: 0
- **In Progress**: 0
- **Remaining**: 156
- **Completion**: 0%

## Overview
Complete requirements and guidelines for submitting Staked to the Apple App Store and Google Play Store, including technical requirements, content guidelines, and submission materials.

## Apple App Store Requirements

### 1. Technical Requirements

#### 1.1 iOS Version Support

##### Implementation Tasks
- [ ] 🔴 Set minimum iOS version to 13.0 in project settings
- [ ] 🔴 Test on iOS 17.x simulators and devices
- [ ] 🔴 Configure iPhone compatibility for all screen sizes
- [ ] 🔴 Add iPad compatibility configurations
- [ ] 🔴 Implement Dynamic Island support for iPhone 14 Pro+
- [ ] 🔴 Add Always-On Display optimizations
- [ ] 🔴 Test on various iOS versions (13.0 - 17.x)
- [ ] 🔴 Document device-specific features

#### 1.2 Build Requirements

##### Setup Tasks
- [ ] 🔴 Install and configure Xcode 15.0 or later
- [ ] 🔴 Update project to Swift 5.9 or later
- [ ] 🔴 Create App ID in Apple Developer Portal
- [ ] 🔴 Generate distribution provisioning profiles
- [ ] 🔴 Create distribution certificate
- [ ] 🔴 Configure automatic code signing
- [ ] 🔴 Optimize app size (target < 200MB)
- [ ] 🔴 Configure bitcode settings
- [ ] 🔴 Set up CI/CD for iOS builds

#### 1.3 Required Capabilities

##### Capability Configuration
- [ ] 🔴 Enable Push Notifications in project capabilities
- [ ] 🔴 Configure Push Notification entitlement
- [ ] 🔴 Enable Background Modes capability
- [ ] 🔴 Select "Remote notifications" in Background Modes
- [ ] 🔴 Enable Associated Domains capability
- [ ] 🔴 Configure deep linking domains
- [ ] 🔴 Implement Sign in with Apple
- [ ] 🔴 Test all capabilities in development
- [ ] 🔴 Verify capabilities in provisioning profile

#### 1.4 Performance Requirements

##### Performance Optimization Tasks
- [ ] 🔴 Optimize app launch time (measure and improve)
- [ ] 🔴 Profile app launch with Instruments
- [ ] 🔴 Fix all known crashes
- [ ] 🔴 Run thorough QA testing
- [ ] 🔴 Profile memory usage with Instruments
- [ ] 🔴 Optimize images and assets
- [ ] 🔴 Implement battery usage optimizations
- [ ] 🔴 Add network request timeouts
- [ ] 🔴 Implement retry logic for failed requests
- [ ] 🔴 Test on low-end devices

### 2. App Store Connect Setup

#### 2.1 App Information

##### App Store Connect Tasks
- [ ] 🔴 Create app in App Store Connect
- [ ] 🔴 Set app name: "Staked - Habit Tracker"
- [ ] 🔴 Add subtitle: "Track habits together, with stakes"
- [ ] 🔴 Select primary category: Health & Fitness
- [ ] 🔴 Select secondary category: Social Networking
- [ ] 🔴 Complete age rating questionnaire
- [ ] 🔴 Set age rating to 12+
- [ ] 🔴 Add app icon (1024x1024)
- [ ] 🔴 Configure pricing (Free)
- [ ] 🔴 Select availability (all countries initially)

#### 2.2 App Description (4000 characters max)
```
Staked revolutionizes habit tracking by combining social accountability with financial stakes. Join groups with friends, set daily habits, and put money on the line to stay motivated.

KEY FEATURES:

GROUP HABITS
• Create or join groups with up to 10 members
• Set habits together and support each other
• View everyone's progress in real-time
• Compete on group leaderboards

FINANCIAL STAKES
• Set monetary stakes for each habit
• Money redistributed when habits are missed
• Track who owes what within your group
• Record payments outside the app

FLEXIBLE TRACKING
• Daily, weekly, or custom frequency habits
• Set personalized check-in deadlines
• Vacation mode for planned breaks
• Detailed statistics and streaks

SMART NOTIFICATIONS
• Deadline reminders before check-in time
• Payment notifications
• Group activity updates
• Email summaries (optional)

COMPREHENSIVE ANALYTICS
• Personal success rates and trends
• Group leaderboards and comparisons
• Progress charts and heat maps
• Export your data anytime

Whether you're trying to exercise daily, read more, or build any positive habit, Staked helps you stay accountable with the power of social pressure and financial motivation.

Note: Staked tracks money owed between group members but does not process actual payments. All financial transactions occur outside the app between users.

Start building better habits today with Staked!
```

#### 2.3 Keywords (100 characters max)
```
habit,tracker,social,accountability,group,challenge,streak,daily,routine,goals,motivation,stakes
```

#### 2.4 Promotional Text (170 characters max)
```
Transform your habits with friends! Set goals, add financial stakes, and stay accountable together. Build better routines with social motivation.
```

#### 2.5 What's New (4000 characters max)
```
Version 1.0.0 - Initial Release
• Create and join habit groups
• Track daily habits with stakes
• Monitor debts and payments
• View statistics and leaderboards
• Push notifications for deadlines
```

### 3. Screenshots & Preview

#### 3.1 Screenshot Preparation Tasks

##### Screenshot Creation
- [ ] 🔴 Design screenshot templates with marketing text
- [ ] 🔴 Create 6.7" screenshots (iPhone 15 Pro Max)
- [ ] 🔴 Create 6.5" screenshots (iPhone 14 Plus)
- [ ] 🔴 Create 5.5" screenshots (iPhone 8 Plus)
- [ ] 🔴 Capture Welcome/Onboarding screen
- [ ] 🔴 Capture Dashboard with today's habits
- [ ] 🔴 Capture Group view with members
- [ ] 🔴 Capture Create habit screen
- [ ] 🔴 Capture Statistics and charts
- [ ] 🔴 Capture Leaderboard
- [ ] 🔴 Capture Financial overview
- [ ] 🔴 Capture Profile and achievements
- [ ] 🔴 Add marketing captions to screenshots
- [ ] 🔴 Optimize screenshot file sizes

#### 3.2 App Preview Video Tasks

##### Video Production
- [ ] 🔴 Plan app preview storyboard
- [ ] 🔴 Record screen captures of core features
- [ ] 🔴 Edit video to 15-30 seconds
- [ ] 🔴 Add captions and annotations
- [ ] 🔴 Export at 1920×1080 or higher
- [ ] 🔴 Create versions for different device sizes
- [ ] 🔴 Add background music (royalty-free)
- [ ] 🔴 Test video on different devices

### 4. App Review Information

#### 4.1 Demo Account Setup

##### Demo Environment Tasks
- [ ] 🔴 Create demo account in production
- [ ] 🔴 Set username: demo@staked.app
- [ ] 🔴 Set password: DemoUser123!
- [ ] 🔴 Create demo group with sample data
- [ ] 🔴 Generate demo group code: DEMO2024
- [ ] 🔴 Add sample habits to demo account
- [ ] 🔴 Add sample group members
- [ ] 🔴 Create sample check-in history
- [ ] 🔴 Add sample financial transactions
- [ ] 🔴 Test demo account thoroughly
- [ ] 🔴 Document demo account features

#### 4.2 Notes for Reviewer
```
Staked is a social habit tracking app with financial stakes. 

Key points:
1. The app tracks debts between users but does NOT process real money
2. All actual payments happen outside the app
3. Users must be 12+ due to simulated gambling elements
4. Push notifications are essential for deadline reminders

To test:
1. Sign in with the demo account
2. Join the demo group using code DEMO2024
3. Create a test habit with a stake
4. Check in or miss the deadline to see debt creation
5. Record a payment to see the confirmation flow
```

#### 4.3 Contact Information
- Email: support@staked.app
- Phone: [Your phone number]

### 5. Privacy & Legal

#### 5.1 Privacy & Legal Document Tasks

##### Documentation Preparation
- [ ] 🔴 Write comprehensive privacy policy
- [ ] 🔴 Include GDPR compliance in privacy policy
- [ ] 🔴 Include CCPA compliance in privacy policy
- [ ] 🔴 Host privacy policy at https://staked.app/privacy
- [ ] 🔴 Write terms of service
- [ ] 🔴 Include liability disclaimers
- [ ] 🔴 Host terms of service at https://staked.app/terms
- [ ] 🔴 Create EULA if needed
- [ ] 🔴 Have legal review of all documents
- [ ] 🔴 Add in-app links to legal documents

#### 5.3 Privacy Nutrition Labels
```
Data Collected:
- Contact Info: Email, Name
- Identifiers: User ID
- Usage Data: Product interaction
- Diagnostics: Crash data, performance

Data Linked to You:
- Contact Info
- Identifiers
- Usage Data

Data Not Linked to You:
- Diagnostics
```

### 6. Compliance Requirements

#### 6.1 Apple Guidelines Compliance

##### Compliance Review Tasks
- [ ] 🔴 Review and ensure no real money processing
- [ ] 🔴 Add clear disclaimers about financial tracking
- [ ] 🔴 Review content for age appropriateness (12+)
- [ ] 🔴 Remove any inappropriate content
- [ ] 🔴 Verify app description accuracy
- [ ] 🔴 Remove all placeholder content
- [ ] 🔴 Document all app features
- [ ] 🔴 Ensure no hidden features
- [ ] 🔴 Verify no dynamic code downloading
- [ ] 🔴 Review Apple's latest guidelines
- [ ] 🔴 Run App Store review checklist

#### 6.2 Specific Guideline Concerns
- **3.2.2 Unacceptable Business Model**
  - Clearly state no real money processing
  - Not a gambling app, just tracking

- **4.1 Copycats**
  - Original implementation and design
  - Unique social stakes concept

- **5.1.1 Data Collection and Storage**
  - Clear privacy policy
  - User consent for data collection
  - Secure data handling

### 7. Localization

#### 7.1 Localization Tasks

##### Initial Localization
- [ ] 🔴 Set up localization in Xcode project
- [ ] 🔴 Extract all strings to Localizable.strings
- [ ] 🔴 Create English (US) localization
- [ ] 🔴 Create English (UK) localization
- [ ] 🔴 Localize app store metadata
- [ ] 🔴 Localize screenshots
- [ ] 🔴 Test localizations
- [ ] 🔴 Add language selection in app

#### 7.2 Future Localizations
- [ ] Spanish
- [ ] French
- [ ] German
- [ ] Portuguese
- [ ] Japanese

## Google Play Store Requirements

### 1. Technical Requirements

#### 1.1 Android Version Support

##### Android Configuration Tasks
- [ ] 🔴 Set minimum SDK to 23 in build.gradle
- [ ] 🔴 Set target SDK to 34
- [ ] 🔴 Set compile SDK to 34
- [ ] 🔴 Configure screen size support in manifest
- [ ] 🔴 Add density-specific resources
- [ ] 🔴 Test on Android 6.0 through 14
- [ ] 🔴 Add adaptive icons
- [ ] 🔴 Configure splash screen
- [ ] 🔴 Test on tablets
- [ ] 🔴 Test on foldable devices

#### 1.2 Build Requirements

##### Android Build Setup
- [ ] 🔴 Configure AAB (Android App Bundle) generation
- [ ] 🔴 Optimize app size to < 150MB
- [ ] 🔴 Configure ProGuard/R8 rules
- [ ] 🔴 Generate upload keystore
- [ ] 🔴 Configure signing in build.gradle
- [ ] 🔴 Set up version code automation
- [ ] 🔴 Set initial version name (1.0.0)
- [ ] 🔴 Configure build variants
- [ ] 🔴 Set up CI/CD for Android builds
- [ ] 🔴 Test release build

#### 1.3 Required Permissions
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### 2. Play Console Setup

#### 2.1 Store Listing

**App Name** (30 characters)
```
Staked - Social Habit Tracker
```

**Short Description** (80 characters)
```
Track habits with friends, add financial stakes, and stay accountable together!
```

**Full Description** (4000 characters)
```
[Same as iOS description above]
```

#### 2.2 Categorization
- Category: Health & Fitness
- Tags: Habit Tracker, Social, Productivity, Lifestyle

#### 2.3 Content Rating
- [ ] Complete IARC questionnaire
- Expected rating: Teen (Simulated Gambling)
- No violence
- No sexual content
- Mild simulated gambling
- No drugs/alcohol
- No profanity

### 3. Graphics Assets

#### 3.1 Graphics Asset Tasks

##### Asset Creation
- [ ] 🔴 Create 512×512 PNG app icon
- [ ] 🔴 Design feature graphic (1024×500)
- [ ] 🔴 Create phone screenshots (1080×1920)
- [ ] 🔴 Capture at least 4 phone screenshots
- [ ] 🔴 Create tablet screenshots (1200×1920)
- [ ] 🔴 Add captions to screenshots
- [ ] 🔴 Create promotional video
- [ ] 🔴 Upload video to YouTube
- [ ] 🔴 Optimize all graphics for file size
- [ ] 🔴 Create graphic variants for A/B testing

#### 3.2 Screenshot Requirements
- No device frames in images
- Show actual app functionality
- Include captions/descriptions
- Localized for each language

### 4. Testing Requirements

#### 4.1 Pre-launch Testing Tasks

##### Testing Implementation
- [ ] 🔴 Build release APK/AAB
- [ ] 🔴 Upload to closed testing track
- [ ] 🔴 Wait for pre-launch report
- [ ] 🔴 Review automated test results
- [ ] 🔴 Fix all reported crashes
- [ ] 🔴 Fix all ANRs (Application Not Responding)
- [ ] 🔴 Address performance warnings
- [ ] 🔴 Fix accessibility issues
- [ ] 🔴 Re-test after fixes
- [ ] 🔴 Document known issues

#### 4.2 Testing Tracks
1. **Internal Testing** (100 testers)
   - Development team
   - Initial bug catching

2. **Closed Testing** (1000s testers)
   - Beta testers
   - Feature validation

3. **Open Testing** (unlimited)
   - Public beta
   - Final testing

### 5. Play Store Policies

#### 5.1 Policy Compliance Tasks

##### Compliance Verification
- [ ] 🔴 Review all marketing claims for accuracy
- [ ] 🔴 Ensure app description matches functionality
- [ ] 🔴 Complete content rating questionnaire
- [ ] 🔴 Review Google Play policies
- [ ] 🔴 Verify no policy violations
- [ ] 🔴 Ensure data collection transparency
- [ ] 🔴 Add required disclosures
- [ ] 🔴 Test compliance with automated tools
- [ ] 🔴 Document policy compliance

#### 5.2 Financial Products Policy
- [ ] Clear disclosure of no real money processing
- [ ] Not a gambling app
- [ ] No cryptocurrency features
- [ ] No cash loans

#### 5.3 Families Policy (Optional)
- Not targeting children
- 12+ age rating
- No ads targeting children

### 6. Data Safety Section

#### 6.1 Data Collection Disclosure
```
Data Types Collected:
✓ Personal info
  - Name
  - Email address
✓ Financial info
  - Other financial info (debt tracking only)
✓ App activity
  - App interactions
  - Other user-generated content
✓ App info and performance
  - Crash logs
  - Diagnostics

Data Sharing:
- No data shared with third parties

Data Security:
- Data is encrypted in transit
- Users can request data deletion
```

#### 6.2 Privacy Policy Requirements
- [ ] Comprehensive privacy policy
- [ ] Hosted on permanent URL
- [ ] Covers all data collection
- [ ] GDPR compliant
- [ ] Contact information included

### 7. Release Management

#### 7.1 Staged Rollout
- Start with 5% of users
- Monitor crash rate
- Monitor user feedback
- Increase to 10%, 25%, 50%, 100%
- Halt if issues detected

#### 7.2 Release Notes
```
What's New:
• Track habits with friends and stakes
• Create or join groups
• Set daily check-in reminders
• Monitor group finances
• View statistics and leaderboards
```

## Common Requirements (Both Stores)

### 1. App Quality

#### 1.1 Functionality Testing Tasks

##### Quality Assurance
- [ ] 🔴 Test all features thoroughly
- [ ] 🔴 Verify feature descriptions accuracy
- [ ] 🔴 Remove all placeholder content
- [ ] 🔴 Test all links and navigation
- [ ] 🔴 Implement comprehensive error handling
- [ ] 🔴 Add offline mode where needed
- [ ] 🔴 Test edge cases
- [ ] 🔴 Perform regression testing
- [ ] 🔴 Create QA test plan
- [ ] 🔴 Document known limitations

#### 1.2 Performance Optimization Tasks

##### Performance Tuning
- [ ] 🔴 Profile and optimize load times
- [ ] 🔴 Optimize animations for 60 fps
- [ ] 🔴 Profile battery usage
- [ ] 🔴 Optimize network data usage
- [ ] 🔴 Profile memory usage
- [ ] 🔴 Fix memory leaks
- [ ] 🔴 Optimize image loading
- [ ] 🔴 Implement lazy loading
- [ ] 🔴 Add performance monitoring
- [ ] 🔴 Test on low-end devices

#### 1.3 Stability
- [ ] No crashes
- [ ] No ANRs (Android)
- [ ] No freezes
- [ ] Graceful degradation
- [ ] Proper state restoration

### 2. Legal Requirements

#### 2.1 Required Documents
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] EULA (if applicable)
- [ ] Copyright documentation
- [ ] Third-party licenses

#### 2.2 Intellectual Property
- [ ] Own all content
- [ ] Licensed third-party content
- [ ] No trademark violations
- [ ] No copyright infringement
- [ ] Original app name

### 3. Accessibility

#### 3.1 Accessibility Implementation Tasks

##### Basic Accessibility
- [ ] 🔴 Add screen reader labels to all elements
- [ ] 🔴 Test with VoiceOver (iOS)
- [ ] 🔴 Test with TalkBack (Android)
- [ ] 🔴 Verify color contrast ratios (4.5:1)
- [ ] 🔴 Ensure touch targets meet size requirements
- [ ] 🔴 Implement text scaling support
- [ ] 🔴 Add keyboard navigation for tablets
- [ ] 🔴 Test with accessibility inspector
- [ ] 🔴 Add accessibility hints
- [ ] 🔴 Group related elements

#### 3.2 Enhanced Accessibility
- [ ] VoiceOver/TalkBack optimized
- [ ] Dynamic Type support (iOS)
- [ ] Reduced motion options
- [ ] Audio descriptions
- [ ] Haptic feedback

## Submission Checklist

### Pre-Submission Testing

#### Testing Checklist Tasks
- [ ] 🔴 Test on physical iOS devices
- [ ] 🔴 Test on physical Android devices
- [ ] 🔴 Test all supported screen sizes
- [ ] 🔴 Test on minimum OS versions
- [ ] 🔴 Test on latest OS versions
- [ ] 🔴 Complete all user flow testing
- [ ] 🔴 Test payment recording flows
- [ ] 🔴 Test with slow network
- [ ] 🔴 Test with no network
- [ ] 🔴 Test fresh installation
- [ ] 🔴 Test app updates
- [ ] 🔴 Test data migration
- [ ] 🔴 Test with multiple accounts

### Final Submission Checklist

#### Pre-Submit Tasks
- [ ] 🔴 Update version number in project
- [ ] 🔴 Write release notes
- [ ] 🔴 Update all screenshots
- [ ] 🔴 Verify demo account works
- [ ] 🔴 Publish privacy policy
- [ ] 🔴 Publish terms of service
- [ ] 🔴 Set up support email
- [ ] 🔴 Configure analytics (Firebase/Mixpanel)
- [ ] 🔴 Enable crash reporting (Crashlytics/Sentry)
- [ ] 🔴 Switch to production API endpoints
- [ ] 🔴 Remove debug code
- [ ] 🔴 Disable logging in production
- [ ] 🔴 Final security audit
- [ ] 🔴 Create submission backup

### Post-Submission
- [ ] Monitor review status
- [ ] Respond to reviewer quickly
- [ ] Prepare for rejection reasons
- [ ] Have fixes ready
- [ ] Plan marketing launch
- [ ] Prepare support documentation
- [ ] Monitor initial reviews
- [ ] Track crash reports

## Rejection Reasons & Solutions

### Common iOS Rejections
1. **Guideline 2.1 - Performance**
   - Solution: Fix all crashes, test thoroughly

2. **Guideline 4.2 - Minimum Functionality**
   - Solution: Add more features, remove web views

3. **Guideline 5.1.1 - Data Collection**
   - Solution: Clear privacy policy, proper consent

### Common Android Rejections
1. **Policy: Misleading Claims**
   - Solution: Accurate description, real screenshots

2. **Policy: Permissions**
   - Solution: Justify all permissions used

3. **Technical: Crashes**
   - Solution: Fix all crashes in pre-launch report

## Timeline

### Typical Review Times
- **iOS**: 24-48 hours (can be 7 days)
- **Android**: 2-3 hours (can be 24 hours)

### Expedited Review (iOS)
- Use sparingly
- Critical bug fixes
- Time-sensitive events

### Appeal Process
- **iOS**: Resolution Center in App Store Connect
- **Android**: Policy appeals in Play Console