import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId, email, fullName, avatarUrl } = await req.json();

    // Create a Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return NextResponse.json({ profile: existingProfile });
    }

    // Create new profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: userId,
        email: email,
        full_name: fullName || email.split('@')[0],
        avatar_url: avatarUrl || '',
        images_generated: 0,
        paid: false
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}