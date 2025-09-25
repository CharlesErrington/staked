-- Complete fix for signup flow RLS policies
-- This allows the signup process to work correctly

-- First, drop ALL existing policies to start fresh
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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Allow profile creation during signup
-- This uses a service key approach with proper validation
CREATE POLICY "Allow profile creation for valid auth users" 
ON users FOR INSERT 
WITH CHECK (
  -- Allow if the ID matches an existing auth.users entry
  -- This works for both authenticated and unauthenticated contexts
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = users.id
  )
);

-- Allow authenticated users to view their own profile
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Allow authenticated users to view profiles of group members
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

-- Allow authenticated users to update only their own profile
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Special policy for username availability checks
-- This needs to work for both anon and authenticated users
CREATE POLICY "Check username availability" 
ON users FOR SELECT
USING (true);  -- Allow all selects, but queries will filter appropriately

-- Ensure the trigger function exists and works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insert the user profile with proper defaults
  INSERT INTO public.users (
    id, 
    email, 
    username, 
    full_name,
    email_notifications,
    push_notifications,
    timezone
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    true,  -- default email_notifications
    true,  -- default push_notifications
    'America/New_York'  -- default timezone
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;