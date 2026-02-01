"use client";

import { useState } from "react";

// Dashboard categories with their embed URLs
interface Dashboard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  embedUrl: string;
  color: string;
}

const dashboards: Dashboard[] = [
  {
    id: "hiring",
    name: "Hiring",
    description: "Track applicants, interviews, and hiring metrics",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    embedUrl: "https://workstream.embed-omniapp.co/dashboards/bec2cdb4",
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "payroll",
    name: "Payroll",
    description: "Monitor payroll processing and payment status",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    embedUrl: "https://workstream.embed-omniapp.co/dashboards/bec2cdb4",
    color: "from-green-500 to-green-600"
  },
  {
    id: "onboarding",
    name: "Onboarding",
    description: "View onboarding progress and completion rates",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    embedUrl: "https://workstream.embed-omniapp.co/dashboards/bec2cdb4",
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "workstreamiq",
    name: "WorkstreamIQ",
    description: "AI-powered insights and analytics",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    embedUrl: "https://workstream.embed-omniapp.co/dashboards/bec2cdb4",
    color: "from-orange-500 to-orange-600"
  }
];

export default function Dashboards() {
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard>(dashboards[0]);

  return (
    <div className="h-full flex flex-col">
      {/* Unified Header with Tabs */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-8 pt-6 pb-0">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboards</h1>
            <p className="mt-1 text-sm text-gray-500">Real-time insights and analytics across your organization</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 -mb-px">
            {dashboards.map((dashboard) => (
              <button
                key={dashboard.id}
                onClick={() => setSelectedDashboard(dashboard)}
                className={`group relative flex items-center gap-2 px-3 py-3 rounded-t-lg transition-all duration-200 flex-1 min-w-0 ${
                  selectedDashboard.id === dashboard.id
                    ? "bg-gray-50 text-workstream-blue"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    selectedDashboard.id === dashboard.id
                      ? "bg-workstream-blue text-white shadow-sm"
                      : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                  }`}
                >
                  {dashboard.icon}
                </div>
                
                {/* Text */}
                <div className="text-left flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${
                    selectedDashboard.id === dashboard.id ? "text-workstream-blue" : "text-gray-900"
                  }`}>
                    {dashboard.name}
                  </div>
                  <div className="text-xs text-gray-500 leading-tight">
                    {dashboard.description}
                  </div>
                </div>

                {/* Open in New Tab Icon */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(dashboard.embedUrl, "_blank");
                  }}
                  className={`flex-shrink-0 p-1 rounded transition-all opacity-0 group-hover:opacity-100 ${
                    selectedDashboard.id === dashboard.id
                      ? "text-workstream-blue hover:bg-white/50"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title={`Open ${dashboard.name} in new tab`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>

                {/* Active indicator bar */}
                {selectedDashboard.id === dashboard.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-workstream-blue" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Content - Seamless Integration */}
      <div className="flex-1 bg-gray-50 overflow-hidden">
        {/* Iframe Container - Full bleed */}
        <iframe
          key={selectedDashboard.id}
          src={selectedDashboard.embedUrl}
          className="w-full h-full border-0"
          title={`${selectedDashboard.name} Dashboard`}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
