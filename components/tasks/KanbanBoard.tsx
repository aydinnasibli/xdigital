// components/tasks/KanbanBoard.tsx
'use client';

import { useState, useTransition } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskStatus, TaskPriority } from '@/models/Task';
import { updateTaskOrder } from '@/app/actions/tasks';
import { TaskCard } from './TaskCard';

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatus;
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

interface KanbanBoardProps {
    tasks: Task[];
    projectId: string;
}

const columns = [
    { id: TaskStatus.TODO, title: 'To Do', color: 'bg-gray-100' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-50' },
    { id: TaskStatus.IN_REVIEW, title: 'In Review', color: 'bg-yellow-50' },
    { id: TaskStatus.COMPLETED, title: 'Completed', color: 'bg-green-50' },
];

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isPending, startTransition] = useTransition();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t._id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        const taskId = active.id as string;
        const newStatus = over.id as TaskStatus;

        const task = tasks.find(t => t._id === taskId);

        if (task && task.status !== newStatus) {
            // Optimistically update UI
            startTransition(async () => {
                await updateTaskOrder(taskId, 0, newStatus);
            });
        }

        setActiveTask(null);
    };

    const getTasksByStatus = (status: TaskStatus) => {
        return tasks.filter(t => t.status === status);
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {columns.map(column => {
                    const columnTasks = getTasksByStatus(column.id);

                    return (
                        <div
                            key={column.id}
                            className="flex flex-col"
                        >
                            {/* Column Header */}
                            <div className={`${column.color} rounded-t-lg p-3 border-b-2 border-gray-300`}>
                                <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                                    <span>{column.title}</span>
                                    <span className="text-sm bg-white px-2 py-1 rounded-full">
                                        {columnTasks.length}
                                    </span>
                                </h3>
                            </div>

                            {/* Column Body */}
                            <SortableContext
                                id={column.id}
                                items={columnTasks.map(t => t._id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className={`${column.color} rounded-b-lg p-3 min-h-[200px] flex-1 space-y-2`}>
                                    {columnTasks.map(task => (
                                        <TaskCard key={task._id} task={task} />
                                    ))}
                                    {columnTasks.length === 0 && (
                                        <div className="text-center text-gray-400 py-8">
                                            No tasks
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </div>
                    );
                })}
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div className="opacity-50">
                        <TaskCard task={activeTask} isDragging />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
