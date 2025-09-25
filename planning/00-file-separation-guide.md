# Planning Files Separation Guide

## Purpose of Each Planning Document

### 01-system-architecture.md
**What belongs here:**
- High-level system design decisions
- Technology stack choices (React Native, Supabase, etc.)
- Infrastructure architecture (mobile app, backend, external services)
- Service integration strategies
- Deployment architecture
- Scalability considerations
- Future architecture considerations

**What DOESN'T belong here:**
- Specific implementation steps
- UI component creation
- Database table creation
- API endpoint implementations
- Testing procedures

---

### 02-database-schema.md
**What belongs here:**
- Database table definitions and SQL
- Table fields and data types
- Foreign key relationships
- Indexes and constraints
- Database functions and stored procedures
- Database triggers
- Row Level Security (RLS) policies
- Database performance optimizations
- Migration SQL scripts

**What DOESN'T belong here:**
- API endpoint definitions
- UI/UX implementations
- Testing procedures (except RLS policy tests)
- Project setup steps
- Client-side code

---

### 03-api-design.md
**What belongs here:**
- API endpoint specifications
- Request/response formats
- API authentication methods
- Rate limiting rules
- Error response formats
- WebSocket/real-time subscription definitions
- API versioning strategy
- API documentation

**What DOESN'T belong here:**
- Database table creation
- UI component implementation
- Test implementations
- SDK setup steps (belong in implementation)
- Email template designs

---

### 04-screen-flows.md
**What belongs here:**
- Screen layouts and designs
- UI component specifications
- Navigation flows
- User interaction patterns
- Design system implementation
- Component styling
- Animations and transitions
- Responsive design specifications

**What DOESN'T belong here:**
- API implementations
- Database operations
- Business logic
- Testing procedures

---

### 05-implementation-phases.md
**What belongs here:**
- Step-by-step implementation order
- Project setup tasks
- Environment configuration
- SDK installations
- Integration tasks
- Deployment steps
- Feature rollout sequence
- Milestone definitions

**What DOESN'T belong here:**
- Detailed technical specifications
- Database schemas
- API contracts
- UI designs

---

### 06-security-requirements.md
**What belongs here:**
- Security policies and requirements
- Authentication implementation details
- Authorization rules
- Encryption specifications
- Data protection measures
- Compliance requirements
- Security testing requirements
- Vulnerability management

**What DOESN'T belong here:**
- General API endpoints
- UI implementations
- Non-security related features

---

### 07-app-store-requirements.md
**What belongs here:**
- Store submission requirements
- App metadata and descriptions
- Screenshot specifications
- Store listing content
- Review guidelines compliance
- Platform-specific requirements
- Release preparation tasks

**What DOESN'T belong here:**
- Development tasks
- API implementations
- Database design
- Testing procedures

---

### 08-testing-strategy.md
**What belongs here:**
- Test plans and strategies
- Unit test specifications
- Integration test requirements
- E2E test scenarios
- Performance testing
- Security testing
- User acceptance testing
- Test data management
- Test automation setup

**What DOESN'T belong here:**
- Implementation code
- API specifications
- Database schemas
- UI designs

---

## Quick Reference Table

| Task Type | Correct File |
|-----------|--------------|
| Technology choices | 01-system-architecture |
| Table creation | 02-database-schema |
| RLS policies | 02-database-schema |
| API endpoints | 03-api-design |
| Screen layouts | 04-screen-flows |
| Project setup | 05-implementation-phases |
| Step-by-step tasks | 05-implementation-phases |
| Security policies | 06-security-requirements |
| Store metadata | 07-app-store-requirements |
| Test cases | 08-testing-strategy |
| Test implementations | 08-testing-strategy |