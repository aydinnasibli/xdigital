import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        // Get current Clerk user
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        console.log('Clerk User:', {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
        });

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await dbConnect();
        console.log('Connected to MongoDB successfully');

        // Check if user exists
        const existingUser = await User.findOne({ clerkId: clerkUser.id });
        console.log('Existing user:', existingUser);

        if (existingUser) {
            return NextResponse.json({
                message: 'User already exists',
                user: existingUser,
                alreadyExists: true
            });
        }

        // Create user in MongoDB
        console.log('Creating new user...');
        const newUser = await User.create({
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            imageUrl: clerkUser.imageUrl || '',
        });

        console.log('User created successfully:', newUser);

        return NextResponse.json({
            message: 'User synced successfully',
            user: newUser,
            created: true
        });
    } catch (error) {
        console.error('Error syncing user:', error);

        if (error instanceof Error) {
            return NextResponse.json({
                error: 'Failed to sync user',
                details: error.message,
                stack: error.stack
            }, { status: 500 });
        }

        return NextResponse.json({
            error: 'Failed to sync user',
            details: 'Unknown error'
        }, { status: 500 });
    }
}