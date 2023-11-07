import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export default async function getCoffeeChatAidCount() {
  const greeting = await get('CoffeeChatAidCount');
  return NextResponse.json(greeting);
}

