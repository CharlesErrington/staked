-- Phase 1: Core Tables Migration
-- Users, Groups, Group Members, and Invitations

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  push_token TEXT,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- 2. Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
  max_members INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB DEFAULT '{
    "auto_archive_days": 90,
    "allow_late_checkins": false,
    "notification_settings": {}
  }'::jsonb
);

CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_is_active ON groups(is_active);
CREATE INDEX idx_groups_is_archived ON groups(is_archived);

-- 3. Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_active_member UNIQUE(group_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member'))
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_active ON group_members(is_active);

-- 4. Group invitations table
CREATE TABLE IF NOT EXISTS group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
  invited_email VARCHAR(255),
  invited_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invitation_code VARCHAR(8) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

CREATE INDEX idx_invitations_group ON group_invitations(group_id);
CREATE INDEX idx_invitations_code ON group_invitations(invitation_code);
CREATE INDEX idx_invitations_status ON group_invitations(status);

-- Enable Row Level Security on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();-- Phase 2: Habit System Tables Migration
-- Habits, Check-ins, Habit Pauses, and Vacation Modes

-- 5. Habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency_type VARCHAR(20) NOT NULL,
  frequency_value INTEGER DEFAULT 1,
  frequency_days INTEGER[] DEFAULT '{}',
  check_in_deadline TIME NOT NULL,
  stake_amount DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  starts_at DATE DEFAULT CURRENT_DATE,
  ends_at DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_frequency CHECK (frequency_type IN ('daily', 'weekly', 'monthly', 'custom')),
  CONSTRAINT positive_stake CHECK (stake_amount > 0)
);

CREATE INDEX idx_habits_group ON habits(group_id);
CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_habits_active ON habits(is_active);
CREATE INDEX idx_habits_paused ON habits(is_paused);

-- 6. Check-ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  checked_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'missed', 'excused')),
  CONSTRAINT unique_daily_checkin UNIQUE(habit_id, check_in_date)
);

CREATE INDEX idx_checkins_habit ON check_ins(habit_id);
CREATE INDEX idx_checkins_user ON check_ins(user_id);
CREATE INDEX idx_checkins_date ON check_ins(check_in_date);
CREATE INDEX idx_checkins_status ON check_ins(status);

-- 13. Habit pauses table
CREATE TABLE IF NOT EXISTS habit_pauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  paused_at TIMESTAMPTZ DEFAULT NOW(),
  resumed_at TIMESTAMPTZ,
  reason TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_pauses_habit ON habit_pauses(habit_id);
CREATE INDEX idx_pauses_user ON habit_pauses(user_id);
CREATE INDEX idx_pauses_active ON habit_pauses(is_active);

-- 10. Vacation modes table
CREATE TABLE IF NOT EXISTS vacation_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  CONSTRAINT valid_dates CHECK (ends_at > starts_at)
);

CREATE INDEX idx_vacation_user ON vacation_modes(user_id);
CREATE INDEX idx_vacation_group ON vacation_modes(group_id);
CREATE INDEX idx_vacation_habit ON vacation_modes(habit_id);
CREATE INDEX idx_vacation_active ON vacation_modes(is_active);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_pauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_modes ENABLE ROW LEVEL SECURITY;

-- Add updated_at triggers
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_check_ins_updated_at BEFORE UPDATE ON check_ins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Composite indexes for performance
CREATE INDEX idx_checkins_user_date ON check_ins(user_id, check_in_date DESC);
CREATE INDEX idx_habits_group_active ON habits(group_id, is_active);

-- Partial index for pending check-ins
CREATE INDEX idx_pending_checkins ON check_ins(habit_id, check_in_date) WHERE status = 'pending';

-- Partial index for active group members (referenced from phase 1 tables)
CREATE INDEX idx_active_group_members ON group_members(group_id) WHERE is_active = true;-- Phase 3: Financial System Tables Migration
-- Debts, Payments, and Payment Confirmations

-- 7. Debts table
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  debtor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creditor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  reason VARCHAR(255),
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  check_in_id UUID REFERENCES check_ins(id) ON DELETE SET NULL,
  is_settled BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT different_parties CHECK (debtor_id != creditor_id)
);

CREATE INDEX idx_debts_group ON debts(group_id);
CREATE INDEX idx_debts_debtor ON debts(debtor_id);
CREATE INDEX idx_debts_creditor ON debts(creditor_id);
CREATE INDEX idx_debts_settled ON debts(is_settled);
CREATE INDEX idx_debts_archived ON debts(is_archived);

-- 8. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  payment_method VARCHAR(50),
  transaction_reference VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'disputed', 'cancelled')),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_payments_group ON payments(group_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_receiver ON payments(receiver_id);
CREATE INDEX idx_payments_status ON payments(status);

-- 9. Payment confirmations table
CREATE TABLE IF NOT EXISTS payment_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  confirmed_by UUID REFERENCES users(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  disputed_at TIMESTAMPTZ,
  dispute_reason TEXT,
  CONSTRAINT unique_confirmation UNIQUE(payment_id, confirmed_by)
);

CREATE INDEX idx_confirmations_payment ON payment_confirmations(payment_id);
CREATE INDEX idx_confirmations_user ON payment_confirmations(confirmed_by);

-- Enable Row Level Security
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;

-- Composite indexes for common queries
CREATE INDEX idx_debts_group_settled ON debts(group_id, is_settled);
CREATE INDEX idx_payments_group_status ON payments(group_id, status);

-- Partial index for unsettled debts
CREATE INDEX idx_unsettled_debts ON debts(debtor_id, creditor_id) WHERE is_settled = false;-- Phase 4: Additional Features Tables Migration
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
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);-- Phase 5: Database Functions and Triggers Migration
-- Automated check-in creation, debt calculation, and statistics

-- 1. Function to create daily check-ins for active habits
CREATE OR REPLACE FUNCTION create_daily_checkins()
RETURNS void AS $$
BEGIN
  INSERT INTO check_ins (habit_id, user_id, check_in_date, status, deadline)
  SELECT 
    h.id,
    h.user_id,
    CURRENT_DATE,
    'pending',
    CURRENT_DATE + h.check_in_deadline
  FROM habits h
  WHERE h.is_active = true 
    AND h.is_paused = false
    AND NOT EXISTS (
      SELECT 1 FROM check_ins c 
      WHERE c.habit_id = h.id 
        AND c.check_in_date = CURRENT_DATE
    )
    -- Check if user is not on vacation for this habit
    AND NOT EXISTS (
      SELECT 1 FROM vacation_modes v
      WHERE v.user_id = h.user_id
        AND (v.habit_id = h.id OR v.group_id = h.group_id)
        AND v.is_active = true
        AND CURRENT_DATE BETWEEN v.starts_at::date AND v.ends_at::date
    );
END;
$$ LANGUAGE plpgsql;

-- 2. Function to calculate and create debts for missed check-ins
CREATE OR REPLACE FUNCTION calculate_missed_checkin_debts()
RETURNS trigger AS $$
DECLARE
  group_member RECORD;
  member_count INTEGER;
  debt_per_member DECIMAL(10, 2);
BEGIN
  -- Only process when status changes from pending to missed
  IF NEW.status = 'missed' AND OLD.status = 'pending' THEN
    -- Get habit details
    SELECT h.group_id, h.stake_amount, g.currency_code 
    INTO STRICT group_member
    FROM habits h
    JOIN groups g ON g.id = h.group_id
    WHERE h.id = NEW.habit_id;
    
    -- Count active group members excluding the debtor
    SELECT COUNT(*) INTO member_count
    FROM group_members 
    WHERE group_id = group_member.group_id 
      AND is_active = true 
      AND user_id != NEW.user_id;
    
    -- Only create debts if there are other members to pay
    IF member_count > 0 THEN
      debt_per_member := group_member.stake_amount / member_count;
      
      -- Create debt records for each group member
      INSERT INTO debts (group_id, debtor_id, creditor_id, amount, currency_code, reason, habit_id, check_in_id)
      SELECT 
        group_member.group_id,
        NEW.user_id,
        gm.user_id,
        debt_per_member,
        group_member.currency_code,
        'Missed check-in',
        NEW.habit_id,
        NEW.id
      FROM group_members gm
      WHERE gm.group_id = group_member.group_id 
        AND gm.is_active = true 
        AND gm.user_id != NEW.user_id;
        
      -- Create notification for debtor
      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES (
        NEW.user_id,
        'debt_created',
        'Missed Check-in',
        'You missed a check-in and now owe $' || group_member.stake_amount || ' to the group',
        jsonb_build_object(
          'habit_id', NEW.habit_id,
          'check_in_id', NEW.id,
          'total_debt', group_member.stake_amount
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for debt calculation
CREATE TRIGGER trigger_calculate_debts
AFTER UPDATE ON check_ins
FOR EACH ROW
EXECUTE FUNCTION calculate_missed_checkin_debts();

-- 3. Function to update group member statistics
CREATE OR REPLACE FUNCTION update_member_stats()
RETURNS trigger AS $$
BEGIN
  -- Insert or update stats based on check-in status
  INSERT INTO group_member_stats (
    group_id, 
    user_id, 
    successful_checkins, 
    missed_checkins, 
    last_checkin_at,
    total_checkins
  )
  SELECT 
    h.group_id,
    NEW.user_id,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'missed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'completed' THEN NEW.checked_at ELSE NULL END,
    1
  FROM habits h
  WHERE h.id = NEW.habit_id
  ON CONFLICT (group_id, user_id) DO UPDATE
  SET 
    successful_checkins = group_member_stats.successful_checkins + 
      CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    missed_checkins = group_member_stats.missed_checkins + 
      CASE WHEN NEW.status = 'missed' THEN 1 ELSE 0 END,
    total_checkins = group_member_stats.total_checkins + 1,
    last_checkin_at = CASE 
      WHEN NEW.status = 'completed' THEN NEW.checked_at 
      ELSE group_member_stats.last_checkin_at 
    END,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating stats
CREATE TRIGGER trigger_update_stats
AFTER INSERT OR UPDATE ON check_ins
FOR EACH ROW
WHEN (NEW.status IN ('completed', 'missed'))
EXECUTE FUNCTION update_member_stats();

-- 4. Function to calculate net debts between users
CREATE OR REPLACE FUNCTION get_net_debts(p_group_id UUID)
RETURNS TABLE (
  user1_id UUID,
  user2_id UUID,
  net_amount DECIMAL(10, 2),
  currency_code VARCHAR(3)
) AS $$
BEGIN
  RETURN QUERY
  WITH debt_pairs AS (
    SELECT 
      LEAST(debtor_id, creditor_id) as user1,
      GREATEST(debtor_id, creditor_id) as user2,
      CASE 
        WHEN debtor_id < creditor_id THEN amount 
        ELSE -amount 
      END as amount,
      d.currency_code
    FROM debts d
    WHERE group_id = p_group_id 
      AND is_settled = false 
      AND is_archived = false
  )
  SELECT 
    user1 as user1_id,
    user2 as user2_id,
    SUM(amount) as net_amount,
    MAX(dp.currency_code) as currency_code
  FROM debt_pairs dp
  GROUP BY user1, user2
  HAVING SUM(amount) != 0;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to mark check-ins as missed after deadline
CREATE OR REPLACE FUNCTION mark_missed_checkins()
RETURNS void AS $$
BEGIN
  UPDATE check_ins
  SET status = 'missed'
  WHERE status = 'pending'
    AND deadline < NOW();
END;
$$ LANGUAGE plpgsql;

-- 6. Function to settle debts when payment is confirmed
CREATE OR REPLACE FUNCTION settle_debts_on_payment()
RETURNS trigger AS $$
BEGIN
  -- When payment is confirmed, mark related debts as settled
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    UPDATE debts
    SET 
      is_settled = true,
      settled_at = NOW()
    WHERE group_id = NEW.group_id
      AND debtor_id = NEW.payer_id
      AND creditor_id = NEW.receiver_id
      AND is_settled = false
      AND amount <= NEW.amount;
      
    -- Create notification for receiver
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.receiver_id,
      'payment_received',
      'Payment Received',
      'You received a payment of $' || NEW.amount,
      jsonb_build_object(
        'payment_id', NEW.id,
        'payer_id', NEW.payer_id,
        'amount', NEW.amount
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for settling debts
CREATE TRIGGER trigger_settle_debts
AFTER UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION settle_debts_on_payment();

-- 7. Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID, p_habit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  last_date DATE;
  check_record RECORD;
BEGIN
  -- Get check-ins ordered by date descending
  FOR check_record IN
    SELECT check_in_date, status
    FROM check_ins
    WHERE user_id = p_user_id
      AND habit_id = p_habit_id
      AND status IN ('completed', 'missed')
    ORDER BY check_in_date DESC
  LOOP
    -- Break streak if missed
    IF check_record.status = 'missed' THEN
      EXIT;
    END IF;
    
    -- Check for consecutive days
    IF last_date IS NULL OR last_date - check_record.check_in_date = 1 THEN
      current_streak := current_streak + 1;
      last_date := check_record.check_in_date;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to generate invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 8-character alphanumeric code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM group_invitations 
      WHERE invitation_code = code
    ) INTO exists;
    
    -- Exit loop if unique code found
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger to auto-generate invitation codes
CREATE OR REPLACE FUNCTION set_invitation_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.invitation_code IS NULL THEN
    NEW.invitation_code := generate_invitation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invitation_code
BEFORE INSERT ON group_invitations
FOR EACH ROW
EXECUTE FUNCTION set_invitation_code();-- Phase 6: Row Level Security Policies Migration
-- Comprehensive RLS policies for all tables

-- ============================================
-- USER POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view profiles of group members
CREATE POLICY "Users can view profiles of group members" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() 
        AND gm2.user_id = users.id
        AND gm1.is_active = true
        AND gm2.is_active = true
    )
  );

-- ============================================
-- GROUP POLICIES
-- ============================================

-- Users can view groups they belong to
CREATE POLICY "Users can view groups they belong to" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = groups.id 
        AND user_id = auth.uid()
        AND is_active = true
    )
  );

-- Users can create new groups
CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Group admins can update group settings
CREATE POLICY "Group admins can update group settings" ON groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = groups.id 
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );

-- Group owners can delete groups
CREATE POLICY "Group owners can delete groups" ON groups
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = groups.id 
        AND user_id = auth.uid()
        AND role = 'owner'
        AND is_active = true
    )
  );

-- ============================================
-- GROUP MEMBER POLICIES
-- ============================================

-- Users can view members of their groups
CREATE POLICY "Users can view members of their groups" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.is_active = true
    )
  );

-- Group admins can manage members
CREATE POLICY "Group admins can add members" ON group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_members.group_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );

-- Group admins can update member roles
CREATE POLICY "Group admins can update members" ON group_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
        AND gm.is_active = true
    )
  );

-- Users can leave groups (deactivate themselves)
CREATE POLICY "Users can leave groups" ON group_members
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- ============================================
-- GROUP INVITATION POLICIES
-- ============================================

-- Users can view invitations for their groups
CREATE POLICY "Users can view group invitations" ON group_invitations
  FOR SELECT USING (
    -- User is a member of the group
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_invitations.group_id
        AND user_id = auth.uid()
        AND is_active = true
    )
    OR
    -- User is the invited person
    invited_user_id = auth.uid()
    OR
    invited_email = (SELECT email FROM users WHERE id = auth.uid())
  );

-- Group admins can create invitations
CREATE POLICY "Group admins can create invitations" ON group_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_invitations.group_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );

-- Invited users can accept/decline invitations
CREATE POLICY "Users can respond to invitations" ON group_invitations
  FOR UPDATE USING (
    invited_user_id = auth.uid()
    OR
    invited_email = (SELECT email FROM users WHERE id = auth.uid())
  );

-- ============================================
-- HABIT POLICIES
-- ============================================

-- Users can view habits in their groups
CREATE POLICY "Users can view habits in their groups" ON habits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = habits.group_id 
        AND user_id = auth.uid()
        AND is_active = true
    )
  );

-- Users can create their own habits
CREATE POLICY "Users can create their own habits" ON habits
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = habits.group_id
        AND user_id = auth.uid()
        AND is_active = true
    )
  );

-- Users can update their own habits
CREATE POLICY "Users can update their own habits" ON habits
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own habits
CREATE POLICY "Users can delete their own habits" ON habits
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- CHECK-IN POLICIES
-- ============================================

-- Users can view check-ins for habits in their groups
CREATE POLICY "Users can view check-ins in their groups" ON check_ins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM habits h
      JOIN group_members gm ON gm.group_id = h.group_id
      WHERE h.id = check_ins.habit_id
        AND gm.user_id = auth.uid()
        AND gm.is_active = true
    )
  );

-- Users can create their own check-ins
CREATE POLICY "Users can create their own check-ins" ON check_ins
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own check-ins
CREATE POLICY "Users can update their own check-ins" ON check_ins
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- DEBT POLICIES
-- ============================================

-- Users can view debts they're involved in
CREATE POLICY "Users can view their debts" ON debts
  FOR SELECT USING (
    debtor_id = auth.uid() 
    OR 
    creditor_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = debts.group_id
        AND user_id = auth.uid()
        AND is_active = true
    )
  );

-- System creates debts (through triggers)
-- No INSERT policy for users - debts are created automatically

-- Users involved can update debt status
CREATE POLICY "Users can update their debts" ON debts
  FOR UPDATE USING (
    debtor_id = auth.uid() 
    OR 
    creditor_id = auth.uid()
  );

-- ============================================
-- PAYMENT POLICIES
-- ============================================

-- Users can view payments in their groups
CREATE POLICY "Users can view payments" ON payments
  FOR SELECT USING (
    payer_id = auth.uid()
    OR
    receiver_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = payments.group_id
        AND user_id = auth.uid()
        AND is_active = true
    )
  );

-- Payers can create payment records
CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (payer_id = auth.uid());

-- Involved parties can update payment status
CREATE POLICY "Users can update payments" ON payments
  FOR UPDATE USING (
    payer_id = auth.uid()
    OR
    receiver_id = auth.uid()
  );

-- ============================================
-- PAYMENT CONFIRMATION POLICIES
-- ============================================

-- Users can view confirmations for payments they're involved in
CREATE POLICY "Users can view payment confirmations" ON payment_confirmations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payments
      WHERE payments.id = payment_confirmations.payment_id
        AND (payments.payer_id = auth.uid() OR payments.receiver_id = auth.uid())
    )
  );

-- Receivers can confirm payments
CREATE POLICY "Receivers can confirm payments" ON payment_confirmations
  FOR INSERT WITH CHECK (
    confirmed_by = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM payments
      WHERE payments.id = payment_confirmations.payment_id
        AND payments.receiver_id = auth.uid()
    )
  );

-- ============================================
-- VACATION MODE POLICIES
-- ============================================

-- Users can view vacation modes in their groups
CREATE POLICY "Users can view vacation modes" ON vacation_modes
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = vacation_modes.group_id
        AND user_id = auth.uid()
        AND is_active = true
    )
  );

-- Users can create their own vacation modes
CREATE POLICY "Users can create vacation modes" ON vacation_modes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own vacation modes
CREATE POLICY "Users can update vacation modes" ON vacation_modes
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own vacation modes
CREATE POLICY "Users can delete vacation modes" ON vacation_modes
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- HABIT PAUSE POLICIES
-- ============================================

-- Users can view pauses for habits in their groups
CREATE POLICY "Users can view habit pauses" ON habit_pauses
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM habits h
      JOIN group_members gm ON gm.group_id = h.group_id
      WHERE h.id = habit_pauses.habit_id
        AND gm.user_id = auth.uid()
        AND gm.is_active = true
    )
  );

-- Users can pause their own habits
CREATE POLICY "Users can create habit pauses" ON habit_pauses
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can resume their own habits
CREATE POLICY "Users can update habit pauses" ON habit_pauses
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- NOTIFICATION POLICIES
-- ============================================

-- Users can only view their own notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- System creates notifications (through triggers)
-- No INSERT policy for users

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- GROUP MEMBER STATS POLICIES
-- ============================================

-- Users can view stats for groups they belong to
CREATE POLICY "Users can view group stats" ON group_member_stats
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_member_stats.group_id
        AND user_id = auth.uid()
        AND is_active = true
    )
  );

-- Stats are updated automatically by triggers
-- No INSERT/UPDATE policies for users-- Phase 7: Additional Performance Indexes Migration
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
ANALYZE group_member_stats;-- Phase 8: Development Seed Data (Optional)
-- Only run this in development environments for testing

-- This migration is optional and should only be run in development
-- Comment out or delete this file before production deployment

-- Sample users (passwords would be handled by Supabase Auth)
INSERT INTO users (id, email, username, full_name, timezone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'alice', 'Alice Johnson', 'America/New_York'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com', 'bob', 'Bob Smith', 'America/Los_Angeles'),
  ('33333333-3333-3333-3333-333333333333', 'charlie@example.com', 'charlie', 'Charlie Brown', 'Europe/London'),
  ('44444444-4444-4444-4444-444444444444', 'diana@example.com', 'diana', 'Diana Prince', 'America/Chicago')
ON CONFLICT (id) DO NOTHING;

-- Sample groups
INSERT INTO groups (id, name, description, created_by, currency_code) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Morning Runners', 'Daily morning run accountability group', '11111111-1111-1111-1111-111111111111', 'USD'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Meditation Masters', 'Daily meditation practice', '22222222-2222-2222-2222-222222222222', 'USD'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Code Every Day', 'Commit code daily', '33333333-3333-3333-3333-333333333333', 'USD')
ON CONFLICT (id) DO NOTHING;

-- Sample group memberships
INSERT INTO group_members (group_id, user_id, role) VALUES
  -- Morning Runners
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'member'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'member'),
  -- Meditation Masters
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'owner'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'admin'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'member'),
  -- Code Every Day
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'owner'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'member')
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Sample habits
INSERT INTO habits (id, group_id, user_id, name, description, frequency_type, check_in_deadline, stake_amount) VALUES
  -- Morning run habits
  ('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
   'Morning 5K Run', 'Run 5K every morning before 8 AM', 'daily', '08:00:00', 5.00),
  ('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 
   'Morning 5K Run', 'Run 5K every morning before 8 AM', 'daily', '08:00:00', 5.00),
  ('a3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 
   'Morning 5K Run', 'Run 5K every morning before 8 AM', 'daily', '08:00:00', 5.00),
  
  -- Meditation habits
  ('a4444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 
   '20min Meditation', 'Meditate for 20 minutes', 'daily', '22:00:00', 3.00),
  ('a5555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 
   '20min Meditation', 'Meditate for 20 minutes', 'daily', '22:00:00', 3.00),
  ('a6666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 
   '20min Meditation', 'Meditate for 20 minutes', 'daily', '22:00:00', 3.00),
  
  -- Coding habits
  ('a7777777-7777-7777-7777-777777777777', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 
   'Daily Commit', 'Make at least one meaningful commit', 'daily', '23:59:00', 10.00),
  ('a8888888-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 
   'Daily Commit', 'Make at least one meaningful commit', 'daily', '23:59:00', 10.00)
ON CONFLICT (id) DO NOTHING;

-- Sample check-ins for today and past week
DO $$
DECLARE
  today DATE := CURRENT_DATE;
  i INTEGER;
BEGIN
  -- Create check-ins for the past 7 days
  FOR i IN 0..6 LOOP
    -- Morning run check-ins
    INSERT INTO check_ins (habit_id, user_id, check_in_date, status, deadline, checked_at)
    SELECT 
      h.id,
      h.user_id,
      today - i,
      CASE 
        WHEN random() > 0.2 THEN 'completed'
        ELSE 'missed'
      END,
      (today - i) + h.check_in_deadline,
      CASE 
        WHEN random() > 0.2 THEN (today - i) + h.check_in_deadline - INTERVAL '1 hour'
        ELSE NULL
      END
    FROM habits h
    WHERE h.group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    ON CONFLICT (habit_id, check_in_date) DO NOTHING;
    
    -- Meditation check-ins
    INSERT INTO check_ins (habit_id, user_id, check_in_date, status, deadline, checked_at)
    SELECT 
      h.id,
      h.user_id,
      today - i,
      CASE 
        WHEN random() > 0.3 THEN 'completed'
        ELSE 'missed'
      END,
      (today - i) + h.check_in_deadline,
      CASE 
        WHEN random() > 0.3 THEN (today - i) + h.check_in_deadline - INTERVAL '2 hours'
        ELSE NULL
      END
    FROM habits h
    WHERE h.group_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    ON CONFLICT (habit_id, check_in_date) DO NOTHING;
    
    -- Coding check-ins (only for past days, today is pending)
    IF i > 0 THEN
      INSERT INTO check_ins (habit_id, user_id, check_in_date, status, deadline, checked_at)
      SELECT 
        h.id,
        h.user_id,
        today - i,
        CASE 
          WHEN random() > 0.1 THEN 'completed'
          ELSE 'missed'
        END,
        (today - i) + h.check_in_deadline,
        CASE 
          WHEN random() > 0.1 THEN (today - i) + h.check_in_deadline - INTERVAL '30 minutes'
          ELSE NULL
        END
      FROM habits h
      WHERE h.group_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
      ON CONFLICT (habit_id, check_in_date) DO NOTHING;
    ELSE
      -- Today's coding check-ins are pending
      INSERT INTO check_ins (habit_id, user_id, check_in_date, status, deadline)
      SELECT 
        h.id,
        h.user_id,
        today,
        'pending',
        today + h.check_in_deadline
      FROM habits h
      WHERE h.group_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
      ON CONFLICT (habit_id, check_in_date) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- The debt creation trigger will automatically create debts for missed check-ins
-- The stats update trigger will automatically update group member statistics

-- Sample group invitations
INSERT INTO group_invitations (group_id, invited_by, invited_email, invitation_code, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'newrunner@example.com', 'RUN12345', 'pending'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'zenmaster@example.com', 'ZEN98765', 'pending')
ON CONFLICT (invitation_code) DO NOTHING;

-- Sample notifications
INSERT INTO notifications (user_id, type, title, body, data) VALUES
  ('11111111-1111-1111-1111-111111111111', 'reminder', 'Morning Run Reminder', 'Don''t forget your morning run! Deadline is 8:00 AM', 
   '{"habit_id": "a1111111-1111-1111-1111-111111111111"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'group_invite', 'New Group Invitation', 'You''ve been invited to join "Yoga Practitioners"', 
   '{"group_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}'::jsonb),
  ('33333333-3333-3333-3333-333333333333', 'achievement', 'Streak Achievement!', 'You''ve maintained a 7-day streak on Daily Commit!', 
   '{"habit_id": "a7777777-7777-7777-7777-777777777777", "streak": 7}'::jsonb);

-- Note: Debts will be created automatically by triggers when check-ins are marked as 'missed'
-- Note: Statistics will be updated automatically by triggers when check-ins are created