import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';
 
export const config = { matcher: '/counter' };
 
export async function middleware() {
    const count = await get('CoffeeChatAidCount');
    // Ensure we're returning an object with the CoffeeChatAidCount property
    return NextResponse.json({ CoffeeChatAidCount: count });
}