-- Phase 4: Additional Features Tables Migration
-- Notifications and Group Member Statistics

-- 11. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- 12. Group member statistics table
CREATE TABLE IF NOT EXISTS group_member_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_habits INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  successful_checkins INTEGER DEFAULT 0,
  missed_checkins INTEGER DEFAULT 0,
  total_stake_amount DECIMAL(10, 2) DEFAULT 0,
  total_debt_owed DECIMAL(10, 2) DEFAULT 0,
  total_debt_owed_to DECIMAL(10, 2) DEFAULT 0,
  streak_current INTEGER DEFAULT 0,
  streak_longest INTEGER DEFAULT 0,
  last_checkin_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_member_stats UNIQUE(group_id, user_id)
);

CREATE INDEX idx_stats_group ON group_member_stats(group_id);
CREATE INDEX idx_stats_user ON group_member_stats(user_id);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_member_stats ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger for stats
CREATE TRIGGER update_group_member_stats_updated_at BEFORE UPDATE ON group_member_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Composite index for user notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);