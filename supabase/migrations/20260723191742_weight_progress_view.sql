-- Rule (CLAUDE.md #6): weight charts plot the rolling 7-day average as the primary line;
-- raw readings are secondary. rolling_7d_avg is a true calendar-day window (RANGE, not ROWS)
-- so a gap in weigh-ins doesn't silently shrink to fewer than 7 days of coverage becoming
-- misleadingly smooth -- it stays anchored to actual elapsed days.
--
-- Formulas below match the real Notion "Weight Log" / "Dashboard" pages:
--   Lost (kg)    = Start - Weight
--   To Goal (kg) = Weight - goal band midpoint ("kg left to the middle of your 70-75 band")
--   Progress %   = (Start - Weight) / (Start - goal band midpoint) * 100
--   BMI          = Weight / height_m^2
-- BMI is null whenever height_cm hasn't been set (see user_settings) rather than assuming a
-- hardcoded height like the Notion version did.
create view public.weight_progress as
with daily_weight as (
  select
    user_id,
    log_date,
    avg(weight_kg) as weight_kg
  from public.weigh_ins
  group by user_id, log_date
)
select
  d.user_id,
  d.log_date,
  d.weight_kg,
  avg(d.weight_kg) over (
    partition by d.user_id
    order by d.log_date
    range between interval '6 days' preceding and current row
  ) as rolling_7d_avg,
  s.starting_weight_kg,
  s.goal_weight_low_kg,
  s.goal_weight_high_kg,
  (s.goal_weight_low_kg + s.goal_weight_high_kg) / 2 as goal_weight_mid_kg,
  s.starting_weight_kg - d.weight_kg as lost_kg,
  d.weight_kg - (s.goal_weight_low_kg + s.goal_weight_high_kg) / 2 as to_goal_kg,
  case
    when (s.starting_weight_kg - (s.goal_weight_low_kg + s.goal_weight_high_kg) / 2) = 0
      then null
    else round(
      (s.starting_weight_kg - d.weight_kg)
      / (s.starting_weight_kg - (s.goal_weight_low_kg + s.goal_weight_high_kg) / 2)
      * 100,
      1
    )
  end as progress_pct,
  case
    when s.height_cm is null or s.height_cm = 0 then null
    else round(d.weight_kg / power(s.height_cm / 100.0, 2), 1)
  end as bmi
from daily_weight d
join public.user_settings s on s.user_id = d.user_id;

alter view public.weight_progress set (security_invoker = true);
