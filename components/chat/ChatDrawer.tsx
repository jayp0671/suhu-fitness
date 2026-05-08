"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "How many calories in paneer tikka?",
  "What should I eat to hit my protein goal?",
  "Should I increase my squat weight?",
  "Give me a high-protein vegetarian lunch idea",
  "How am I doing this week?",
  "Generate my weekly grocery list 🛒",
  "Motivate me 💪",
];

export function ChatDrawer({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const { messages, sendMessage, isStreaming, clearChat } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function submit(value = text) {
    if (!value.trim() || isStreaming) return;
    setText("");
    await sendMessage(value.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-[85vh] w-full flex-col rounded-t-[2rem] border border-white/10 bg-[#0d0d0d] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 flex-col items-center px-5 pb-3 pt-4">
          <div className="mb-4 h-1.5 w-12 rounded-full bg-white/20" />
          <div className="flex w-full items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Suhu Coach</h2>
              <p className="text-xs text-neutral-500">Your personal nutritionist and strength coach</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat"><Trash2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-3">
          {messages.length === 0 ? (
            <div className="pt-4">
              <p className="mb-3 text-center text-xs text-neutral-500">Ask anything about food, workouts, or your progress</p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button key={p} onClick={() => submit(p)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.06]">{p}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={cn("max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed", msg.role === "user" ? "ml-auto bg-[#c8f065] text-[#0a0a0a]" : "bg-white/[0.06] text-neutral-100")}>
                {msg.content}
                {isStreaming && i === messages.length - 1 && msg.role === "assistant" && (
                  <span className="ml-1 inline-block h-3 w-1.5 animate-pulse rounded-full bg-neutral-400" />
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
        <div className="shrink-0 border-t border-white/10 px-4 py-4">
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={isStreaming ? "Coach is typing..." : "Ask your coach..."}
              disabled={isStreaming}
              className="flex-1"
            />
            <Button size="icon" onClick={() => submit()} disabled={isStreaming || !text.trim()}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
