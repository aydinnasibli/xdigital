import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json(
            { error: 'Missing svix headers' },
            { status: 400 }
        );
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the webhook
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 400 }
        );
    }

    // Connect to database
    await dbConnect();

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        try {
            // Create user in MongoDB
            const newUser = await User.create({
                clerkId: id,
                email: email_addresses[0].email_address,
                firstName: first_name || '',
                lastName: last_name || '',
                imageUrl: image_url || '',
            });

            console.log('User created in MongoDB:', newUser._id);

            return NextResponse.json(
                {
                    message: 'User created successfully',
                    userId: newUser._id,
                },
                { status: 201 }
            );
        } catch (error) {
            console.error('Error creating user in MongoDB:', error);
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }
    }

    if (eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        try {
            // Update user in MongoDB
            const updatedUser = await User.findOneAndUpdate(
                { clerkId: id },
                {
                    email: email_addresses[0].email_address,
                    firstName: first_name || '',
                    lastName: last_name || '',
                    imageUrl: image_url || '',
                },
                { new: true }
            );

            if (!updatedUser) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            console.log('User updated in MongoDB:', updatedUser._id);

            return NextResponse.json(
                {
                    message: 'User updated successfully',
                    userId: updatedUser._id,
                },
                { status: 200 }
            );
        } catch (error) {
            console.error('Error updating user in MongoDB:', error);
            return NextResponse.json(
                { error: 'Failed to update user' },
                { status: 500 }
            );
        }
    }

    if (eventType === 'user.deleted') {
        const { id } = evt.data;

        try {
            // Delete user from MongoDB
            const deletedUser = await User.findOneAndDelete({ clerkId: id });

            if (!deletedUser) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            console.log('User deleted from MongoDB:', deletedUser._id);

            // TODO: Also delete related data (projects, messages, etc.)
            // This can be handled with MongoDB cascade or manually

            return NextResponse.json(
                {
                    message: 'User deleted successfully',
                    userId: deletedUser._id,
                },
                { status: 200 }
            );
        } catch (error) {
            console.error('Error deleting user from MongoDB:', error);
            return NextResponse.json(
                { error: 'Failed to delete user' },
                { status: 500 }
            );
        }
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
}