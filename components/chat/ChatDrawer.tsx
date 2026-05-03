"use client";

import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

const prompts = ["How many calories in my meal?", "What should I eat for lunch?", "Is my workout balanced?", "Motivate me!"];

export function ChatDrawer({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const { messages, sendMessage, isStreaming, clearChat } = useChat();
  async function submit(value = text) { if (!value.trim()) return; setText(""); await sendMessage(value.trim()); }
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="h-[82vh] w-full rounded-t-[2rem] border border-white/10 bg-[#101010] p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
        <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">Suhu Coach</h2><p className="text-xs text-neutral-500">Calories, workouts, and motivation.</p></div><Button variant="ghost" size="icon" onClick={clearChat}><Trash2 className="h-4 w-4" /></Button></div>
        <div className="mt-4 h-[calc(82vh-10rem)] space-y-3 overflow-y-auto pb-3">
          {!messages.length ? <div className="grid gap-2">{prompts.map((p) => <button key={p} onClick={() => submit(p)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left text-sm text-neutral-300">{p}</button>)}</div> : null}
          {messages.map((msg, i) => <div key={i} className={cn("max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-6", msg.role === "user" ? "ml-auto bg-[#c8f065] text-[#0a0a0a]" : "bg-white/[0.06] text-neutral-100")}>{msg.content}</div>)}
        </div>
        <div className="flex gap-2"><Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder={isStreaming ? "Coach is typing..." : "Ask the coach..."} /><Button size="icon" onClick={() => submit()} disabled={isStreaming}><Send className="h-4 w-4" /></Button></div>
      </div>
    </div>
  );
}
