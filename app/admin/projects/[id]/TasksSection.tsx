// app/admin/projects/[id]/TasksSection.tsx
"use client";

import { useState } from "react";
import { createTask, updateTask, deleteTask } from "@/app/actions/tasks";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { TaskStatus, TaskPriority } from "@/models/Task";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: any;
  dueDate?: Date;
  estimatedHours?: number;
  tags?: string[];
}

type TaskFormState = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  estimatedHours: string;
};

export default function TasksSection({
  projectId,
  tasks,
}: {
  projectId: string;
  tasks: Task[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<TaskFormState>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    dueDate: "",
    estimatedHours: "",
  });
  const [editTaskData, setEditTaskData] = useState<TaskFormState>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    dueDate: "",
    estimatedHours: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    setLoading(true);
    const result = await createTask({
      projectId,
      title: newTask.title,
      description: newTask.description || undefined,
      priority: newTask.priority,
      status: newTask.status,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      estimatedHours: newTask.estimatedHours
        ? Number(newTask.estimatedHours)
        : undefined,
    });

    if (result.success) {
      setNewTask({
        title: "",
        description: "",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: "",
        estimatedHours: "",
      });
      setShowAddForm(false);
      router.refresh();
    } else {
      alert(result.error || "Failed to create task");
    }

    setLoading(false);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const result = await deleteTask(taskId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const result = await updateTask(taskId, { status });
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to update task");
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task._id);
    setEditTaskData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : "",
      estimatedHours: task.estimatedHours ? String(task.estimatedHours) : "",
    });
  };

  const handleEditCancel = () => {
    setEditingTask(null);
    setEditTaskData({
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: "",
      estimatedHours: "",
    });
  };

  const handleEditSave = async (taskId: string) => {
    if (!editTaskData.title.trim()) {
      alert("Title is required");
      return;
    }
    setEditLoadingId(taskId);
    const result = await updateTask(taskId, {
      title: editTaskData.title,
      description: editTaskData.description || undefined,
      priority: editTaskData.priority,
      status: editTaskData.status,
      dueDate: editTaskData.dueDate
        ? new Date(editTaskData.dueDate)
        : undefined,
      estimatedHours: editTaskData.estimatedHours
        ? Number(editTaskData.estimatedHours)
        : undefined,
    });

    if (result.success) {
      setEditingTask(null);
      router.refresh();
    } else {
      alert(result.error || "Failed to update task");
    }
    setEditLoadingId(null);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "bg-gray-100 text-gray-800";
      case TaskStatus.IN_PROGRESS:
        return "bg-gray-100 text-gray-800";

      case TaskStatus.IN_REVIEW:
        return "bg-gray-100 text-gray-800";

      case TaskStatus.COMPLETED:
        return "bg-gray-100 text-gray-800";

      case TaskStatus.BLOCKED:
        return "bg-gray-100 text-gray-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return "bg-gray-100 text-gray-600";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case TaskPriority.HIGH:
        return "bg-orange-100 text-orange-800";
      case TaskPriority.URGENT:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="border border-gray-400 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-400">
          Tasks ({tasks.length})
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 hover:cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form
          onSubmit={(e) => void handleAdd(e)}
          className="mb-6 p-4 rounded-lg space-y-3"
        >
          <input
            type="text"
            placeholder="Task title *"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            disabled={loading}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            rows={3}
            disabled={loading}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                disabled={loading}
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    status: e.target.value as TaskStatus,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                disabled={loading}
              >
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.IN_REVIEW}>In Review</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
                <option value={TaskStatus.BLOCKED}>Blocked</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Hours"
                value={newTask.estimatedHours}
                onChange={(e) =>
                  setNewTask({ ...newTask, estimatedHours: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:cursor-pointer transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:cursor-pointer transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tasks yet. Create one to get started.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="p-4 border border-gray-400 rounded-lg "
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingTask === task._id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTaskData.title}
                        onChange={(e) =>
                          setEditTaskData({
                            ...editTaskData,
                            title: e.target.value,
                          })
                        }
                        className="w-full border border-gray-400 rounded-lg px-3 py-2"
                      />
                      <textarea
                        value={editTaskData.description}
                        onChange={(e) =>
                          setEditTaskData({
                            ...editTaskData,
                            description: e.target.value,
                          })
                        }
                        className="w-full border border-gray-400 rounded-lg px-3 py-2"
                        rows={2}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={editTaskData.priority}
                          onChange={(e) =>
                            setEditTaskData({
                              ...editTaskData,
                              priority: e.target.value as TaskPriority,
                            })
                          }
                          className="w-full border border-gray-400 rounded-lg px-3 py-2"
                        >
                          <option value={TaskPriority.LOW}>Low</option>
                          <option value={TaskPriority.MEDIUM}>Medium</option>
                          <option value={TaskPriority.HIGH}>High</option>
                          <option value={TaskPriority.URGENT}>Urgent</option>
                        </select>
                        <select
                          value={editTaskData.status}
                          onChange={(e) =>
                            setEditTaskData({
                              ...editTaskData,
                              status: e.target.value as TaskStatus,
                            })
                          }
                          className="w-full border border-gray-400 rounded-lg px-3 py-2"
                        >
                          <option value={TaskStatus.TODO}>To Do</option>
                          <option value={TaskStatus.IN_PROGRESS}>
                            In Progress
                          </option>
                          <option value={TaskStatus.IN_REVIEW}>
                            In Review
                          </option>
                          <option value={TaskStatus.COMPLETED}>
                            Completed
                          </option>
                          <option value={TaskStatus.BLOCKED}>Blocked</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={editTaskData.dueDate}
                          onChange={(e) =>
                            setEditTaskData({
                              ...editTaskData,
                              dueDate: e.target.value,
                            })
                          }
                          className="w-full border border-gray-400 rounded-lg px-3 py-2"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={editTaskData.estimatedHours}
                          onChange={(e) =>
                            setEditTaskData({
                              ...editTaskData,
                              estimatedHours: e.target.value,
                            })
                          }
                          className="w-full border border-gray-400 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => void handleEditSave(task._id)}
                          disabled={editLoadingId === task._id}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 hover:cursor-pointer transition-all duration-300 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          {editLoadingId === task._id ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-gray-400 rounded hover:bg-gray-700 hover:cursor-pointer  transition-all duration-300"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-400">
                          {task.title}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-200 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {task.dueDate && (
                          <span>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.estimatedHours && (
                          <span>{task.estimatedHours}h estimated</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-start gap-2 ml-4">
                  {editingTask !== task._id && (
                    <>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          void handleStatusChange(
                            task._id,
                            e.target.value as TaskStatus
                          )
                        }
                        className={`px-3 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(
                          task.status
                        )}`}
                      >
                        <option value={TaskStatus.TODO}>To Do</option>
                        <option value={TaskStatus.IN_PROGRESS}>
                          In Progress
                        </option>
                        <option value={TaskStatus.IN_REVIEW}>In Review</option>
                        <option value={TaskStatus.COMPLETED}>Completed</option>
                        <option value={TaskStatus.BLOCKED}>Blocked</option>
                      </select>
                      <button
                        onClick={() => handleEditClick(task)}
                        className="p-1 text-gray-500 hover:bg-gray-600 hover:cursor-pointer transition-all duration-300 rounded"
                        title="Edit task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(task._id)}
                        className="p-1 text-red-500 hover:bg-red-400 hover:cursor-pointer transition-all duration-300 rounded"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {editingTask === task._id && (
                    <div className="flex items-center gap-2">
                      {/* while editing we still show delete if desired */}
                      <button
                        onClick={() => void handleDelete(task._id)}
                        className="p-1 text-red-500 hover:bg-red-400 hover:cursor-pointer transition-all duration-300 rounded"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
