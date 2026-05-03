import { GOALS, SUHU_PROFILE } from "@/lib/goals";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function createNvidiaChatStream(messages: ChatMessage[]) {
  const apiUrl = process.env.NVIDIA_API_URL ?? "https://integrate.api.nvidia.com/v1";
  const apiKey = process.env.NVIDIA_API_KEY;
  const model = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-70b-instruct";

  if (!apiKey) {
    throw new Error("Missing NVIDIA_API_KEY");
  }

  const systemPrompt = `You are a fitness and nutrition assistant for ${SUHU_PROFILE.name}, a ${SUHU_PROFILE.age}-year-old woman (${SUHU_PROFILE.weightLbs} lbs, ${SUHU_PROFILE.height}) working on ${SUHU_PROFILE.goal}. Her daily calorie goal is ${GOALS.calories} calories, water goal is ${GOALS.water} oz, step goal is ${GOALS.steps}, and sleep goal is ${GOALS.sleep} hours. Help estimate calories, suggest healthy meals, answer workout questions, and provide motivation. Be concise, friendly, practical, and avoid medical diagnosis.`;

  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!response.ok || !response.body) {
    const details = await response.text().catch(() => "Unknown NVIDIA error");
    throw new Error(details);
  }

  return response.body;
}
