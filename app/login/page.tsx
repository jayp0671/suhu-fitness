"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit() {
    setError("");
    const res = await signIn("credentials", { pin, redirect: false });
    if (res?.ok) router.push("/dashboard");
    else setError("Wrong PIN. Try again.");
  }

  return (
    <main className="suhu-page flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-[2rem] suhu-card p-6">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#c8f065] text-[#0a0a0a]">
          <Dumbbell className="h-7 w-7" />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c8f065]">Suhu Fitness</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Enter your PIN</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">Private tracker for meals, training, water, steps, sleep, weight, and coaching.</p>
        <div className="mt-8 space-y-3">
          <Input value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} type="password" inputMode="numeric" maxLength={8} placeholder="PIN" className="text-center text-2xl tracking-[0.6em]" />
          <Button className="w-full" size="lg" onClick={submit}>Unlock</Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </section>
    </main>
  );
}
