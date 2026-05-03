# Suhu Fitness

Dark, minimal single-user fitness tracker built with Next.js 14, Tailwind, shadcn-style UI, Supabase, NextAuth PIN auth, NVIDIA NIM chat, Web Push, and Vercel.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase

Create a Supabase project, open SQL Editor, and run `supabase/schema.sql`.

Add these to `.env.local` and later to Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Auth

Set:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=random_long_string
APP_PIN=1234
```

For Vercel, change `NEXTAUTH_URL` to the production URL.

## NVIDIA

Create an API key in NVIDIA Build / NIM and set:

```env
NVIDIA_API_KEY=
NVIDIA_API_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
```

## Push

Generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

Set:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:you@email.com
```

## Deploy

Push to GitHub, connect the repo to Vercel, and copy every `.env.local` variable into Vercel Environment Variables.
