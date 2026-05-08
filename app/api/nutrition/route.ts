export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getLocalDate } from "@/lib/utils";
import { GOALS } from "@/lib/goals";

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
    calories: Number(body.calories ?? 0),
    protein_g: Number(body.protein_g ?? 0),
    carbs_g: Number(body.carbs_g ?? 0),
    fat_g: Number(body.fat_g ?? 0),
    fiber_g: Number(body.fiber_g ?? 0),
    sodium_mg: Number(body.sodium_mg ?? 0),
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  checkCalorieWarning(body.date ?? getLocalDate()).catch(() => {});
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

async function checkCalorieWarning(date: string) {
  const supabase = getServiceSupabase();
  const { data: meals } = await supabase.from("meal_entries").select("calories").eq("date", date);
  if (!meals) return;
  const total = meals.reduce((s, m) => s + (m.calories ?? 0), 0);
  const goal = GOALS.calories;
  if (total > goal) {
    const { data: existing } = await supabase.from("coaching_tips").select("id").eq("type", "warning").gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).limit(1);
    if (!existing || existing.length === 0) {
      await supabase.from("coaching_tips").insert({ type: "warning", title: "Over calorie goal", body: `You have logged ${total} calories today, which is ${total - goal} over your ${goal} goal. Consider a lighter dinner or skip snacks for the rest of the day.` });
    }
  }
}
