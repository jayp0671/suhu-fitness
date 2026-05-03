"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Dumbbell, History, Home, Utensils, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/nutrition", label: "Food", icon: Utensils },
  { href: "/tracking", label: "Track", icon: Waves },
  { href: "/history", label: "History", icon: History },
];

export function BottomNav() {
  const pathname = usePathname();
  const hidden = pathname === "/login";

  if (hidden) return null;

  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-[1.5rem] border border-white/10 bg-[#121212]/95 p-2 shadow-2xl backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-neutral-500 transition", active && "bg-[#c8f065] text-[#0a0a0a]") }>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
