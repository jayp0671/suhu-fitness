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
    sets_done: body.sets_done === "" ? null : body.sets_done,
    reps_done: body.reps_done === "" ? null : body.reps_done,
    weight_lbs: body.weight_lbs === "" ? null : body.weight_lbs,
    is_custom: Boolean(body.is_custom),
  }, { onConflict: "date,exercise_id" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ exercise: data });
}
