import { NextApiRequest, NextApiResponse } from 'next';
import { get } from '@vercel/edge-config';

export default async function getCoffeeChatAidCount(req: NextApiRequest, res: NextApiResponse) {
  try {
    const CoffeeChatAidCountValue = await get('CoffeeChatAidCount');
    
    // Check if the value is a string and not undefined before using it
    if (typeof CoffeeChatAidCountValue === 'string') {
      const coffeeChatsAidedValue = parseInt(CoffeeChatAidCountValue, 10);
      res.status(200).json({ value: coffeeChatsAidedValue });
    } else {
      // If the value is not a string or is undefined, handle the case appropriately
      res.status(500).json({ error: 'Invalid CoffeeChatAidCount value' });
    }
  } catch (error) {
    console.error('Failed to fetch CoffeeChatAidCount:', error);
    res.status(500).json({ error: 'Failed to fetch CoffeeChatAidCount' });
  }
}
