// proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Route matchers
const isAdminRoute = createRouteMatcher(['/admin(.*)']);
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

    const url = req.nextUrl.clone();

    // ------------- ADMIN ROUTES -------------
    if (isAdminRoute(req)) {
        if (!userId) {
            // Not logged in → redirect to sign-in
            url.pathname = '/sign-in';
            url.searchParams.set('redirect_url', req.nextUrl.pathname);
            return NextResponse.redirect(url);
        }
        // Logged-in users proceed; server-side will check admin role
        return NextResponse.next();
    }

    // ------------- PROTECTED ROUTES -------------
    if (isProtectedRoute(req)) {
        if (!userId) {
            // Not logged in → redirect to sign-in
            url.pathname = '/sign-in';
            url.searchParams.set('redirect_url', req.nextUrl.pathname);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // ------------- PUBLIC ROUTES -------------
    if (isPublicRoute(req)) {
        if (userId) {
            // Logged-in user trying to access public page → redirect to dashboard
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // ------------- DEFAULT PASS-THROUGH -------------
    return NextResponse.next();
});

// Middleware configuration
export const config = {
    matcher: [
        // Match everything except _next static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
