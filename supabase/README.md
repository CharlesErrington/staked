# Supabase Database Setup

This directory contains all the SQL migrations needed to set up the Staked app database in Supabase.

## Migration Files

The migrations are organized in phases:

1. **001_core_tables.sql** - Core tables (users, groups, group_members, invitations)
2. **002_habit_system.sql** - Habit tracking tables (habits, check_ins, pauses, vacation_modes)
3. **003_financial_system.sql** - Financial tables (debts, payments, payment_confirmations)
4. **004_additional_features.sql** - Additional features (notifications, group_member_stats)
5. **005_functions_triggers.sql** - Database functions and triggers for automation
6. **006_rls_policies.sql** - Row Level Security policies for data access control
7. **007_performance_indexes.sql** - Performance optimization indexes
8. **008_seed_data_dev.sql** - Sample data for development (optional)

## Setup Instructions

### 1. Local Development with Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Initialize Supabase in your project (if not already done)
supabase init

# Start local Supabase
supabase start

# Run migrations
supabase db push

# Check migration status
supabase migration list

# Reset database and rerun all migrations
supabase db reset
```

### 2. Production Setup (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order (001 through 007)
4. Skip 008_seed_data_dev.sql in production
5. Verify tables in Table Editor

### 3. Manual Migration (Direct SQL)

If you need to run migrations manually:

```sql
-- Run each .sql file in order
-- Start with 001_core_tables.sql
-- End with 007_performance_indexes.sql
-- Only run 008_seed_data_dev.sql in development
```

## Important Notes

### Row Level Security (RLS)

All tables have RLS enabled. Make sure to:
1. Enable RLS in Supabase Dashboard under Authentication > Policies
2. Verify that auth.uid() returns the correct user ID
3. Test policies thoroughly before production

### Automatic Functions

The database includes several automatic functions:
- **create_daily_checkins()** - Creates check-ins for active habits (run daily via cron)
- **calculate_missed_checkin_debts()** - Auto-creates debts when check-ins are missed
- **update_member_stats()** - Updates statistics when check-ins change
- **mark_missed_checkins()** - Marks pending check-ins as missed after deadline (run hourly via cron)

### Setting up Cron Jobs

In Supabase Dashboard, go to Database > Extensions and enable pg_cron, then:

```sql
-- Run daily at 00:00 UTC
SELECT cron.schedule(
  'create-daily-checkins',
  '0 0 * * *',
  'SELECT create_daily_checkins();'
);

-- Run hourly to mark missed check-ins
SELECT cron.schedule(
  'mark-missed-checkins',
  '0 * * * *',
  'SELECT mark_missed_checkins();'
);
```

### Environment Variables

Make sure your `.env` file includes:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key (for admin operations only)
```

## Testing

After running migrations:

1. Check all tables are created in Table Editor
2. Verify RLS policies are active
3. Test user authentication flow
4. Create test data and verify triggers work
5. Check that functions execute correctly

## Rollback

To rollback migrations:

```bash
# Reset to clean state
supabase db reset

# Or manually drop all tables (CAUTION: This deletes all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Make sure user is authenticated and auth.uid() is set
2. **Foreign Key Violations**: Run migrations in order (001 to 007)
3. **Permission Denied**: Check RLS policies and user roles
4. **Trigger Not Firing**: Verify trigger is created and enabled

### Debug Queries

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- List all policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public';

-- Check triggers
SELECT * FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Check functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

## Migration Best Practices

1. Always test migrations locally first
2. Back up production database before migrations
3. Run migrations during low-traffic periods
4. Monitor for errors after deployment
5. Have a rollback plan ready

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review the planning documents in `/planning`
3. Check migration logs in Supabase Dashboard