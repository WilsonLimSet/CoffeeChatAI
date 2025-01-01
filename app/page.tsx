'use client';

import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Image from 'next/image';

const Page = () => {
    const [coffeeChatsAided, setCoffeeChatsAided] = useState(0);

    useEffect(() => {
        const fetchCounter = async () => {
            const response = await fetch('/api/counter-coffee', {
                cache: 'no-store'
            });
            const data = await response.json();
            setCoffeeChatsAided(data);
        };
        fetchCounter();
    }, []);

    return ( 
        <div className='flex flex-col min-h-screen items-center w-full'>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1609710199882100" crossOrigin="anonymous"></script>
            <HeroHighlight>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: [20, -5, 0] }} 
                    transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
                    className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-bold text-black dark:text-white"
                >
                    Generate {" "}
                    <Highlight className='text-white'>
                        Smart Questions
                    </Highlight>
                    {" "} for Coffee Chats
                </motion.h1>
            </HeroHighlight>
            
            <div className="text-lg text-center font-semibold mb-4">
                AI-powered question generator for meaningful networking conversations
            </div>
            
            <p className="text-m font-semibold text-slate-600 dark:text-slate-400 mb-6">
                {coffeeChatsAided.toLocaleString()} coffee chats aided so far
            </p>

            <Link href={'/app'} className='mb-10'>
                <HoverBorderGradient containerClassName="rounded-full" as="button" className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2">
                    Generate Questions
                </HoverBorderGradient>
            </Link>

            <div className="w-full max-w-6xl px-4 mt-12 mb-16">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <h3 className="text-xl font-bold mb-4">Sample LinkedIn Bio</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            "Vice President at Goldman Sachs | Previously Investment Banking at Morgan Stanley | 
                            Wharton MBA  | 
                            Passionate about fintech innovation and sustainable finance"
                        </p>
                    </div>

                    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <h3 className="text-xl font-bold mb-4">AI Generated Questions</h3>
                        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                            <li>• How has the M&A landscape evolved since your transition from Morgan Stanley to Goldman Sachs?</li>
                            <li>• What emerging trends in fintech are you most excited about implementing in traditional banking?</li>
                            <li>• Could you share your perspective on the intersection of private equity and sustainable finance?</li>
                        </ul>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Page;