export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("ai_memory").select("*").order("category").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ memory: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { key, value, category } = body;
  if (!key || !value || !category) return NextResponse.json({ error: "Missing key, value, or category" }, { status: 400 });
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("ai_memory").upsert({ key, value, category, updated_at: new Date().toISOString() }, { onConflict: "key" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ memory: data });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("ai_memory").delete().eq("key", key);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
