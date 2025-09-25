-- Phase 5: Database Functions and Triggers Migration
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
EXECUTE FUNCTION set_invitation_code();