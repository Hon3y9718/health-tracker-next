-- Rule (CLAUDE.md #4): derived, lives in SQL. Built on top of daily_totals rather than
-- re-joining meals/drinks, so there is exactly one definition of a "day" in the schema.
--
-- Rule (CLAUDE.md #6) / product principle: the weekly average is the headline, not any
-- single day -- this view is what the dashboard's "This week" section reads from, and it
-- carries its own status bands so one bad day doesn't dominate the read.
create view public.weekly_totals as
select
  d.user_id,
  date_trunc('week', d.log_date)::date as week_start,
  count(*) as days_logged,
  round(avg(d.calories)) as avg_calories,
  round(avg(d.protein_g), 1) as avg_protein_g,
  round(avg(d.water_l), 2) as avg_water_l,
  round(avg(d.fiber_g), 1) as avg_fiber_g,
  sum(d.calories) as total_calories,
  sum(d.protein_g) as total_protein_g,
  max(d.calorie_target) as calorie_target,
  max(d.protein_target_g) as protein_target_g,
  max(d.water_target_l) as water_target_l,
  case
    when avg(d.calories) < max(d.calorie_target) - 200 then 'under'
    when avg(d.calories) <= max(d.calorie_target) + 200 then 'on_target'
    when avg(d.calories) <= max(d.calorie_target) + 500 then 'over'
    else 'way_over'
  end as calorie_status,
  case
    when avg(d.protein_g) >= max(d.protein_target_g) then 'hit'
    when avg(d.protein_g) >= max(d.protein_target_g) * 0.8 then 'close'
    else 'low'
  end as protein_status,
  case
    when avg(d.water_l) >= max(d.water_target_l) then 'hit'
    when avg(d.water_l) >= max(d.water_target_l) * 0.67 then 'close'
    else 'low'
  end as water_status
from public.daily_totals d
group by d.user_id, date_trunc('week', d.log_date)::date;

alter view public.weekly_totals set (security_invoker = true);
