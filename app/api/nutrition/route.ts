import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getLocalDate } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? getLocalDate();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("meal_entries").select("*").eq("date", date).order("logged_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ meals: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("meal_entries").insert({
    date: body.date ?? getLocalDate(),
    meal: body.meal,
    food_name: body.food_name,
    calories: Number(body.calories),
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ meal: data });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("meal_entries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
