# Coffee Chat AI

AI-powered question generator for meaningful networking conversations and coffee chats.

## Overview

Coffee Chat AI helps you prepare for networking meetings by generating intelligent, contextual questions based on someone's professional background. Simply paste a LinkedIn bio or professional description, and get tailored questions that demonstrate genuine interest and understanding.

## Features

- 🤖 AI-powered question generation
- 💬 Professional and casual conversation modes
- ✨ Context-aware questions based on background
- 📋 One-click copy to clipboard
- 🔄 Unlimited generations for pro users

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase Auth
- OpenAI API
- Stripe Integration
- Vercel KV

## Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=


## Getting Started

1. Clone the repository
2. Install dependencies: pnpm install
3. Set up environment variables in `.env`
4. Run the development server: pnpm dev

Template taken from https://github.com/rexanwong/text-behind-image