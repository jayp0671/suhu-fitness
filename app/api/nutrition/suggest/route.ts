export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { GOALS, getTodayCalorieGoal } from "@/lib/goals";
import { getLocalDate } from "@/lib/utils";

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const date = getLocalDate();
    const { data: meals } = await supabase.from("meal_entries").select("calories, protein_g, carbs_g, fat_g").eq("date", date);
    const eaten = meals ?? [];
    const totalCal = eaten.reduce((s, m) => s + (m.calories ?? 0), 0);
    const totalProtein = eaten.reduce((s, m) => s + (m.protein_g ?? 0), 0);
    const calorieGoal = getTodayCalorieGoal();
    const remainingCal = Math.max(0, calorieGoal - totalCal);
    const remainingProtein = Math.max(0, GOALS.protein - totalProtein);

    const apiUrl = process.env.NVIDIA_API_URL ?? "https://integrate.api.nvidia.com/v1";
    const apiKey = process.env.NVIDIA_API_KEY;
    const model = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-70b-instruct";

    if (!apiKey) {
      return NextResponse.json({ suggestions: [] });
    }

    const res = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a vegetarian nutritionist. Suggest 3 meals that fit the remaining daily macros. Suhu is strictly vegetarian (no eggs, no meat). Return ONLY a JSON array: [{"name":"meal name","calories":number,"protein_g":number,"carbs_g":number,"fat_g":number,"reason":"why this fits"}]. No markdown, no explanation.`,
          },
          {
            role: "user",
            content: `Remaining calories: ${remainingCal}. Remaining protein needed: ${remainingProtein}g. It is currently ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}.`,
          },
        ],
        stream: false,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) return NextResponse.json({ suggestions: [] });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const suggestions = JSON.parse(clean);
    return NextResponse.json({ suggestions: Array.isArray(suggestions) ? suggestions : [] });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
