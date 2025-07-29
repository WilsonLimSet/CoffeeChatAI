'use client';

import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Image from 'next/image';
import LinkedInProfileMockup from '@/components/linkedin-profile-mockup';

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
            
            <div className="text-lg text-center font-semibold mb-2 text-gray-600 dark:text-gray-300">
                Turn any LinkedIn profile into thoughtful conversation starters
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-8">
                <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{coffeeChatsAided.toLocaleString()}</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">coffee chats aided</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">5 free questions</span>
            </div>

            <Link href={'/app'} className='mb-16'>
                <HoverBorderGradient containerClassName="rounded-full" as="button" className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-8 py-3 text-lg font-semibold">
                    Generate Questions Now →
                </HoverBorderGradient>
            </Link>

            <div className="w-full max-w-6xl px-4 ">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Paste their profile</h3>
                        </div>
                        <LinkedInProfileMockup />
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                            <p className="mb-2">Simply copy & paste from LinkedIn</p>
                            <p className="text-xs">(or any portfolio website)</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Get smart questions</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                                        "How has your 25+ year journey at Goldman Sachs shaped your vision for the firm's future direction?"
                                    </p>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                                        "What inspired you to pursue DJing alongside leading one of the world's top investment banks?"
                                    </p>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                                        "How do you see Goldman Sachs adapting to compete with emerging fintech companies?"
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    Questions tailored to their background & expertise
                                </p>
                                <Link href={'/app'}>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                                        Try it Free
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <Footer />
        </div>
    );
}

export default Page;