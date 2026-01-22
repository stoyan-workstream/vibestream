"use client";

import { useState } from "react";
import { Bell, HelpCircle, Sparkles, Zap, Pencil, Info, MessageSquare, Briefcase, ArrowRight, Pin, ShieldAlert, DollarSign, AlertTriangle } from "lucide-react";
import Link from "next/link";

// Get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Get current date formatted
const getCurrentDate = () => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
};

// Get week range
const getWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return `${formatDate(startOfWeek)} – ${formatDate(endOfWeek)}`;
};

// Sample data
const complianceStats = {
  issues: { total: 17, change: 3 },
  potentialFines: { total: 19487, change: 4287 },
  categories: [
    { name: "Ready to Work", count: 11 },
    { name: "Time & Pay", count: 6 },
  ],
};

const complianceActionItems = [
  {
    id: "c1",
    icon: AlertTriangle,
    message: "6 Time & Pay issues account for 92% of potential fines",
    action: "Review Now",
    urgent: true,
  },
  {
    id: "c2",
    icon: Info,
    message: "5 I-9 forms are past their completion deadline",
    action: "Complete I-9s",
    urgent: false,
  },
];

const hiringStats = {
  applications: { total: 12, today: 3 },
  interviews: { total: 5, today: 2 },
  newHires: { total: 2, today: 0 },
};

const actionItems = [
  {
    id: "1",
    icon: Info,
    message: "Set your scheduling availability to ensure interviews can be set up",
    action: "Add Availability",
    pinnable: true,
  },
  {
    id: "2",
    icon: Info,
    message: "Some of your managers have not set their interview availability yet",
    action: "Set Availability",
    pinnable: true,
  },
  {
    id: "3",
    icon: MessageSquare,
    message: "You have 647 unread message(s) from active applicants",
    action: "Read Messages",
    pinnable: true,
  },
  {
    id: "4",
    icon: Briefcase,
    message: "Improve your job posting visibility",
    action: "Review Job Postings",
    pinnable: true,
  },
];

const priorities = [
  { id: "1", title: "Review pending compliance issues", category: "Compliance", urgent: true },
  { id: "2", title: "Complete Q1 hiring plan", category: "Hiring", urgent: false },
];

export default function Home() {
  const [dateRange, setDateRange] = useState<"week" | "month">("week");
  const [pinnedPriorities, setPinnedPriorities] = useState<string[]>(["1", "2"]);

  const userName = "Stoyan";

  return (
    <div className="min-h-full bg-gradient-to-br from-amber-50/50 via-white to-teal-50/30">
      {/* Header */}
      <div className="px-8 lg:px-12 pt-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {getGreeting()}, {userName}
          </h1>
              <p className="text-gray-500 mt-0.5">Here&apos;s what your day looks like</p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-medium">
              ST
            </div>
          </div>
        </div>

        {/* Tab and Date */}
        <div className="flex items-center justify-between mt-8 border-b border-gray-200">
          <div className="flex">
            <button className="px-1 pb-3 text-sm font-medium text-gray-900 border-b-2 border-gray-900">
              My overview
            </button>
          </div>
          <p className="text-sm text-gray-500 pb-3">{getCurrentDate()}</p>
        </div>

        {/* Date Range Pills */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setDateRange("week")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              dateRange === "week"
                ? "bg-teal-50 text-teal-700 border border-teal-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            This week: <span className="text-teal-600">{getWeekRange()}</span>
          </button>
          <button
            onClick={() => setDateRange("month")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              dateRange === "month"
                ? "bg-teal-50 text-teal-700 border border-teal-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            This month
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 lg:px-12 py-8">
        <div className="flex gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            {/* Priorities Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-gray-400" />
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priorities</h2>
              </div>

              {pinnedPriorities.length > 0 ? (
                <div className="space-y-3">
                  {priorities
                    .filter(p => pinnedPriorities.includes(p.id))
                    .map((priority) => (
                      <div
                        key={priority.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          {priority.urgent && (
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                          )}
                          <span className="text-sm text-gray-700">{priority.title}</span>
                          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                            {priority.category}
                          </span>
                        </div>
                        <button
                          onClick={() => setPinnedPriorities(prev => prev.filter(id => id !== priority.id))}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-400">No priorities pinned.</p>
                </div>
              )}
            </div>

            {/* Compliance Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compliance</h2>
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    {complianceStats.issues.total} issues
                  </span>
                </div>
                <Link href="/compliance" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  View all →
                </Link>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">Open Issues</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-semibold text-gray-900">{complianceStats.issues.total}</span>
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      +{complianceStats.issues.change} this week
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">Potential Fines</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-semibold text-gray-900">${complianceStats.potentialFines.total.toLocaleString()}</span>
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      +${complianceStats.potentialFines.change.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="flex gap-4 mb-5">
                {complianceStats.categories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-sm text-gray-600">{cat.name}</span>
                    <span className="text-sm font-medium text-gray-900">{cat.count}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-5 space-y-3">
                {complianceActionItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.urgent ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className="text-sm text-gray-700">{item.message}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/compliance"
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          item.urgent 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-teal-500 hover:bg-teal-600 text-white'
                        }`}
                      >
                        {item.action}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hiring Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">Hiring</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Applications</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-semibold text-gray-900">{hiringStats.applications.total}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      {hiringStats.applications.today} today <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Interviews</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-semibold text-gray-900">{hiringStats.interviews.total}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      {hiringStats.interviews.today} today <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">New hires</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-semibold text-gray-900">{hiringStats.newHires.total}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      {hiringStats.newHires.today} today <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-5 space-y-3">
                {actionItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{item.message}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors">
                        {item.action}
                      </button>
                      {item.pinnable && (
                        <button className="text-gray-300 hover:text-gray-500 transition-colors">
                          <Sparkles className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-80 flex-shrink-0">
            {/* Quick Links Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gray-400" />
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Links</h2>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-400">No links added yet. Get started!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
