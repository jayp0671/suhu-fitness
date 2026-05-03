"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { usePathname } from "next/navigation";
import { ChatDrawer } from "@/components/chat/ChatDrawer";

export function ChatBubble() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname === "/login") return null;
  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-28 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#c8f065] text-[#0a0a0a] shadow-2xl"><Bot className="h-6 w-6" /></button>
      {open ? <ChatDrawer onClose={() => setOpen(false)} /> : null}
    </>
  );
}
