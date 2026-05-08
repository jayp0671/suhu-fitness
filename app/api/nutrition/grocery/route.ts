export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toLocaleDateString("en-CA");

    const { data: meals } = await supabase
      .from("meal_entries")
      .select("food_name, calories, protein_g")
      .gte("date", dateStr)
      .order("calories", { ascending: false });

    const foodFrequency: Record<string, number> = {};
    for (const meal of meals ?? []) {
      foodFrequency[meal.food_name] = (foodFrequency[meal.food_name] ?? 0) + 1;
    }
    const topFoods = Object.entries(foodFrequency).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([name]) => name);

    const apiUrl = process.env.NVIDIA_API_URL ?? "https://integrate.api.nvidia.com/v1";
    const apiKey = process.env.NVIDIA_API_KEY;
    const model = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-70b-instruct";

    if (!apiKey) return NextResponse.json({ grocery: [] });

    const res = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a vegetarian nutritionist creating a weekly grocery list. The user eats these foods regularly. Generate a practical, organized grocery list. Return ONLY a JSON array: [{"category":"Produce/Protein/Dairy/Pantry/Frozen","item":"item name","quantity":"amount","note":"optional tip"}]. No markdown.`,
          },
          { role: "user", content: `Frequently eaten foods: ${topFoods.join(", ")}. She is strictly vegetarian (no eggs, no meat). Focus on high-protein vegetarian foods.` },
        ],
        stream: false,
        max_tokens: 600,
        temperature: 0.5,
      }),
    });

    if (!res.ok) return NextResponse.json({ grocery: [] });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const grocery = JSON.parse(clean);
    return NextResponse.json({ grocery: Array.isArray(grocery) ? grocery : [] });
  } catch {
    return NextResponse.json({ grocery: [] });
  }
}
