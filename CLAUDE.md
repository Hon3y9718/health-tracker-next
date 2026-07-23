# CLAUDE.md

Project instructions for Claude Code. Read this before making changes.

---

## Project

A personal nutrition, hydration and weight tracker. Single user today, built multi-tenant
from the start. Ported from a Notion workspace.

The user logs meals, drinks and weigh-ins. Everything else — daily totals, adherence status,
weekly averages, progress toward goal weight — is **derived**, never stored.

Full domain spec: `docs/nutrition-tracker-spec.md`. Read it before touching the schema or
any calculation. This file covers how to work in the repo; that file covers what the system
is supposed to do.

## Stack

- Next.js (App Router) + TypeScript
- Supabase (Postgres, Auth, RLS)
- Tailwind
- `@supabase/ssr` for auth

## Commands

```bash
npm run dev              # local dev server
npm run build            # production build — must pass before any commit
npm run lint
npm run typecheck

supabase start           # local Postgres + Studio
supabase db reset        # rebuild local DB from migrations + seed
supabase migration new <name>
supabase gen types typescript --local > src/types/database.ts
```

Regenerate types after every migration. Do not hand-edit `database.ts`.

## Layout

```
src/
  app/                  routes
  components/           shared UI
  lib/supabase/         client / server / middleware
  lib/queries/          data access — all DB reads and writes live here
  types/database.ts     generated, do not edit
supabase/
  migrations/           versioned SQL
  seed.sql
docs/
  nutrition-tracker-spec.md
```

Components never call Supabase directly. Everything goes through `lib/queries/`.

---

## Rules that must not be broken

These encode domain decisions, not style preferences. Breaking them produces a working app
that is wrong.

### 1. No hardcoded targets

Calorie, protein and water targets live in `user_settings`. Read them from there — in SQL,
in components, in tests, everywhere.

If you find yourself typing `2000`, `150`, `3.0`, `101` or `72.5` outside a migration
default or a seed file, stop. This was the central flaw of the Notion version: thresholds
were baked into four separate formulas and changing a goal meant editing all of them.

Changing a target must recompute history too, not just future days.

### 2. Only `calories` is required on a meal

Every other macro is nullable and every form must submit without them.

The user estimates macros from photos and often won't know fibre or fat. A form that blocks
submission means the meal goes unlogged, which corrupts the whole day's total. A partially
logged meal is strictly better than a missing one.

Never add a NOT NULL constraint or a required-field validation to `protein_g`, `carbs_g`,
`fat_g` or `fiber_g`.

### 3. Meals, drinks and weigh-ins are independent

Logging water must work on a day with no meals. Logging a meal must work with no water.
Never introduce a foreign key, required join or UI flow that makes one depend on another.

There is no `days` table. A day exists if something was logged on it. Aggregation happens
in views via `group by log_date`.

### 4. Derived values live in SQL views, not application code

`daily_totals`, `weekly_totals`, `monthly_totals`, `weight_progress`. One definition, one
place. Do not recompute a status badge or a variance in TypeScript.

If a calculation is needed client-side for interactivity, extract it to a shared module and
keep the view as the source of truth for anything persisted or charted.

### 5. RLS on every table, `security_invoker` on every view

```sql
alter view daily_totals set (security_invoker = true);
```

Without it views run as definer and leak across users. Add this to the same migration that
creates the view — not later.

### 6. Weight charts plot the rolling 7-day average

Raw daily weight swings 1–2 kg on water alone. Charting it produces noise that reads as
failure. Plot `rolling_7d_avg` as the primary line; raw readings as faint dots behind it.

Same principle in copy: the weekly average is the headline, not any single day.

### 7. `log_date` is not derived from a timestamp

A meal eaten at 01:00 belongs to the previous day in the user's head. `log_date` is stored
independently of `eaten_at`. Do not "simplify" by computing one from the other — that
reintroduces timezone off-by-one bugs.

---

## Product principles

Apply these when a decision isn't specified.

**Logging friction is the thing that kills the product.** Weigh every design choice against
whether it adds taps to logging a meal. A tracker used imperfectly beats an accurate one
abandoned in week three. When in doubt, cut a field.

**Protein gets equal visual weight to calories.** The user is dieting without resistance
training, so protein intake is the main lever on how much lean mass is retained. It is not
a secondary stat.

**Do not build streak mechanics.** Streaks break on one bad day and push people toward
compensatory under-eating the next day. That is the failure mode this app exists to avoid.

**The "under" status is not a win.** Render it neutral — blue or grey, never green.
Overshooting the deficit is a flag, not an achievement.

**Never editorialise about the user's body or food choices.** The app reports numbers. No
congratulatory or disapproving copy attached to weight or intake.

---

## Working style

- Small commits, one concern each
- `npm run build` and `npm run typecheck` must pass before you consider a task done
- Schema changes go in a migration, never applied ad hoc against the DB
- New derived logic goes in a view with a comment explaining the rule
- Prefer server components; use client components only for genuine interactivity
- If a requirement here conflicts with the spec, flag it rather than picking one silently

## Not yet built

Deliberately out of scope until asked:

- Foods library / saved meals — the highest-value addition if logging proves too slow
- "Recalculate my target from actual data" — compares rolling weight change against logged
  intake after 4 weeks to derive real TDEE and replace the estimate
- Photo upload and AI macro estimation
- Export
