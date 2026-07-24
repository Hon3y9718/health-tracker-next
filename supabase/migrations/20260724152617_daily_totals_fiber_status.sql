-- Fiber has always had a target (user_settings.fiber_target_g) and the raw value/target
-- already flowed through daily_totals, but no status band was ever derived for it, so the
-- dashboard's Fiber tile silently rendered without a status pill (TargetMeter only shows one
-- when both status and statusKind are passed -- see src/components/TargetMeter.tsx).
--
-- Fiber is a "more is better, up to target" metric like protein, not a two-sided band like
-- calories, so it reuses protein_status's hit/close/low thresholds (rule #4: one definition,
-- in the view, not invented client-side).
create or replace view public.daily_totals as
with meal_days as (
  select
    user_id,
    log_date,
    sum(calories) as calories,
    sum(protein_g) as protein_g,
    sum(carbs_g) as carbs_g,
    sum(fat_g) as fat_g,
    sum(fiber_g) as fiber_g,
    count(*) as meals_logged
  from public.meals
  group by user_id, log_date
),
drink_days as (
  select
    user_id,
    log_date,
    sum(amount_l) as water_l
  from public.drinks
  group by user_id, log_date
),
combined as (
  select
    coalesce(m.user_id, dr.user_id) as user_id,
    coalesce(m.log_date, dr.log_date) as log_date,
    m.calories,
    m.protein_g,
    m.carbs_g,
    m.fat_g,
    m.fiber_g,
    m.meals_logged,
    dr.water_l
  from meal_days m
  full outer join drink_days dr
    on m.user_id = dr.user_id and m.log_date = dr.log_date
)
select
  c.user_id,
  c.log_date,
  coalesce(c.calories, 0) as calories,
  c.protein_g,
  c.carbs_g,
  c.fat_g,
  c.fiber_g,
  coalesce(c.meals_logged, 0) as meals_logged,
  coalesce(c.water_l, 0) as water_l,
  s.calorie_target,
  s.protein_target_g,
  s.fiber_target_g,
  s.water_target_l,
  round(coalesce(c.calories, 0) - s.calorie_target) as calorie_variance,
  case
    when coalesce(c.calories, 0) < s.calorie_target - 200 then 'under'
    when coalesce(c.calories, 0) <= s.calorie_target + 200 then 'on_target'
    when coalesce(c.calories, 0) <= s.calorie_target + 500 then 'over'
    else 'way_over'
  end as calorie_status,
  case
    when coalesce(c.protein_g, 0) >= s.protein_target_g then 'hit'
    when coalesce(c.protein_g, 0) >= s.protein_target_g * 0.8 then 'close'
    else 'low'
  end as protein_status,
  case
    when coalesce(c.water_l, 0) >= s.water_target_l then 'hit'
    when coalesce(c.water_l, 0) >= s.water_target_l * 0.67 then 'close'
    else 'low'
  end as water_status,
  case
    when coalesce(c.fiber_g, 0) >= s.fiber_target_g then 'hit'
    when coalesce(c.fiber_g, 0) >= s.fiber_target_g * 0.8 then 'close'
    else 'low'
  end as fiber_status
from combined c
join public.user_settings s on s.user_id = c.user_id;

alter view public.daily_totals set (security_invoker = true);
