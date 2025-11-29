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
        <div className="bg-gray-800 border border-gray-400 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <p className="text-sm  font-medium text-gray-300">
              {selectedProjects.length} project(s) selected
            </p>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="border border-gray-400 hover:cursor-pointer rounded-lg px-3 py-1.5 text-sm bg-gray-600 "
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
              className="px-4 py-1.5 bg-gray-600/75 border border-gray-400 rounded-lg hover:bg-gray-800 hover:cursor-pointer text-sm "
            >
              {loading ? "Updating..." : "Apply"}
            </button>
            <button
              onClick={() => setSelectedProjects([])}
              className="px-4 py-1.5 bg-gray-600/75 border border-gray-400 rounded-lg hover:bg-gray-800 hover:cursor-pointer text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-black/40 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="text-gray-500 hover:text-gray-700"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No projects found</p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project._id}
                    className={`hover:bg-gray-50 ${
                      selectedProjects.includes(project._id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectProject(project._id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedProjects.includes(project._id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {project.projectName}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {project.projectDescription}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          {project.clientName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {project.clientEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatServiceType(project.serviceType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {project.package}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/projects/${project._id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-800">
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
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    in_progress: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "In Progress",
    },
    review: { bg: "bg-purple-100", text: "text-purple-800", label: "Review" },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Completed",
    },
    on_hold: { bg: "bg-gray-100", text: "text-gray-800", label: "On Hold" },
    cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
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
