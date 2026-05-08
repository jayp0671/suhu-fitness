export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getLocalDate } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? getLocalDate();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("exercise_logs").select("*").eq("date", date).order("logged_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ exercises: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("exercise_logs").upsert({
    date: body.date ?? getLocalDate(),
    exercise_id: body.exercise_id,
    exercise_name: body.exercise_name,
    is_done: Boolean(body.is_done),
    sets_done: body.sets_done === "" ? null : Number(body.sets_done) || null,
    reps_done: body.reps_done === "" ? null : body.reps_done,
    weight_lbs: body.weight_lbs === "" ? null : Number(body.weight_lbs) || null,
    is_custom: Boolean(body.is_custom),
    notes: body.notes ?? null,
  }, { onConflict: "date,exercise_id" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Check for PR
  if (body.is_done && body.weight_lbs && body.exercise_id) {
    checkForPR(body.exercise_id, body.exercise_name, Number(body.weight_lbs), body.reps_done).catch(() => {});
    fetch(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/coaching/overload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise_id: body.exercise_id, exercise_name: body.exercise_name }),
    }).catch(() => {});
  }

  return NextResponse.json({ exercise: data });
}

async function checkForPR(exerciseId: string, exerciseName: string, weightLbs: number, repsDone: string) {
  const supabase = getServiceSupabase();
  const { data: prevLogs } = await supabase
    .from("exercise_logs")
    .select("weight_lbs, reps_done, date")
    .eq("exercise_id", exerciseId)
    .eq("is_done", true)
    .not("weight_lbs", "is", null)
    .order("weight_lbs", { ascending: false })
    .limit(10);

  if (!prevLogs || prevLogs.length === 0) return;

  const previousBest = prevLogs[0]?.weight_lbs ?? 0;
  if (weightLbs > previousBest) {
    const { data: existing } = await supabase
      .from("personal_records")
      .select("id")
      .eq("exercise_id", exerciseId)
      .eq("weight_lbs", weightLbs)
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from("personal_records").insert({
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        weight_lbs: weightLbs,
        reps_done: repsDone,
        previous_best: previousBest,
      });
      await supabase.from("coaching_tips").insert({
        type: "milestone",
        title: `New PR: ${exerciseName}! 🏆`,
        body: `You just hit a new personal record on ${exerciseName} at ${weightLbs}lbs! That's up from your previous best of ${previousBest}lbs. Keep pushing — strength gains like this are proof your training is working.`,
      });
    }
  }
}
