-- Phase 8: Development Seed Data (Optional)
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