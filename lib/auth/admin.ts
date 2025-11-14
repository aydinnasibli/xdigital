// lib/auth/admin.ts
import { auth } from '@clerk/nextjs/server';

const ADMIN_EMAIL = 'xdigitalaz@proton.me';

export async function isAdmin(): Promise<boolean> {
    try {
        const { sessionClaims } = await auth();
        const userEmail = sessionClaims?.email as string | undefined;
        return userEmail === ADMIN_EMAIL;
    } catch (error) {
        return false;
    }
}

export async function requireAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        throw new Error('Unauthorized: Admin access required');
    }
    return true;
}

export async function getAdminSession() {
    const { userId, sessionClaims } = await auth();
    const userEmail = sessionClaims?.email as string | undefined;

    if (!userId || userEmail !== ADMIN_EMAIL) {
        throw new Error('Unauthorized: Admin access required');
    }

    return { userId, email: userEmail };
}