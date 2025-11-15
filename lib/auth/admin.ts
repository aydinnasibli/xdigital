// lib/auth/admin.ts
import { currentUser } from '@clerk/nextjs/server';

export async function isAdmin(): Promise<boolean> {
    try {
        const user = await currentUser();
        const role = user?.publicMetadata?.role; // Admin role stored in Clerk user
        return role === 'admin';
    } catch {
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
    const user = await currentUser();
    const role = user?.publicMetadata?.role;

    if (!user?.id || role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
    }

    return { userId: user.id, role };
}
