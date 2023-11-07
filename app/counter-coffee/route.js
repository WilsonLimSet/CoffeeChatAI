import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
 
export async function GET() {
  const user = await kv.get('coffeecounter');
  return NextResponse.json(user);
}