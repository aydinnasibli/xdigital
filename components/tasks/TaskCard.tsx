// components/tasks/TaskCard.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskPriority } from '@/models/Task';

interface Task {
    _id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: Date;
    assignedTo?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        imageUrl?: string;
    };
    subtasks?: Array<{ title: string; completed: boolean }>;
}

interface TaskCardProps {
    task: Task;
    isDragging?: boolean;
    readOnly?: boolean;
}

const priorityColors = {
    [TaskPriority.LOW]: 'bg-gray-200 text-gray-700',
    [TaskPriority.MEDIUM]: 'bg-blue-200 text-blue-700',
    [TaskPriority.HIGH]: 'bg-orange-200 text-orange-700',
    [TaskPriority.URGENT]: 'bg-red-200 text-red-700',
};

export function TaskCard({ task, isDragging = false, readOnly = false }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: task._id, disabled: readOnly });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...(readOnly ? {} : listeners)}
            className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
            } ${isDragging ? 'rotate-3' : ''}`}
        >
            {/* Priority Badge */}
            <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
                {isOverdue && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                        Overdue
                    </span>
                )}
            </div>

            {/* Task Title */}
            <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>

            {/* Task Description */}
            {task.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Subtasks Progress */}
            {totalSubtasks > 0 && (
                <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Subtasks</span>
                        <span>{completedSubtasks}/{totalSubtasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
                {/* Due Date */}
                {task.dueDate && (
                    <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                        {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                )}

                {/* Assigned User */}
                {task.assignedTo && (
                    <div className="flex items-center">
                        {task.assignedTo.imageUrl ? (
                            <img
                                src={task.assignedTo.imageUrl}
                                alt={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                                className="w-6 h-6 rounded-full border-2 border-white"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                                {task.assignedTo.firstName?.[0]}
                                {task.assignedTo.lastName?.[0]}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
