import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceSupabase();
  const [logs, meals, exercises] = await Promise.all([
    supabase.from("daily_logs").select("*").order("date", { ascending: false }).limit(30),
    supabase.from("meal_entries").select("*").order("date", { ascending: false }).limit(500),
    supabase.from("exercise_logs").select("*").order("date", { ascending: false }).limit(500),
  ]);
  if (logs.error) return NextResponse.json({ error: logs.error.message }, { status: 500 });
  if (meals.error) return NextResponse.json({ error: meals.error.message }, { status: 500 });
  if (exercises.error) return NextResponse.json({ error: exercises.error.message }, { status: 500 });
  return NextResponse.json({ logs: logs.data ?? [], meals: meals.data ?? [], exercises: exercises.data ?? [] });
}
