-- Fix infinite recursion in RLS policies
-- The issue is that the users table policies reference group_members
-- and group_members policies might reference users, creating a loop

-- First, drop ALL existing policies on users table
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view profiles of group members" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert" ON users;
DROP POLICY IF EXISTS "Users can view profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role has full access" ON users;
DROP POLICY IF EXISTS "Anyone can insert profile for existing auth user" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view group member profiles" ON users;
DROP POLICY IF EXISTS "Anon can check username availability" ON users;
DROP POLICY IF EXISTS "Allow profile creation for valid auth users" ON users;
DROP POLICY IF EXISTS "Check username availability" ON users;
DROP POLICY IF EXISTS "Public profile creation for auth users" ON users;
DROP POLICY IF EXISTS "Users view own profile" ON users;
DROP POLICY IF EXISTS "Users view group member profiles" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop the new policies too in case they exist
DROP POLICY IF EXISTS "Allow profile creation" ON users;
DROP POLICY IF EXISTS "View own profile" ON users;
DROP POLICY IF EXISTS "Update own profile" ON users;
DROP POLICY IF EXISTS "View any profile by id" ON users;

-- Create SIMPLE policies without group_members reference to avoid recursion

-- 1. Allow anyone to create a profile if auth user exists
CREATE POLICY "Allow profile creation"
ON users FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = users.id
  )
);

-- 2. Users can view their own profile
CREATE POLICY "View own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- 4. Allow viewing profiles by ID (for group member lookups later)
-- This avoids the recursion by not checking group membership here
CREATE POLICY "View any profile by id"
ON users FOR SELECT
USING (
  -- User is authenticated
  auth.role() = 'authenticated'
);

-- Now check group_members policies and make sure they don't cause recursion
-- Drop problematic policies on group_members if they exist
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Group members can view other members" ON group_members;
DROP POLICY IF EXISTS "View own group memberships" ON group_members;
DROP POLICY IF EXISTS "View group members of your groups" ON group_members;

-- Create simple group_members policies
CREATE POLICY "View own group memberships"
ON group_members FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "View group members of your groups"
ON group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members gm2
    WHERE gm2.group_id = group_members.group_id
    AND gm2.user_id = auth.uid()
  )
);