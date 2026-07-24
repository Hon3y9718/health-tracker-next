import type { Meal } from "@/lib/queries/meals";
import type { Drink } from "@/lib/queries/drinks";
import type { WeighIn } from "@/lib/queries/weighIns";
import type { Exercise } from "@/lib/queries/exercises";

// One combined, chronological CSV rather than four separate files -- avoids the multi-file
// download prompt browsers show for several simultaneous downloads from one click, and stays
// easy to filter by record_type in a spreadsheet. Each domain has its own timestamp column
// (eaten_at/drunk_at/weighed_at/logged_at) -- they're unified into recorded_at here since
// they all mean the same thing ("when this happened"), but log_date is kept as its own raw
// column alongside it (rule #7: never derive one from the other).
const COLUMNS = [
  "record_type",
  "log_date",
  "recorded_at",
  "title",
  "meal_label",
  "entry_label",
  "calories",
  "protein_g",
  "carbs_g",
  "fat_g",
  "fiber_g",
  "drink_type",
  "amount_l",
  "weight_kg",
  "exercise_type",
  "duration_minutes",
  "notes",
  "created_at",
] as const;

type Column = (typeof COLUMNS)[number];
type Row = Record<Column, string | number | null>;

function toRow(partial: Partial<Row>): Row {
  const row = {} as Row;
  for (const col of COLUMNS) row[col] = partial[col] ?? null;
  return row;
}

function escapeCsvField(value: string | number | null): string {
  if (value === null) return "";
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildExportCsv({
  meals,
  drinks,
  weighIns,
  exercises,
}: {
  meals: Meal[];
  drinks: Drink[];
  weighIns: WeighIn[];
  exercises: Exercise[];
}): string {
  const rows: Row[] = [
    ...meals.map((m) =>
      toRow({
        record_type: "meal",
        log_date: m.log_date,
        recorded_at: m.eaten_at,
        title: m.title,
        meal_label: m.meal_label,
        calories: m.calories,
        protein_g: m.protein_g,
        carbs_g: m.carbs_g,
        fat_g: m.fat_g,
        fiber_g: m.fiber_g,
        notes: m.notes,
        created_at: m.created_at,
      }),
    ),
    ...drinks.map((d) =>
      toRow({
        record_type: "drink",
        log_date: d.log_date,
        recorded_at: d.drunk_at,
        entry_label: d.entry_label,
        drink_type: d.drink_type,
        amount_l: d.amount_l,
        notes: d.notes,
        created_at: d.created_at,
      }),
    ),
    ...weighIns.map((w) =>
      toRow({
        record_type: "weigh_in",
        log_date: w.log_date,
        recorded_at: w.weighed_at,
        entry_label: w.entry_label,
        weight_kg: w.weight_kg,
        notes: w.notes,
        created_at: w.created_at,
      }),
    ),
    ...exercises.map((e) =>
      toRow({
        record_type: "exercise",
        log_date: e.log_date,
        recorded_at: e.logged_at,
        exercise_type: e.exercise_type,
        duration_minutes: e.duration_minutes,
        notes: e.notes,
        created_at: e.created_at,
      }),
    ),
  ].sort((a, b) => String(a.log_date).localeCompare(String(b.log_date)));

  const header = COLUMNS.join(",");
  const body = rows.map((r) => COLUMNS.map((c) => escapeCsvField(r[c])).join(",")).join("\n");
  return `${header}\n${body}\n`;
}
