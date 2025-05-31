import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Allow access to auth callback route
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res;
  }

  // Check auth condition
  if (!session && (req.nextUrl.pathname.startsWith('/dashboard'))) {
    // Redirect to login if accessing protected routes without session
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If user is logged in and tries to access auth pages, redirect to dashboard
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};