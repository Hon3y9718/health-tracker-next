-- Rule (CLAUDE.md #4): derived, lives in SQL. Backs the activity heatmap -- deliberately
-- just a presence/count-per-day fact, not a streak counter. The product principle against
-- streak mechanics ("breaks on one bad day and pushes toward compensation") argues against
-- computing a "current streak" number here; this view only ever answers "what happened on
-- day X", never "how many days in a row".
create view public.exercise_days as
select
  user_id,
  log_date,
  count(*) as session_count,
  array_agg(distinct exercise_type order by exercise_type) as exercise_types
from public.exercises
group by user_id, log_date;

alter view public.exercise_days set (security_invoker = true);
