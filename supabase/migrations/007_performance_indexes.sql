-- Phase 7: Additional Performance Indexes Migration
-- Optimize query performance with strategic indexes

-- ============================================
-- ADDITIONAL COMPOSITE INDEXES
-- ============================================

-- User activity queries
CREATE INDEX IF NOT EXISTS idx_users_active_updated 
  ON users(deleted_at, updated_at DESC) 
  WHERE deleted_at IS NULL;

-- Group activity and member count queries
CREATE INDEX IF NOT EXISTS idx_group_members_group_active_role 
  ON group_members(group_id, is_active, role) 
  WHERE is_active = true;

-- Habit deadline monitoring
CREATE INDEX IF NOT EXISTS idx_habits_deadline_active 
  ON habits(check_in_deadline, is_active) 
  WHERE is_active = true AND is_paused = false;

-- Check-in deadline monitoring for automated tasks
CREATE INDEX IF NOT EXISTS idx_checkins_deadline_status 
  ON check_ins(deadline, status) 
  WHERE status = 'pending';

-- Daily check-in creation optimization
CREATE INDEX IF NOT EXISTS idx_checkins_date_habit_user 
  ON check_ins(check_in_date, habit_id, user_id);

-- Debt aggregation queries
CREATE INDEX IF NOT EXISTS idx_debts_debtor_settled_archived 
  ON debts(debtor_id, is_settled, is_archived) 
  WHERE is_settled = false AND is_archived = false;

CREATE INDEX IF NOT EXISTS idx_debts_creditor_settled_archived 
  ON debts(creditor_id, is_settled, is_archived) 
  WHERE is_settled = false AND is_archived = false;

-- Payment verification queries
CREATE INDEX IF NOT EXISTS idx_payments_payer_receiver_status 
  ON payments(payer_id, receiver_id, status) 
  WHERE status = 'pending';

-- Notification delivery optimization
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_expires 
  ON notifications(user_id, is_read, expires_at) 
  WHERE is_read = false;

-- Vacation mode active checks
CREATE INDEX IF NOT EXISTS idx_vacation_active_dates 
  ON vacation_modes(user_id, starts_at, ends_at) 
  WHERE is_active = true;

-- Group invitation lookups
CREATE INDEX IF NOT EXISTS idx_invitations_email_status 
  ON group_invitations(invited_email, status) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_invitations_user_status 
  ON group_invitations(invited_user_id, status) 
  WHERE status = 'pending';

-- ============================================
-- PARTIAL INDEXES FOR COMMON QUERIES
-- ============================================

-- Active habits per user
CREATE INDEX IF NOT EXISTS idx_habits_user_active_paused 
  ON habits(user_id, is_active, is_paused) 
  WHERE is_active = true AND is_paused = false;

-- Pending check-ins per user
CREATE INDEX IF NOT EXISTS idx_checkins_user_pending 
  ON check_ins(user_id, check_in_date) 
  WHERE status = 'pending';

-- Recent successful check-ins for streak calculation
CREATE INDEX IF NOT EXISTS idx_checkins_user_completed_date 
  ON check_ins(user_id, habit_id, check_in_date DESC) 
  WHERE status = 'completed';

-- Active group statistics
CREATE INDEX IF NOT EXISTS idx_stats_group_updated 
  ON group_member_stats(group_id, updated_at DESC);

-- ============================================
-- TEXT SEARCH INDEXES
-- ============================================

-- Full text search on group names and descriptions
CREATE INDEX IF NOT EXISTS idx_groups_search 
  ON groups USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Full text search on habit names and descriptions
CREATE INDEX IF NOT EXISTS idx_habits_search 
  ON habits USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Username search optimization
CREATE INDEX IF NOT EXISTS idx_users_username_lower 
  ON users(LOWER(username));

-- Email search optimization
CREATE INDEX IF NOT EXISTS idx_users_email_lower 
  ON users(LOWER(email));

-- ============================================
-- FOREIGN KEY INDEXES (if not already created)
-- ============================================

-- Ensure all foreign keys have indexes for join performance
CREATE INDEX IF NOT EXISTS idx_habits_group_id ON habits(group_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_habit_id ON check_ins(habit_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_habit_id ON debts(habit_id);
CREATE INDEX IF NOT EXISTS idx_debts_check_in_id ON debts(check_in_id);
CREATE INDEX IF NOT EXISTS idx_vacation_modes_habit_id ON vacation_modes(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_pauses_habit_id ON habit_pauses(habit_id);

-- ============================================
-- MAINTENANCE INDEXES
-- ============================================

-- Cleanup of expired invitations
CREATE INDEX IF NOT EXISTS idx_invitations_expires_status 
  ON group_invitations(expires_at, status) 
  WHERE status = 'pending';

-- Cleanup of old notifications
CREATE INDEX IF NOT EXISTS idx_notifications_expires 
  ON notifications(expires_at);

-- Archive old completed check-ins
CREATE INDEX IF NOT EXISTS idx_checkins_date_status 
  ON check_ins(check_in_date, status) 
  WHERE status IN ('completed', 'missed');

-- ============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================

-- Update table statistics for query optimizer
ANALYZE users;
ANALYZE groups;
ANALYZE group_members;
ANALYZE group_invitations;
ANALYZE habits;
ANALYZE check_ins;
ANALYZE debts;
ANALYZE payments;
ANALYZE payment_confirmations;
ANALYZE vacation_modes;
ANALYZE habit_pauses;
ANALYZE notifications;
ANALYZE group_member_stats;