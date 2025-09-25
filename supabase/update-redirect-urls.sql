-- This updates the auth settings to work with Expo Go
-- You'll need to run this in Supabase SQL editor

-- For now, you can manually confirm users for testing
-- Find the user and confirm their email
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'),
      '{email_verified}',
      'true'
    )
WHERE email = 'YOUR_EMAIL_HERE';

-- To see all unconfirmed users:
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;