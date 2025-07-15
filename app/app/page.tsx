'use client'

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useUser } from '@/hooks/useUser';
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { ModeToggle } from '@/components/mode-toggle';
import { Profile } from '@/types';
import Authenticate from '@/components/authenticate';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "ai/react";
import PayDialog from '@/components/pay-dialog';

interface ScrapingResponse {
    success: boolean;
    content?: string;
    error?: string;
}

type InputType = 'url' | 'linkedin';
type VibeType = 'Professional' | 'Casual';

const Page: React.FC = () => {
    const { user } = useUser();
    const { session } = useSessionContext();
    const supabaseClient = useSupabaseClient();
    const [currentUser, setCurrentUser] = useState<Profile | undefined>();
    const [isPayDialogOpen, setIsPayDialogOpen] = useState<boolean>(false);
    const { toast } = useToast();
    const [coffeeChatsAided, setCoffeeChatsAided] = useState<number>(0);
    const bioRef = useRef<HTMLDivElement | null>(null);
    const [vibe, setVibe] = useState<VibeType>("Professional");
    const [bioInput, setBioInput] = useState<string>('');
    const [urlInput, setUrlInput] = useState<string>('');
    const [inputType, setInputType] = useState<InputType>('linkedin');
    const [streamedResponse, setStreamedResponse] = useState<string>('');
    const [accumulatedText, setAccumulatedText] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [isScrapingLoading, setIsScrapingLoading] = useState<boolean>(false);
    const [questions, setQuestions] = useState<string[]>([]);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    
    // Track if component is mounted
    const isMounted = useRef<boolean>(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const scrollToBios = () => {
        if (bioRef.current !== null) {
            bioRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setBioInput(e.target.value);
        handleInputChange(e);
    };

    const isFormValid = (): boolean => {
        if (inputType === 'linkedin') {
            return input.length >= 20;
        } else {
            return isValidUrl(url);
        }
    };

    const { input, handleInputChange, handleSubmit, messages } = useChat({
        api: '/api/chat',
        body: {
            vibe,
            bio: bioInput,
        },
        onResponse(response) {
            // Check if user has reached their limit
            if (currentUser && !currentUser.paid && (currentUser.images_generated ?? 0) >= 5) {
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
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            const text = new TextDecoder().decode(value);
                            accumulated += text;
                            
                            if (!isMounted.current) return;
                            
                            const processedQuestions = accumulated
                                .split('\n')
                                .map(q => q.trim())
                                .filter(q => q.length > 0);
                            
                            setQuestions(processedQuestions);
                            setStreamedResponse(accumulated);
                        }

                        // Increment the generation count after successful generation
                        if (currentUser && isMounted.current) {
                            const { data, error } = await supabaseClient
                                .from('profiles')
                                .update({ 
                                    images_generated: (currentUser.images_generated ?? 0) + 1 
                                })
                                .eq('id', currentUser.id)
                                .select()
                                .single();
                                
                            if (data) {
                                setCurrentUser(data);
                            }
                        }
                    } catch (error) {
                        if (error instanceof Error && error.name !== 'AbortError') {
                            toast({
                                title: "Error generating questions",
                                description: error.message,
                                variant: "destructive"
                            });
                        }
                    }
                })();
            }
            
            scrollToBios();
            fetchUpdatedCounter().then(setCoffeeChatsAided);
        },
        onFinish() {
            if (!isMounted.current) return;
            setIsChatLoading(false);
        },
        onError(error: Error) {
            if (!isMounted.current) return;
            setIsChatLoading(false);
            // toast({
            //     title: "Error generating questions",
            //     description: error.message,
            //     variant: "destructive"
            // });
        }
    });

    useEffect(() => {
        if (messages.length > 0) {
            console.log('Latest message:', messages[messages.length - 1]);
        }
    }, [messages]);

    const fetchUpdatedCounter = async (): Promise<number> => {
        const response = await fetch("/api/counter-coffee", {
            headers: {
                "Cache-Control": "no-cache",
            },
        });
        const data = await response.json();
        return data;
    };

    const getCurrentUser = async (userId: string): Promise<void> => {
        try {
            let { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, create it via API route
                
                const response = await fetch('/api/create-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        email: user?.email || '',
                        fullName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
                        avatarUrl: user?.user_metadata?.picture || user?.user_metadata?.avatar_url || ''
                    })
                });

                const result = await response.json();
                
                if (result.error) {
                    throw new Error(result.error);
                }
                
                profile = result.profile;
            } else if (error) {
                throw error;
            }

            if (profile && isMounted.current) {
                setCurrentUser(profile);
            }
        } catch (error) {
            console.error('Error fetching/creating user profile:', error);
        }
    };

    useEffect(() => {
        if (user?.id) {
            getCurrentUser(user.id);
        }
    }, [user]);

    useEffect(() => {
        const getCounter = async () => {
            const count = await fetchUpdatedCounter();
            if (isMounted.current) {
                setCoffeeChatsAided(count);
            }
        };
        getCounter();
    }, []);

    const isValidUrl = (urlString: string): boolean => {
        try {
            const urlObj = new URL(urlString);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const handleUrlScrape = async (url: string): Promise<string | null> => {
        if (!isMounted.current) return null;
        
        try {
            // Check for LinkedIn URLs
            if (url.includes('linkedin.com')) {
                toast({
                    title: "LinkedIn profiles cannot be scraped",
                    description: "Please copy and paste the bio text directly instead",
                    variant: "destructive"
                });
                return null;
            }

            const response = await fetch('/api/firecrawl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
                signal: abortControllerRef.current?.signal
            });

            if (!isMounted.current) return null;

            if (!response.ok) {
                throw new Error('Failed to scrape URL');
            }

            const data: ScrapingResponse = await response.json();
            
            if (!isMounted.current) return null;

            if (data.success && data.content) {
                toast({
                    title: "Profile extracted successfully",
                    description: "Generating questions...",
                });
                return data.content;
            } else {
                throw new Error(data.error || 'No content found');
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    return null;
                }
                throw error;
            }
            throw new Error('An unknown error occurred');
        }
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Clear existing questions when starting a new generation
        setQuestions([]);
        setStreamedResponse('');
        setIsChatLoading(true);
        
        try {
            if (inputType === 'url') {
                setIsScrapingLoading(true);
                const content = await handleUrlScrape(url);
                if (!content || !isMounted.current) {
                    setIsChatLoading(false);
                    setIsScrapingLoading(false);
                    return;
                }
                
                // Make a direct API call instead of using handleSubmit
                console.log('Sending to chat API:', { vibe, bioLength: content.length, bioPreview: content.substring(0, 100) + '...' });
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        vibe,
                        bio: content,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    throw new Error(errorData.details || 'Failed to generate questions');
                }

                // Process the streaming response
                console.log('Response received, starting to process...');
                const reader = response.body?.getReader();
                if (reader) {
                    let accumulated = '';
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) {
                                console.log('Stream complete. Total response:', accumulated);
                                break;
                            }
                            const text = new TextDecoder().decode(value);
                            accumulated += text;
                            
                            if (!isMounted.current) return;
                            
                            const processedQuestions = accumulated
                                .split('\n')
                                .map(q => q.trim())
                                .filter(q => q.length > 0);
                            
                            setQuestions(processedQuestions);
                            setStreamedResponse(accumulated);
                        }

                        // Increment the generation count after successful generation
                        if (currentUser && isMounted.current) {
                            const { data } = await supabaseClient
                                .from('profiles')
                                .update({ 
                                    images_generated: (currentUser.images_generated ?? 0) + 1 
                                })
                                .eq('id', currentUser.id)
                                .select()
                                .single();
                                
                            if (data) {
                                setCurrentUser(data);
                            }
                        }
                    } catch (error) {
                        if (error instanceof Error && error.name !== 'AbortError') {
                            throw error;
                        }
                    }
                }
                
                setIsScrapingLoading(false);
                scrollToBios();
                fetchUpdatedCounter().then(setCoffeeChatsAided);
            } else {
                // For 'linkedin' input type
                if (input.length < 20) {
                    toast({
                        title: "Profile too short",
                        description: "Please enter at least 20 characters",
                        variant: "destructive"
                    });
                    setIsChatLoading(false);
                    return;
                }
                
                // Add a prefix to help the AI understand it's LinkedIn data
                const linkedinBio = `LinkedIn Profile:\n${input}`;
                
                // Make a direct API call with the LinkedIn content
                console.log('Sending LinkedIn profile to chat API:', { vibe, bioLength: linkedinBio.length });
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        vibe,
                        bio: linkedinBio,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    throw new Error(errorData.details || 'Failed to generate questions');
                }

                // Process the streaming response
                console.log('Response received, starting to process...');
                const reader = response.body?.getReader();
                if (reader) {
                    let accumulated = '';
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) {
                                console.log('Stream complete. Total response:', accumulated);
                                break;
                            }
                            const text = new TextDecoder().decode(value);
                            accumulated += text;
                            
                            if (!isMounted.current) return;
                            
                            const processedQuestions = accumulated
                                .split('\n')
                                .map(q => q.trim())
                                .filter(q => q.length > 0);
                            
                            setQuestions(processedQuestions);
                            setStreamedResponse(accumulated);
                        }

                        // Increment the generation count after successful generation
                        if (currentUser && isMounted.current) {
                            const { data } = await supabaseClient
                                .from('profiles')
                                .update({ 
                                    images_generated: (currentUser.images_generated ?? 0) + 1 
                                })
                                .eq('id', currentUser.id)
                                .select()
                                .single();
                                
                            if (data) {
                                setCurrentUser(data);
                            }
                        }
                    } catch (error) {
                        if (error instanceof Error && error.name !== 'AbortError') {
                            throw error;
                        }
                    }
                }
                
                setIsScrapingLoading(false);
                scrollToBios();
                fetchUpdatedCounter().then(setCoffeeChatsAided);
            }
        } catch (error) {
            setIsChatLoading(false);
            setIsScrapingLoading(false);
            toast({
                title: "Error processing request",
                description: error instanceof Error ? error.message : "Please try again",
                variant: "destructive"
            });
        } finally {
            setIsChatLoading(false);
        }
    };

    const isLoading = isScrapingLoading || isChatLoading;

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
                                            {5 - (currentUser.images_generated ?? 0)} generations left
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="cursor-pointer h-10 w-10">
                                        {currentUser?.avatar_url && (
                                            <AvatarImage 
                                                src={currentUser.avatar_url}
                                                alt={currentUser?.full_name || 'User avatar'}
                                                referrerPolicy="no-referrer"
                                            />
                                        )}
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                            {currentUser?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CC'}
                                        </AvatarFallback>
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
                                    <h3 className="text-xl font-semibold">Enter information about the person</h3>
                                </div>

                                <div className="flex gap-2 mb-2 flex-wrap">
                                    <Button 
                                        variant={inputType === 'linkedin' ? 'default' : 'outline'}
                                        onClick={() => setInputType('linkedin')}
                                        disabled={isLoading}
                                        className="flex-1 md:flex-none"
                                    >
                                        LinkedIn / Bio
                                    </Button>
                                    <Button 
                                        variant={inputType === 'url' ? 'default' : 'outline'}
                                        onClick={() => setInputType('url')}
                                        disabled={isLoading}
                                        className="flex-1 md:flex-none"
                                    >
                                        Website URL
                                    </Button>
                                </div>

                                {inputType === 'url' ? (
                                    <div className="space-y-2">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                                            placeholder="Paste profile URL (e.g. personal website)"
                                            className="w-full p-2 border rounded"
                                            disabled={isLoading}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                                </svg>
                                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">How to add profile information:</h4>
                                            </div>
                                            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5">
                                                <li className="flex items-center gap-2">
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">•</span> 
                                                    <strong>For LinkedIn:</strong> Select only the profile content (About, Experience, etc.)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">•</span> 
                                                    <strong>For any bio:</strong> Paste any professional bio or resume text
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">•</span> 
                                                    Copy (<kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">Ctrl/Cmd + C</kbd>) and paste below
                                                </li>
                                            </ol>
                                        </div>
                                        <Textarea 
                                            value={input}
                                            onChange={handleBioChange}
                                            placeholder="Paste bio or LinkedIn profile text here (e.g., 'John Doe • Software Engineer at Google • About: Passionate about...')"
                                            className="min-h-[150px] text-base border-2 focus:border-blue-500"
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Image src="/2-black.png" width={24} height={24} alt="2 icon" />
                                    <h3 className="text-xl font-semibold">Select your vibe</h3>
                                </div>

                                <Select 
                                    value={vibe} 
                                    onValueChange={(value: VibeType) => setVibe(value)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="text-base h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                        <SelectItem value="Casual">Casual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div 
                                onClick={() => {
                                    if (inputType === 'linkedin' && input.length < 20) {
                                        toast({
                                            title: "Profile too short",
                                            description: "Please enter at least 20 characters",
                                            variant: "destructive"
                                        });
                                    } else if (inputType === 'url' && !isValidUrl(url)) {
                                        toast({
                                            title: "Invalid URL",
                                            description: "Please enter a valid URL starting with http:// or https://",
                                            variant: "destructive"
                                        });
                                    }
                                }}
                            >
                                <Button 
                                    onClick={handleFormSubmit}
                                    disabled={
                                        !isFormValid() || 
                                        isLoading || 
                                        (!currentUser?.paid && (currentUser?.images_generated ?? 0) >= 5)
                                    }
                                    className="w-full h-10 text-base font-medium"
                                >
                                    {!currentUser?.paid && (currentUser?.images_generated ?? 0) >= 5 ? (
                                        'Upgrade to generate more questions'
                                    ) : isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <span className="animate-spin">⏳</span> 
                                            {isScrapingLoading ? 'Extracting info...' : 'Generating...'}
                                        </div>
                                    ) : (
                                        'Generate your questions →'
                                    )}
                                </Button>
                            </div>

                            {questions.length > 0 && (
                                <output className="space-y-4 mt-8 mb-6 px-4 md:px-0">
                                    <div className="space-y-2">
                                        <h2
                                            className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 text-center"
                                            ref={bioRef}
                                        >
                                            Your generated questions
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-400 text-center text-xs md:text-sm px-4">
                                            Tap to copy all questions to your clipboard
                                        </p>
                                    </div>
                                    <div 
                                        className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl 
                                        p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 
                                        cursor-pointer active:scale-[0.98] border border-gray-200 dark:border-gray-700
                                        touch-manipulation"
                                        onClick={() => {
                                            const formattedQuestions = questions
                                                .map((q: string) => `• ${q}`)
                                                .join('\n\n');
                                            navigator.clipboard.writeText(formattedQuestions);
                                            toast({
                                                title: "Copied! 📋",
                                                description: "Questions copied to clipboard",
                                            });
                                        }}
                                    >
                                        <div className="space-y-6">
                                            {questions.map((question: string, index: number) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <span className="text-blue-500 dark:text-blue-400 font-bold text-lg mt-0.5 shrink-0">
                                                        {index + 1}.
                                                    </span>
                                                    <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                                                        {question}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Tap anywhere to copy
                                            </p>
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
            {currentUser && (
                <PayDialog 
                    userDetails={currentUser}
                    userEmail={user?.user_metadata?.email}
                    isOpen={isPayDialogOpen}
                    onClose={() => setIsPayDialogOpen(false)}
                />
            )}
        </>
    );
};

export default Page;