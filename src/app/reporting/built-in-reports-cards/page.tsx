"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

// Helper to create URL-friendly slugs
function createReportSlug(reportTitle: string, tabName: string): string {
  const reportSlug = reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const tabSlug = tabName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${reportSlug}--${tabSlug}`;
}

interface Report {
  title: string;
  tabCount: number;
  tabNames: string[];
  description: string;
  category: string;
}

const reports: Report[] = [
  {
    title: "401(k) Report",
    tabCount: 2,
    tabNames: ["Table", "EIN/Location"],
    description: "This report contains employee demographic, employment, payroll, and retirement contribution details at the employee level with one row per employee record per payday.",
    category: "Benefits",
  },
  {
    title: "All Workstream Usage Report",
    tabCount: 1,
    tabNames: ["Employees"],
    description: "Shows which employees have set up and logged into their mobile accounts - works for all customers now (not just payroll).",
    category: "Usage",
  },
  {
    title: "Cash Requirement Report",
    tabCount: 4,
    tabNames: ["Payroll Items", "Collections", "Payrolls", "Refunds"],
    description: "Summarizes the cash needed for each payroll run with direct-deposit information, employer taxes, employee taxes, and the overall required total.",
    category: "Payroll",
  },
  {
    title: "Employee Offboarding Report",
    tabCount: 2,
    tabNames: ["Lapsed Payments", "Started Not Paid"],
    description: "Shows Lapsed Payments (employees unpaid for over one month) and Started, Not Paid (employees hired last year who still haven't received a payment).",
    category: "Employee",
  },
  {
    title: "Employees Report",
    tabCount: 6,
    tabNames: ["Table", "Location", "Primary Job Title", "Work Anniversary", "Birthday", "Blocking Steps"],
    description: "Provides a roster of active employees with their status, personal details, job assignment, workplace location, tenure, and payroll setup information.",
    category: "Employee",
  },
  {
    title: "Hours Report",
    tabCount: 5,
    tabNames: ["Month", "3M Lookback", "6M Lookback", "9M Lookback", "12M Lookback"],
    description: "Summarize total hours worked by each employee over a specified period.",
    category: "Time & Attendance",
  },
  {
    title: "January 2026 Min Wage Increase Report",
    tabCount: 1,
    tabNames: ["Bulk Upload Format"],
    description: "This report checks all current hourly earning rates (not salaried) that are either already below the current state minimum wage, or will be below the state minimum wage after January 1st, 2026.",
    category: "Compliance",
  },
  {
    title: "Live Jobs and Earnings Report",
    tabCount: 4,
    tabNames: ["Workers Earnings", "Worker Job Summary", "Job Summary", "Earning Name Summary"],
    description: "Comprehensive view of live jobs and earnings data across your organization.",
    category: "Payroll",
  },
  {
    title: "Multiple Worksite Report",
    tabCount: 2,
    tabNames: ["State Totals", "Location Totals"],
    description: "Shows headcount snapshots on the 11th day of each month in a selected quarter, viewable either by individual location or rolled up to the state level.",
    category: "Compliance",
  },
  {
    title: "New Hires and Terminations Report",
    tabCount: 2,
    tabNames: ["New Hires", "Terminations"],
    description: "A specialized report derived from the employee data model to track new hires and terminations across your organization with key dates and demographic details.",
    category: "Employee",
  },
  {
    title: "Paper Check Report",
    tabCount: 1,
    tabNames: ["Table"],
    description: "Lists all employees on the payroll that should be paid via paper check.",
    category: "Payroll",
  },
  {
    title: "Payrate History Report",
    tabCount: 1,
    tabNames: ["Table"],
    description: "Track employee compensation changes over time with detailed earning rate history, previous rates, percentage increases, and payroll usage dates.",
    category: "Compensation",
  },
  {
    title: "Payroll Accrual Report",
    tabCount: 1,
    tabNames: ["Table"],
    description: "This report will only show data for customers that have active time off policies.",
    category: "Payroll",
  },
  {
    title: "Payroll Garnishments Report",
    tabCount: 1,
    tabNames: ["Table"],
    description: "Lists each employee's garnishment and child support deduction details alongside their on-platform, off-platform, and total deduction amounts by pay period.",
    category: "Payroll",
  },
  {
    title: "Payroll Journal Report",
    tabCount: 5,
    tabNames: ["Table", "Line Item", "Line Item & Location", "Line Item & Job Title", "Line Item Location & Job Title"],
    description: "Detailed record of all payroll transactions organized by payday, including employee earnings, deductions, taxes, benefits, and other payroll-related expenses.",
    category: "Payroll",
  },
  {
    title: "Payroll Run Status Report",
    tabCount: 3,
    tabNames: ["By Payroll Object", "By Payroll Item", "Table"],
    description: "Lists recent payroll runs and shows for each payment whether it is Draft, Paid, Partially Paid, or Failed.",
    category: "Payroll",
  },
  {
    title: "Payroll Summary Report",
    tabCount: 7,
    tabNames: ["Table", "Employee", "Location", "Job Title", "Earnings Rate", "Line Item", "Full/Part Time"],
    description: "Summarize total payroll costs (earnings, deductions, taxes, benefits) for a given period.",
    category: "Payroll",
  },
  {
    title: "PTO",
    tabCount: 5,
    tabNames: ["Balance Table", "Balances by Employee", "Balance History", "Policies", "Policies by Employee"],
    description: "Shows each employee's current paid-time-off balances (vacation, sick leave) and the related policy balance histories and details.",
    category: "Time & Attendance",
  },
  {
    title: "PTO Audit Summary",
    tabCount: 1,
    tabNames: ["Summary Totals"],
    description: "This report provides a comprehensive view of employee paid time off (PTO) and sick leave activity, combining time-off requests with actual hours paid through payroll.",
    category: "Time & Attendance",
  },
  {
    title: "W2 Paper Election Employees YTD",
    tabCount: 1,
    tabNames: ["Table"],
    description: "Provides a list of employees who did not consent to electronic W2s and will need paper W2s mailed out.",
    category: "Tax",
  },
  {
    title: "Wages Report",
    tabCount: 1,
    tabNames: ["Employee"],
    description: "Comprehensive wage data broken down by employee for payroll analysis and reporting.",
    category: "Payroll",
  },
  {
    title: "Worker Compensation Report",
    tabCount: 4,
    tabNames: ["Table", "By State", "By Location/Comp Code", "By EIN/EarningType"],
    description: "Provides year-to-date and prior 12-month wage aggregations broken down by earning type for workers' compensation reporting.",
    category: "Compliance",
  },
  {
    title: "Worker Compensation Report - Flexible Dates",
    tabCount: 4,
    tabNames: ["Table", "By State", "By Location/Comp Code", "By EIN/Comp Code"],
    description: "Provides detailed workers' compensation wage breakdowns per employee per payroll period with flexible date filtering.",
    category: "Compliance",
  },
  {
    title: "Workstream Usage Report",
    tabCount: 1,
    tabNames: ["Employee"],
    description: "Shows which payroll employees have set up and logged into their mobile accounts.",
    category: "Usage",
  },
];

const categories = Array.from(new Set(reports.map((r) => r.category))).sort();

// Category icons
const categoryIcons: Record<string, React.ReactNode> = {
  "Benefits": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  "Compensation": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "Compliance": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  "Employee": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  "Payroll": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  "Tax": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
    </svg>
  ),
  "Time & Attendance": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "Usage": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg 
    className="w-5 h-5" 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={1.5} 
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
    />
  </svg>
);

// Category Card Component with Dropdown
function CategoryCard({ 
  category, 
  reports,
  isStarred,
  onToggleStar,
  starredReports,
  onToggleReportStar
}: { 
  category: string; 
  reports: Report[];
  isStarred: boolean;
  onToggleStar: () => void;
  starredReports: Set<string>;
  onToggleReportStar: (reportTitle: string) => void;
}) {

  return (
    <div className="w-full">
      {/* Horizontal Card */}
      <div className="relative bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        
        {/* Card Content */}
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            {/* Left: Category Info */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-workstream-blue to-workstream-blue-dark rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                {categoryIcons[category]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-900">{category}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar();
                    }}
                    className={`p-1 rounded-full transition-colors ${
                      isStarred 
                        ? "text-yellow-500 hover:text-yellow-600" 
                        : "text-gray-300 hover:text-yellow-500"
                    }`}
                    title={isStarred ? "Remove from favorites" : "Add to favorites"}
                  >
                    <StarIcon filled={isStarred} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">{reports.length} reports available</p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-workstream-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Reports List - Always visible */}
      <div className="mt-3 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 space-y-3">
            {reports.map((report) => {
              const isReportStarred = starredReports.has(report.title);
              return (
                <div
                  key={report.title}
                  className="group/item p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-gray-400 mt-1 flex-shrink-0">
                      <DocumentIcon />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {report.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleReportStar(report.title);
                          }}
                          className={`p-0.5 rounded transition-colors ${
                            isReportStarred 
                              ? "text-yellow-500 hover:text-yellow-600" 
                              : "text-gray-300 hover:text-yellow-500"
                          }`}
                          title={isReportStarred ? "Remove from favorites" : "Add to favorites"}
                        >
                          <StarIcon filled={isReportStarred} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                        {report.description}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Available Views:</p>
                        <div className="flex flex-wrap gap-2">
                          {report.tabNames.map((tab) => (
                            <Link
                              key={tab}
                              href={`/reporting/built-in-reports/${createReportSlug(report.title, tab)}`}
                              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-gray-200 rounded-full transition-all whitespace-nowrap"
                            >
                              {tab}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </div>
  );
}

export default function BuiltInReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [starredCategories, setStarredCategories] = useState<Set<string>>(new Set());
  const [starredReports, setStarredReports] = useState<Set<string>>(new Set());

  // Load starred items from localStorage
  useEffect(() => {
    const savedCategories = localStorage.getItem("starredCategories");
    const savedReports = localStorage.getItem("starredReports");
    if (savedCategories) {
      setStarredCategories(new Set(JSON.parse(savedCategories)));
    }
    if (savedReports) {
      setStarredReports(new Set(JSON.parse(savedReports)));
    }
  }, []);

  // Save starred categories to localStorage
  const toggleCategoryStar = (category: string) => {
    setStarredCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      localStorage.setItem("starredCategories", JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Save starred reports to localStorage
  const toggleReportStar = (reportTitle: string) => {
    setStarredReports((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportTitle)) {
        newSet.delete(reportTitle);
      } else {
        newSet.add(reportTitle);
      }
      localStorage.setItem("starredReports", JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };


  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("report-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        searchQuery === "" ||
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.tabNames.some((tab) => tab.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === null || report.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const groupedReports = useMemo(() => {
    const grouped: Record<string, Report[]> = {};
    filteredReports.forEach((report) => {
      if (!grouped[report.category]) {
        grouped[report.category] = [];
      }
      grouped[report.category].push(report);
    });
    return grouped;
  }, [filteredReports]);

  // Sort categories: starred first, then alphabetically
  const sortedCategories = useMemo(() => {
    return Object.entries(groupedReports).sort(([catA], [catB]) => {
      const aStarred = starredCategories.has(catA);
      const bStarred = starredCategories.has(catB);
      if (aStarred && !bStarred) return -1;
      if (!aStarred && bStarred) return 1;
      return catA.localeCompare(catB);
    });
  }, [groupedReports, starredCategories]);


  return (
    <div className="p-8 lg:p-12 min-h-full max-w-6xl">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Built-in Reports</h1>
        <p className="mt-1 text-gray-500">Browse and search pre-configured reports</p>
      </div>

      {/* Stats Summary */}
      <div className="flex gap-8 mb-8 text-sm">
        <div>
          <span className="text-gray-400">Total reports</span>
          <span className="ml-2 font-medium text-gray-900">{reports.length}</span>
        </div>
        <div>
          <span className="text-gray-400">Categories</span>
          <span className="ml-2 font-medium text-gray-900">{categories.length}</span>
        </div>
        <div>
          <span className="text-gray-400">Starred</span>
          <span className="ml-2 font-medium text-yellow-600">{starredCategories.size + starredReports.size}</span>
        </div>
        {searchQuery && (
          <div className="animate-fade-in">
            <span className="text-gray-400">Showing</span>
            <span className="ml-2 font-medium text-gray-900">{filteredReports.length}</span>
          </div>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 mb-10">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              id="report-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-11 pr-28 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-workstream-blue focus:border-transparent transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200 pointer-events-none">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-workstream-blue focus:border-transparent cursor-pointer transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* Starred Reports Quick Access */}
      {starredReports.size > 0 && !searchQuery && !selectedCategory && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-500">
              <StarIcon filled={true} />
            </span>
            <h2 className="text-lg font-semibold text-gray-900">Favorite Reports</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from(starredReports).map((reportTitle) => {
              const report = reports.find((r) => r.title === reportTitle);
              if (!report) return null;
              return (
                <div
                  key={reportTitle}
                  className="p-4 bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0">
                      <DocumentIcon />
                    </span>
                    <h4 className="text-sm font-medium text-gray-900 flex-1">
                      {report.title}
                    </h4>
                    <button
                      onClick={() => toggleReportStar(reportTitle)}
                      className="text-yellow-500 hover:text-yellow-600 transition-colors"
                    >
                      <StarIcon filled={true} />
                    </button>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    <p className="text-xs font-medium text-gray-600">Quick Access:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.tabNames.slice(0, 3).map((tab) => (
                        <Link
                          key={tab}
                          href={`/reporting/built-in-reports/${createReportSlug(report.title, tab)}`}
                          className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-workstream-blue bg-white hover:bg-workstream-blue hover:text-white rounded-md transition-all border border-workstream-blue/30 hover:border-workstream-blue hover:shadow-sm"
                        >
                          <span>{tab}</span>
                          <svg className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                      {report.tabNames.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500">
                          +{report.tabNames.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Cards - Vertical Stack */}
      <div className="space-y-4">
        {sortedCategories.map(([category, categoryReports]) => (
          <CategoryCard
            key={category}
            category={category}
            reports={categoryReports}
            isStarred={starredCategories.has(category)}
            onToggleStar={() => toggleCategoryStar(category)}
            starredReports={starredReports}
            onToggleReportStar={toggleReportStar}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="mt-16 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <SearchIcon />
          </div>
          <h3 className="mt-4 text-base font-medium text-gray-900">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory(null);
            }}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
