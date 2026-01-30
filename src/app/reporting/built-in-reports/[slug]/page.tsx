"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

// Map of report slugs to their iframe URLs
// For now, all reports use the same embed URL - this can be expanded later
const reportEmbeds: Record<string, string> = {
  default: "https://workstream.embed-omniapp.co/dashboards/bec2cdb4",
};

// Helper to convert slug back to display name
function slugToDisplayName(slug: string): { reportName: string; tabName: string } {
  const parts = slug.split("--");
  const reportName = parts[0]?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Report";
  const tabName = parts[1]?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "View";
  return { reportName, tabName };
}

export default function ReportViewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { reportName, tabName } = slugToDisplayName(slug);
  const embedUrl = reportEmbeds[slug] || reportEmbeds.default;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/reporting/built-in-reports"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back to Reports</span>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{reportName}</h1>
              <p className="text-sm text-gray-500">{tabName} view</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(embedUrl, "_blank")}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in new tab
            </button>
          </div>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 bg-gray-50">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          title={`${reportName} - ${tabName}`}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
