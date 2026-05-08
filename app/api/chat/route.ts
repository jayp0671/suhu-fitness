export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createNvidiaChatStream, extractAndSaveMemory } from "@/lib/nvidia";
import { createClient } from "@supabase/supabase-js";

function getServiceSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      await supabase.from("chat_history").insert({ role: "user", content: lastUserMessage.content });
    }

    const stream = await createNvidiaChatStream(messages);
    const [clientStream, memoryStream] = stream.tee();

    (async () => {
      try {
        const reader = memoryStream.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              fullResponse += parsed.choices?.[0]?.delta?.content ?? "";
            } catch { /* skip malformed */ }
          }
        }
        if (fullResponse) {
          await supabase.from("chat_history").insert({ role: "assistant", content: fullResponse });
          await extractAndSaveMemory(fullResponse);
        }
      } catch { /* silent fail */ }
    })();

    return new Response(clientStream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Chat error" }, { status: 500 });
  }
}
