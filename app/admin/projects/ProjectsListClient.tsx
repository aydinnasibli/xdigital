// app/admin/projects/ProjectsListClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, CheckSquare, Square } from "lucide-react";
import { bulkUpdateProjects } from "@/app/actions/admin/projects";
import { ProjectStatus } from "@/models/Project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Project {
  _id: string;
  projectName: string;
  projectDescription: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  package: string;
  status: string;
  createdAt: string;
}

export default function ProjectsListClient({
  projects,
}: {
  projects: Project[];
}) {
  const router = useRouter();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");

  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map((p) => p._id));
    }
  };

  const handleSelectProject = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedProjects.length === 0) {
      toast.error("Please select at least one project");
      return;
    }

    if (!bulkStatus) {
      toast.error("Please select a status");
      return;
    }

    if (
      !confirm(
        `Update ${selectedProjects.length} project(s) to status "${bulkStatus}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await bulkUpdateProjects(selectedProjects, {
      status: bulkStatus,
    });

    if (result.success) {
      toast.success(
        `Updated ${selectedProjects.length} project(s) successfully`
      );
      setSelectedProjects([]);
      setBulkStatus("");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update projects");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedProjects.length > 0 && (
        <div className="bg-black border border-gray-400 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <p className="text-sm  font-medium text-gray-300">
              {selectedProjects.length} project(s) selected
            </p>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="border border-gray-400 hover:cursor-pointer rounded-lg px-3 py-1.5 text-sm bg-gray-800 "
            >
              <option value="">Change Status To...</option>
              <option value={ProjectStatus.PENDING}>Pending</option>
              <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
              <option value={ProjectStatus.REVIEW}>Review</option>
              <option value={ProjectStatus.COMPLETED}>Completed</option>
              <option value={ProjectStatus.ON_HOLD}>On Hold</option>
            </select>
            <button
              onClick={() => void handleBulkUpdate()}
              disabled={loading || !bulkStatus}
              className="px-4 py-1.5 bg-gray-800 border border-gray-400 rounded-lg hover:bg-gray-900 hover:cursor-pointer text-sm "
            >
              {loading ? "Updating..." : "Apply"}
            </button>
            <button
              onClick={() => setSelectedProjects([])}
              className="px-4 py-1.5 bg-gray-800 border border-gray-400 rounded-lg hover:bg-gray-900 hover:cursor-pointer text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <div className=" rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/60 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="text-gray-300  hover:text-gray-500"
                    title={
                      selectedProjects.length === projects.length
                        ? "Deselect all"
                        : "Select all"
                    }
                  >
                    {selectedProjects.length === projects.length ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-black/70 divide-y divide-gray-400">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-gray-400">No projects found</p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    onClick={() =>
                      router.push(`/admin/projects/${project._id}`)
                    }
                    key={project._id}
                    className={`hover:bg-gray-600/30 hover:cursor-pointer ${
                      selectedProjects.includes(project._id)
                        ? "bg-gray-900/80"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectProject(project._id)}
                        className="text-gray-300 hover:text-gray-500"
                      >
                        {selectedProjects.includes(project._id) ? (
                          <CheckSquare className="w-5 h-5 text-gray-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-200">
                          {project.projectName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-300">
                          {project.clientName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {project.clientEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatServiceType(project.serviceType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 capitalize">
                      {project.package}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-600 rounded-lg p-4 mt-10">
        <p className="text-sm text-gray-200">
          Showing <strong>{projects.length}</strong> projects
          {selectedProjects.length > 0 && (
            <span className="ml-2">
              · <strong>{selectedProjects.length}</strong> selected
            </span>
          )}
        </p>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { bg: "bg-white/80", text: "text-black/80", label: "Pending" },
    in_progress: {
      bg: "bg-white/80",
      text: "text-black/80",
      label: "In Progress",
    },
    review: { bg: "bg-white/80", text: "text-black/80", label: "Review" },
    completed: {
      bg: "bg-white/80",
      text: "text-black/80",
      label: "Completed",
    },
    on_hold: { bg: "bg-white/80", text: "text-black/80", label: "On Hold" },
    cancelled: { bg: "bg-white/80", text: "text-black/80", label: "Cancelled" },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

function formatServiceType(type: string): string {
  const types = {
    web_development: "Web Development",
    social_media_marketing: "Social Media Marketing",
    digital_solutions: "Digital Solutions",
  };
  return types[type as keyof typeof types] || type;
}
