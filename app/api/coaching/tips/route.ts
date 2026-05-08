export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("coaching_tips").select("*").eq("dismissed", false).order("created_at", { ascending: false }).limit(5);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tips: data ?? [] });
}

export async function PATCH(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("coaching_tips").update({ dismissed: true }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
