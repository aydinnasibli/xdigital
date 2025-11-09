import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database/mongodb';
import mongoose from 'mongoose';

export async function GET() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
        console.log('MONGODB_URI starts with:', process.env.MONGODB_URI?.substring(0, 20));

        // Connect to MongoDB
        await dbConnect();

        // Check connection state
        const connectionState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        console.log('Connection state:', states[connectionState as keyof typeof states]);
        console.log('Database name:', mongoose.connection.db?.databaseName);

        // List all collections
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log('Collections:', collections?.map(c => c.name));

        // Try to count users
        const User = mongoose.models.User;
        if (User) {
            const userCount = await User.countDocuments();
            console.log('User count:', userCount);

            // Get all users
            const users = await User.find({}).limit(5);
            console.log('Users:', users);
        }

        return NextResponse.json({
            success: true,
            connectionState: states[connectionState as keyof typeof states],
            database: mongoose.connection.db?.databaseName,
            collections: collections?.map(c => c.name) || [],
            hasUserModel: !!mongoose.models.User,
            userCount: mongoose.models.User ? await mongoose.models.User.countDocuments() : 0,
        });
    } catch (error) {
        console.error('Database test error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        }, { status: 500 });
    }
}