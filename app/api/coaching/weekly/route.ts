export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { GOALS, SUHU_PROFILE } from "@/lib/goals";
import { configureWebPush, getReminder } from "@/lib/push";

function toLocalDate(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-CA");
}

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const weekEnd = toLocalDate(0);
    const weekStart = toLocalDate(6);

    const [logsRes, mealsRes, exercisesRes] = await Promise.all([
      supabase.from("daily_logs").select("date, water_oz, steps, sleep_hrs, weight_lbs, cardio_done, active_calories").gte("date", weekStart).lte("date", weekEnd),
      supabase.from("meal_entries").select("date, food_name, calories, protein_g, carbs_g, fat_g").gte("date", weekStart).lte("date", weekEnd),
      supabase.from("exercise_logs").select("date, exercise_name, is_done, sets_done, reps_done, weight_lbs").gte("date", weekStart).lte("date", weekEnd).eq("is_done", true),
    ]);

    const logs = logsRes.data ?? [];
    const meals = mealsRes.data ?? [];
    const exercises = exercisesRes.data ?? [];

    const totalCalories = meals.reduce((s, m) => s + (m.calories ?? 0), 0);
    const avgCalories = Math.round(totalCalories / 7);
    const totalProtein = meals.reduce((s, m) => s + (m.protein_g ?? 0), 0);
    const avgProtein = Math.round(totalProtein / 7);
    const cardiodays = logs.filter((l) => l.cardio_done).length;
    const workoutDays = new Set(exercises.map((e) => e.date)).size;
    const avgSteps = Math.round(logs.reduce((s, l) => s + (l.steps ?? 0), 0) / Math.max(logs.length, 1));
    const avgSleep = (logs.reduce((s, l) => s + (l.sleep_hrs ?? 0), 0) / Math.max(logs.length, 1)).toFixed(1);
    const avgWater = Math.round(logs.reduce((s, l) => s + (l.water_oz ?? 0), 0) / Math.max(logs.length, 1));
    const latestWeight = [...logs].reverse().find((l) => l.weight_lbs)?.weight_lbs;
    const avgActiveCalories = Math.round(logs.reduce((s, l) => s + (l.active_calories ?? 0), 0) / Math.max(logs.length, 1));

    const stats = { avgCalories, avgProtein, cardiodays, workoutDays, avgSteps, avgSleep, avgWater, latestWeight, avgActiveCalories };
    const statsText = `Weekly stats (${weekStart} to ${weekEnd}): Avg calories: ${avgCalories}/${GOALS.calories} goal. Avg protein: ${avgProtein}g/day (goal: ${GOALS.protein}g). Cardio: ${cardiodays}/7 days. Workout days: ${workoutDays}/5 target. Avg steps: ${avgSteps}/${GOALS.steps} goal. Avg sleep: ${avgSleep} hrs. Avg water: ${avgWater} oz. Latest weight: ${latestWeight ? `${latestWeight} lbs` : "not logged"}. Avg active calories: ${avgActiveCalories}/${GOALS.activeCalories}.`;

    let summary = statsText;
    const apiKey = process.env.NVIDIA_API_KEY;
    const apiUrl = process.env.NVIDIA_API_URL ?? "https://integrate.api.nvidia.com/v1";
    const model = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-70b-instruct";

    if (apiKey) {
      const res = await fetch(`${apiUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: `You are ${SUHU_PROFILE.name}'s personal fitness coach. Write a warm, specific, actionable weekly check-in in 4-6 sentences. Reference the actual numbers. She is a strict vegetarian (no eggs). Goals: ${GOALS.calories} cal/day (training), ${GOALS.restDayCalories} cal (rest days), ${GOALS.protein}g protein/day, fat loss, build strength. Celebrate wins, identify gaps, give 2 specific action items for next week.` },
            { role: "user", content: statsText },
          ],
          stream: false, max_tokens: 400, temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        summary = data.choices?.[0]?.message?.content ?? summary;
      }
    }

    await supabase.from("weekly_summaries").upsert({ week_start: weekStart, week_end: weekEnd, summary, stats }, { onConflict: "week_start" });

    try {
      const webpush = configureWebPush();
      const { data: subs } = await supabase.from("push_subscriptions").select("*");
      const reminder = getReminder("weekly");
      if (subs && subs.length > 0) {
        await Promise.allSettled(subs.map((sub) => webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify({ title: reminder.title, body: reminder.body }))));
      }
    } catch { /* push optional */ }

    return NextResponse.json({ ok: true, week_start: weekStart, summary });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Weekly summary error" }, { status: 500 });
  }
}
