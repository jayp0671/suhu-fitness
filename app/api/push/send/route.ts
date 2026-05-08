export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { configureWebPush, getReminder } from "@/lib/push";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = searchParams.get("secret");
  if (cronSecret && providedSecret && providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = searchParams.get("type");
  const payload = getReminder(type);
  const supabase = getServiceSupabase();
  const push = configureWebPush();
  const { data, error } = await supabase.from("push_subscriptions").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await Promise.allSettled((data ?? []).map((sub) =>
    push.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload)
    )
  ));
  return NextResponse.json({ sent: data?.length ?? 0 });
}
