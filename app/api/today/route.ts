export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getLocalDate } from "@/lib/utils";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? getLocalDate();
  const supabase = getServiceSupabase();
  const [logRes, mealRes, exerciseRes] = await Promise.all([
    supabase.from("daily_logs").select("*").eq("date", date).maybeSingle(),
    supabase.from("meal_entries").select("*").eq("date", date).order("logged_at", { ascending: true }),
    supabase.from("exercise_logs").select("*").eq("date", date).order("logged_at", { ascending: true }),
  ]);

  if (logRes.error) return NextResponse.json({ error: logRes.error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  if (mealRes.error) return NextResponse.json({ error: mealRes.error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  if (exerciseRes.error) return NextResponse.json({ error: exerciseRes.error.message }, { status: 500, headers: NO_CACHE_HEADERS });

  return NextResponse.json(
    {
      log: logRes.data ?? { date, water_oz: 0, steps: 0, sleep_hrs: 0, cardio_done: false, active_calories: 0 },
      meals: mealRes.data ?? [],
      exercises: exerciseRes.data ?? [],
    },
    { headers: NO_CACHE_HEADERS }
  );
}
