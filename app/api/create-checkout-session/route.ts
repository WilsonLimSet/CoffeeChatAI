import { stripe } from "@/lib/stripe";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, email, plan_name } = body;

        let session = await stripe.checkout.sessions.create({
            customer_email: email,
            line_items: [ 
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: plan_name
                        },
                        recurring: {
                            interval: 'month'
                        },
                        unit_amount: 4 * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                user_id: user_id
            },
            mode: 'subscription',
            success_url: `https://www.coffeechatai.com/app`,
        });

        return NextResponse.json({ paymentLink: session.url });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}