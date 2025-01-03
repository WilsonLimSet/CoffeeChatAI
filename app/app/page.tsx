'use client'

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
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

interface ScrapingResponse {
    success: boolean;
    content?: string;
    error?: string;
}

type InputType = 'bio' | 'url';
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
    const [inputType, setInputType] = useState<InputType>('bio');
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
        if (inputType === 'bio') {
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
            if (currentUser && !currentUser.paid && (currentUser.images_generated ?? 0) >= 2) {
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

            if (!profile) {
                const newProfile = {
                    id: userId,
                    full_name: user?.user_metadata?.full_name || '',
                    avatar_url: user?.user_metadata?.avatar_url || '',
                    email: user?.email || '',
                    images_generated: 0,
                    paid: false,
                };

                const { data: createdProfile, error: createError } = await supabaseClient
                    .from('profiles')
                    .insert([newProfile])
                    .select()
                    .single();

                if (createError) throw createError;
                profile = createdProfile;
            }

            if (error && error.code !== 'PGRST116') throw error;

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
                console.log(content);
                
                // Make a direct API call instead of using handleSubmit
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
                    throw new Error('Failed to generate questions');
                }

                // Process the streaming response
                const reader = response.body?.getReader();
                if (reader) {
                    let accumulated = '';
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
                if (input.length < 20) {
                    toast({
                        title: "Bio too short",
                        description: "Please enter at least 20 characters",
                        variant: "destructive"
                    });
                    setIsChatLoading(false);
                    return;
                }
                await handleSubmit(e);
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
                                            {2 - (currentUser.images_generated ?? 0)} generations left
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
                                    <h3 className="text-xl font-semibold">Enter information about the person</h3>
                                </div>

                                <div className="flex gap-2 mb-2">
                                    <Button 
                                        variant={inputType === 'bio' ? 'default' : 'outline'}
                                        onClick={() => setInputType('bio')}
                                        disabled={isLoading}
                                    >
                                        Paste Bio
                                    </Button>
                                    <Button 
                                        variant={inputType === 'url' ? 'default' : 'outline'}
                                        onClick={() => setInputType('url')}
                                        disabled={isLoading}
                                    >
                                        Use URL
                                    </Button>
                                </div>

                                {inputType === 'bio' ? (
                                    <Textarea 
                                        value={input}
                                        onChange={handleBioChange}
                                        placeholder="e.g. Patrick Collison (born 9 September 1988) is an Irish billionaire entrepreneur..."
                                        className="min-h-[100px] text-base"
                                        disabled={isLoading}
                                    />
                                ) : (
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
                                    if (inputType === 'bio' && input.length < 20) {
                                        toast({
                                            title: "Bio too short",
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
                                        (!currentUser?.paid && (currentUser?.images_generated ?? 0) >= 2)
                                    }
                                    className="w-full h-10 text-base font-medium"
                                >
                                    {!currentUser?.paid && (currentUser?.images_generated ?? 0) >= 2 ? (
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
                                                .map((q: string) => `• ${q}`)
                                                .join('\n\n');
                                            navigator.clipboard.writeText(formattedQuestions);
                                            toast({
                                                title: "Copied to clipboard",
                                                description: "All questions have been copied to your clipboard",
                                            });
                                        }}
                                    >
                                        <div className="space-y-4">
                                            {questions.map((question: string, index: number) => (
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