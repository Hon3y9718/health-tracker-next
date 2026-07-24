import { generateOneLiner } from "@/lib/gemini";
import { getUserSettings, updateUserSettings } from "@/lib/queries/settings";
import { getWeeklyTotals, getWeightProgress } from "@/lib/queries/totals";
import { getExerciseDays } from "@/lib/queries/exercises";
import { computeCurrentStreak } from "@/lib/streak";
import { todayInTimezone } from "@/lib/date-grouping";

// Guardrail, not a guarantee: the prompt already instructs against praise/emotional
// language, but generated text can still slip past instructions. If it reads as
// congratulatory, fall back to a plain fact instead of showing it -- per CLAUDE.md, this
// app never editorialises about intake or the body, generated text included.
const PRAISE_PATTERN =
  /(great|amazing|awesome|fantastic|well done|good job|keep it up|proud|crush|smash|killing it|way to go|excellent|nice work|impressive|!|🎉|💪|🔥|👏)/i;

// One generated line per user per day, cached on user_settings -- this is the only thing
// on the dashboard that calls an external API, and it shouldn't do it on every page load.
export async function getDailyInsight(): Promise<string> {
  const settings = await getUserSettings();
  const todayStr = todayInTimezone(settings.timezone);

  if (settings.daily_insight_date === todayStr && settings.daily_insight_text) {
    return settings.daily_insight_text;
  }

  const [weekly, weightProgress, exerciseDays] = await Promise.all([
    getWeeklyTotals(1),
    getWeightProgress(30),
    getExerciseDays(30),
  ]);

  const thisWeek = weekly[0];
  const latestWeight = weightProgress[0];
  const streak = computeCurrentStreak(exerciseDays, todayStr);
  const activeDaysLast30 = exerciseDays.filter((d) => (d.session_count ?? 0) > 0).length;

  const facts: string[] = [];
  if (thisWeek) {
    facts.push(
      `This week's average: ${Math.round(thisWeek.avg_calories ?? 0)} kcal and ${thisWeek.avg_protein_g ?? 0}g protein, across ${thisWeek.days_logged} day(s) logged.`,
    );
  }
  if (latestWeight?.lost_kg !== null && latestWeight?.lost_kg !== undefined) {
    facts.push(`Weight change since the starting point: ${latestWeight.lost_kg.toFixed(1)}kg.`);
  }
  if (latestWeight?.progress_pct !== null && latestWeight?.progress_pct !== undefined) {
    facts.push(`${latestWeight.progress_pct}% of the way to the goal band.`);
  }
  facts.push(
    `Exercise: ${streak} consecutive day(s) logged, ${activeDaysLast30} active day(s) in the last 30 days.`,
  );

  const dataSummary = facts.join(" ");
  const fallback = facts[0] ?? dataSummary;

  let text = fallback;
  try {
    const generated = await generateOneLiner(
      "You are generating a single status line for a personal health-tracking dashboard. " +
        "Using ONLY the data below, write exactly one sentence (under 20 words) stating one " +
        "specific, genuine fact from it -- ideally the most concrete number available. " +
        "Rules: no praise, no encouragement, no congratulations, no emotional or motivational " +
        'language, no exclamation marks, no emoji. Do not say things like "great job" or ' +
        '"keep it up". State the fact the way a plain status readout would.\n\n' +
        `Data: ${dataSummary}`,
    );
    if (generated && !PRAISE_PATTERN.test(generated)) {
      text = generated;
    }
  } catch {
    // Network/API failure -- fall back to the plain fact rather than show nothing.
  }

  await updateUserSettings({ daily_insight_text: text, daily_insight_date: todayStr }).catch(
    () => {},
  );

  return text;
}
