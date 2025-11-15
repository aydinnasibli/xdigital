// app/actions/tasks.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Task, { TaskStatus, TaskPriority } from '@/models/Task';
import User from '@/models/User';
import mongoose from 'mongoose';
import { logActivity } from './activities';
import { ActivityType, ActivityEntity } from '@/models/Activity';

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Get all tasks for a project
export async function getProjectTasks(projectId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return { success: false, error: 'Invalid project ID' };
        }

        await dbConnect();

        const tasks = await Task.find({ projectId })
            .populate('assignedTo', 'firstName lastName email imageUrl')
            .populate('createdBy', 'firstName lastName email imageUrl')
            .sort({ order: 1 })
            .lean();

        const serializedTasks = tasks.map(task => ({
            ...task,
            _id: task._id.toString(),
            projectId: task.projectId.toString(),
            assignedTo: task.assignedTo ? {
                ...task.assignedTo,
                _id: task.assignedTo._id.toString(),
            } : null,
            createdBy: {
                ...task.createdBy,
                _id: task.createdBy._id.toString(),
            },
        }));

        return { success: true, data: serializedTasks };
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return { success: false, error: 'Failed to fetch tasks' };
    }
}

// Create a new task
export async function createTask(data: {
    projectId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string;
    dueDate?: Date;
    estimatedHours?: number;
    tags?: string[];
    milestoneId?: string;
}): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Get the highest order number for this project
        const highestOrderTask = await Task.findOne({ projectId: data.projectId })
            .sort({ order: -1 })
            .lean();

        const newOrder = highestOrderTask ? highestOrderTask.order + 1 : 0;

        const task = await Task.create({
            ...data,
            createdBy: user._id,
            order: newOrder,
        });

        // Log activity
        await logActivity({
            type: ActivityType.TASK_CREATED,
            entityType: ActivityEntity.TASK,
            entityId: task._id.toString(),
            projectId: data.projectId,
            title: `Created task: ${data.title}`,
        });

        revalidatePath(`/dashboard/projects/${data.projectId}`);
        revalidatePath('/dashboard/projects');

        return {
            success: true,
            data: {
                ...task.toObject(),
                _id: task._id.toString(),
                projectId: task.projectId.toString(),
            },
        };
    } catch (error) {
        console.error('Error creating task:', error);
        return { success: false, error: 'Failed to create task' };
    }
}

// Update task
export async function updateTask(taskId: string, data: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: string;
    dueDate: Date;
    estimatedHours: number;
    actualHours: number;
    tags: string[];
}>): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return { success: false, error: 'Invalid task ID' };
        }

        await dbConnect();

        const task = await Task.findById(taskId);
        if (!task) {
            return { success: false, error: 'Task not found' };
        }

        const oldStatus = task.status;

        Object.assign(task, data);

        // If status changed to completed, set completedDate
        if (data.status === TaskStatus.COMPLETED && oldStatus !== TaskStatus.COMPLETED) {
            const user = await User.findOne({ clerkId: clerkUserId });
            task.completedDate = new Date();
            task.completedBy = user?._id;

            // Log completion
            await logActivity({
                type: ActivityType.TASK_COMPLETED,
                entityType: ActivityEntity.TASK,
                entityId: taskId,
                projectId: task.projectId.toString(),
                title: `Completed task: ${task.title}`,
            });
        } else if (oldStatus !== data.status) {
            // Log status change
            await logActivity({
                type: ActivityType.TASK_STATUS_CHANGED,
                entityType: ActivityEntity.TASK,
                entityId: taskId,
                projectId: task.projectId.toString(),
                title: `Task status changed: ${task.title}`,
                metadata: {
                    oldValue: oldStatus,
                    newValue: data.status,
                },
            });
        }

        await task.save();

        revalidatePath(`/dashboard/projects/${task.projectId}`);

        return {
            success: true,
            data: {
                ...task.toObject(),
                _id: task._id.toString(),
                projectId: task.projectId.toString(),
            },
        };
    } catch (error) {
        console.error('Error updating task:', error);
        return { success: false, error: 'Failed to update task' };
    }
}

// Update task order (for Kanban drag-and-drop)
export async function updateTaskOrder(taskId: string, newOrder: number, newStatus?: TaskStatus): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const task = await Task.findById(taskId);
        if (!task) {
            return { success: false, error: 'Task not found' };
        }

        task.order = newOrder;
        if (newStatus) {
            task.status = newStatus;
        }

        await task.save();

        revalidatePath(`/dashboard/projects/${task.projectId}`);

        return { success: true };
    } catch (error) {
        console.error('Error updating task order:', error);
        return { success: false, error: 'Failed to update task order' };
    }
}

// Delete task
export async function deleteTask(taskId: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            return { success: false, error: 'Task not found' };
        }

        revalidatePath(`/dashboard/projects/${task.projectId}`);

        return { success: true };
    } catch (error) {
        console.error('Error deleting task:', error);
        return { success: false, error: 'Failed to delete task' };
    }
}

// Add subtask to a task
export async function addSubtask(taskId: string, title: string): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const task = await Task.findById(taskId);
        if (!task) {
            return { success: false, error: 'Task not found' };
        }

        task.subtasks = task.subtasks || [];
        task.subtasks.push({
            title,
            completed: false,
        });

        await task.save();

        revalidatePath(`/dashboard/projects/${task.projectId}`);

        return { success: true, data: task.toObject() };
    } catch (error) {
        console.error('Error adding subtask:', error);
        return { success: false, error: 'Failed to add subtask' };
    }
}

// Toggle subtask completion
export async function toggleSubtask(taskId: string, subtaskIndex: number): Promise<ActionResponse> {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: 'Unauthorized' };
        }

        await dbConnect();

        const user = await User.findOne({ clerkId: clerkUserId });
        const task = await Task.findById(taskId);
        if (!task) {
            return { success: false, error: 'Task not found' };
        }

        if (!task.subtasks || !task.subtasks[subtaskIndex]) {
            return { success: false, error: 'Subtask not found' };
        }

        const subtask = task.subtasks[subtaskIndex];
        subtask.completed = !subtask.completed;

        if (subtask.completed) {
            subtask.completedDate = new Date();
            subtask.completedBy = user?._id;
        } else {
            subtask.completedDate = undefined;
            subtask.completedBy = undefined;
        }

        await task.save();

        revalidatePath(`/dashboard/projects/${task.projectId}`);

        return { success: true, data: task.toObject() };
    } catch (error) {
        console.error('Error toggling subtask:', error);
        return { success: false, error: 'Failed to toggle subtask' };
    }
}
