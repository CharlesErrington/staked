-- First, check for orphaned auth users and duplicate emails
WITH orphaned_users AS (
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data->>'username' as username,
    au.raw_user_meta_data->>'full_name' as full_name,
    ROW_NUMBER() OVER (PARTITION BY au.email ORDER BY au.created_at) as email_occurrence
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
)
SELECT 
  id,
  email,
  username,
  email_occurrence,
  created_at
FROM orphaned_users
ORDER BY email, created_at;

-- Create profiles for orphaned users, handling duplicate emails
INSERT INTO public.users (id, email, username, full_name, email_notifications, push_notifications, timezone)
WITH orphaned_users AS (
  SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'username' as meta_username,
    au.raw_user_meta_data->>'full_name' as full_name,
    ROW_NUMBER() OVER (PARTITION BY au.email ORDER BY au.created_at) as email_occurrence
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
)
SELECT 
  id,
  email,
  -- Generate unique username for duplicates
  CASE 
    WHEN email_occurrence = 1 THEN 
      COALESCE(meta_username, split_part(email, '@', 1))
    ELSE 
      COALESCE(
        meta_username || '_' || email_occurrence::text,
        split_part(email, '@', 1) || '_' || email_occurrence::text
      )
  END as username,
  full_name,
  true as email_notifications,
  true as push_notifications,
  'America/New_York' as timezone
FROM orphaned_users
ON CONFLICT (id) DO NOTHING;

-- Optional: Delete duplicate auth users (keep only the first one for each email)
-- UNCOMMENT ONLY IF YOU WANT TO CLEAN UP DUPLICATE AUTH USERS
/*
WITH duplicates AS (
  SELECT 
    id,
    email,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at) as rn
  FROM auth.users
)
DELETE FROM auth.users
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);
*/

-- Now apply the fixed RLS policies
DROP POLICY IF EXISTS "Anyone can create profile for auth user" ON users;
DROP POLICY IF EXISTS "View own profile" ON users;
DROP POLICY IF EXISTS "View group members" ON users;
DROP POLICY IF EXISTS "Check usernames" ON users;
DROP POLICY IF EXISTS "Update own profile" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Most permissive INSERT policy
CREATE POLICY "Allow profile creation"
ON users FOR INSERT
WITH CHECK (true);  -- Temporarily allow all inserts to fix the issue

-- View policies
CREATE POLICY "View own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

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

CREATE POLICY "Public username check"
ON users FOR SELECT
USING (true);

-- Update policy
CREATE POLICY "Update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Grant all necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- After fixing the immediate issue, update the INSERT policy to be more secure
-- Run this AFTER you've successfully created all user profiles
/*
DROP POLICY "Allow profile creation" ON users;
CREATE POLICY "Allow profile creation for auth users"
ON users FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = users.id
  )
);
*/