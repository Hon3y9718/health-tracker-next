# Nutrition & Weight Tracker — Build Spec

A port of an existing Notion-based tracking system to a web app backed by Supabase (Postgres).
This document describes the domain, the schema, the derived values, the screens, and the
decisions worth changing during the port.

---

## 1. What this system does

A single user logs three independent streams of data:

| Stream | Granularity | Purpose |
|---|---|---|
| **Meals** | Many per day | Calories and macros |
| **Drinks** | Many per day | Fluid intake in litres |
| **Weigh-ins** | Usually one per day, sometimes zero | Progress toward goal weight |

From those three streams everything else is derived: daily totals, adherence status,
weekly and monthly averages, variance against target, and progress toward the goal weight.

**Nothing is entered twice.** Every number on every dashboard traces back to a row in one
of the three log tables.

### User context (seed values)

| Parameter | Value |
|---|---|
| Starting weight | 101 kg |
| Goal band | 70 – 75 kg (midpoint 72.5) |
| Height | 170 cm |
| Calorie target | 2,000 kcal/day |
| Protein target | 150 g/day |
| Water target | 3.0 L/day |
| Activity level | Sedentary (no exercise) |
| Estimated TDEE | ~2,300 kcal |
| Expected rate | 0.15 – 0.3 kg/week at target |

These are **settings, not constants.** They live in a table and every derived value reads
from it. Changing the calorie target must instantly recompute every historical status.
This was the main structural weakness of the Notion version and is the single most
important thing to get right in the port.

---

## 2. The one big change from Notion

The Notion build has a `Daily Log` table containing **1,096 pre-created empty rows**, one
per day from 2026-07-23 to 2029-07-22. Each meal and drink has to be manually linked to its
day via a relation, so that rollup properties can sum them.

That table exists **only because Notion cannot aggregate rows without an explicit relation.**

**Do not port it.** In Postgres this is a view:

```sql
select log_date, sum(calories) from meals group by log_date;
```

Deleting that concept removes:

- 1,096 junk rows
- The manual "pick today's date" step on every single form submission
- An entire class of silent-failure bug (forget to link → meal vanishes from totals)

Days become implicit. A day "exists" if something was logged on it. If you need per-day
notes or a mood field, add a sparse `day_notes` table keyed on `(user_id, log_date)` and
left-join it — do not pre-populate it.

---

## 3. Schema

### 3.1 Enums

```sql
create type meal_slot as enum (
  'meal_1', 'meal_2', 'meal_3', 'meal_4', 'meal_5', 'meal_6',
  'snack', 'pre_workout', 'post_workout'
);

create type drink_type as enum (
  'water', 'coffee_tea', 'buttermilk_lassi', 'electrolyte', 'other'
);

create type adherence_status as enum (
  'not_logged', 'under', 'on_target', 'over', 'way_over'
);
```

`meal_slot` is a convenience label, not a constraint — the user can log any number of meals
per day and the slot is free-choice. Consider making it `text` instead if you want users to
invent their own labels without a migration.

### 3.2 Settings

```sql
create table user_settings (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  start_weight_kg    numeric(5,2) not null default 101,
  goal_weight_min_kg numeric(5,2) not null default 70,
  goal_weight_max_kg numeric(5,2) not null default 75,
  height_cm          numeric(5,1) not null default 170,
  cal_target         integer      not null default 2000,
  protein_target_g   integer      not null default 150,
  water_target_l     numeric(4,2) not null default 3.0,
  created_at         timestamptz  not null default now(),
  updated_at         timestamptz  not null default now()
);
```

Goal midpoint is computed as `(goal_weight_min_kg + goal_weight_max_kg) / 2`.

### 3.3 Meals

```sql
create table meals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  log_date   date not null default current_date,
  eaten_at   timestamptz,
  name       text,
  slot       meal_slot,
  calories   numeric(7,2) not null,
  protein_g  numeric(6,2),
  carbs_g    numeric(6,2),
  fat_g      numeric(6,2),
  fiber_g    numeric(6,2),
  notes      text,
  created_at timestamptz not null default now()
);

create index meals_user_date_idx on meals (user_id, log_date desc);
```

**Only `calories` is `not null`.** This is deliberate and matters. In the Notion version
every macro was marked required, which meant that not knowing the fibre content of a dish
blocked the submission entirely — and a blocked submission means the meal goes unlogged and
the whole day's total is wrong. A partially logged meal is strictly better than no meal.

`log_date` is stored separately from `eaten_at` rather than derived from it. A meal eaten at
01:00 usually belongs to the previous day in the user's mental model, and timezone-shifting a
timestamp to get a date is a recurring source of off-by-one-day bugs.

### 3.4 Drinks

```sql
create table drinks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  log_date   date not null default current_date,
  drank_at   timestamptz,
  amount_l   numeric(4,2) not null,
  kind       drink_type not null default 'water',
  notes      text,
  created_at timestamptz not null default now()
);

create index drinks_user_date_idx on drinks (user_id, log_date desc);
```

Fully independent of meals. The user must be able to log water on a day with no meals
logged, and meals on a day with no water logged. Never make one depend on the other.

Typical amounts: 0.25 (glass), 0.5, 1.0 (bottle). Consider quick-add buttons for these
rather than a number input.

### 3.5 Weigh-ins

```sql
create table weigh_ins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg   numeric(5,2) not null,
  label       text,
  notes       text,
  created_at  timestamptz not null default now()
);

create index weigh_ins_user_date_idx on weigh_ins (user_id, measured_on desc);
```

Append-only, multiple per day allowed. Do **not** add a unique constraint on
`(user_id, measured_on)` — people weigh themselves twice and want both readings.

### 3.6 Optional: food library

Not in the Notion build; the user declined it for now. Include the table if you want the
option later — reusing saved macros for repeat meals is the single biggest reduction in
logging effort.

```sql
create table foods (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  portion     text,
  calories    numeric(7,2) not null,
  protein_g   numeric(6,2),
  carbs_g     numeric(6,2),
  fat_g       numeric(6,2),
  fiber_g     numeric(6,2),
  times_used  integer not null default 0,
  created_at  timestamptz not null default now()
);
```

---

## 4. Derived data

All of this was formula properties in Notion. In Postgres it belongs in views, so the
business rules live in exactly one place.

### 4.1 Daily totals and adherence

```sql
create view daily_totals as
with days as (
  select user_id, log_date from meals
  union
  select user_id, log_date from drinks
),
m as (
  select user_id, log_date,
         sum(calories)  as calories,
         sum(protein_g) as protein_g,
         sum(carbs_g)   as carbs_g,
         sum(fat_g)     as fat_g,
         sum(fiber_g)   as fiber_g,
         count(*)       as meals_logged
  from meals group by user_id, log_date
),
d as (
  select user_id, log_date, sum(amount_l) as water_l
  from drinks group by user_id, log_date
)
select
  days.user_id,
  days.log_date,
  coalesce(m.calories, 0)     as calories,
  coalesce(m.protein_g, 0)    as protein_g,
  coalesce(m.carbs_g, 0)      as carbs_g,
  coalesce(m.fat_g, 0)        as fat_g,
  coalesce(m.fiber_g, 0)      as fiber_g,
  coalesce(m.meals_logged, 0) as meals_logged,
  coalesce(d.water_l, 0)      as water_l,
  round(coalesce(m.calories, 0) - s.cal_target) as variance,
  case
    when coalesce(m.calories, 0) = 0                    then 'not_logged'
    when m.calories < s.cal_target - 200                then 'under'
    when m.calories <= s.cal_target + 200               then 'on_target'
    when m.calories <= s.cal_target + 500               then 'over'
    else 'way_over'
  end::adherence_status as calorie_status,
  case
    when coalesce(m.protein_g, 0) = 0                   then 'not_logged'
    when m.protein_g >= s.protein_target_g              then 'on_target'
    when m.protein_g >= s.protein_target_g * 0.8        then 'under'
    else 'under'
  end::adherence_status as protein_status,
  coalesce(d.water_l, 0) >= s.water_target_l as water_hit
from days
join user_settings s on s.user_id = days.user_id
left join m on m.user_id = days.user_id and m.log_date = days.log_date
left join d on d.user_id = days.user_id and d.log_date = days.log_date;
```

**Threshold rules**, all relative to `cal_target` so they move when the target moves:

| Status | Condition (target = 2000) |
|---|---|
| `not_logged` | total = 0 |
| `under` | < target − 200 (< 1,800) |
| `on_target` | target ± 200 (1,800 – 2,200) |
| `over` | ≤ target + 500 (2,201 – 2,500) |
| `way_over` | > target + 500 |

The `under` band matters. It is not a success state — it flags days where intake dropped
low enough to be worth noticing, and the UI should render it neutrally (blue/grey), never
as a win. Overshooting the deficit is not the goal.

### 4.2 Weekly rollup

```sql
create view weekly_totals as
select
  user_id,
  date_trunc('week', log_date)::date as week_start,
  round(avg(calories))               as avg_calories,
  round(avg(protein_g))              as avg_protein_g,
  round(avg(water_l), 2)             as avg_water_l,
  sum(calories)                      as total_calories,
  count(*) filter (where calorie_status = 'on_target') as days_on_target,
  count(*)                           as days_logged
from daily_totals
group by user_id, date_trunc('week', log_date);
```

Weekly average is the number that actually drives decisions. A single 2,800 kcal day inside
a good week is noise; the app should present the weekly figure more prominently than any
single day's.

### 4.3 Monthly rollup

Identical to weekly with `date_trunc('month', log_date)`.

### 4.4 Weight progress

```sql
create view weight_progress as
select
  w.user_id,
  w.measured_on,
  w.weight_kg,
  round(w.weight_kg - (s.goal_weight_min_kg + s.goal_weight_max_kg) / 2, 1) as to_goal_kg,
  round(s.start_weight_kg - w.weight_kg, 1)                                 as lost_kg,
  round(
    (s.start_weight_kg - w.weight_kg)
    / nullif(s.start_weight_kg - (s.goal_weight_min_kg + s.goal_weight_max_kg) / 2, 0)
    * 100
  )                                                                          as progress_pct,
  round(w.weight_kg / power(s.height_cm / 100.0, 2), 1)                      as bmi,
  round(avg(w.weight_kg) over (
    partition by w.user_id order by w.measured_on
    rows between 6 preceding and current row
  ), 2)                                                                      as rolling_7d_avg
from weigh_ins w
join user_settings s on s.user_id = w.user_id;
```

**`rolling_7d_avg` is the headline number, not `weight_kg`.** Daily weight swings 1–2 kg on
water alone. Charting raw daily weight produces a sawtooth that reads as random and is
actively demoralising. Plot the rolling average as the primary line and raw readings as
faint dots behind it.

---

## 5. Row-level security

Single-user today, but build it multi-tenant from the start.

```sql
alter table user_settings enable row level security;
alter table meals         enable row level security;
alter table drinks        enable row level security;
alter table weigh_ins     enable row level security;

create policy "own rows" on meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- repeat for each table
```

Views inherit RLS from their base tables when created with `security_invoker = true`
(Postgres 15+). Set it explicitly:

```sql
alter view daily_totals set (security_invoker = true);
```

Without this the views run as the definer and leak across users.

---

## 6. Screens

### 6.1 Today (default screen)

The screen the user opens 5–8 times a day. Optimise ruthlessly for this one.

- Calories consumed vs target, as a ring or bar
- Protein consumed vs target — give this equal visual weight to calories
- Water total with quick-add buttons (+0.25, +0.5, +1.0 L)
- List of today's meals, each tappable to edit or delete
- One large primary action: **Log a meal**

No date picker. Today is implied. Provide a small "yesterday" affordance for late entries.

### 6.2 Log a meal

Fields in order: name, slot, calories, protein, carbs, fat, fiber, notes.

Only calories is required. Every other field submits empty without complaint.

The user's stated workflow: photograph the food, ask an AI for macros, enter the **highest**
estimate given for calories/carbs/fat and the **lowest** for protein. That deliberate bias
means logged calories run perhaps 10–15% above actual. Two implications:

- Real deficit is larger than the app displays — this is fine and self-correcting
- When back-calculating TDEE from weight change, the intake figure is inflated; trust the
  weight trend over the calorie number

### 6.3 Week

- Bar chart, calories per day, with a horizontal reference line at `cal_target`
- Weekly average calories, protein, water as three large numbers
- Days-on-target count (e.g. "5 / 7")

Notion could not draw a target line, so the workaround there was charting
`calories − target` with zero as the implied line. In a web app draw the real line —
it is far more readable.

### 6.4 Month

- Calories per day across the month
- Weight trend (rolling average) overlaid or adjacent
- Monthly average vs previous month

### 6.5 Progress

- Weight chart: rolling 7-day average as the line, raw readings as dots
- Current weight, kg lost, kg to goal, progress %
- Goal band (70–75 kg) drawn as a shaded region rather than a single line

### 6.6 Over-limit

Filtered list of days where `calorie_status in ('over', 'way_over')`, newest first, showing
date, total, variance, and **notes**.

The notes column is the entire point of this screen. Over months it turns into a list of
situational triggers — weekends, late nights, eating out — which is more actionable than the
numbers. Prompt for a note whenever a day crosses into `over`.

### 6.7 Settings

Edits `user_settings`. Every threshold and every derived value must recompute from here,
historically as well as going forward. No target value should be hardcoded anywhere else in
the codebase.

---

## 7. Domain notes worth encoding

These shaped the design and should survive the port.

**Weekly average beats any single day.** Do not build streak mechanics that break on one bad
day — they encourage compensatory under-eating the next day, which is the failure mode to
design against.

**Protein is the muscle-retention lever.** The user is dieting without resistance training,
which means a meaningful share of weight lost will be lean mass. Protein intake reduces but
does not eliminate that. Given this, protein deserves equal billing with calories in the UI,
not a secondary stat.

**The target is a hypothesis, not a fact.** Estimated TDEE (~2,300) comes from a formula, not
a measurement. After four weeks of data, compare week-1 and week-4 rolling weight averages
against logged intake to derive the real figure, then update `cal_target`. Consider building
this as an explicit feature: *"Recalculate my target from my actual data."* It is the single
highest-value thing the app can do that a spreadsheet cannot.

**Data entry is the failure point.** Every design decision should be weighed against whether
it adds taps to logging a meal. A tracker used imperfectly beats an accurate one abandoned
in week three.

---

## 8. Migration from Notion

Four databases in the Notion workspace:

| Notion DB | Maps to | Note |
|---|---|---|
| Nutrition Log | `meals` | `Title` → `name`, `Meal Number` → `slot`, `Day` relation → drop |
| Water Log | `drinks` | `Entry` → dropped, `Amount (L)` → `amount_l`, `Drink` → `kind` |
| Weight Log | `weigh_ins` | Formula columns → recomputed by view, do not import |
| Daily Log | *nothing* | 1,096 empty rows, replaced by `daily_totals` view |

Export each as CSV. Drop every formula and rollup column — they are all recomputed. Drop the
`Day` relation column entirely; `log_date` carries that information already.

At time of writing the Notion logs contain **no meal or drink data** and a single seeded
weigh-in (101 kg, 2026-07-23). A migration script is likely unnecessary — seeding
`user_settings` and one weigh-in row is probably the whole job.

---

## 9. Suggested build order

1. Schema + RLS + `user_settings` seeded
2. Log-a-meal form and the Today screen — usable end to end before anything else
3. `daily_totals` view and status badges
4. Water quick-add
5. Weigh-in form and the Progress chart
6. Week and Month screens
7. Over-limit screen
8. Settings screen with live recalculation
9. Foods library, if logging friction proves to be the bottleneck

Ship after step 2. Everything after it is analysis of data that does not exist yet.