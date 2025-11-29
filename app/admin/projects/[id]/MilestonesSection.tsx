// app/admin/projects/[id]/MilestonesSection.tsx
"use client";

import { useState } from "react";
import { addMilestone, updateMilestone } from "@/app/actions/admin/projects";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, Plus } from "lucide-react";
import { toast } from "sonner";

export default function MilestonesSection({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: any[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.title.trim()) return;

    setLoading(true);
    const result = await addMilestone(projectId, {
      title: newMilestone.title,
      description: newMilestone.description,
      dueDate: newMilestone.dueDate
        ? new Date(newMilestone.dueDate)
        : undefined,
    });

    if (result.success) {
      toast.success("Milestone added successfully");
      setNewMilestone({ title: "", description: "", dueDate: "" });
      setShowAddForm(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to add milestone");
    }

    setLoading(false);
  };

  const handleToggle = async (index: number, completed: boolean) => {
    const result = await updateMilestone(projectId, index, { completed });

    if (result.success) {
      toast.success(
        completed
          ? "Milestone marked as completed! Client notified via email"
          : "Milestone updated"
      );
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update milestone");
    }
  };

  return (
    <div className="border border-gray-400 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-500">
          Milestones ({milestones.length})
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gray-600 text-white hover:cursor-pointer rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </button>
      </div>

      {/* Add Milestone Form */}
      {showAddForm && (
        <form
          onSubmit={(e) => void handleAdd(e)}
          className="mb-6 p-4  rounded-lg space-y-3"
        >
          <input
            type="text"
            placeholder="Milestone title"
            value={newMilestone.title}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, title: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            disabled={loading}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={newMilestone.description}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            rows={3}
            disabled={loading}
          />
          <input
            type="date"
            value={newMilestone.dueDate}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, dueDate: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            disabled={loading}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:cursor-pointer transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add"}
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

      {/* Milestones List */}
      <div className="space-y-3">
        {milestones.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No milestones yet</p>
        ) : (
          milestones.map((milestone, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${
                milestone.completed
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => void handleToggle(index, !milestone.completed)}
                  className="mt-1"
                >
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <h4
                    className={`font-medium ${
                      milestone.completed
                        ? "text-green-900 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {milestone.title}
                  </h4>
                  {milestone.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {milestone.description}
                    </p>
                  )}
                  {milestone.dueDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  {milestone.completed && milestone.completedDate && (
                    <p className="text-xs text-green-600 mt-1">
                      Completed:{" "}
                      {new Date(milestone.completedDate).toLocaleDateString()}
                    </p>
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
