// app/admin/projects/[id]/DeploymentSection.tsx
"use client";

import { useState } from "react";
import { updateProjectDeployment } from "@/app/actions/projects";
import { ExternalLink, Globe, Check, X } from "lucide-react";

interface DeploymentSectionProps {
  projectId: string;
  deploymentUrl?: string;
  vercelProjectId?: string;
  googleAnalyticsPropertyId?: string;
}

export default function DeploymentSection({
  projectId,
  deploymentUrl: initialDeploymentUrl,
  vercelProjectId: initialVercelProjectId,
  googleAnalyticsPropertyId: initialGAPropertyId,
}: DeploymentSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    deploymentUrl: initialDeploymentUrl || "",
    vercelProjectId: initialVercelProjectId || "",
    googleAnalyticsPropertyId: initialGAPropertyId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await updateProjectDeployment(projectId, formData);

      if (response.success) {
        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        setError(response.error || "Failed to update deployment information");
      }
    } catch (err) {
      setError("An error occurred while updating deployment information");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      deploymentUrl: initialDeploymentUrl || "",
      vercelProjectId: initialVercelProjectId || "",
      googleAnalyticsPropertyId: initialGAPropertyId || "",
    });
    setIsEditing(false);
    setError("");
  };

  return (
    <div className=" rounded-lg shadow p-6 border border-gray-400">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-500 flex items-center gap-2">
          <Globe size={24} className="text-gray-500" />
          Deployment Information
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:cursor-pointer transition-all duration-300"
          >
            {initialDeploymentUrl ? "Update" : "Add Deployment"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <X size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check size={18} />
          Deployment information updated successfully!
        </div>
      )}

      {isEditing ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL *
            </label>
            <input
              type="url"
              required
              value={formData.deploymentUrl}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deploymentUrl: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://client-website.vercel.app"
            />
            <p className="text-xs text-gray-500 mt-1">
              The live URL where the client&apos;s website is deployed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vercel Project ID (Optional)
            </label>
            <input
              type="text"
              value={formData.vercelProjectId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  vercelProjectId: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="prj_..."
            />
            <p className="text-xs text-gray-500 mt-1">
              For tracking and managing the Vercel project
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Analytics Property ID (Optional)
            </label>
            <input
              type="text"
              value={formData.googleAnalyticsPropertyId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  googleAnalyticsPropertyId: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used to fetch analytics data for the client dashboard
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer transition-all duration-300"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-400 text-gray-300 rounded-lg hover:bg-gray-800 hover:cursor-pointer transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {initialDeploymentUrl ? (
            <>
              <div>
                <p className="text-sm text-gray-600">Website URL</p>
                <a
                  href={initialDeploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2 mt-1"
                >
                  {initialDeploymentUrl}
                  <ExternalLink size={16} />
                </a>
              </div>

              {initialVercelProjectId && (
                <div>
                  <p className="text-sm text-gray-600">Vercel Project ID</p>
                  <p className="text-gray-900 font-mono text-sm mt-1">
                    {initialVercelProjectId}
                  </p>
                </div>
              )}

              {initialGAPropertyId && (
                <div>
                  <p className="text-sm text-gray-600">
                    Google Analytics Property ID
                  </p>
                  <p className="text-gray-900 font-mono text-sm mt-1">
                    {initialGAPropertyId}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Globe size={48} className="mx-auto mb-3 text-gray-400" />
              <p>No deployment information yet</p>
              <p className="text-sm mt-1">
                Add the website URL after deploying to Vercel
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
