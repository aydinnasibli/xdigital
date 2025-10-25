import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
]);

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

    // If user is authenticated and tries to access public routes, redirect to dashboard
    if (userId && isPublicRoute(req)) {
        const dashboardUrl = new URL('/dashboard', req.url);
        return Response.redirect(dashboardUrl);
    }

    // If user is not authenticated and tries to access protected routes, redirect to sign-in
    if (!userId && isProtectedRoute(req)) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return Response.redirect(signInUrl);
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};