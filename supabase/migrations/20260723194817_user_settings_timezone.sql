-- log_date is stored independently of timestamps (rule #7), but "today" still has to mean
-- the user's local calendar day, not the server's. The dashboard was computing "today" from
-- the server's UTC clock while logging forms compute it from the browser's local clock,
-- which silently disagree whenever the two dates differ (found live: a meal logged for
-- local "today" didn't show up in the "Today" section because the server's UTC "today" was
-- a different date). Storing the user's IANA timezone lets every server-rendered "today"
-- agree with the browser instead of guessing.
alter table public.user_settings
  add column timezone text not null default 'UTC';
