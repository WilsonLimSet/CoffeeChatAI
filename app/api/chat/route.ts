import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { kv } from '@vercel/kv';

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Set the runtime to edge for best performance
export const runtime = 'edge';
export async function POST(req: Request) {
  const { vibe, bio } = await req.json();
  await kv.incr('coffeecounter');
  const user = await kv.get('coffeecounter');
  console.log('Incremented to :', user); // Log the fetched data

  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'user',
        content: `I am a podcast host preparing to interview a person with the following biography: "${bio}" 
        Based on this, generate two ${vibe.toLowerCase()} questions that directly relate to the biography provided. ${
          vibe === 'Funny'
            ? 'The questions should contain humor and be slightly ridiculous.'
            : 'The questions should be thoughtful and engaging.'
        } Ensure each question is concise and under 250 characters.
        If you can't come up with anything say you need more a more specific bio, do not make up a person.
        `,
      },
    ],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}