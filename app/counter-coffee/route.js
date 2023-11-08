import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
 
export async function GET() {
  const user = await kv.get('coffeecounter');
  // Create a response with the counter value
  const response = NextResponse.json(user);

  // Set cache-control headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, max-age=0');

  return response;
}