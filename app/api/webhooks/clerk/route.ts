// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';
import Task from '@/models/Task';
import Message from '@/models/Message';
import File from '@/models/File';
import FileFolder from '@/models/FileFolder';
import Invoice from '@/models/Invoice';
import Notification from '@/models/Notification';
import NotificationPreference from '@/models/NotificationPreference';
import Activity from '@/models/Activity';
import Analytics from '@/models/Analytics';
import Deliverable from '@/models/Deliverable';
import Feedback from '@/models/Feedback';
import SavedFilter from '@/models/SavedFilter';
import TimeEntry from '@/models/TimeEntry';

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
        const data = evt.data as any;
        const {
            id,
            email_addresses,
            username,
            first_name,
            last_name,
            image_url,
            profile_image_url
        } = data;

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ clerkId: id });
            if (existingUser) {
                return NextResponse.json(
                    {
                        message: 'User already exists',
                        userId: existingUser._id,
                    },
                    { status: 200 }
                );
            }

            // Create user in MongoDB
            const newUser = await User.create({
                clerkId: id,
                email: email_addresses[0].email_address,
                userName: username || '',
                firstName: first_name || '',
                lastName: last_name || '',
                imageUrl: image_url || profile_image_url || '',
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
        const data = evt.data as any;
        const {
            id,
            email_addresses,
            username,
            first_name,
            last_name,
            image_url,
            profile_image_url
        } = data;

        try {
            // Update user in MongoDB
            const updatedUser = await User.findOneAndUpdate(
                { clerkId: id },
                {
                    email: email_addresses[0].email_address,
                    userName: username || '',
                    firstName: first_name || '',
                    lastName: last_name || '',
                    imageUrl: image_url || profile_image_url || '',
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

            // Cascade delete all related data
            const userId = deletedUser._id;
            const clerkId = deletedUser.clerkId;

            await Promise.all([
                // Delete projects created by this user
                Project.deleteMany({ userId: clerkId }),
                // Delete tasks assigned to or created by this user
                Task.deleteMany({ $or: [{ assignedTo: userId }, { createdBy: userId }] }),
                // Delete messages sent by this user
                Message.deleteMany({ userId: clerkId }),
                // Delete files uploaded by this user
                File.deleteMany({ userId: clerkId }),
                // Delete file folders created by this user
                FileFolder.deleteMany({ userId: clerkId }),
                // Delete invoices created by this user
                Invoice.deleteMany({ userId: clerkId }),
                // Delete notifications for this user
                Notification.deleteMany({ userId: clerkId }),
                // Delete notification preferences for this user
                NotificationPreference.deleteMany({ userId: clerkId }),
                // Delete activity logs for this user
                Activity.deleteMany({ userId: clerkId }),
                // Delete analytics data for this user
                Analytics.deleteMany({ userId: clerkId }),
                // Delete deliverables created by this user
                Deliverable.deleteMany({ createdBy: userId }),
                // Delete feedback given by this user
                Feedback.deleteMany({ userId: clerkId }),
                // Delete saved filters for this user
                SavedFilter.deleteMany({ userId: clerkId }),
                // Delete time entries for this user
                TimeEntry.deleteMany({ userId: clerkId }),
            ]);

            console.log('User and all related data deleted successfully:', userId);

            return NextResponse.json(
                {
                    message: 'User and all related data deleted successfully',
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