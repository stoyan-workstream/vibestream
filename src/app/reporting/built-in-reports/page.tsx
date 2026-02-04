"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Pin, ChevronDown, X, Award, DollarSign, FileCheck, Users, UserPlus, Wallet, Calculator, Clock, BarChart3 } from "lucide-react";
import { getRelatedTerms, matchesSearch, getMatchedTerms } from "@/utils/semanticSearch";
import { HighlightedText } from "@/components/HighlightedText";

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
    tabCount: 2,
    tabNames: ["Table", "Summary"],
    description: "Displays a comprehensive history of pay rate changes for employees over time.",
    category: "Compensation",
  },
  {
    title: "Payroll Report",
    tabCount: 2,
    tabNames: ["Table", "Summary"],
    description: "Detailed breakdown of payroll information including earnings, deductions, and net pay for each employee.",
    category: "Payroll",
  },
  {
    title: "Tax Report",
    tabCount: 3,
    tabNames: ["Federal", "State", "Local"],
    description: "Comprehensive tax reporting across federal, state, and local jurisdictions.",
    category: "Tax",
  },
  {
    title: "Time Off Report",
    tabCount: 2,
    tabNames: ["Accrual", "Usage"],
    description: "Track employee time off accruals and usage patterns.",
    category: "Time & Attendance",
  },
];

type SortOption = "pinned-first" | "alphabetical" | "report-count-high" | "report-count-low";

const categoryIcons: Record<string, React.ReactElement> = {
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

// Report Row Component
function ReportRow({ 
  report, 
  isPinned, 
  onTogglePin,
  searchQuery
}: { 
  report: Report; 
  isPinned: boolean; 
  onTogglePin: () => void;
  searchQuery: string;
}) {
  const matchedTerms = getMatchedTerms(report, searchQuery);
  
  return (
    <div className="group px-6 py-5 bg-white hover:bg-gray-50 border-b border-gray-100 transition-colors">
      <div className="flex items-start gap-4">
        {/* Report Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 leading-none">
              <HighlightedText text={report.title} searchTerms={matchedTerms} />
            </h3>
            {/* Pin Toggle */}
            <button
              onClick={onTogglePin}
              className={`flex-shrink-0 transition-colors mt-0.5 ${
                isPinned ? "text-workstream-blue" : "text-gray-300 hover:text-workstream-blue"
              }`}
              title={isPinned ? "Unpin report" : "Pin report"}
            >
              <Pin className={`w-4 h-4 ${isPinned ? "fill-current" : ""}`} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            <HighlightedText text={report.description} searchTerms={matchedTerms} />
          </p>
          
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

export default function BuiltInReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pinnedReports, setPinnedReports] = useState<Set<string>>(new Set());
  const [pinnedCategories, setPinnedCategories] = useState<Set<string>>(new Set());

  // Load pinned items from localStorage
  useEffect(() => {
    const savedReports = localStorage.getItem("pinnedReports");
    const savedCategories = localStorage.getItem("pinnedCategories");
    if (savedReports) {
      setPinnedReports(new Set(JSON.parse(savedReports)));
    }
    if (savedCategories) {
      setPinnedCategories(new Set(JSON.parse(savedCategories)));
    }
  }, []);

  // Save pinned reports to localStorage
  const toggleReportPin = (reportTitle: string) => {
    setPinnedReports((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportTitle)) {
        newSet.delete(reportTitle);
      } else {
        newSet.add(reportTitle);
      }
      localStorage.setItem("pinnedReports", JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Toggle pin for categories
  const toggleCategoryPin = (category: string) => {
    setPinnedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      localStorage.setItem("pinnedCategories", JSON.stringify(Array.from(newSet)));
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
      const matchesSearchQuery = matchesSearch(report, searchQuery);
      const matchesCategory = selectedCategory === null || report.category === selectedCategory;

      return matchesSearchQuery && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Separate pinned and unpinned reports
  const { pinnedReportsList, unpinnedReports } = useMemo(() => {
    const pinned: Report[] = [];
    const unpinned: Report[] = [];
    
    filteredReports.forEach((report) => {
      if (pinnedReports.has(report.title)) {
        pinned.push(report);
      } else {
        unpinned.push(report);
      }
    });
    
    // Sort pinned reports alphabetically
    pinned.sort((a, b) => a.title.localeCompare(b.title));
    
    return { pinnedReportsList: pinned, unpinnedReports: unpinned };
  }, [filteredReports, pinnedReports]);

  // Group unpinned reports by category
  const groupedReports = useMemo(() => {
    const grouped: Record<string, Report[]> = {};
    unpinnedReports.forEach((report) => {
      if (!grouped[report.category]) {
        grouped[report.category] = [];
      }
      grouped[report.category].push(report);
    });
    return grouped;
  }, [unpinnedReports]);

  // Sort categories: pinned first, then alphabetically
  const sortedCategories = useMemo(() => {
    return Object.keys(groupedReports).sort((a, b) => {
      const aPin = pinnedCategories.has(a);
      const bPin = pinnedCategories.has(b);
      if (aPin && !bPin) return -1;
      if (!aPin && bPin) return 1;
      return a.localeCompare(b);
    });
  }, [groupedReports, pinnedCategories]);

  const categories = useMemo(() => {
    const allCategories = Array.from(new Set(reports.map((r) => r.category)));
    return allCategories.sort((a, b) => a.localeCompare(b));
  }, []);

  return (
    <div className="p-8 lg:p-12 min-h-full w-full">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Built-in Reports (Flat View)</h1>
        <p className="mt-1 text-gray-500">Browse all reports in a single list</p>
      </div>

      {/* Stats Summary */}
      <div className="flex gap-8 mb-8 text-sm">
        <div>
          <span className="text-gray-500">Total Reports:</span>
          <span className="ml-2 font-semibold text-gray-900">{filteredReports.length}</span>
        </div>
        {pinnedReportsList.length > 0 && (
          <div>
            <span className="text-gray-500">Pinned:</span>
            <span className="ml-2 font-semibold text-workstream-blue">{pinnedReportsList.length}</span>
          </div>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        {/* Search Input */}
        <div className="relative flex-1">
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
            className="w-full pl-11 pr-20 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
      <div className="space-y-10">
        {/* Pinned Reports Section */}
        {pinnedReportsList.length > 0 && (
          <div className="space-y-3">
            {/* Pinned Header */}
            <div className="flex items-center gap-3 px-2">
              <Pin className="w-4 h-4 text-workstream-blue fill-current" />
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Pinned Reports
              </h2>
              <span className="text-xs text-gray-400">({pinnedReportsList.length})</span>
            </div>

            {/* Pinned Reports Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-gray-100">
                {pinnedReportsList.map((report) => (
                  <ReportRow
                    key={report.title}
                    report={report}
                    isPinned={true}
                    onTogglePin={() => toggleReportPin(report.title)}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Sections */}
        {sortedCategories.map((category) => {
          const categoryReports = groupedReports[category];
          if (!categoryReports || categoryReports.length === 0) return null;
          
          const isCategoryPinned = pinnedCategories.has(category);

          return (
            <div key={category} className="space-y-3">
              {/* Category Header - Outside Card */}
              <div className="flex items-center gap-3 px-2">
                <span className="text-workstream-blue">
                  {categoryIcons[category]}
                </span>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {category}
                </h2>
                <span className="text-xs text-gray-400">({categoryReports.length})</span>
                <button
                  onClick={() => toggleCategoryPin(category)}
                  className={`ml-auto flex-shrink-0 transition-colors ${
                    isCategoryPinned ? "text-workstream-blue" : "text-gray-300 hover:text-workstream-blue"
                  }`}
                  title={isCategoryPinned ? "Unpin category" : "Pin category"}
                >
                  <Pin className={`w-4 h-4 ${isCategoryPinned ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Reports Card */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-100">
                  {categoryReports.map((report) => (
                    <ReportRow
                      key={report.title}
                      report={report}
                      isPinned={false}
                      onTogglePin={() => toggleReportPin(report.title)}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="mt-16 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
