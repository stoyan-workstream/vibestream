"use client";

import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Check, Search, Calendar, Filter, SortAsc, Eye, EyeOff, GripVertical } from "lucide-react";

interface Report {
  title: string;
  tabCount: number;
  tabNames: string[];
  description: string;
  category: string;
}

interface Column {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "currency";
  visible: boolean;
}

interface CustomReportWizardProps {
  reports: Report[];
  onClose: () => void;
}

const SAMPLE_COLUMNS: Column[] = [
  { id: "employee_name", name: "Employee Name", type: "text", visible: true },
  { id: "employee_id", name: "Employee ID", type: "text", visible: true },
  { id: "department", name: "Department", type: "text", visible: true },
  { id: "position", name: "Position", type: "text", visible: true },
  { id: "hire_date", name: "Hire Date", type: "date", visible: true },
  { id: "salary", name: "Salary", type: "currency", visible: true },
  { id: "hours_worked", name: "Hours Worked", type: "number", visible: true },
  { id: "location", name: "Location", type: "text", visible: true },
  { id: "manager", name: "Manager", type: "text", visible: false },
  { id: "email", name: "Email", type: "text", visible: false },
  { id: "phone", name: "Phone", type: "text", visible: false },
  { id: "status", name: "Status", type: "text", visible: true },
];

export default function CustomReportWizard({ reports, onClose }: CustomReportWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedView, setSelectedView] = useState<string>("");
  const [reportName, setReportName] = useState("");
  const [columns, setColumns] = useState<Column[]>(SAMPLE_COLUMNS);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<{ column: string; direction: "asc" | "desc" }[]>([]);
  const [filters, setFilters] = useState<{ column: string; operator: string; value: string }[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const totalSteps = 6;

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleColumn = (columnId: string) => {
    setColumns(columns.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col)));
  };

  const moveColumn = (index: number, direction: "up" | "down") => {
    const newColumns = [...columns];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newColumns.length) {
      [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
      setColumns(newColumns);
    }
  };

  const addGroupBy = (column: string) => {
    if (!groupBy.includes(column)) {
      setGroupBy([...groupBy, column]);
    }
  };

  const removeGroupBy = (column: string) => {
    setGroupBy(groupBy.filter((c) => c !== column));
  };

  const addSort = () => {
    setSortBy([...sortBy, { column: "", direction: "asc" }]);
  };

  const updateSort = (index: number, field: "column" | "direction", value: string) => {
    const newSort = [...sortBy];
    newSort[index] = { ...newSort[index], [field]: value };
    setSortBy(newSort);
  };

  const removeSort = (index: number) => {
    setSortBy(sortBy.filter((_, i) => i !== index));
  };

  const addFilter = () => {
    setFilters([...filters, { column: "", operator: "equals", value: "" }]);
  };

  const updateFilter = (index: number, field: "column" | "operator" | "value", value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreate = () => {
    // Here you would save the custom report configuration
    console.log("Creating custom report:", {
      reportName,
      baseReport: selectedReport?.title,
      view: selectedView,
      columns: columns.filter((c) => c.visible),
      groupBy,
      sortBy,
      filters,
      dateRange,
    });
    onClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedReport !== null;
      case 2:
        return selectedView !== "";
      case 3:
        return reportName.trim() !== "";
      case 4:
        return columns.some((c) => c.visible);
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Custom Report</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Step {step} of {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Select" },
              { num: 2, label: "View" },
              { num: 3, label: "Name" },
              { num: 4, label: "Columns" },
              { num: 5, label: "Sort" },
              { num: 6, label: "Filters" },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      s.num < step
                        ? "bg-workstream-blue text-white"
                        : s.num === step
                        ? "bg-workstream-blue text-white ring-4 ring-workstream-blue/20"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {s.num < step ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-xs mt-1 whitespace-nowrap ${
                      s.num === step ? "text-workstream-blue font-medium" : "text-gray-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      s.num < step ? "bg-workstream-blue" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step 1: Select Base Report */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Base Report</h3>
                <p className="text-sm text-gray-600">Choose a built-in report to customize</p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue focus:border-transparent"
                />
              </div>

              {/* Report List */}
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {filteredReports.map((report) => (
                  <button
                    key={report.title}
                    onClick={() => setSelectedReport(report)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedReport?.title === report.title
                        ? "border-workstream-blue bg-workstream-blue/5"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {report.category}
                          </span>
                          <span className="text-xs text-gray-500">{report.tabCount} views available</span>
                        </div>
                      </div>
                      {selectedReport?.title === report.title && (
                        <div className="ml-3 flex-shrink-0">
                          <div className="w-6 h-6 bg-workstream-blue rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Choose View */}
          {step === 2 && selectedReport && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a View</h3>
                <p className="text-sm text-gray-600">
                  Select which view of <span className="font-medium">{selectedReport.title}</span> to customize
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {selectedReport.tabNames.map((view) => (
                  <button
                    key={view}
                    onClick={() => setSelectedView(view)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedView === view
                        ? "border-workstream-blue bg-workstream-blue/5"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{view}</h4>
                        <p className="text-sm text-gray-600 mt-1">Customize the {view.toLowerCase()} view</p>
                      </div>
                      {selectedView === view && (
                        <div className="w-6 h-6 bg-workstream-blue rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Name Report */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Name Your Custom Report</h3>
                <p className="text-sm text-gray-600">Give your report a descriptive name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Monthly Payroll Summary by Department"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue focus:border-transparent text-lg"
                  autoFocus
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Naming Tips</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Use a clear, descriptive name that explains what the report shows. Include the time period, grouping, or
                      specific filters if relevant.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Configure Columns */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Columns</h3>
                <p className="text-sm text-gray-600">Select and reorder the columns to display in your report</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {columns.map((column, index) => (
                  <div
                    key={column.id}
                    className={`flex items-center gap-3 p-3 bg-white rounded-lg border transition-all ${
                      column.visible ? "border-gray-200" : "border-gray-100 opacity-50"
                    }`}
                  >
                    <button
                      onClick={() => toggleColumn(column.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        column.visible
                          ? "bg-workstream-blue border-workstream-blue"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {column.visible && <Check className="w-3 h-3 text-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${column.visible ? "text-gray-900" : "text-gray-500"}`}>
                          {column.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {column.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveColumn(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 rotate-90" />
                      </button>
                      <button
                        onClick={() => moveColumn(index, "down")}
                        disabled={index === columns.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                {columns.filter((c) => c.visible).length} of {columns.length} columns selected
              </div>
            </div>
          )}

          {/* Step 5: Grouping & Sorting */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Grouping & Sorting</h3>
                <p className="text-sm text-gray-600">Configure how your data should be grouped and sorted</p>
              </div>

              {/* Grouping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Group By (Optional)</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {groupBy.map((column) => (
                      <span
                        key={column}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-workstream-blue/10 text-workstream-blue rounded-full text-sm"
                      >
                        {columns.find((c) => c.id === column)?.name}
                        <button onClick={() => removeGroupBy(column)} className="hover:text-workstream-blue-dark">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addGroupBy(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                  >
                    <option value="">Add grouping...</option>
                    {columns
                      .filter((c) => c.visible && !groupBy.includes(c.id))
                      .map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Sorting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Sort By</label>
                <div className="space-y-2">
                  {sortBy.map((sort, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={sort.column}
                        onChange={(e) => updateSort(index, "column", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                      >
                        <option value="">Select column...</option>
                        {columns
                          .filter((c) => c.visible)
                          .map((column) => (
                            <option key={column.id} value={column.id}>
                              {column.name}
                            </option>
                          ))}
                      </select>
                      <select
                        value={sort.direction}
                        onChange={(e) => updateSort(index, "direction", e.target.value as "asc" | "desc")}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                      <button
                        onClick={() => removeSort(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addSort}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-workstream-blue hover:text-workstream-blue transition-colors"
                  >
                    + Add Sort Rule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Filters & Date Range */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Filters & Date Range</h3>
                <p className="text-sm text-gray-600">Apply filters to narrow down your report data</p>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Date Range (Optional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Filters (Optional)</label>
                <div className="space-y-2">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={filter.column}
                        onChange={(e) => updateFilter(index, "column", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                      >
                        <option value="">Select column...</option>
                        {columns
                          .filter((c) => c.visible)
                          .map((column) => (
                            <option key={column.id} value={column.id}>
                              {column.name}
                            </option>
                          ))}
                      </select>
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(index, "operator", e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                      >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                      </select>
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(index, "value", e.target.value)}
                        placeholder="Value..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                      />
                      <button
                        onClick={() => removeFilter(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFilter}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-workstream-blue hover:text-workstream-blue transition-colors"
                  >
                    + Add Filter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="inline-flex items-center gap-2 px-6 py-2 bg-workstream-blue text-white font-medium rounded-lg hover:bg-workstream-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-6 py-2 bg-workstream-blue text-white font-medium rounded-lg hover:bg-workstream-blue-dark transition-all shadow-sm hover:shadow-md"
              >
                <Check className="w-4 h-4" />
                Create Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
