-- Phase 2: Habit System Tables Migration
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
CREATE INDEX idx_active_group_members ON group_members(group_id) WHERE is_active = true;