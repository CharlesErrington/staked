-- Create profile for your user
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