import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google'
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import SupabaseProvider from "@/providers/SupabaseProvider";
import UserProvider from "@/providers/UserProvider";
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Coffee Chat AI - Generate Smart Questions for Coffee Chats",
  description: "Turn any LinkedIn profile into thoughtful conversation starters. AI-powered question generator for meaningful networking conversations. 5 free questions, no credit card required.",
  keywords: "coffee chat, networking questions, LinkedIn conversations, interview questions, networking tips, conversation starters, professional networking, career conversations, informational interviews, AI question generator",
  openGraph: {
    title: "Coffee Chat AI - Generate Smart Questions for Coffee Chats",
    description: "Turn any LinkedIn profile into thoughtful conversation starters. AI-powered question generator for meaningful networking conversations.",
    url: "https://www.coffeechatai.com",
    siteName: "Coffee Chat AI",
    images: [
      {
        url: "https://www.coffeechatai.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Coffee Chat AI - Turn LinkedIn profiles into conversation starters",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coffee Chat AI - Generate Smart Questions for Coffee Chats",
    description: "Turn any LinkedIn profile into thoughtful conversation starters. AI-powered question generator for meaningful networking.",
    images: ["https://www.coffeechatai.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <SupabaseProvider>
            <UserProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                <div>
                  {children}
                  <Analytics />
                  <SpeedInsights />
                  <Toaster />
                </div>
              </ThemeProvider>
            </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
