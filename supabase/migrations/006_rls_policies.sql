-- Phase 6: Row Level Security Policies Migration
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
-- No INSERT/UPDATE policies for users