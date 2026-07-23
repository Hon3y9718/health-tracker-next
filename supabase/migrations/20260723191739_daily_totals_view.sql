-- Rule (CLAUDE.md #4): derived values live here, not in application code. This is the one
-- definition of a "day" -- there is no days table (rule #3); a day is just whatever log_date
-- values appear in meals or drinks, unioned together via a full outer join so a day with
-- water but no meals (or vice versa) still shows up correctly.
--
-- Status bands come from the real Notion dashboard formulas (not invented here):
--   Calorie Status: replace 1800 with Cal Target - 200, 2200 with Cal Target + 200,
--                    2500 with Cal Target + 500
--   Protein Status: replace 150 with Protein Target, 120 with Protein Target * 0.8
--   Water Status:   replace 3 with Water Target, 2 with Water Target * 0.67
-- Rule (product principle): "under" is rendered neutral in the UI, never as a win -- that's
-- a presentation concern, but the label itself ('under') is chosen here so the UI never has
-- to re-derive it.
create view public.daily_totals as
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
  end as water_status
from combined c
join public.user_settings s on s.user_id = c.user_id;

alter view public.daily_totals set (security_invoker = true);
