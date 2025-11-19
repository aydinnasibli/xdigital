// app/actions/tasks.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/database/mongodb';
import Task, { TaskStatus, TaskPriority } from '@/models/Task';
import User from '@/models/User';
import Project from '@/models/Project';
import mongoose from 'mongoose';
import { logActivity } from './activities';
import { ActivityType, ActivityEntity } from '@/models/Activity';
import { createNotification } from '@/lib/services/notification.service';
import { NotificationType } from '@/models/Notification';
import { toSerializedObject } from '@/lib/utils/serialize-mongo';
import { logError } from '@/lib/sentry-logger';

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
        logError(error as Error, { context: 'getProjectTasks', projectId });
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

        // If task is assigned, notify the assignee
        if (data.assignedTo && mongoose.Types.ObjectId.isValid(data.assignedTo)) {
            const assignedUser = await User.findById(data.assignedTo);
            if (assignedUser?.clerkId) {
                await createNotification({
                    userId: assignedUser.clerkId,
                    projectId: data.projectId,
                    type: NotificationType.PROJECT_UPDATE,
                    title: 'New Task Assigned',
                    message: `You have been assigned: "${data.title}"${data.dueDate ? ` - Due: ${new Date(data.dueDate).toLocaleDateString()}` : ''}`,
                    link: `/dashboard/projects/${data.projectId}`,
                    sendEmail: true,
                    emailSubject: `New Task Assigned - ${data.title}`,
                });
            }
        }

        revalidatePath(`/dashboard/projects/${data.projectId}`);
        revalidatePath('/dashboard/projects');

        return {
            success: true,
            data: toSerializedObject(task),
        };
    } catch (error) {
        logError(error as Error, { context: 'createTask', projectId: data.projectId, title: data.title });
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

            // Notify project client about task completion
            const project = await Project.findById(task.projectId);
            if (project?.clerkUserId) {
                await createNotification({
                    userId: project.clerkUserId,
                    projectId: task.projectId.toString(),
                    type: NotificationType.PROJECT_UPDATE,
                    title: 'Task Completed',
                    message: `Task "${task.title}" has been completed`,
                    link: `/dashboard/projects/${task.projectId}`,
                    sendEmail: true,
                    emailSubject: `Task Completed - ${task.title}`,
                });
            }
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
            data: toSerializedObject(task),
        };
    } catch (error) {
        logError(error as Error, { context: 'updateTask', taskId, status: data.status });
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
        logError(error as Error, { context: 'updateTaskOrder', taskId, newOrder, newStatus });
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
        logError(error as Error, { context: 'deleteTask', taskId });
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

        return { success: true, data: toSerializedObject(task) };
    } catch (error) {
        logError(error as Error, { context: 'addSubtask', taskId, title });
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

        return { success: true, data: toSerializedObject(task) };
    } catch (error) {
        logError(error as Error, { context: 'toggleSubtask', taskId, subtaskIndex });
        return { success: false, error: 'Failed to toggle subtask' };
    }
}
