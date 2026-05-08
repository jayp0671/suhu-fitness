export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const subscription = await req.json();
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("push_subscriptions").upsert({
    endpoint: subscription.endpoint,
    p256dh: subscription.keys?.p256dh,
    auth: subscription.keys?.auth,
  }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
