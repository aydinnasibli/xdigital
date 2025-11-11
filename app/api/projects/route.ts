// app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';

// GET all projects for current user
export async function GET() {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Get user from MongoDB
        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get all projects for this user
        const projects = await Project.find({ userId: user._id })
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            projects,
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

// POST create new project
export async function POST(req: Request) {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Get user from MongoDB
        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const body = await req.json();
        const { projectName, projectDescription, serviceType, package: packageType } = body;

        // Validate required fields
        if (!projectName || !projectDescription || !serviceType || !packageType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create new project
        const newProject = await Project.create({
            userId: user._id,
            clerkUserId: clerkUserId,
            projectName,
            projectDescription,
            serviceType,
            package: packageType,
            status: 'pending',
        });

        return NextResponse.json({
            success: true,
            project: newProject,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}