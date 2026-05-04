"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { ChatBubble } from "@/components/chat/ChatBubble";

export function AppChrome() {
  const pathname = usePathname();
  const hideChrome = pathname === "/login";

  if (hideChrome) {
    return null;
  }

  return (
    <>
      <ChatBubble />
      <BottomNav />
    </>
  );
}
