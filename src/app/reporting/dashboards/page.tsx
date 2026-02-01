"use client";

import { useState } from "react";
import { Users, Banknote, ClipboardCheck, Zap } from "lucide-react";

interface Dashboard {
  id: string;
  name: string;
  description: string;
  icon: typeof Users;
  embedUrl: string;
}

const DASHBOARDS: Dashboard[] = [
  {
    id: "hiring",
    name: "Hiring",
    description: "Track applicants, interviews, and hiring metrics",
    icon: Users,
    embedUrl: "https://workstream.embed-omniapp.co/dashboards/bec2cdb4",
  },
  {
    id: "payroll",
    name: "Payroll",
    description: "Monitor payroll processing and payment status",
    icon: Banknote,
    embedUrl: "https://workstream.embed-omniapp.co/dashboards/bec2cdb4",
  },
  {
    id: "onboarding",
    name: "Onboarding",
    description: "View onboarding progress and completion rates",
    icon: ClipboardCheck,
    embedUrl: "https://workstream.embed-omniapp.co/dashboards/bec2cdb4",
  },
  {
    id: "workstreamiq",
    name: "WorkstreamIQ",
    description: "AI-powered insights and analytics",
    icon: Zap,
    embedUrl: "https://workstream.embed-omniapp.co/dashboards/bec2cdb4",
  },
];

export default function Dashboards() {
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard>(DASHBOARDS[0]);

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
            {DASHBOARDS.map((dashboard) => {
              const Icon = dashboard.icon;
              const isActive = selectedDashboard.id === dashboard.id;
              
              return (
                <button
                  key={dashboard.id}
                  onClick={() => setSelectedDashboard(dashboard)}
                  className={`group relative flex items-center gap-2 px-3 py-3 rounded-t-lg transition-all duration-200 flex-1 min-w-0 ${
                    isActive
                      ? "bg-gray-50 text-workstream-blue"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-workstream-blue text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Text */}
                  <div className="text-left flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${
                      isActive ? "text-workstream-blue" : "text-gray-900"
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
                      isActive
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
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-workstream-blue" />
                  )}
                </button>
              );
            })}
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
