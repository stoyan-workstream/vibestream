"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Star, ChevronDown, X, ChevronLeft, ChevronRight, Award, DollarSign, FileCheck, Users, UserPlus, Wallet, Calculator, Clock, BarChart3 } from "lucide-react";

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
    title: "Applicant Report",
    tabCount: 3,
    tabNames: ["Table", "By Source", "By Location"],
    description: "See your applicants and filter by applicant details including application status, source, and location.",
    category: "Hiring",
  },
  {
    title: "Hiring Report",
    tabCount: 5,
    tabNames: ["Daily", "Weekly", "Monthly", "By Location", "By Brand"],
    description: "See hiring performance and applicant engagement during specific time frames across your locations, positions and sources.",
    category: "Hiring",
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

const allCategories = Array.from(new Set(reports.map((r) => r.category))).sort();

// Report Row Component
function ReportRow({ 
  report, 
  isStarred, 
  onToggleStar
}: { 
  report: Report; 
  isStarred: boolean; 
  onToggleStar: () => void;
}) {
  return (
    <div className="group px-6 py-5 bg-white hover:bg-gray-50 border-b border-gray-100 transition-colors">
      <div className="flex items-start gap-4">
        {/* Report Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900">{report.title}</h3>
            {/* Star Toggle */}
            <button
              onClick={onToggleStar}
              className={`flex-shrink-0 transition-colors ${
                isStarred ? "text-yellow-500" : "text-gray-300 hover:text-yellow-500"
              }`}
              title={isStarred ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={`w-4 h-4 ${isStarred ? "fill-current" : ""}`} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">{report.description}</p>
          
          {/* Action Badges - New row below description */}
          <div className="flex items-center gap-2 flex-wrap">
            {report.tabNames.map((tab) => (
              <Link
                key={tab}
                href={`/reporting/built-in-reports/${createReportSlug(report.title, tab)}`}
                className="group inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-workstream-blue bg-workstream-blue/10 hover:bg-workstream-blue hover:text-white rounded-lg transition-all border border-workstream-blue/20 hover:border-workstream-blue hover:shadow-md"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>{tab}</span>
                <svg className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type SortOption = "alphabetical" | "report-count-high" | "report-count-low" | "starred-first";

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  "Benefits": <Award className="w-4 h-4" />,
  "Compensation": <DollarSign className="w-4 h-4" />,
  "Compliance": <FileCheck className="w-4 h-4" />,
  "Employee": <Users className="w-4 h-4" />,
  "Hiring": <UserPlus className="w-4 h-4" />,
  "Payroll": <Wallet className="w-4 h-4" />,
  "Tax": <Calculator className="w-4 h-4" />,
  "Time & Attendance": <Clock className="w-4 h-4" />,
  "Usage": <BarChart3 className="w-4 h-4" />,
};

export default function BuiltInReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [starredReports, setStarredReports] = useState<Set<string>>(new Set());
  const [starredCategories, setStarredCategories] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>("starred-first");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load starred items from localStorage
  useEffect(() => {
    const savedReports = localStorage.getItem("starredReports");
    if (savedReports) {
      setStarredReports(new Set(JSON.parse(savedReports)));
    }
    const savedCategories = localStorage.getItem("starredCategories");
    if (savedCategories) {
      setStarredCategories(new Set(JSON.parse(savedCategories)));
    }
  }, []);

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

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        searchQuery === "" ||
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.tabNames.some((tab) => tab.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = activeCategory === null || activeCategory === "all" || 
        (activeCategory === "favorites" ? starredReports.has(report.title) : report.category === activeCategory);

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, starredReports]);

  // Sort reports
  const sortedReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      const aStarred = starredReports.has(a.title);
      const bStarred = starredReports.has(b.title);
      
      if (sortOption === "starred-first") {
        if (aStarred && !bStarred) return -1;
        if (!aStarred && bStarred) return 1;
      }
      
      return a.title.localeCompare(b.title);
    });
  }, [filteredReports, starredReports, sortOption]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((report) => {
      counts[report.category] = (counts[report.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Sort categories with starred first
  const sortedCategories = useMemo(() => {
    return [...allCategories].sort((a, b) => {
      const aStarred = starredCategories.has(a);
      const bStarred = starredCategories.has(b);
      
      if (aStarred && !bStarred) return -1;
      if (!aStarred && bStarred) return 1;
      return a.localeCompare(b);
    });
  }, [starredCategories]);

  return (
    <div className="h-full flex">
      {/* Sticky Sidebar */}
      <aside className={`${sidebarCollapsed ? "w-16" : "w-72"} flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 relative z-40 ${sidebarCollapsed ? "overflow-visible" : ""}`}>
        <div className={`${sidebarCollapsed ? "p-3" : "p-6"} h-full ${sidebarCollapsed ? "overflow-y-auto overflow-x-visible" : "overflow-y-auto"} transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Categories
              </h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors ml-auto"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
          
          <nav className="space-y-1">
            {/* All Reports */}
            <button
              onClick={() => setActiveCategory("all")}
              className={`group/tooltip w-full flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                activeCategory === "all" || activeCategory === null
                  ? "bg-workstream-blue text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {sidebarCollapsed ? (
                <>
                  <BarChart3 className="w-5 h-5" />
                  {/* Tooltip */}
                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-[100] shadow-lg">
                    All Reports
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                  </span>
                </>
              ) : (
                <>
                  <span>All Reports</span>
                  <span className="text-xs opacity-75 bg-white/20 px-2 py-0.5 rounded-full">{reports.length}</span>
                </>
              )}
            </button>

            {/* Favorites */}
            <button
              onClick={() => setActiveCategory("favorites")}
              className={`group/tooltip w-full flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                activeCategory === "favorites"
                  ? "bg-workstream-blue text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {sidebarCollapsed ? (
                <>
                  <Star className="w-5 h-5 fill-current text-yellow-500" />
                  {/* Tooltip */}
                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-[100] shadow-lg">
                    Favorites
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span>Favorites</span>
                  </div>
                  <span className={`text-xs opacity-75 ${activeCategory === "favorites" ? "bg-white/20" : "bg-gray-100"} px-2 py-0.5 rounded-full`}>{starredReports.size}</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="py-2">
              <div className="border-t border-gray-200" />
            </div>

            {/* Category List */}
            {sortedCategories.map((category) => {
              const isStarred = starredCategories.has(category);
              const icon = categoryIcons[category];
              const isActive = activeCategory === category;
              
              return (
                <div
                  key={category}
                  className={`flex items-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-workstream-blue text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <button
                    onClick={() => setActiveCategory(category)}
                    className={`group/tooltip flex-1 flex items-center ${sidebarCollapsed ? "justify-center px-3 py-2.5" : "justify-between px-3 py-2.5"} text-sm font-medium min-w-0 relative`}
                  >
                    {sidebarCollapsed ? (
                      <>
                        <div className="flex-shrink-0">{icon}</div>
                        {/* Tooltip */}
                        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-[100] shadow-lg">
                          {category}
                          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="flex-shrink-0">{icon}</div>
                          <span className="truncate">{category}</span>
                        </div>
                        <span className={`text-xs opacity-75 ml-2 flex-shrink-0 ${isActive ? "bg-white/20" : "bg-gray-100"} px-2 py-0.5 rounded-full`}>
                          {categoryCounts[category] || 0}
                        </span>
                      </>
                    )}
                  </button>
                  {!sidebarCollapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategoryStar(category);
                      }}
                      className={`pr-3 pl-1 py-2.5 transition-colors flex-shrink-0 ${
                        isStarred 
                          ? "text-yellow-500" 
                          : isActive
                          ? "text-white/50 hover:text-yellow-500"
                          : "text-gray-300 hover:text-yellow-500"
                      }`}
                      title={isStarred ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className={`w-4 h-4 ${isStarred ? "fill-current" : ""}`} />
                    </button>
                  )}
                </div>
              );
            })}
          </nav>

        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                {activeCategory === "all" || activeCategory === null
                  ? "All Built-in Reports"
                  : activeCategory === "favorites"
                  ? "Favorite Reports"
                  : `${activeCategory} Reports`}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {sortedReports.length} {sortedReports.length === 1 ? "report" : "reports"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-workstream-blue focus:border-transparent cursor-pointer transition-all"
              >
                <option value="starred-first">Starred First</option>
                <option value="alphabetical">A-Z</option>
                <option value="report-count-high">Most Views</option>
                <option value="report-count-low">Fewest Views</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {sortedReports.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {sortedReports.map((report) => (
                <ReportRow
                  key={report.title}
                  report={report}
                  isStarred={starredReports.has(report.title)}
                  onToggleStar={() => toggleReportStar(report.title)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900">No reports found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="mt-4 text-sm text-workstream-blue hover:text-workstream-blue-dark font-medium transition-colors"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
