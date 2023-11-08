import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { kv } from '@vercel/kv';
// Create an OpenAI API client (that's edge friendly!)
// YOU NEED TO CHANGE THIS TO OPENAI_API_KEY WHEN PUSHING AND KEEP IT ON REACT_APP_OPENAI_API_KEY FOR LOCAL
console.log('API Key:', process.env.OPENAI_API_KEY);

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const config = new Configuration({
  //apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  apiKey: process.env.OPENAI_API_KEY,
});
console.log('key:', config.apiKey);
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
        content: `You are a talk show host and you're about to interview someone. Based on the biography of this person: ${bio}$ generate 2 ${vibe} potential interesting questions that are specific to them${
          vibe === 'Funny'
            ? "Make sure there is a joke in there and it's a little ridiculous."
            : null
        }
          Make sure each generated question is less than 200 characters{
          bio.slice(-1) === '.' ? '' : '.'
        }`,
      },
    ],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
