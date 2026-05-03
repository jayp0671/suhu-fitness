import { NextResponse } from "next/server";
import { createNvidiaChatStream } from "@/lib/nvidia";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const last = messages?.[messages.length - 1];
    if (last?.role === "user") {
      getServiceSupabase().from("chat_history").insert({ role: "user", content: last.content }).then(() => undefined);
    }
    const stream = await createNvidiaChatStream(messages ?? []);
    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Chat failed" }, { status: 500 });
  }
}
