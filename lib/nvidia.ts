import { createClient } from "@supabase/supabase-js";
import { GOALS, SUHU_PROFILE } from "@/lib/goals";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string; };
type MemoryRow = { key: string; value: string; category: string; };
type DailyLogRow = { date: string; water_oz: number | null; steps: number | null; sleep_hrs: number | null; weight_lbs: number | null; cardio_done: boolean | null; active_calories: number | null; };
type MealRow = { date: string; food_name: string; meal: string; calories: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null; };
type ExerciseRow = { date: string; exercise_name: string; is_done: boolean | null; sets_done: number | null; reps_done: string | null; weight_lbs: number | null; };
type WeeklySummaryRow = { week_start: string; summary: string; };

function getServiceSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function toLocalDate(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-CA");
}

async function buildSystemPrompt(): Promise<string> {
  const supabase = getServiceSupabase();
  const today = toLocalDate(0);
  const sevenDaysAgo = toLocalDate(7);

  const [memoryRes, logsRes, mealsRes, exercisesRes, summaryRes, tipsRes, mealFavoritesRes] = await Promise.all([
    supabase.from("ai_memory").select("key, value, category").order("category"),
    supabase.from("daily_logs").select("date, water_oz, steps, sleep_hrs, weight_lbs, cardio_done, active_calories").gte("date", sevenDaysAgo).order("date", { ascending: false }),
    supabase.from("meal_entries").select("date, food_name, meal, calories, protein_g, carbs_g, fat_g").gte("date", sevenDaysAgo).order("logged_at", { ascending: false }),
    supabase.from("exercise_logs").select("date, exercise_name, is_done, sets_done, reps_done, weight_lbs").gte("date", sevenDaysAgo).eq("is_done", true).order("date", { ascending: false }),
    supabase.from("weekly_summaries").select("week_start, summary").order("week_start", { ascending: false }).limit(1),
    supabase.from("coaching_tips").select("type, title, body").eq("dismissed", false).order("created_at", { ascending: false }).limit(5),
    supabase.from("meal_favorites").select("name, calories, protein_g, carbs_g, fat_g").order("use_count", { ascending: false }).limit(10),
  ]);

  const memory = (memoryRes.data ?? []) as MemoryRow[];
  const logs = (logsRes.data ?? []) as DailyLogRow[];
  const meals = (mealsRes.data ?? []) as MealRow[];
  const exercises = (exercisesRes.data ?? []) as ExerciseRow[];
  const lastSummary = ((summaryRes.data ?? []) as WeeklySummaryRow[])[0];
  const tips = tipsRes.data ?? [];
  const favorites = mealFavoritesRes.data ?? [];

  const memoryByCategory: Record<string, string[]> = {};
  for (const m of memory) {
    if (!memoryByCategory[m.category]) memoryByCategory[m.category] = [];
    memoryByCategory[m.category].push(m.value);
  }

  const mealsByDate: Record<string, MealRow[]> = {};
  for (const meal of meals) {
    if (!mealsByDate[meal.date]) mealsByDate[meal.date] = [];
    mealsByDate[meal.date].push(meal);
  }

  const mealSummary = Object.entries(mealsByDate).slice(0, 5).map(([date, items]) => {
    const totalCal = items.reduce((s, i) => s + (i.calories ?? 0), 0);
    const totalProtein = items.reduce((s, i) => s + (i.protein_g ?? 0), 0);
    const foods = items.map((i) => i.food_name).join(", ");
    return `  ${date}: ${totalCal}cal, ${totalProtein.toFixed(0)}g protein -- ${foods}`;
  }).join("\n");

  const workoutByDate: Record<string, ExerciseRow[]> = {};
  for (const ex of exercises) {
    if (!workoutByDate[ex.date]) workoutByDate[ex.date] = [];
    workoutByDate[ex.date].push(ex);
  }

  const workoutSummary = Object.entries(workoutByDate).slice(0, 5).map(([date, exs]) => {
    const details = exs.map((e) => `${e.exercise_name} ${e.sets_done ?? "?"}x${e.reps_done ?? "?"} @ ${e.weight_lbs ?? "?"}lbs`).join(", ");
    return `  ${date}: ${details}`;
  }).join("\n");

  const todayLog = logs.find((l) => l.date === today);
  const todayMeals = mealsByDate[today] ?? [];
  const todayCalories = todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0);
  const todayProtein = todayMeals.reduce((s, m) => s + (m.protein_g ?? 0), 0);
  const isRestDay = [0, 6].includes(new Date().getDay());
  const calorieGoal = isRestDay ? GOALS.restDayCalories : GOALS.calories;

  const tipsSummary = tips.length > 0 ? tips.map((t) => `  [${t.type.toUpperCase()}] ${t.title}: ${t.body}`).join("\n") : "  None pending.";
  const memorySection = Object.entries(memoryByCategory).map(([cat, vals]) => `[${cat.toUpperCase()}]\n${vals.map((v) => `  - ${v}`).join("\n")}`).join("\n");
  const favoritesSection = favorites.length > 0 ? favorites.map((f: any) => `  - ${f.name}: ${f.calories}cal, ${f.protein_g}g protein`).join("\n") : "  None saved yet.";

  return `You are Suhu's dedicated personal AI coach -- an elite-level vegetarian nutritionist and strength & fat loss specialist. You are warm, direct, professional, and deeply knowledgeable. You know Suhu personally and track her progress over time.

== SUHU'S PROFILE ==
Name: ${SUHU_PROFILE.name}
Age: ${SUHU_PROFILE.age}
Height: ${SUHU_PROFILE.height}
Starting weight: ${SUHU_PROFILE.weightLbs} lbs
Goal: ${SUHU_PROFILE.goal}
Today is a: ${isRestDay ? "REST DAY" : "TRAINING DAY"}
Daily calorie target (training day): ${GOALS.calories} cal
Daily calorie target (rest day): ${GOALS.restDayCalories} cal
Today's calorie goal: ${calorieGoal} cal
Protein goal: ${GOALS.protein}g/day
Water goal: ${GOALS.water} oz/day
Steps goal: ${GOALS.steps}/day
Sleep goal: ${GOALS.sleep} hrs/night
Active calories goal: ${GOALS.activeCalories} cal/day

== DIETARY RULES (NON-NEGOTIABLE) ==
- Suhu is STRICTLY VEGETARIAN. She does not eat meat, fish, or poultry.
- She does NOT eat eggs in any form.
- Never suggest any meal, food, or ingredient containing meat, fish, seafood, or eggs.
- Focus on high-protein vegetarian sources: lentils, chickpeas, tofu, tempeh, paneer, Greek yogurt, protein powder, quinoa, edamame, cottage cheese.

== LEARNED PREFERENCES & MEMORY ==
${memorySection}

== SAVED FAVORITE MEALS ==
${favoritesSection}

== TODAY (${today}) ==
Calories eaten: ${todayCalories} / ${calorieGoal} (${Math.max(0, calorieGoal - todayCalories)} remaining)
Protein today: ${todayProtein.toFixed(0)}g / ${GOALS.protein}g goal
Water: ${todayLog?.water_oz ?? 0} oz / ${GOALS.water} oz
Steps: ${todayLog?.steps ?? 0} / ${GOALS.steps}
Sleep last night: ${todayLog?.sleep_hrs ?? "not logged"} hrs
Cardio done: ${todayLog?.cardio_done ? "Yes" : "Not yet"}
Active calories: ${todayLog?.active_calories ?? 0} / ${GOALS.activeCalories}
Foods today: ${todayMeals.length > 0 ? todayMeals.map((m) => m.food_name).join(", ") : "Nothing logged yet"}

== LAST 7 DAYS -- NUTRITION ==
${mealSummary || "  No meal data found."}

== LAST 7 DAYS -- WORKOUTS ==
${workoutSummary || "  No workout data found."}

== PENDING COACHING INSIGHTS ==
${tipsSummary}

== LAST WEEKLY SUMMARY ==
${lastSummary ? `Week of ${lastSummary.week_start}:\n${lastSummary.summary}` : "No weekly summary yet."}

== YOUR RESPONSIBILITIES ==
1. NUTRITION: Estimate calories and macros for any food she describes. Always flag non-vegetarian/egg foods. Warn if under 1000cal by 8pm or over goal. Suggest meals to hit remaining protein.
2. WORKOUT: Track progressive overload. If she consistently hits top rep range, suggest increasing weight. Reference previous session weights when discussing exercises.
3. MEMORY: When you learn something new, note it clearly (e.g. "I will remember you like X").
4. COACHING: Give specific, actionable advice. Reference her actual data. Detect plateaus and suggest changes.
5. MOTIVATION: Be encouraging but real. Celebrate wins (PRs, streaks), address setbacks constructively.
6. MEAL SUGGESTIONS: When asked, suggest specific vegetarian meals that fit her remaining macros for the day.
7. GROCERY LISTS: When asked, generate a practical weekly grocery list based on her usual eating patterns.

Keep responses concise and practical. Use bullet points for meal estimates. Always end nutrition estimates with macro breakdown.`;
}

export async function createNvidiaChatStream(messages: ChatMessage[]) {
  const apiUrl = process.env.NVIDIA_API_URL ?? "https://integrate.api.nvidia.com/v1";
  const apiKey = process.env.NVIDIA_API_KEY;
  const model = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-70b-instruct";
  if (!apiKey) throw new Error("Missing NVIDIA_API_KEY");

  const systemPrompt = await buildSystemPrompt();
  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "system", content: systemPrompt }, ...messages], stream: true, max_tokens: 800, temperature: 0.7 }),
  });

  if (!response.ok || !response.body) {
    const details = await response.text().catch(() => "Unknown NVIDIA error");
    throw new Error(details);
  }
  return response.body;
}

export async function extractAndSaveMemory(assistantMessage: string) {
  const triggers = [
    /i('ll| will) remember (you |that )?(like|love|enjoy|prefer|avoid|hate)/i,
    /noted that you (like|love|enjoy|prefer|avoid|hate)/i,
    /i('ll| will) remember (you |that )?(prefer|usually|always|never)/i,
  ];
  const matches = triggers.some((t) => t.test(assistantMessage));
  if (!matches) return;

  const apiUrl = process.env.NVIDIA_API_URL ?? "https://integrate.api.nvidia.com/v1";
  const apiKey = process.env.NVIDIA_API_KEY;
  const model = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-70b-instruct";
  if (!apiKey) return;

  try {
    const res = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: 'Extract preference facts from this coach message. Return ONLY a JSON array like: [{"key":"unique_snake_case_key","value":"full sentence describing the preference","category":"diet|workout|preference|goal|note"}]. If nothing to extract, return [].' },
          { role: "user", content: assistantMessage },
        ],
        stream: false, max_tokens: 300, temperature: 0.1,
      }),
    });
    if (!res.ok) return;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const facts = JSON.parse(clean);
    if (!Array.isArray(facts) || facts.length === 0) return;
    const supabase = getServiceSupabase();
    for (const fact of facts) {
      if (!fact.key || !fact.value || !fact.category) continue;
      await supabase.from("ai_memory").upsert({ key: fact.key, value: fact.value, category: fact.category, updated_at: new Date().toISOString() }, { onConflict: "key" });
    }
  } catch { /* silent fail */ }
}
