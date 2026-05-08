export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceSupabase();
  const [summariesRes, weightsRes, prsRes] = await Promise.all([
    supabase.from("weekly_summaries").select("*").order("week_start", { ascending: false }).limit(12),
    supabase.from("weight_logs").select("date, weight_lbs").order("date", { ascending: true }).limit(60),
    supabase.from("personal_records").select("*").order("achieved_at", { ascending: false }).limit(20),
  ]);

  return NextResponse.json({
    summaries: summariesRes.data ?? [],
    weights: weightsRes.data ?? [],
    prs: prsRes.data ?? [],
  });
}
