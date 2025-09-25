# System Architecture - Staked App

## Implementation Status Tracker

### Quick Status Overview
- 🔴 Not Started
- 🟡 In Progress  
- 🟢 Completed
- ⏸️ Blocked/Waiting

### Summary
- **Total Tasks**: 50
- **Completed**: 40
- **In Progress**: 0
- **Remaining**: 10
- **Completion**: 80%

## Overview
Staked is a social habit tracking application with financial stakes, built using React Native for mobile clients and Supabase for backend services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Mobile App                          │
│                    (React Native / Expo)                    │
├─────────────────────────────────────────────────────────────┤
│  UI Layer          │  State Layer      │  Service Layer     │
│  - Screens         │  - Zustand        │  - API Clients     │
│  - Components      │  - React Query    │  - Push Service    │
│  - Navigation      │  - Local Storage  │  - Auth Service    │
└────────────────────┬───────────────────┴────────────────────┘
                     │
                     │ HTTPS / WebSocket
                     │
┌────────────────────▼───────────────────────────────────────┐
│                      Supabase Cloud                         │
├─────────────────────────────────────────────────────────────┤
│  API Gateway       │  Auth Service     │  Realtime Engine  │
│  - REST APIs       │  - JWT Tokens     │  - WebSockets     │
│  - Rate Limiting   │  - OAuth          │  - Broadcasts     │
│  - CORS            │  - MFA            │  - Presence       │
├────────────────────┼───────────────────┼───────────────────┤
│              PostgreSQL Database                            │
│  - Row Level Security (RLS)                                │
│  - Triggers & Functions                                    │
│  - Automatic API Generation                                │
└─────────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────┐
│                   External Services                         │
├─────────────────────────────────────────────────────────────┤
│  Push Notifications │  Email Service   │  Analytics        │
│  - Expo Push       │  - SendGrid       │  - Mixpanel       │
│  - FCM/APNS        │  - Templates      │  - Custom Events  │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Mobile Application Layer

#### UI Components & Design System

##### Core Infrastructure Setup
- [x] 🟢 Install NativeWind and TailwindCSS
- [x] 🟢 Configure babel.config.js for NativeWind  
- [x] 🟢 Create tailwind.config.js
- [x] 🟢 Set up global.css file
- [x] 🟢 Create basic UI component library (Button, Card, Input, Typography)
- [x] 🟢 Define design system architecture
  - Create atomic design structure (atoms, molecules, organisms)
  - Document component composition patterns
  - Define prop interfaces and types
- [x] 🟢 Set up component library structure
  - Organize components by category
  - Create component index files
  - Set up Storybook for component documentation (pending)
- [x] 🟢 Choose and configure icon library
  - Evaluate react-native-vector-icons vs expo-icons
  - Install and configure chosen library (@expo/vector-icons)
  - Create icon wrapper component
- [x] 🟢 Set up theming system architecture
  - Implement theme context provider
  - Create light/dark theme configurations
  - Add theme persistence

#### Styling Architecture
- [x] 🟢 Basic NativeWind configuration
- [x] 🟢 Define styling architecture patterns
  - Document Tailwind class naming conventions
  - Create style composition guidelines
  - Define component variant patterns
- [x] 🟢 Choose theme system approach (context vs. config)
  - Implement React Context for theme management
  - Create theme switching mechanism
  - Define theme type definitions
- [x] 🟢 Plan responsive design strategy
  - Define breakpoint system
  - Create responsive utilities
  - Document responsive patterns

#### State Management

##### State Management Architecture
- [x] 🟢 Install and configure Zustand
- [x] 🟢 Create basic store structure (authStore, appStore)
- [x] 🟢 Install and configure React Query
- [x] 🟢 Set up QueryProvider
- [x] 🟢 Define state management patterns
  - Document store slicing strategy
  - Create store composition patterns
  - Define action naming conventions
- [x] 🟢 Plan store architecture and data flow
  - Create state shape documentation
  - Define store relationships
  - Document data flow diagrams
- [x] 🟢 Choose persistence strategy
  - Implement AsyncStorage persistence
  - Create selective persistence configuration
  - Add migration strategy for schema changes

#### Services

##### Core Services Architecture
- [x] 🟢 Install Supabase client
- [x] 🟢 Create basic Supabase configuration
- [x] 🟢 Create pushNotificationService.ts stub
- [x] 🟢 Define service layer architecture
  - Create base service class
  - Define service interfaces
  - Implement dependency injection pattern
- [x] 🟢 Plan API client structure
  - Create API client wrapper
  - Implement request/response interceptors
  - Add error handling middleware
- [ ] 🔴 Choose notification strategy (Expo vs. custom)
  - Evaluate Expo Notifications capabilities
  - Compare with Firebase Cloud Messaging
  - Implement chosen solution
- [ ] 🔴 Define background task requirements
  - Identify background task needs
  - Choose background task library
  - Implement task scheduling

### 2. Backend Services (Supabase)

#### Authentication

##### Authentication Architecture
- [x] 🟢 Choose authentication strategy (email, OAuth, MFA)
  - Implement email/password authentication
  - Add social OAuth providers (Google, Apple)
  - Plan MFA implementation timeline
- [x] 🟢 Plan session management approach
  - Define token refresh strategy
  - Implement session persistence
  - Add session timeout handling
- [x] 🟢 Define security requirements
  - Document authentication flow
  - Define password requirements
  - Plan account recovery process
- [x] 🟢 Set up Supabase Auth configuration
  - Configure auth providers
  - Set up email templates
  - Configure redirect URLs

#### Database (PostgreSQL)

##### Database Architecture
- [x] 🟢 Define database schema strategy
  - Create ERD documentation
  - Define naming conventions
  - Plan migration strategy
- [x] 🟢 Plan RLS (Row Level Security) approach
  - Define security policies per table
  - Create role-based access rules
  - Document policy testing strategy
- [x] 🟢 Design trigger and function architecture
  - Identify automation needs
  - Create trigger specifications
  - Define stored procedure requirements
- [x] 🟢 Set up Supabase database project
  - Create production database
  - Configure connection pooling
  - Set up database backups
- [x] 🟢 Configure database access patterns
  - Define query optimization strategy
  - Create indexing plan
  - Document access patterns

#### Real-time Subscriptions

##### Real-time Architecture
- [ ] 🔴 Enable Supabase Realtime
  - Configure Realtime settings
  - Set up channel authorization
  - Define broadcast patterns
- [ ] 🔴 Define subscription patterns
  - Document subscription use cases
  - Create subscription management
  - Define cleanup strategies
- [ ] 🔴 Plan WebSocket connection strategy
  - Implement reconnection logic
  - Add connection state management
  - Create offline queue mechanism
- [ ] 🔴 Choose presence tracking approach
  - Define presence requirements
  - Implement presence channels
  - Create online status system

#### API Layer

##### API Architecture
- [ ] 🔴 Define API strategy (REST vs. RPC)
  - Choose between REST and RPC patterns
  - Document API conventions
  - Create API style guide
- [ ] 🔴 Plan API versioning approach
  - Define versioning strategy
  - Implement version routing
  - Create deprecation policy
- [ ] 🔴 Set up rate limiting strategy
  - Configure rate limit thresholds
  - Implement per-user limits
  - Add rate limit headers
- [ ] 🔴 Configure CORS and security headers
  - Set up CORS policies
  - Add security headers
  - Configure CSP rules

### 3. External Services

#### Push Notifications (Expo Push Service)

##### Push Notification Architecture
- [ ] 🔴 Choose push notification provider (Expo vs. Firebase)
  - Evaluate Expo Push Notifications
  - Compare with FCM capabilities
  - Make platform decision
- [ ] 🔴 Define notification strategy
  - Create notification categories
  - Define delivery rules
  - Plan notification preferences
- [ ] 🔴 Plan notification types and triggers
  - Document notification events
  - Create notification templates
  - Define trigger conditions

#### Email Service (SendGrid)

##### Email Service Architecture  
- [ ] 🔴 Choose email provider (SendGrid vs. alternatives)
  - Compare SendGrid, AWS SES, Mailgun
  - Evaluate pricing and features
  - Select and configure provider
- [ ] 🔴 Define email requirements and templates needed
  - List all email types needed
  - Create email template designs
  - Define personalization requirements
- [ ] 🔴 Plan email delivery strategy
  - Set up transactional emails
  - Configure email queuing
  - Implement delivery tracking

#### Analytics (Future)

##### Analytics Architecture
- [ ] 🔴 Choose analytics provider (Mixpanel, Amplitude, etc.)
  - Evaluate analytics platforms
  - Compare pricing and features
  - Implement chosen solution
- [ ] 🔴 Define key metrics to track
  - Identify KPIs
  - Create metrics dashboard plan
  - Define success metrics
- [ ] 🔴 Plan event tracking strategy
  - Document event taxonomy
  - Create tracking plan
  - Implement event tracking
- [ ] 🔴 Choose error tracking solution (Sentry, etc.)
  - Evaluate error tracking tools
  - Configure error reporting
  - Set up alerting rules

## Data Flow Patterns

### 1. User Registration Flow
```
Mobile App → Supabase Auth → Create User → Create Profile → Return Session
```

### 2. Habit Check-in Flow
```
User Action → Validate Time → Create Check-in → Calculate Debts → 
Broadcast Updates → Send Notifications
```

### 3. Payment Confirmation Flow
```
Payer Records → Notify Receivers → Receivers Confirm → 
Update Balances → Archive if Cleared
```

### 4. Real-time Group Updates
```
Database Change → Trigger Function → Broadcast to Channel → 
WebSocket to Clients → Update UI
```

## Security Architecture

### Authentication & Authorization
- JWT tokens with short expiration
- Refresh token rotation
- Role-based access control (User, Admin, Super Admin)
- Device fingerprinting for suspicious activity

### Data Protection
- TLS/SSL for all communications
- Encryption at rest for sensitive data (debts, payments)
- Row Level Security policies
- API rate limiting

### Privacy
- GDPR compliance ready
- Data minimization principles
- User data export capability
- Right to deletion implementation

## Scalability Considerations

### Database Optimization
- Indexed foreign keys for fast queries
- Partitioned tables for large datasets
- Connection pooling
- Read replicas for analytics

### Caching Strategy
- React Query cache for API responses
- Local storage for offline capability
- CDN for static assets
- Database query result caching

### Performance Targets
- API response time < 200ms
- Real-time updates < 100ms
- App launch time < 2 seconds
- 99.9% uptime SLA

## Deployment Architecture

### Development Environment
- Local Supabase instance
- Expo development build
- Hot reload enabled
- Debug logging

### Staging Environment
- Supabase free tier project
- TestFlight/Internal testing track
- Production-like data
- Performance monitoring

### Production Environment
- Supabase Pro plan
- App Store/Play Store release
- CloudFlare CDN
- Error tracking (Sentry)
- Analytics enabled

## Monitoring & Observability

### Application Monitoring
- Crash reporting
- Performance metrics
- User session recording
- Feature flag management

### Backend Monitoring
- Database query performance
- API endpoint latency
- WebSocket connection health
- Error rate tracking

### Business Metrics
- Daily active users
- Habit completion rates
- Payment completion rates
- User retention

## Disaster Recovery

### Backup Strategy
- Daily automated database backups
- Point-in-time recovery capability
- Cross-region backup storage
- Regular restore testing

### Incident Response
- Automated health checks
- Alert escalation chain
- Runbook documentation
- Post-mortem process

## Future Architecture Considerations

### Web Application
- Next.js frontend in monorepo
- Shared component library
- Progressive Web App capability
- SEO optimization

### Microservices (if needed)
- Payment processing service
- Notification service
- Analytics pipeline
- ML for habit predictions

### Blockchain Integration (potential)
- Smart contracts for stakes
- Decentralized payment verification
- Transparent group agreements
- Cryptocurrency support

## Implementation Notes

### What Belongs in This Document
This architecture document should contain:
- High-level system design decisions
- Technology stack choices
- Infrastructure configuration
- Service architecture patterns
- Integration strategies
- Deployment architecture

### What Belongs in Other Documents
- **02-database-schema.md**: Table creation, RLS policies, triggers, functions
- **03-api-design.md**: Endpoint definitions, API methods, request/response formats
- **04-screen-flows.md**: Screen layouts, UI components, navigation flows
- **05-implementation-phases.md**: Step-by-step implementation tasks
- **06-security-requirements.md**: Security implementation details, MFA setup
- **07-app-store-requirements.md**: Store-specific configurations
- **08-testing-strategy.md**: Test implementations, test cases