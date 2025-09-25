-- AGGRESSIVE FIX: Drop ALL policies and recreate minimal set

-- First disable RLS temporarily to clear everything
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on both tables
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Drop all policies on users table
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
  END LOOP;

  -- Drop all policies on group_members table
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'group_members'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON group_members', pol.policyname);
  END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Create MINIMAL policies for users table
-- 1. Anyone can insert their own profile
CREATE POLICY "insert_own_profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- 2. Anyone can view any profile (for now, to avoid recursion)
CREATE POLICY "view_all_profiles"
ON users FOR SELECT
USING (true);

-- 3. Users can update their own profile
CREATE POLICY "update_own_profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Create MINIMAL policies for group_members table
-- 1. View your own memberships
CREATE POLICY "view_own_memberships"
ON group_members FOR SELECT
USING (auth.uid() = user_id);

-- 2. Simple policy for viewing group members (no recursion to users table)
CREATE POLICY "view_same_group_members"
ON group_members FOR SELECT
USING (
  group_id IN (
    SELECT group_id
    FROM group_members
    WHERE user_id = auth.uid()
  )
);