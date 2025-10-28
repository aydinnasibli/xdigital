import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/about',
    '/web',
    '/socialmedia',
    '/digitalsolution',
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    // Authenticated user going to public routes
    if (userId && isPublicRoute(req) && req.nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Non-authenticated user going to protected routes
    if (!userId && isProtectedRoute(req)) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }
});

// Ensure middleware runs as Edge Function
export const config = {
    runtime: 'edge',
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
