"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Star, Calendar, Filter, MoreVertical, ExternalLink, Trash2, Edit, Copy, Download, Share2, Clock } from "lucide-react";
import Link from "next/link";
import CustomReportWizard from "../../../components/CustomReportWizard";
import ScheduleReportModal, { ScheduleConfig } from "../../../components/ScheduleReportModal";

interface CustomReport {
  id: string;
  name: string;
  description: string;
  baseReport: string;
  category: string;
  createdDate: string;
  lastRun: string;
  starred: boolean;
  schedule?: ScheduleConfig;
}

const SAMPLE_CUSTOM_REPORTS: CustomReport[] = [
  {
    id: "1",
    name: "Monthly Payroll Summary by Department",
    description: "Detailed payroll breakdown grouped by department with overtime calculations",
    baseReport: "Payroll Report",
    category: "Payroll",
    createdDate: "2024-01-15",
    lastRun: "2024-01-28",
    starred: true,
    schedule: {
      enabled: true,
      frequency: "monthly",
      time: "09:00",
      dayOfMonth: 1,
      recipients: ["hr@company.com", "finance@company.com"],
      format: "xlsx",
      includeCharts: false,
      timezone: "America/New_York",
    },
  },
  {
    id: "2",
    name: "New Hire Onboarding Status",
    description: "Track onboarding progress for employees hired in the last 90 days",
    baseReport: "Employee Onboarding Report",
    category: "Hiring",
    createdDate: "2024-01-10",
    lastRun: "2024-01-27",
    starred: true,
  },
  {
    id: "3",
    name: "Quarterly Benefits Enrollment",
    description: "Benefits enrollment data with employee selections and costs",
    baseReport: "401(k) Report",
    category: "Benefits",
    createdDate: "2023-12-20",
    lastRun: "2024-01-20",
    starred: false,
    schedule: {
      enabled: true,
      frequency: "quarterly",
      time: "08:00",
      recipients: ["benefits@company.com"],
      format: "pdf",
      includeCharts: true,
      timezone: "America/New_York",
    },
  },
  {
    id: "4",
    name: "Overtime Hours by Location",
    description: "Weekly overtime hours aggregated by location and position",
    baseReport: "Time & Attendance Report",
    category: "Time & Attendance",
    createdDate: "2024-01-05",
    lastRun: "2024-01-26",
    starred: false,
    schedule: {
      enabled: true,
      frequency: "weekly",
      time: "10:00",
      dayOfWeek: 1,
      recipients: ["operations@company.com"],
      format: "csv",
      includeCharts: false,
      timezone: "America/New_York",
    },
  },
  {
    id: "5",
    name: "Compliance Training Completion",
    description: "Employee compliance training status with completion dates",
    baseReport: "Training Report",
    category: "Compliance",
    createdDate: "2023-12-15",
    lastRun: "2024-01-25",
    starred: false,
  },
];

export default function CustomReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [starredReports, setStarredReports] = useState<Set<string>>(
    new Set(SAMPLE_CUSTOM_REPORTS.filter((r) => r.starred).map((r) => r.id))
  );
  const [showWizard, setShowWizard] = useState(false);
  const [reports, setReports] = useState<CustomReport[]>(SAMPLE_CUSTOM_REPORTS);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(SAMPLE_CUSTOM_REPORTS.map((r) => r.category))).sort();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        searchQuery === "" ||
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.baseReport.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filterCategory === null || filterCategory === "all" || report.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, filterCategory, reports]);

  const sortedReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      const aStarred = starredReports.has(a.id);
      const bStarred = starredReports.has(b.id);
      if (aStarred && !bStarred) return -1;
      if (!aStarred && bStarred) return 1;
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });
  }, [filteredReports, starredReports]);

  const toggleStar = (reportId: string) => {
    setStarredReports((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const handleDelete = (reportId: string) => {
    setReports(reports.filter((r) => r.id !== reportId));
    setShowDeleteConfirm(null);
    setActiveMenu(null);
  };

  const handleDuplicate = (report: CustomReport) => {
    const newReport: CustomReport = {
      ...report,
      id: Date.now().toString(),
      name: `${report.name} (Copy)`,
      createdDate: new Date().toISOString().split("T")[0],
      lastRun: new Date().toISOString().split("T")[0],
      starred: false,
    };
    setReports([newReport, ...reports]);
    setActiveMenu(null);
  };

  const handleExport = (report: CustomReport, format: "csv" | "xlsx" | "pdf") => {
    console.log(`Exporting ${report.name} as ${format}`);
    setActiveMenu(null);
  };

  const handleShare = (report: CustomReport) => {
    console.log(`Sharing ${report.name}`);
    setActiveMenu(null);
  };

  const handleRun = (report: CustomReport) => {
    console.log(`Running ${report.name}`);
    // Update last run date
    setReports(
      reports.map((r) =>
        r.id === report.id ? { ...r, lastRun: new Date().toISOString().split("T")[0] } : r
      )
    );
  };

  const handleSaveSchedule = (reportId: string, schedule: ScheduleConfig) => {
    setReports(
      reports.map((r) =>
        r.id === reportId ? { ...r, schedule } : r
      )
    );
  };

  const getScheduleLabel = (schedule?: ScheduleConfig) => {
    if (!schedule || !schedule.enabled) return null;
    return schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Custom Reports</h1>
            <p className="mt-1 text-sm text-gray-500">
              {sortedReports.length} {sortedReports.length === 1 ? "report" : "reports"}
            </p>
          </div>

          <button
            onClick={() => setShowWizard(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-workstream-blue text-white text-sm font-medium rounded-lg hover:bg-workstream-blue-dark transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create Custom Report
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search custom reports..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-workstream-blue focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={filterCategory || "all"}
              onChange={(e) => setFilterCategory(e.target.value === "all" ? null : e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-workstream-blue focus:border-transparent cursor-pointer transition-all min-w-[200px]"
            >
              <option value="all">All Categories</option>
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

      {/* Reports Grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {sortedReports.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-6 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{report.name}</h3>
                      <button
                        onClick={() => toggleStar(report.id)}
                        className={`flex-shrink-0 transition-colors ${
                          starredReports.has(report.id)
                            ? "text-yellow-500 hover:text-yellow-600"
                            : "text-gray-300 hover:text-yellow-500"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${starredReports.has(report.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                  </div>

                  <div className="relative ml-2">
                    <button
                      onClick={() => setActiveMenu(activeMenu === report.id ? null : report.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {/* Dropdown menu */}
                    {activeMenu === report.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveMenu(null)}
                        />
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => handleRun(report)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Run Report
                          </button>
                          <button
                            onClick={() => {
                              setShowWizard(true);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(report)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleShare(report)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                          <button
                            onClick={() => {
                              setShowScheduleModal(report.id);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            {report.schedule?.enabled ? "Edit Schedule" : "Schedule Report"}
                          </button>
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => handleExport(report, "csv")}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export as CSV
                          </button>
                          <button
                            onClick={() => handleExport(report, "xlsx")}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export as Excel
                          </button>
                          <button
                            onClick={() => handleExport(report, "pdf")}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export as PDF
                          </button>
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(report.id);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{report.category}</span>
                  <span className="text-xs text-gray-500">Based on {report.baseReport}</span>
                  {getScheduleLabel(report.schedule) && (
                    <button
                      onClick={() => setShowScheduleModal(report.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium hover:bg-green-100 transition-colors"
                      title="Edit schedule"
                    >
                      <Clock className="w-3 h-3" />
                      Scheduled: {getScheduleLabel(report.schedule)}
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500">
                      Last run: {new Date(report.lastRun).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => setShowScheduleModal(report.id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all ${
                        report.schedule?.enabled
                          ? "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                          : "text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}
                      title={report.schedule?.enabled ? "Edit schedule" : "Schedule this report"}
                    >
                      <Clock className="w-3 h-3" />
                      {report.schedule?.enabled ? "Scheduled" : "Schedule"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowWizard(true);
                      }}
                      className="p-2 text-gray-400 hover:text-workstream-blue hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit report"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(report)}
                      className="p-2 text-gray-400 hover:text-workstream-blue hover:bg-blue-50 rounded-lg transition-colors"
                      title="Duplicate report"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(report.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRun(report)}
                      className="px-3 py-1.5 bg-workstream-blue text-white text-sm font-medium rounded-lg hover:bg-workstream-blue-dark transition-all flex items-center gap-1.5"
                    >
                      Run Report
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">No custom reports found</h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery || filterCategory
                  ? "Try adjusting your search or filter"
                  : "Create your first custom report to get started"}
              </p>
              {(searchQuery || filterCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterCategory(null);
                  }}
                  className="text-sm text-workstream-blue hover:text-workstream-blue-dark font-medium transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Report</h3>
                <p className="text-sm text-gray-600 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {reports.find((r) => r.id === showDeleteConfirm)?.name}
              </span>
              ? All configurations and history will be permanently removed.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Report Wizard */}
      {showWizard && (
        <CustomReportWizard
          reports={SAMPLE_CUSTOM_REPORTS.map((r) => ({
            title: r.name,
            tabCount: 1,
            tabNames: ["Table"],
            description: r.description,
            category: r.category,
          }))}
          onClose={() => setShowWizard(false)}
        />
      )}

      {/* Schedule Report Modal */}
      {showScheduleModal && (
        <ScheduleReportModal
          reportName={reports.find((r) => r.id === showScheduleModal)?.name || ""}
          existingSchedule={reports.find((r) => r.id === showScheduleModal)?.schedule}
          onClose={() => setShowScheduleModal(null)}
          onSave={(schedule) => handleSaveSchedule(showScheduleModal, schedule)}
        />
      )}
    </div>
  );
}
