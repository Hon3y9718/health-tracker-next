-- Rule (CLAUDE.md #4): same shape as weekly_totals, built on daily_totals, one month bucket.
create view public.monthly_totals as
select
  d.user_id,
  date_trunc('month', d.log_date)::date as month_start,
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
group by d.user_id, date_trunc('month', d.log_date)::date;

alter view public.monthly_totals set (security_invoker = true);
