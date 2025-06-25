import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 🔥 SEMPRE permitir acesso a rotas de autenticação
  const authRoutes = [
    '/auth/callback',
    '/reset-password', 
    '/set-password',
    '/login',
    '/register'
  ];
  
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));
  
  if (isAuthRoute) {
    console.log('🔓 [MIDDLEWARE] Permitindo acesso a rota de auth:', req.nextUrl.pathname);
    return res;
  }

  // 🔥 Verificar se é um magic link em qualquer rota
  const url = req.nextUrl;
  const hasVerifyToken = url.searchParams.get('token') && url.searchParams.get('type');
  
  if (hasVerifyToken) {
    console.log('🔗 [MIDDLEWARE] Magic link detectado, permitindo acesso:', url.pathname);
    return res;
  }

  // Verificar sessão apenas para rotas protegidas
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Proteger dashboard sem sessão
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('🚫 [MIDDLEWARE] Redirecionando para login - sem sessão');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Se logado e tentando acessar auth pages, redirecionar para dashboard
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    console.log('✅ [MIDDLEWARE] Usuário logado, redirecionando para dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};