-- Drop all existing policies on users table
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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Allow ANYONE to insert a profile if the ID exists in auth.users
-- This handles the signup flow where the user isn't authenticated yet
CREATE POLICY "Anyone can insert profile for existing auth user" 
ON users FOR INSERT 
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = users.id
  )
);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Allow users to view profiles of group members
CREATE POLICY "Users can view group member profiles" 
ON users FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
    AND gm2.user_id = users.id
    AND gm1.is_active = true
    AND gm2.is_active = true
  )
);

-- Allow anon to select a user by username (for checking availability)
CREATE POLICY "Anon can check username availability" 
ON users FOR SELECT 
TO anon
USING (true);  -- We'll rely on the query to filter by username

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);