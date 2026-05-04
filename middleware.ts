export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!login|api/auth|api/apple-health|api/push/send|_next|favicon.ico|manifest.json|sw.js|icons).*)",
  ],
};
