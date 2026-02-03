"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

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

export default function BuiltInReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
        {searchQuery && (
          <div className="animate-fade-in">
            <span className="text-gray-400">Showing</span>
            <span className="ml-2 font-medium text-gray-900">{filteredReports.length}</span>
          </div>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
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
            className="w-full pl-11 pr-20 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all"
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

      {/* Reports List */}
      <div className="space-y-12">
        {Object.entries(groupedReports)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, categoryReports]) => (
            <section key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-gray-400">
                  {categoryIcons[category]}
                </span>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  {category}
                </h2>
                <span className="text-sm text-gray-400">{categoryReports.length}</span>
              </div>

              {/* Reports */}
              <div className="space-y-3">
                {categoryReports.map((report) => (
                  <article
                    key={report.title}
                    className="group bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Report Title */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                            <DocumentIcon />
                          </span>
                          <h3 className="font-medium text-gray-900 group-hover:text-black transition-colors">
                            {report.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2 pl-6.5">
                          {report.description}
                        </p>

                        {/* Report Variants */}
                        <div className="mt-3 flex items-center gap-1 text-sm pl-6.5 flex-wrap">
                          {report.tabNames.slice(0, 5).map((tab, index) => (
                            <span key={tab} className="flex items-center">
                              <Link
                                href={`/reporting/built-in-reports/${createReportSlug(report.title, tab)}`}
                                className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {tab}
                              </Link>
                              {index < Math.min(report.tabNames.length, 5) - 1 && (
                                <span className="text-gray-300 mx-2">·</span>
                              )}
                            </span>
                          ))}
                          {report.tabNames.length > 5 && (
                            <span className="text-gray-400 ml-1">
                              +{report.tabNames.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
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
