import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getLocalDate } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? getLocalDate();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("daily_logs").select("*").eq("date", date).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ log: data ?? { date, water_oz: 0, steps: 0, sleep_hrs: 0, cardio_done: false } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const date = body.date ?? getLocalDate();
  const supabase = getServiceSupabase();
  const payload = {
    date,
    water_oz: body.water_oz,
    steps: body.steps,
    sleep_hrs: body.sleep_hrs,
    cardio_done: body.cardio_done,
    weight_lbs: body.weight_lbs,
  };
  const { data, error } = await supabase.from("daily_logs").upsert(payload, { onConflict: "date" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ log: data });
}
