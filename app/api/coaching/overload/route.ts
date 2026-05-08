export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { exercise_id, exercise_name } = await req.json();
    if (!exercise_id) return NextResponse.json({ ok: true });

    const supabase = getServiceSupabase();
    const { data: logs } = await supabase.from("exercise_logs").select("date, sets_done, reps_done, weight_lbs").eq("exercise_id", exercise_id).eq("is_done", true).not("weight_lbs", "is", null).order("date", { ascending: false }).limit(4);

    if (!logs || logs.length < 3) return NextResponse.json({ ok: true, reason: "Not enough data" });

    const last3 = logs.slice(0, 3);
    const weights = last3.map((l) => l.weight_lbs);
    const sameWeight = weights.every((w) => w === weights[0]);
    if (!sameWeight) return NextResponse.json({ ok: true, reason: "Weight varied" });

    const repValues = last3.map((l) => {
      const r = l.reps_done ?? "";
      const match = r.match(/(\d+)/g);
      if (!match) return 0;
      return Math.max(...match.map(Number));
    });
    const avgReps = repValues.reduce((s, r) => s + r, 0) / repValues.length;
    if (avgReps < 10) return NextResponse.json({ ok: true, reason: "Reps too low" });

    const currentWeight = weights[0];
    const suggestedWeight = Math.ceil((currentWeight * 1.05) / 2.5) * 2.5;

    const { data: existing } = await supabase.from("coaching_tips").select("id").eq("exercise_id", exercise_id).eq("dismissed", false).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).limit(1);
    if (existing && existing.length > 0) return NextResponse.json({ ok: true, reason: "Recent tip exists" });

    let tipBody = `You have been completing ${exercise_name} at ${currentWeight}lbs for 3 sessions in a row and consistently hitting your rep targets. Time to increase to ${suggestedWeight}lbs — your muscles have adapted and need a new challenge.`;

    const apiUrl = process.env.NVIDIA_API_URL ?? "https://integrate.api.nvidia.com/v1";
    const apiKey = process.env.NVIDIA_API_KEY;
    const model = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-70b-instruct";

    if (apiKey) {
      const res = await fetch(`${apiUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are a strength coach. Write a 2-sentence progressive overload suggestion. Be specific, motivating, and explain WHY. No fluff." },
            { role: "user", content: `Exercise: ${exercise_name}. Current weight: ${currentWeight}lbs. Suggested: ${suggestedWeight}lbs. She hit rep targets 3 sessions in a row. Avg reps: ${avgReps.toFixed(0)}.` },
          ],
          stream: false, max_tokens: 120, temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const aiText = data.choices?.[0]?.message?.content;
        if (aiText) tipBody = aiText;
      }
    }

    await supabase.from("coaching_tips").insert({ type: "overload", title: `Time to increase ${exercise_name}`, body: tipBody, exercise_id });
    return NextResponse.json({ ok: true, tip_created: true, suggested_weight: suggestedWeight });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Overload check error" }, { status: 500 });
  }
}
