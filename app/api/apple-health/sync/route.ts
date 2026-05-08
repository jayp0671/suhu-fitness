export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type AppleWorkoutSession = {
  apple_uuid?: string;
  date: string;
  workout_type: string;
  duration_minutes?: number | null;
  active_calories?: number | null;
  distance_miles?: number | null;
  started_at?: string | null;
  ended_at?: string | null;
};

type AppleHealthSyncBody = {
  sync_secret?: string;
  date: string;
  steps?: number | null;
  sleep_hrs?: number | null;
  active_calories?: number | null;
  resting_heart_rate?: number | null;
  average_heart_rate?: number | null;
  weight_lbs?: number | null;
  workouts?: AppleWorkoutSession[];
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Missing Supabase admin environment variables.");
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function isValidDateString(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function numberOrNull(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AppleHealthSyncBody;

    if (!process.env.APPLE_HEALTH_SYNC_SECRET) {
      return NextResponse.json({ error: "APPLE_HEALTH_SYNC_SECRET is not configured." }, { status: 500 });
    }

    if (body.sync_secret !== process.env.APPLE_HEALTH_SYNC_SECRET) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!isValidDateString(body.date)) {
      return NextResponse.json({ error: "A valid date is required in YYYY-MM-DD format." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const dailyLogPayload = {
      date: body.date,
      steps: numberOrNull(body.steps) ?? 0,
      steps_source: body.steps == null ? "manual" : "apple_health",
      sleep_hrs: numberOrNull(body.sleep_hrs) ?? 0,
      sleep_source: body.sleep_hrs == null ? "manual" : "apple_health",
      active_calories: numberOrNull(body.active_calories) ?? 0,
      active_calories_source: body.active_calories == null ? "manual" : "apple_health",
      resting_heart_rate: numberOrNull(body.resting_heart_rate),
      resting_heart_rate_source: body.resting_heart_rate == null ? "manual" : "apple_health",
      average_heart_rate: numberOrNull(body.average_heart_rate),
      average_heart_rate_source: body.average_heart_rate == null ? "manual" : "apple_health",
      weight_lbs: numberOrNull(body.weight_lbs),
      weight_source: body.weight_lbs == null ? "manual" : "apple_health",
      apple_health_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: dailyLogError } = await supabase.from("daily_logs").upsert(dailyLogPayload, { onConflict: "date" });
    if (dailyLogError) return NextResponse.json({ error: dailyLogError.message }, { status: 500 });

    const workouts = Array.isArray(body.workouts) ? body.workouts : [];
    if (workouts.length > 0) {
      const workoutPayload = workouts
        .filter((workout) => isValidDateString(workout.date))
        .map((workout) => ({
          apple_uuid: workout.apple_uuid ?? `${workout.date}-${workout.workout_type}-${workout.started_at ?? "unknown"}`,
          date: workout.date,
          workout_type: workout.workout_type,
          duration_minutes: numberOrNull(workout.duration_minutes),
          active_calories: numberOrNull(workout.active_calories),
          distance_miles: numberOrNull(workout.distance_miles),
          started_at: workout.started_at ?? null,
          ended_at: workout.ended_at ?? null,
          source: "apple_health",
          synced_at: new Date().toISOString(),
        }));

      if (workoutPayload.length > 0) {
        const { error: workoutError } = await supabase.from("apple_workout_sessions").upsert(workoutPayload, { onConflict: "apple_uuid" });
        if (workoutError) return NextResponse.json({ error: workoutError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, date: body.date, workouts_synced: workouts.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Apple Health sync error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
