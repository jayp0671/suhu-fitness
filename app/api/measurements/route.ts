export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getLocalDate } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 30);
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("measurements")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ measurements: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("measurements")
    .insert({
      date: body.date ?? getLocalDate(),
      waist_in: body.waist_in ?? null,
      hips_in: body.hips_in ?? null,
      chest_in: body.chest_in ?? null,
      arms_in: body.arms_in ?? null,
      thighs_in: body.thighs_in ?? null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ measurement: data });
}
