-- First check if your profile exists
SELECT * FROM public.users WHERE id = 'd99d5e59-1c30-4256-b381-3a1bec49563b';

-- If no rows returned above, create the profile:
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
  'd99d5e59-1c30-4256-b381-3a1bec49563b',
  'charlieerrington_61@hotmail.com',
  'Charlie',
  '',
  true,
  true,
  'America/New_York'
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email;

-- Then check the trigger exists and is enabled
SELECT
  tgname AS trigger_name,
  tgenabled AS is_enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- If trigger doesn't exist or is disabled, create/enable it:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    true,
    true,
    'America/New_York'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();