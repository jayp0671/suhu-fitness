export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getLocalDate } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 60);
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ weights: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getServiceSupabase();
  const date = body.date ?? getLocalDate();
  const weight = Number(body.weight_lbs);
  const { data, error } = await supabase
    .from("weight_logs")
    .insert({ date, weight_lbs: weight })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("daily_logs").upsert({ date, weight_lbs: weight }, { onConflict: "date" });
  checkPlateau().catch(() => {});
  return NextResponse.json({ weight: data });
}

async function checkPlateau() {
  const supabase = getServiceSupabase();
  const { data: recent } = await supabase
    .from("weight_logs")
    .select("weight_lbs, date")
    .order("date", { ascending: false })
    .limit(14);

  if (!recent || recent.length < 10) return;
  const tenDayWeights = recent.slice(0, 10).map((w) => w.weight_lbs);
  const min = Math.min(...tenDayWeights);
  const max = Math.max(...tenDayWeights);
  const range = max - min;

  if (range < 1.5) {
    const { data: existing } = await supabase
      .from("coaching_tips")
      .select("id")
      .eq("type", "warning")
      .ilike("title", "%plateau%")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from("coaching_tips").insert({
        type: "warning",
        title: "Weight plateau detected 📉",
        body: `Your weight has stayed within ${range.toFixed(1)}lbs for 10 days (${min}–${max}lbs). Consider: increasing cardio by 10 min/day, dropping calories by 100 for 2 weeks, or adding a refeed day this weekend to reset metabolism.`,
      });
    }
  }
}
