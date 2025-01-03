# Coffee Chat AI

AI-powered question generator for meaningful networking conversations and coffee chats.

## Overview

Coffee Chat AI helps you prepare for networking meetings by generating intelligent, contextual questions based on someone's professional background. Simply paste a bio, or provide a website URL, and get tailored questions that show genuine interest and understanding.

## Features

- 🤖 AI-powered question generation
- 💬 Website scraping support for personal websites and profiles
- 💬 Professional and casual conversation modes
- ✨ Context-aware questions based on background
- 📋 One-click copy to clipboard
- 🔄 Unlimited generations for pro users

## Input Methods

1. **Direct Bio Input**
   - Paste any professional bio or description
   - Minimum 20 characters required
   - Perfect for LinkedIn bios or other professional descriptions

2. **Website Scraping**
   - Input any personal website or profile URL
   - Automatically extracts relevant biographical information
   - Works with most personal websites and professional profiles
   - Note: LinkedIn profiles cannot be directly scraped (paste the bio instead)

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase Auth
- OpenAI API
- Firecrawl API (for website scraping)
- Stripe Integration
- Vercel KV

## Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=L
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
FIRECRAWL_API_KEY=


## Getting Started
1. Clone the repository
2. Install dependencies: pnpm install
3. Set up environment variables in `.env`
4. Run the development server: pnpm dev

Template taken from https://github.com/rexanwong/text-behind-image