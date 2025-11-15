// models/Task.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    IN_REVIEW = 'in_review',
    COMPLETED = 'completed',
    BLOCKED = 'blocked',
}

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

interface ISubtask {
    title: string;
    completed: boolean;
    completedDate?: Date;
    completedBy?: Types.ObjectId;
}

export interface ITask extends Document {
    _id: mongoose.Types.ObjectId;
    projectId: Types.ObjectId;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo?: Types.ObjectId; // User ID
    assignedBy?: Types.ObjectId; // User ID (admin)
    dueDate?: Date;
    estimatedHours?: number;
    actualHours?: number;
    tags?: string[];
    subtasks?: ISubtask[];
    dependencies?: Types.ObjectId[]; // Other task IDs that must be completed first
    milestoneId?: Types.ObjectId; // Reference to milestone
    order: number; // For Kanban board ordering
    completedDate?: Date;
    completedBy?: Types.ObjectId;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
        status: {
            type: String,
            enum: Object.values(TaskStatus),
            default: TaskStatus.TODO,
            index: true,
        },
        priority: {
            type: String,
            enum: Object.values(TaskPriority),
            default: TaskPriority.MEDIUM,
            index: true,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        dueDate: {
            type: Date,
            index: true,
        },
        estimatedHours: {
            type: Number,
            min: 0,
        },
        actualHours: {
            type: Number,
            min: 0,
        },
        tags: [{
            type: String,
            trim: true,
        }],
        subtasks: [{
            title: {
                type: String,
                required: true,
                trim: true,
            },
            completed: {
                type: Boolean,
                default: false,
            },
            completedDate: Date,
            completedBy: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        }],
        dependencies: [{
            type: Schema.Types.ObjectId,
            ref: 'Task',
        }],
        milestoneId: {
            type: Schema.Types.ObjectId,
        },
        order: {
            type: Number,
            default: 0,
        },
        completedDate: Date,
        completedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ projectId: 1, order: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });

// Virtual for completion percentage based on subtasks
TaskSchema.virtual('completionPercentage').get(function() {
    if (!this.subtasks || this.subtasks.length === 0) {
        return this.status === TaskStatus.COMPLETED ? 100 : 0;
    }
    const completed = this.subtasks.filter(st => st.completed).length;
    return Math.round((completed / this.subtasks.length) * 100);
});

const Task = (mongoose.models?.Task as Model<ITask>) || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
