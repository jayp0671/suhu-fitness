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
  const { data, error } = await supabase.from("daily_logs").select("*").eq("date", date).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  return NextResponse.json(
    { log: data ?? { date, water_oz: 0, steps: 0, sleep_hrs: 0, cardio_done: false, active_calories: 0 } },
    { headers: NO_CACHE_HEADERS }
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const date = body.date ?? getLocalDate();
  const supabase = getServiceSupabase();
  const payload: Record<string, unknown> = { date };
  if (body.water_oz !== undefined) payload.water_oz = body.water_oz;
  if (body.steps !== undefined) payload.steps = body.steps;
  if (body.sleep_hrs !== undefined) payload.sleep_hrs = body.sleep_hrs;
  if (body.cardio_done !== undefined) payload.cardio_done = body.cardio_done;
  if (body.weight_lbs !== undefined) payload.weight_lbs = body.weight_lbs;
  if (body.mood !== undefined) payload.mood = body.mood;
  if (body.energy !== undefined) payload.energy = body.energy;
  if (body.notes !== undefined) payload.notes = body.notes;

  const { data, error } = await supabase
    .from("daily_logs")
    .upsert(payload, { onConflict: "date" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  return NextResponse.json({ log: data }, { headers: NO_CACHE_HEADERS });
}
