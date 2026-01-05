import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

// Create an OpenAI provider instance
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { vibe, bio } = await req.json();

    if (!bio) {
      return new Response('Bio is required', { status: 400 });
    }

    // Try to increment counter, but don't block if it fails
    try {
      const { kv } = await import('@vercel/kv');
      await kv.incr('coffeecounter');
    } catch (kvError) {
      console.error('KV Error:', kvError);
    }

    console.log('Attempting to call OpenAI with bio length:', bio.length);

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'user',
          content: `I am preparing to meet a person with the following biography: "${bio}"
          Based on this, generate exactly three ${vibe.toLowerCase()} questions that directly relate to their background.
          ${vibe === 'Casual'
            ? 'Make the questions conversational and humorous.'
            : 'Make the questions professional and thoughtful.'
          }

          Format rules:
          - Put each question on a new line
          - Do not include numbers or bullet points
          - Keep each question under 250 characters
          - Questions must be specific to the bio
          - No additional text or explanations

          If you can't generate questions, just respond with "Unable to generate questions, try again."`
        }
      ]
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('Chat API error:', error);
    console.error('Error details:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Failed to generate questions', 
      details: error.message,
      cause: error.cause?.message || 'Unknown'
    }, { status: 500 });
  }
}