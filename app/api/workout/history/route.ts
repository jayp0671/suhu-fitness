export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const exerciseId = searchParams.get("exercise_id");
  if (!exerciseId) return NextResponse.json({ error: "Missing exercise_id" }, { status: 400 });

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("exercise_logs")
    .select("date, sets_done, reps_done, weight_lbs")
    .eq("exercise_id", exerciseId)
    .eq("is_done", true)
    .not("weight_lbs", "is", null)
    .order("date", { ascending: false })
    .limit(5);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ history: data ?? [] });
}
