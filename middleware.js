import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';
 
export const config = { matcher: '/counter' };
 
export async function middleware() {
  const greeting = await get('CoffeeChatAidCount');
  return NextResponse.json(greeting);
}