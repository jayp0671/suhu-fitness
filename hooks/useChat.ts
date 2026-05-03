import { useState } from "react";
import { ChatMessage, useChatStore } from "@/store/chat";

function parseSseChunk(chunk: string) {
  return chunk
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.replace("data: ", "").trim())
    .filter((line) => line && line !== "[DONE]")
    .map((line) => {
      try {
        return JSON.parse(line).choices?.[0]?.delta?.content ?? "";
      } catch {
        return "";
      }
    })
    .join("");
}

export function useChat() {
  const { messages, setMessages, clearChat } = useChatStore();
  const [isStreaming, setIsStreaming] = useState(false);

  async function sendMessage(text: string) {
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }, { role: "assistant", content: "" }];
    setMessages(nextMessages);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(0, -1) }),
      });
      if (!res.ok || !res.body) throw new Error("Chat request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += parseSseChunk(decoder.decode(value, { stream: true }));
        setMessages([...nextMessages.slice(0, -1), { role: "assistant", content: assistantText || "Thinking..." }]);
      }
    } catch {
      setMessages([...nextMessages.slice(0, -1), { role: "assistant", content: "I ran into an issue reaching the coach. Check your NVIDIA env vars and try again." }]);
    } finally {
      setIsStreaming(false);
    }
  }

  return { messages, sendMessage, isStreaming, clearChat };
}
