-- Local dev seed only. Runs after migrations on `supabase db reset`. Never applied to the
-- hosted project. Creates one auth user so the on_auth_user_created trigger (see
-- 20260723191735_user_settings.sql) provisions a user_settings row, then logs a couple of
-- weeks of sample meals/drinks/weigh-ins so daily_totals / weekly_totals / weight_progress
-- have something to render locally.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'dev@example.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
);

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, created_at, updated_at
) values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"dev@example.com"}',
  'email',
  now(), now()
);

-- user_settings row already exists via the handle_new_user trigger, using table defaults
-- (2000 kcal / 150g protein / 30g fiber / 3L water / 101kg start / 70-75kg goal band).
-- Set a height here so BMI has something to compute in local dev.
update public.user_settings
set height_cm = 175
where user_id = '11111111-1111-1111-1111-111111111111';

insert into public.meals (user_id, title, calories, protein_g, carbs_g, fat_g, fiber_g, meal_label, eaten_at, log_date)
values
  ('11111111-1111-1111-1111-111111111111', 'Oats + whey', 420, 35, 45, 8, 6, 'Meal 1', now() - interval '2 days' + time '08:00', (current_date - 2)),
  ('11111111-1111-1111-1111-111111111111', 'Chicken + rice', 650, 55, 70, 12, 4, 'Meal 2', now() - interval '2 days' + time '13:30', (current_date - 2)),
  ('11111111-1111-1111-1111-111111111111', 'Dal + roti', 520, 28, null, null, null, 'Meal 3', now() - interval '2 days' + time '20:00', (current_date - 2)),
  ('11111111-1111-1111-1111-111111111111', 'Eggs + toast', 380, 26, 30, 15, 3, 'Meal 1', now() - interval '1 days' + time '08:15', (current_date - 1)),
  ('11111111-1111-1111-1111-111111111111', 'Paneer bowl', 600, 40, 50, 20, 8, 'Meal 2', now() - interval '1 days' + time '14:00', (current_date - 1)),
  ('11111111-1111-1111-1111-111111111111', 'Late night dal', 700, 30, null, null, null, 'Snack', now() - interval '1 days' + time '23:30', (current_date - 1)),
  ('11111111-1111-1111-1111-111111111111', 'Protein shake', 250, 40, 10, 3, null, 'Pre-workout', now() + time '07:00', current_date);

insert into public.drinks (user_id, entry_label, amount_l, drink_type, drunk_at, log_date)
values
  ('11111111-1111-1111-1111-111111111111', null, 0.5, 'Water', now() - interval '2 days' + time '09:00', (current_date - 2)),
  ('11111111-1111-1111-1111-111111111111', null, 1.0, 'Water', now() - interval '2 days' + time '13:00', (current_date - 2)),
  ('11111111-1111-1111-1111-111111111111', null, 0.5, 'Electrolyte', now() - interval '2 days' + time '17:00', (current_date - 2)),
  ('11111111-1111-1111-1111-111111111111', null, 1.0, 'Water', now() - interval '1 days' + time '10:00', (current_date - 1)),
  ('11111111-1111-1111-1111-111111111111', null, 0.5, 'Coffee/Tea', now() - interval '1 days' + time '08:00', (current_date - 1)),
  ('11111111-1111-1111-1111-111111111111', null, 0.25, 'Water', now() + time '08:00', current_date);

insert into public.weigh_ins (user_id, weight_kg, entry_label, weighed_at, log_date)
values
  ('11111111-1111-1111-1111-111111111111', 96.4, 'Morning', now() - interval '6 days' + time '07:00', (current_date - 6)),
  ('11111111-1111-1111-1111-111111111111', 96.1, 'Morning', now() - interval '5 days' + time '07:00', (current_date - 5)),
  ('11111111-1111-1111-1111-111111111111', 96.6, 'Morning', now() - interval '4 days' + time '07:00', (current_date - 4)),
  ('11111111-1111-1111-1111-111111111111', 95.9, 'Morning', now() - interval '3 days' + time '07:00', (current_date - 3)),
  ('11111111-1111-1111-1111-111111111111', 95.7, 'Morning', now() - interval '2 days' + time '07:00', (current_date - 2)),
  ('11111111-1111-1111-1111-111111111111', 96.0, 'Morning', now() - interval '1 days' + time '07:00', (current_date - 1)),
  ('11111111-1111-1111-1111-111111111111', 95.5, 'Morning', now() + time '07:00', current_date);
