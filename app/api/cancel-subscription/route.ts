import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies }, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const { subscription_id } = await req.json();

    // Cancel the subscription on Stripe
    await stripe.subscriptions.cancel(subscription_id);

    // Update the Supabase row
    const { error } = await supabase
      .from('profiles')
      .update({
        paid: false,
        subscription_id: null
      })
      .eq('subscription_id', subscription_id);

    if (error) {
      throw new Error(`Supabase update error: ${error.message}`);
    }

    return NextResponse.json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}