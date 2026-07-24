-- Caches the generated daily insight text so the dashboard only calls the Gemini API once
-- per user per day, not on every page load. daily_insight_date is compared against the
-- user's local "today" (user_settings.timezone), same pattern as every other "today" check
-- in this app -- not derived from a timestamp.
alter table public.user_settings
  add column daily_insight_text text,
  add column daily_insight_date date;
