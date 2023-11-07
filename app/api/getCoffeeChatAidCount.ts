import { NextApiRequest, NextApiResponse } from 'next';
import { get } from '@vercel/edge-config';

export default async function getCoffeeChatAidCount(req: NextApiRequest, res: NextApiResponse) {
  try {
    const CoffeeChatAidCountValue = await get('CoffeeChatAidCount');
    // Check if the value is undefined before using it
    if (CoffeeChatAidCountValue === undefined) {
      // Handle the undefined case, perhaps by returning a default value or an error
      res.status(404).json({ error: 'CoffeeChatAidCount not found' });
      return;
    }
    // Now we know CoffeeChatAidCountValue is not undefined, we can safely use it
    const coffeeChatsAidedValue = parseInt(CoffeeChatAidCountValue, 10);
    res.status(200).json({ value: coffeeChatsAidedValue });
  } catch (error) {
    console.error('Failed to fetch CoffeeChatAidCount:', error);
    res.status(500).json({ error: 'Failed to fetch CoffeeChatAidCount' });
  }
}
