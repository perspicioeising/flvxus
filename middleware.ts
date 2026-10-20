import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Middleware de sessao (architecture.md §5.2).
 *
 * Responsabilidades:
 *  - Renovar SEMPRE a sessao via @supabase/ssr (lib/supabase/middleware.ts).
 *  - Barrar acesso nao autenticado a rotas protegidas (/professor, /aluno e,
 *    por retrocompatibilidade enquanto a v1 existe, /dashboard), redirecionando
 *    para /login.
 *  - Redirecionar usuario ja logado para fora das telas de auth (/login, /register).
 *
 * NAO decide papel: o gate por papel ('trainer'/'student') e feito nos layouts
 * server-side de cada area (§5.2). O middleware roda no edge e nao deve consultar
 * o banco a cada requisicao.
 */

// Rotas de autenticacao sempre liberadas.
const AUTH_ROUTES = [
  '/auth/callback',
  '/reset-password',
  '/set-password',
  '/login',
  '/register',
];

// Prefixos de rota que exigem usuario autenticado.
const PROTECTED_PREFIXES = ['/professor', '/aluno', '/dashboard'];

export async function middleware(request: NextRequest) {
  // Renova a sessao em toda requisicao e obtem o usuario resolvido.
  const { response, user } = await updateSession(request);

  const { pathname, searchParams } = request.nextUrl;

  // Magic link / verificacao em qualquer rota: liberar para o fluxo de auth.
  const hasVerifyToken = searchParams.get('token') && searchParams.get('type');
  if (hasVerifyToken) {
    return response;
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Usuario logado tentando acessar login/register -> manda para a home logada.
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Rotas de auth seguem liberadas (apos o tratamento acima).
  if (isAuthRoute) {
    return response;
  }

  // Barrar nao autenticado em rotas protegidas.
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Casa todas as rotas EXCETO:
     * - assets estaticos do Next (_next/static, _next/image)
     * - favicon, manifest (PWA) e icones
     * - arquivos de imagem comuns
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
