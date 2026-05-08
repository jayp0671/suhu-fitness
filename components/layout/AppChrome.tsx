"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { ChatBubble } from "@/components/chat/ChatBubble";

export function AppChrome() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  return (
    <>
      <ChatBubble />
      <BottomNav />
    </>
  );
}
