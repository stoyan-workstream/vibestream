import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Hardcoded password - change this or use SITE_PASSWORD env var
const SITE_PASSWORD = process.env.SITE_PASSWORD || 'demo2024';

export async function POST(request: Request) {
  const { password } = await request.json();
  
  if (password === SITE_PASSWORD) {
    const cookieStore = await cookies();
    
    // Set auth cookie (expires in 7 days)
    cookieStore.set('site-auth', SITE_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('site-auth');
  return NextResponse.json({ success: true });
}
