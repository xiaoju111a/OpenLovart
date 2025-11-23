import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the Supabase token
    const token = await getToken({ template: 'supabase' });

    // Decode the JWT to see what's inside (for debugging)
    let decodedToken = null;
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          decodedToken = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        }
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }

    return NextResponse.json({
      userId,
      hasSupabaseToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      decodedToken,
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
