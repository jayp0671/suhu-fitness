export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("meal_favorites")
    .select("*")
    .order("use_count", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ favorites: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg } = body;
  if (!name || calories === undefined) return NextResponse.json({ error: "Missing name or calories" }, { status: 400 });
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("meal_favorites")
    .upsert({ name, calories, protein_g: protein_g ?? 0, carbs_g: carbs_g ?? 0, fat_g: fat_g ?? 0, fiber_g: fiber_g ?? 0, sodium_mg: sodium_mg ?? 0, use_count: 1 }, { onConflict: "name" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ favorite: data });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("meal_favorites").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = getServiceSupabase();
  await supabase.rpc("increment_favorite_use", { fav_id: id });
  return NextResponse.json({ ok: true });
}
