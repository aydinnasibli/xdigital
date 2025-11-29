// app/admin/projects/[id]/TimelineSection.tsx
"use client";

import { useState } from "react";
import { updateAdminProject } from "@/app/actions/admin/projects";
import { useRouter } from "next/navigation";
import { Calendar, Save } from "lucide-react";
import { toast } from "sonner";

export default function TimelineSection({
  projectId,
  timeline,
}: {
  projectId: string;
  timeline?: {
    startDate?: string;
    estimatedCompletion?: string;
    completedDate?: string;
  };
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timelineData, setTimelineData] = useState({
    startDate: timeline?.startDate
      ? new Date(timeline.startDate).toISOString().split("T")[0]
      : "",
    estimatedCompletion: timeline?.estimatedCompletion
      ? new Date(timeline.estimatedCompletion).toISOString().split("T")[0]
      : "",
    completedDate: timeline?.completedDate
      ? new Date(timeline.completedDate).toISOString().split("T")[0]
      : "",
  });

  const handleSave = async () => {
    setLoading(true);
    const result = await updateAdminProject(projectId, {
      timeline: {
        startDate: timelineData.startDate
          ? new Date(timelineData.startDate)
          : undefined,
        estimatedCompletion: timelineData.estimatedCompletion
          ? new Date(timelineData.estimatedCompletion)
          : undefined,
        completedDate: timelineData.completedDate
          ? new Date(timelineData.completedDate)
          : undefined,
      },
    });

    if (result.success) {
      toast.success("Timeline updated successfully");
      setIsEditing(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update timeline");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-lg shadow p-6 border border-gray-400">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-500 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Project Timeline
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:cursor-pointer transition-all duration-300"
          >
            Edit Timeline
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setTimelineData({
                  startDate: timeline?.startDate
                    ? new Date(timeline.startDate).toISOString().split("T")[0]
                    : "",
                  estimatedCompletion: timeline?.estimatedCompletion
                    ? new Date(timeline.estimatedCompletion)
                        .toISOString()
                        .split("T")[0]
                    : "",
                  completedDate: timeline?.completedDate
                    ? new Date(timeline.completedDate)
                        .toISOString()
                        .split("T")[0]
                    : "",
                });
              }}
              className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-700 hover:cursor-pointer transition-all duration-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onSubmit={() => void handleSave()}
              disabled={loading}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Date
          </label>
          {isEditing ? (
            <input
              type="date"
              value={timelineData.startDate}
              onChange={(e) =>
                setTimelineData({ ...timelineData, startDate: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              disabled={loading}
            />
          ) : (
            <div className="font-medium text-lg">
              {timeline?.startDate ? (
                new Date(timeline.startDate).toLocaleDateString()
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Estimated Completion
          </label>
          {isEditing ? (
            <input
              type="date"
              value={timelineData.estimatedCompletion}
              onChange={(e) =>
                setTimelineData({
                  ...timelineData,
                  estimatedCompletion: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              disabled={loading}
            />
          ) : (
            <div className="font-medium text-lg">
              {timeline?.estimatedCompletion ? (
                new Date(timeline.estimatedCompletion).toLocaleDateString()
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Completed Date
          </label>
          {isEditing ? (
            <input
              type="date"
              value={timelineData.completedDate}
              onChange={(e) =>
                setTimelineData({
                  ...timelineData,
                  completedDate: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              disabled={loading}
            />
          ) : (
            <div className="font-medium text-lg">
              {timeline?.completedDate ? (
                <span className="text-green-600">
                  {new Date(timeline.completedDate).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </div>
          )}
        </div>
      </div>

      {!isEditing && (
        <div className="mt-4 p-4 bg-gray-200 border border-gray-400 rounded-lg">
          <p className="text-sm text-gray-800">
            💡 Set the project timeline to help track progress. Clients can view
            this information in their dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
