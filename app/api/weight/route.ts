import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getLocalDate } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 30);
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("weight_logs").select("*").order("date", { ascending: false }).limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ weights: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getServiceSupabase();
  const date = body.date ?? getLocalDate();
  const weight = Number(body.weight_lbs);
  const { data, error } = await supabase.from("weight_logs").insert({ date, weight_lbs: weight }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("daily_logs").upsert({ date, weight_lbs: weight }, { onConflict: "date" });
  return NextResponse.json({ weight: data });
}
