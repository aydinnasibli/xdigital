// app/admin/projects/page.tsx
import { getAllProjects } from "@/app/actions/admin/projects";
import { ProjectStatus, ServiceType } from "@/models/Project";
import ProjectsListClient from "./ProjectsListClient";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    serviceType?: string;
    search?: string;
  }>;
}

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const result = await getAllProjects({
    status: params.status,
    serviceType: params.serviceType,
    search: params.search,
  });

  const projects = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-700">All Projects</h1>
          <p className="text-gray-400 mt-2">
            Manage all client projects across xDigital
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              defaultValue={params.status || ""}
            >
              <option value="">All Statuses</option>
              <option value={ProjectStatus.PENDING}>Pending</option>
              <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
              <option value={ProjectStatus.REVIEW}>Review</option>
              <option value={ProjectStatus.COMPLETED}>Completed</option>
              <option value={ProjectStatus.ON_HOLD}>On Hold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Service Type
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              defaultValue={params.serviceType || ""}
            >
              <option value="">All Services</option>
              <option value={ServiceType.WEB_DEVELOPMENT}>
                Web Development
              </option>
              <option value={ServiceType.SMM}>Social Media Marketing</option>
              <option value={ServiceType.DIGITAL_SOLUTIONS}>
                Digital Solutions
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              defaultValue={params.search || ""}
            />
          </div>
        </div>
      </div>

      {/* Projects List with Bulk Operations */}
      <ProjectsListClient projects={projects} />
    </div>
  );
}
