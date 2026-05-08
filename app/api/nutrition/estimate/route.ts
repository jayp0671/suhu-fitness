export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    if (!description?.trim()) return NextResponse.json({ error: "No food description provided" }, { status: 400 });

    const apiUrl = process.env.NVIDIA_API_URL ?? "https://integrate.api.nvidia.com/v1";
    const apiKey = process.env.NVIDIA_API_KEY;
    const model = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-70b-instruct";
    if (!apiKey) return NextResponse.json({ error: "Missing NVIDIA_API_KEY" }, { status: 500 });

    const res = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a precise nutritionist. The user describes a food or meal. Return ONLY a JSON object with these exact fields: {"food_name":"clean display name","calories":number,"protein_g":number,"carbs_g":number,"fat_g":number,"fiber_g":number,"sodium_mg":number,"notes":"brief note about portion assumptions"}. Use realistic average portions if not specified. Round all numbers to 1 decimal. Return ONLY the JSON, no markdown, no explanation.`,
          },
          { role: "user", content: description },
        ],
        stream: false,
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const details = await res.text().catch(() => "NVIDIA error");
      return NextResponse.json({ error: details }, { status: 500 });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const clean = text.replace(/```json|```/g, "").trim().replace(/\.$/, "");
    let macros;
    try { macros = JSON.parse(clean); } catch {
      return NextResponse.json({ error: "Failed to parse nutrition data" }, { status: 500 });
    }

    const required = ["food_name", "calories", "protein_g", "carbs_g", "fat_g"];
    for (const field of required) {
      if (macros[field] === undefined) return NextResponse.json({ error: `Missing field: ${field}` }, { status: 500 });
    }

    return NextResponse.json({ macros });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Estimation error" }, { status: 500 });
  }
}
