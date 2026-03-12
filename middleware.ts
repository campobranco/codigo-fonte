import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que exigem autenticação
const protectedPaths = ['/admin', '/witnessing', '/reports'];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    
    // Verifica se a rota atual está protegida
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
    
    if (isProtected) {
        // App Hosting reserva o cookie __session para SSR
        const session = req.cookies.get('__session')?.value;
        
        // Se não houver cookie, redireciona instantaneamente para login
        if (!session) {
            const loginUrl = new URL('/auth/login', req.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Aplica o middleware em todas as rotas exceto assets e arquivos estáticos
         */
        '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
    ],
};

