// app/admin/projects/[id]/UpdateStatusForm.tsx
"use client";

import { useState } from "react";
import { updateProjectStatus } from "@/app/actions/admin/projects";
import { ProjectStatus } from "@/models/Project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UpdateStatusForm({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProjectStatus(projectId, status);

    if (result.success) {
      toast.success("Project status updated successfully!");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update status");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Project Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
          disabled={loading}
        >
          <option value={ProjectStatus.PENDING}>Pending</option>
          <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
          <option value={ProjectStatus.REVIEW}>Review</option>
          <option value={ProjectStatus.COMPLETED}>Completed</option>
          <option value={ProjectStatus.ON_HOLD}>On Hold</option>
          <option value={ProjectStatus.CANCELLED}>Cancelled</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || status === currentStatus}
        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Updating..." : "Update Status"}
      </button>
    </form>
  );
}
