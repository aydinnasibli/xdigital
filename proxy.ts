// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);
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
    const { userId, sessionClaims } = await auth();

    // Get user email from session claims
    const userEmail = sessionClaims?.email as string | undefined;

    // Check if user is admin
    const isAdmin = userEmail === 'xdigitalaz@proton.me';

    // Admin route protection
    if (isAdminRoute(req)) {
        if (!userId) {
            const signInUrl = new URL('/sign-in', req.url);
            signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
            return NextResponse.redirect(signInUrl);
        }

        if (!isAdmin) {
            // Non-admin trying to access admin routes - redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        return NextResponse.next();
    }

    // Authenticated user trying to access ANY public route (including /)
    // Redirect them to appropriate dashboard
    if (userId && isPublicRoute(req)) {
        const redirectUrl = isAdmin ? '/admin/dashboard' : '/dashboard';
        return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Non-authenticated user trying to access protected routes
    // Redirect them to sign-in
    if (!userId && isProtectedRoute(req)) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
});

// Ensure middleware runs as Edge Function
export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};