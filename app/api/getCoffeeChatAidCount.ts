import { NextResponse } from 'next/server';
import { NextApiRequest} from 'next'
import { get } from '@vercel/edge-config';

export default async function getCoffeeChatAidCount(req: NextApiRequest, res: NextApiResponse) {
  const greeting = await get('CoffeeChatAidCount');
  return NextResponse.json(greeting);
}

