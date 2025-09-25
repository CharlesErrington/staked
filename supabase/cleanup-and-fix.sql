-- First, check for orphaned auth users (exist in auth.users but not in public.users)
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'username' as username,
  au.raw_user_meta_data->>'full_name' as full_name
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Create profiles for all orphaned auth users
INSERT INTO public.users (id, email, username, full_name, email_notifications, push_notifications, timezone)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
  au.raw_user_meta_data->>'full_name',
  true,
  true,
  'America/New_York'
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Now fix the RLS policies to prevent this in the future
-- Drop all existing policies
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
DROP POLICY IF EXISTS "Public username checks" ON users;
DROP POLICY IF EXISTS "Users update own profile" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Most permissive INSERT policy for signup flow
-- Allow ANYONE (including non-authenticated) to create a profile if the auth user exists
CREATE POLICY "Anyone can create profile for auth user"
ON users FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = users.id
  )
);

-- Allow users to view their own profile
CREATE POLICY "View own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow viewing profiles of group members
CREATE POLICY "View group members"
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

-- Allow anyone to check username availability
CREATE POLICY "Check usernames"
ON users FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Update the trigger to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'full_name',
    true,
    true,
    'America/New_York'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;