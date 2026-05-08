import webpush from "web-push";

export function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL;
  if (!publicKey || !privateKey || !email) throw new Error("Missing VAPID push environment variables");
  webpush.setVapidDetails(email, publicKey, privateKey);
  return webpush;
}

export function getReminder(type: string | null) {
  switch (type) {
    case "morning":  return { title: "Good morning Suhu! 🌿", body: "Log your breakfast and start strong 💪" };
    case "water":    return { title: "Water check 💧", body: "Halfway through the day — have you hit 40oz of water?" };
    case "workout":  return { title: "Workout time 🔥", body: "Time to get your workout in! You've got this." };
    case "sleep":    return { title: "Sleep log 🌙", body: "Don't forget to log your sleep tonight." };
    case "weekly":   return { title: "Weekly check-in ready 📊", body: "Your coach has reviewed your week. Tap to see your summary." };
    case "plateau":  return { title: "Weight plateau detected 📉", body: "Your coach has some tips to break through. Check in now." };
    default:         return { title: "Suhu Fitness", body: "Tiny check-in. Keep the streak alive." };
  }
}
