// app/app/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from "@/components/ui/button";
import { ModeToggle } from '@/components/mode-toggle'; 
import { Profile } from '@/types';
import Authenticate from '@/components/authenticate';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "ai/react";
import PayDialog from '@/components/pay-dialog';
import Image from "next/image";

const Page = () => {
    const { user } = useUser();
    const { session } = useSessionContext();
    const supabaseClient = useSupabaseClient();
    const [currentUser, setCurrentUser] = useState<Profile>();
    const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
    const { toast } = useToast();
    const [coffeeChatsAided, setCoffeeChatsAided] = useState(0);
    const bioRef = useRef<null | HTMLDivElement>(null);
    const [vibe, setVibe] = useState("Professional");
    const [bio, setBio] = useState("");
    const [streamedResponse, setStreamedResponse] = useState('');
    const [accumulatedText, setAccumulatedText] = useState('');
    

    const scrollToBios = () => {
        if (bioRef.current !== null) {
            bioRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };
    const [questions, setQuestions] = useState<string[]>([]);

    const { input, handleInputChange, handleSubmit, isLoading, messages } = useChat({
        api: '/api/chat',
        body: {
            vibe,
            bio,
        },
        onResponse(response) {
            // Check if user has reached their limit
            if (currentUser && !currentUser.paid && currentUser.images_generated >= 2) {
                toast({
                    title: "Generation limit reached",
                    description: "You've reached your free limit. Upgrade to continue generating questions.",
                    variant: "destructive"
                });
                return;
            }

            let accumulated = '';
            const reader = response.body?.getReader();
            if (reader) {
                (async () => {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const text = new TextDecoder().decode(value);
                        accumulated += text;
                        
                        const processedQuestions = accumulated
                            .split('\n')
                            .map(q => q.trim())
                            .filter(q => q.length > 0);
                        
                        setQuestions(processedQuestions);
                        setStreamedResponse(accumulated);
                    }

                    // Increment the generation count after successful generation
                    if (currentUser) {
                        const { data, error } = await supabaseClient
                            .from('profiles')
                            .update({ images_generated: (currentUser.images_generated || 0) + 1 })
                            .eq('id', currentUser.id)
                            .select()
                            .single();
                            
                        if (data) {
                            setCurrentUser(data);
                        }
                    }
                })();
            }
            
            scrollToBios();
            fetchUpdatedCounter().then(setCoffeeChatsAided);
        },
        onFinish(message) {
            // Final processing is optional now since we're handling it in the stream
            console.log('Stream finished');
        },
    });

    useEffect(() => {
        if (messages.length > 0) {
            console.log('Latest message:', messages[messages.length - 1]);
        }
    }, [messages]);

    useEffect(() => {
        setBio(input);
    }, [input]);

    async function fetchUpdatedCounter() {
        const response = await fetch("/api/counter-coffee", {
            headers: {
                "Cache-Control": "no-cache",
            },
        });
        const data = await response.json();
        return data;
    }

    const getCurrentUser = async (userId: string) => {
        try {
            // First try to get the profile
            let { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            // If no profile exists, create one
            if (!profile) {
                const newProfile = {
                    id: userId,
                    full_name: user?.user_metadata?.full_name || '',
                    avatar_url: user?.user_metadata?.avatar_url || '',
                    email: user?.email || '',
                    images_generated: 0,
                    paid: false,
                }

                const { data: createdProfile, error: createError } = await supabaseClient
                    .from('profiles')
                    .insert([newProfile])
                    .select()
                    .single()

                if (createError) throw createError
                profile = createdProfile
            }

            if (error && error.code !== 'PGRST116') throw error // PGRST116 is the error code for no rows returned

            if (profile) {
                setCurrentUser(profile)
            }
        } catch (error) {
            console.error('Error fetching/creating user profile:', error);
        }
    };

    useEffect(() => {
        if (user?.id) {
            getCurrentUser(user.id)
        }
    }, [user])
    
    useEffect(() => {
        const getCounter = async () => {
            const count = await fetchUpdatedCounter();
            setCoffeeChatsAided(count);
        };
        getCounter();
    }, []);

    return (
        <>
            {user && session && session.user && currentUser ? (
                <div className='flex flex-col min-h-screen'>
                    <header className='flex flex-row items-center justify-between p-5 px-10'>
                        <div className="flex flex-col">
                            <h2 className="text-4xl md:text-2xl font-semibold tracking-tight">
                                Coffee Chat AI
                            </h2>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                {coffeeChatsAided.toLocaleString()} coffee chats aided
                            </p>
                        </div>
                        <div className='flex gap-4 items-center'>
                                <div className='hidden md:block font-semibold'>
                                    {currentUser.paid ? (
                                        <p className='text-sm'>
                                            Unlimited generations
                                        </p>
                                    ) : (
                                        <div className='flex items-center gap-2'>
                                            <p className='text-sm'>
                                                {2 - (currentUser.images_generated)} generations left
                                            </p>
                                            <Button 
                                                variant="link" 
                                                className="p-0 h-auto text-sm text-primary hover:underline"
                                                onClick={() => setIsPayDialogOpen(true)}
                                            >
                                                Upgrade
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            {/* <ModeToggle /> */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="cursor-pointer">
                                        <AvatarImage src={currentUser?.avatar_url} />
                                        <AvatarFallback>CC</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{currentUser?.full_name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Image
                                        src="/1-black.png"
                                        width={24}
                                        height={24}
                                        alt="1 icon"
                                        className="mb-5 sm:mb-0"
                                    />
                                    <h3 className="text-xl font-semibold">Copy a short bio about the person you are meeting</h3>
                                </div>

                                <Textarea 
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Patrick Collison (born 9 September 1988) is an Irish billionaire entrepreneur..."
                                    className="min-h-[100px] text-base"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Image src="/2-black.png" width={24} height={24} alt="2 icon" />
                                    <h3 className="text-xl font-semibold">Select your vibe</h3>
                                </div>

                                <Select value={vibe} onValueChange={setVibe}>
                                    <SelectTrigger className="text-base h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                        <SelectItem value="Casual">Casual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button 
                                onClick={(e) => handleSubmit(e as any)} 
                                disabled={!input || isLoading || (!currentUser?.paid && currentUser?.images_generated >= 2)}
                                className="w-full h-10 text-base font-medium"
                            >
                                {!currentUser?.paid && currentUser?.images_generated >= 2 ? (
                                    'Upgrade to generate more questions'
                                ) : isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="animate-spin">⏳</span> 
                                        Generating...
                                    </div>
                                ) : (
                                    'Generate your questions →'
                                )}
                            </Button>

                            {questions.length > 0 && (
                                <output className="space-y-4 mt-8 mb-6">
                                    <div className="space-y-1">
                                        <h2
                                            className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center"
                                            ref={bioRef}
                                        >
                                            Your generated questions
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-400 text-center text-sm">
                                            Click to copy all questions to your clipboard
                                        </p>
                                    </div>
                                    <div 
                                        className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg p-6 
                                        hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-copy 
                                        border border-gray-200 dark:border-gray-700"
                                        onClick={() => {
                                            const formattedQuestions = questions
                                                .map((q, i) => `• ${q}`)
                                                .join('\n\n');
                                            navigator.clipboard.writeText(formattedQuestions);
                                            toast({
                                                title: "Copied to clipboard",
                                                description: "All questions have been copied to your clipboard",
                                            });
                                        }}
                                    >
                                        <div className="space-y-4">
                                            {questions.map((question, index) => (
                                                <p key={index} className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                                                    • {question}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </output>
                            )}
                        </div>
                    </main>
                </div>
            ) : (
                <Authenticate />
            )}
            <PayDialog 
                userDetails={currentUser as any} 
                userEmail={user?.user_metadata.email} 
                isOpen={isPayDialogOpen} 
                onClose={() => setIsPayDialogOpen(false)} 
            />
        </>
    );
};

export default Page;