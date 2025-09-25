-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view profiles of group members" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Temporarily disable RLS to fix the issue
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Enable RLS but with simpler policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow service role to insert (for triggers)
CREATE POLICY "Service role can insert" 
ON users FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Allow users to view their own profile and profiles of users in same groups
CREATE POLICY "Users can view profiles" 
ON users FOR SELECT 
TO authenticated 
USING (
  auth.uid() = id 
  OR 
  EXISTS (
    SELECT 1 FROM group_members gm1
    WHERE gm1.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = gm1.group_id
      AND gm2.user_id = users.id
      AND gm2.is_active = true
    )
    AND gm1.is_active = true
  )
);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role has full access" 
ON users FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Also make sure the username constraint isn't the issue
-- Check if username column has a unique constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key CASCADE;
ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);