"use client";

import { useState } from "react";
import { ShieldAlert, DollarSign, Sparkles, Lock, Unlock, Mail, Phone } from "lucide-react";

// Sample data
const complianceData = {
  totalIssues: 17,
  totalIssuesLastWeek: 14,
  potentialFines: 19487,
  potentialFinesLastWeek: 15200,
  categories: [
    { name: "Ready to Work", issues: 11, fines: 1500 },
    { name: "Time & Pay", issues: 6, fines: 17987 },
    { name: "Safety & Claims", issues: 0, fines: 0 },
    { name: "Filing & Reporting", issues: 0, fines: 0 },
  ],
};

const locations = [
  "San Francisco - Market St",
  "San Francisco - Mission District", 
  "Oakland - Downtown",
  "San Jose - Santana Row",
  "Palo Alto - University Ave",
  "Berkeley - Shattuck Ave",
  "Fremont - Pacific Commons",
];
const categoryNames = ["Ready to Work", "Time & Pay", "Safety & Claims", "Filing & Reporting"];

const locationHeatmapData: Record<string, Record<string, number>> = {
  "San Francisco - Market St": { "Ready to Work": 5, "Time & Pay": 2, "Safety & Claims": 0, "Filing & Reporting": 0 },
  "San Francisco - Mission District": { "Ready to Work": 3, "Time & Pay": 4, "Safety & Claims": 0, "Filing & Reporting": 0 },
  "Oakland - Downtown": { "Ready to Work": 2, "Time & Pay": 0, "Safety & Claims": 0, "Filing & Reporting": 0 },
  "San Jose - Santana Row": { "Ready to Work": 0, "Time & Pay": 0, "Safety & Claims": 0, "Filing & Reporting": 0 },
  "Palo Alto - University Ave": { "Ready to Work": 1, "Time & Pay": 0, "Safety & Claims": 0, "Filing & Reporting": 0 },
  "Berkeley - Shattuck Ave": { "Ready to Work": 0, "Time & Pay": 0, "Safety & Claims": 0, "Filing & Reporting": 0 },
  "Fremont - Pacific Commons": { "Ready to Work": 0, "Time & Pay": 0, "Safety & Claims": 0, "Filing & Reporting": 0 },
};


interface ComplianceIssue {
  id: string;
  reportDate: string;
  category: "Time & Pay" | "Ready to Work" | "Safety & Claims" | "Filing & Reporting";
  ruleName: string;
  riskLevel: "high" | "medium" | "low";
  location: string;
  worker: string;
  summary: string;
  detail: string;
  potentialFine: number;
  status: "open" | "in_review" | "resolved";
}

const issuesData: ComplianceIssue[] = [
  {
    id: "1",
    reportDate: "May 19, 2025",
    category: "Time & Pay",
    ruleName: "Minimum Wage for San Francisco 2024",
    riskLevel: "high",
    location: "Great Main",
    worker: "Ryan Mason",
    summary: "Rate $17.31 < Min $18.67",
    detail: "For pay period starting 2025-05-19, employee Ryan Mason (San Francisco, CA) had a regular rate of pay of $17.31 per hour (calculated as $1384.62 total straight-time earnings ÷ 80.00 worked hours), which is below the required minimum wage of $18.67 per hour.",
    potentialFine: 1100,
    status: "open",
  },
  {
    id: "2",
    reportDate: "May 18, 2025",
    category: "Time & Pay",
    ruleName: "Overtime Premium Violation",
    riskLevel: "high",
    location: "Great Main",
    worker: "Harry Salazar",
    summary: "OT 85.00h, Paid $0.00 < Required $3984.37",
    detail: "For pay period starting 2025-05-18, employee Harry Salazar (SAN DIEGO, CA) worked 125.00 hours over 7 days (125.00 hours per week equivalent), exceeding the 40-hour weekly threshold by 85.00 hours. They were paid an overtime premium of $0.00, but the required premium was $3984.37. This was calculated using an effective rate of $31.25 per hour for 85.00 overtime hours.",
    potentialFine: 8487,
    status: "open",
  },
  {
    id: "3",
    reportDate: "Apr 28, 2025",
    category: "Ready to Work",
    ruleName: "I-9 Form Completion Violation",
    riskLevel: "high",
    location: "Great Main",
    worker: "Sharon Reese",
    summary: "I-9 1 days past deadline",
    detail: "Employee Sharon Reese was hired on 2022-09-05 with an estimated I-9 completion deadline of 2022-09-08. The E-Verify case was created on 2022-09-09, which was 1 days after the deadline. Status: CLOSED. Risk Level: HIGH. Submitted late.",
    potentialFine: 500,
    status: "open",
  },
  {
    id: "4",
    reportDate: "Apr 28, 2025",
    category: "Time & Pay",
    ruleName: "Overtime Premium Violation",
    riskLevel: "high",
    location: "Great Main",
    worker: "Erik Aguilar",
    summary: "OT 9.06h, Paid $18.56 < Required $224.24",
    detail: "For pay period starting 2025-04-28, employee Erik Aguilar (Fremont, CA) worked 49.06 hours over 7 days (49.06 hours per week equivalent), exceeding the 40-hour weekly threshold by 9.06 hours. They were paid an overtime premium of $18.56, but the required premium was $224.24. This was calculated using an effective rate of $16.50 per hour for 9.06 overtime hours.",
    potentialFine: 1100,
    status: "open",
  },
  {
    id: "5",
    reportDate: "Feb 10, 2025",
    category: "Time & Pay",
    ruleName: "Minimum Wage for San Francisco 2024",
    riskLevel: "high",
    location: "Great Boardway",
    worker: "Edgar Cohen",
    summary: "Rate $17.31 < Min $18.67",
    detail: "For pay period starting 2025-02-10, employee Edgar Cohen (San Francisco, CA) had a regular rate of pay of $17.31 per hour (calculated as $1384.62 total straight-time earnings ÷ 80.00 worked hours), which is below the required minimum wage of $18.67 per hour.",
    potentialFine: 1100,
    status: "open",
  },
  {
    id: "6",
    reportDate: "Feb 10, 2025",
    category: "Ready to Work",
    ruleName: "I-9 Form Completion Violation",
    riskLevel: "high",
    location: "Great Main",
    worker: "Debbie Cardenas",
    summary: "I-9 26 days past deadline",
    detail: "Employee Debbie Cardenas was hired on 2022-08-02 with an estimated I-9 completion deadline of 2022-08-05. The E-Verify case was created on 2022-08-31, which was 26 days after the deadline. Status: CLOSED. Risk Level: HIGH. Submitted late.",
    potentialFine: 500,
    status: "open",
  },
  {
    id: "7",
    reportDate: "Jan 27, 2025",
    category: "Ready to Work",
    ruleName: "I-9 Form Completion Violation",
    riskLevel: "high",
    location: "Great Main",
    worker: "Harry Salazar",
    summary: "I-9 44 days past deadline",
    detail: "Employee Harry Salazar was hired on 2022-08-18 with an estimated I-9 completion deadline of 2022-08-23. The E-Verify case was created on 2022-10-06, which was 44 days after the deadline. Status: CLOSED. Risk Level: HIGH. Submitted late.",
    potentialFine: 500,
    status: "open",
  },
];

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const getHeatmapColor = (value: number, max: number) => {
  if (value === 0) return "bg-gray-50";
  const intensity = Math.min(value / max, 1);
  if (intensity <= 0.25) return "bg-blue-100";
  if (intensity <= 0.5) return "bg-blue-200";
  if (intensity <= 0.75) return "bg-blue-400";
  return "bg-blue-500";
};

const getCategoryStyle = (category: string) => {
  switch (category) {
    case "Time & Pay":
      return "bg-blue-50 text-blue-700";
    case "Ready to Work":
      return "bg-amber-50 text-amber-700";
    case "Safety & Claims":
      return "bg-red-50 text-red-700";
    case "Filing & Reporting":
      return "bg-purple-50 text-purple-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

interface SummaryCardProps {
  title: string;
  value: string | number;
  categories: { name: string; value: number }[];
  showInfo?: boolean;
  formatValue?: (val: number) => string;
  icon?: React.ReactNode;
  changeFromLastWeek?: number; // positive = increase, negative = decrease
  changeLabel?: string;
}

const SummaryCard = ({ title, value, categories, showInfo, formatValue, icon, changeFromLastWeek, changeLabel = "vs last week" }: SummaryCardProps) => {
  const format = formatValue || ((v: number) => v.toString());
  const total = categories.reduce((sum, cat) => sum + cat.value, 0);
  
  const isIncrease = changeFromLastWeek !== undefined && changeFromLastWeek > 0;
  const isDecrease = changeFromLastWeek !== undefined && changeFromLastWeek < 0;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
          {showInfo && (
            <button className="text-gray-300 hover:text-gray-500 transition-colors">
              <InfoIcon />
            </button>
          )}
        </div>
        {icon && (
          <div className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-3 mt-2">
        <p className="text-4xl font-semibold text-gray-900">{value}</p>
        {changeFromLastWeek !== undefined && (
          <span className={`text-sm font-medium flex items-center gap-1 ${
            isIncrease ? 'text-red-600' : isDecrease ? 'text-green-600' : 'text-gray-500'
          }`}>
            {isIncrease && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
            {isDecrease && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {Math.abs(changeFromLastWeek)}% {changeLabel}
          </span>
        )}
      </div>
      
      {/* Category breakdown */}
      <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
        {categories.map((category) => {
          const percentage = total > 0 ? (category.value / total) * 100 : 0;
          return (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm text-gray-600 truncate">{category.name}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-900 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900 ml-3 tabular-nums">
                {format(category.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface HeatmapCardProps {
  title: string;
  rows: string[];
  columns: string[];
  data: Record<string, Record<string, number>>;
}

const HeatmapCard = ({ title, rows, columns, data }: HeatmapCardProps) => {
  const maxValue = Math.max(
    ...Object.values(data).flatMap(row => Object.values(row))
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <button className="text-gray-300 hover:text-gray-500 transition-colors">
          <MoreIcon />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-gray-400 pb-3 pr-4 min-w-[120px]"></th>
              {columns.map((col) => (
                <th key={col} className="text-center text-xs font-medium text-gray-500 pb-3 px-2 min-w-[100px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <td className="text-sm text-gray-600 py-1.5 pr-4 whitespace-nowrap">{row}</td>
                {columns.map((col) => {
                  const value = data[row]?.[col] || 0;
                  return (
                    <td key={col} className="px-1 py-1.5">
                      <div
                        className={`h-10 rounded ${getHeatmapColor(value, maxValue)} transition-colors cursor-pointer hover:ring-2 hover:ring-gray-300`}
                        title={`${row}: ${col} - ${value} issues`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200" />
          <div className="w-4 h-4 rounded bg-blue-100" />
          <div className="w-4 h-4 rounded bg-blue-200" />
          <div className="w-4 h-4 rounded bg-blue-400" />
          <div className="w-4 h-4 rounded bg-blue-500" />
        </div>
        <span className="text-xs text-gray-400">More</span>
      </div>
    </div>
  );
};

interface IssueCardProps {
  issue: ComplianceIssue;
  onResolve: (id: string) => void;
  onMarkInReview: (id: string) => void;
}

const IssueCard = ({ issue, onResolve, onMarkInReview }: IssueCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 transition-all ${
      issue.status === "resolved" ? "opacity-60" : ""
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Worker and Location - Primary Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
              {issue.worker.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{issue.worker}</h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <LocationIcon />
                <span>{issue.location}</span>
              </div>
            </div>
          </div>

          {/* Issue Details */}
          <div className="mt-4 ml-13 pl-0.5">
            {/* Rule name and badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryStyle(issue.category)}`}>
                {issue.category}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <span className={`w-2 h-2 rounded-full ${
                  issue.riskLevel === "high" ? "bg-red-500" : 
                  issue.riskLevel === "medium" ? "bg-amber-500" : "bg-green-500"
                }`} />
                <span className="text-gray-500 capitalize">{issue.riskLevel}</span>
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">{issue.reportDate}</span>
            </div>

            {/* Rule name */}
            <p className="mt-2 text-sm font-medium text-gray-700">{issue.ruleName}</p>

            {/* Summary */}
            <p className="mt-1 text-sm text-gray-500">{issue.summary}</p>

            {/* Expandable detail */}
            {expanded && (
              <p className="mt-3 text-sm text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-3">
                {issue.detail}
              </p>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          </div>
        </div>

        {/* Fine amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400">Potential Fine</p>
          <p className="text-xl font-semibold text-gray-900">${issue.potentialFine.toLocaleString()}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {issue.status === "open" && (
            <>
              <button
                onClick={() => onMarkInReview(issue.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ClockIcon />
                Mark In Review
              </button>
              <button
                onClick={() => onResolve(issue.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-900 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <CheckIcon />
                Resolve
              </button>
            </>
          )}
          {issue.status === "in_review" && (
            <>
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 bg-amber-50 rounded-lg">
                <ClockIcon />
                In Review
              </span>
              <button
                onClick={() => onResolve(issue.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-900 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <CheckIcon />
                Resolve
              </button>
            </>
          )}
          {issue.status === "resolved" && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-600 bg-green-50 rounded-lg">
              <CheckIcon />
              Resolved
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Compliance() {
  const [activeTab, setActiveTab] = useState<"overview" | "issues" | "settings">("overview");
  const [issues, setIssues] = useState(issuesData);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "fine" | "risk">("date");

  const handleResolve = (id: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, status: "resolved" as const } : issue
    ));
  };

  const handleMarkInReview = (id: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, status: "in_review" as const } : issue
    ));
  };

  // Get unique locations and categories for filters
  const uniqueLocations = Array.from(new Set(issues.map(i => i.location))).sort();
  const uniqueCategories = Array.from(new Set(issues.map(i => i.category))).sort();

  // Filter and sort issues
  const filteredIssues = issues
    .filter(issue => {
      const matchesSearch = searchQuery === "" || 
        issue.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.worker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.detail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = filterLocation === "" || issue.location === filterLocation;
      const matchesCategory = filterCategory === "" || issue.category === filterCategory;
      return matchesSearch && matchesLocation && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "fine":
          return b.potentialFine - a.potentialFine;
        case "risk":
          const riskOrder = { high: 3, medium: 2, low: 1 };
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        case "date":
        default:
          return new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime();
      }
    });

  const openIssues = issues.filter(i => i.status === "open");
  const inReviewIssues = issues.filter(i => i.status === "in_review");
  const resolvedIssues = issues.filter(i => i.status === "resolved");

  return (
    <div className="p-8 lg:p-12 min-h-full max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Compliance</h1>
          <p className="mt-1 text-gray-500">Monitor and resolve compliance issues across your organization</p>
        </div>
        <button
          onClick={() => setIsUnlocked(!isUnlocked)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={isUnlocked ? "Show paywall view" : "Show unlocked view"}
        >
          {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </button>
      </div>

      {/* Paywall View */}
      {!isUnlocked && (
        <div className="space-y-6">
          {/* Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compliance Issues</h3>
                </div>
                <div className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <p className="text-4xl font-semibold text-gray-900">17</p>
                <span className="text-sm font-medium text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  21% vs last week
                </span>
              </div>
              <div className="mt-5 pt-5 border-t border-gray-100 blur-sm select-none">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ready to Work</span>
                    <span className="text-sm font-medium">11</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time & Pay</span>
                    <span className="text-sm font-medium">6</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" style={{ top: '50%' }} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Potential Fines</h3>
                </div>
                <div className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <p className="text-4xl font-semibold text-gray-900">$19,487</p>
                <span className="text-sm font-medium text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  28% vs last week
                </span>
              </div>
              <div className="mt-5 pt-5 border-t border-gray-100 blur-sm select-none">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ready to Work</span>
                    <span className="text-sm font-medium">$1,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time & Pay</span>
                    <span className="text-sm font-medium">$17,987</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" style={{ top: '50%' }} />
            </div>
          </div>

          {/* CTA Card - Hero */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Unlock Compliance Shield</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Get full access to compliance monitoring, issue tracking, AI-powered insights, 
                and proactive alerts to help you avoid costly fines and stay compliant.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:sales@company.com"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Contact Sales
                </a>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Schedule a Demo
                </a>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Already have access? <button className="text-white underline hover:no-underline">Sign in</button>
              </p>
            </div>
          </div>

          {/* Feature List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Real-time Monitoring", desc: "Track compliance issues across all locations as they happen" },
              { title: "AI-Powered Insights", desc: "Get intelligent recommendations to prioritize and resolve issues" },
              { title: "Proactive Alerts", desc: "Receive notifications before issues become costly violations" },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Blurred Heatmap Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 relative">
            <h3 className="font-medium text-gray-900 mb-4">Issues by Location</h3>
            <div className="blur-sm select-none">
              <div className="grid grid-cols-5 gap-2">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`h-8 rounded ${i % 3 === 0 ? 'bg-blue-200' : i % 5 === 0 ? 'bg-blue-400' : 'bg-gray-100'}`} />
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none rounded-xl" style={{ top: '30%' }} />
          </div>
        </div>
      )}

      {/* Unlocked Content */}
      {isUnlocked && (
        <>
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-200">
          {[
            { id: "overview", label: "Overview" },
            { id: "issues", label: "Issues" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
          ))}
        </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Stats with Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard
              title="Compliance Issues"
              value={complianceData.totalIssues}
              categories={complianceData.categories.map(c => ({ name: c.name, value: c.issues }))}
              icon={<ShieldAlert className="w-5 h-5" />}
              changeFromLastWeek={Math.round(((complianceData.totalIssues - complianceData.totalIssuesLastWeek) / complianceData.totalIssuesLastWeek) * 100)}
              showInfo
            />
            <SummaryCard
              title="Potential Fines"
              value={`$${complianceData.potentialFines.toLocaleString()}`}
              categories={complianceData.categories.map(c => ({ name: c.name, value: c.fines }))}
              icon={<DollarSign className="w-5 h-5" />}
              changeFromLastWeek={Math.round(((complianceData.potentialFines - complianceData.potentialFinesLastWeek) / complianceData.potentialFinesLastWeek) * 100)}
              formatValue={(v) => `$${v.toLocaleString()}`}
            />
          </div>

          {/* AI Overview */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">AI Overview</h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">Beta</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  You have <span className="font-semibold text-gray-900">17 compliance issues</span> that require attention, 
                  with potential fines totaling <span className="font-semibold text-gray-900">$19,487</span>. 
                  The majority of issues (<span className="font-semibold">65%</span>) are related to <span className="font-semibold text-gray-900">Ready to Work</span> violations, 
                  primarily I-9 form completion delays at your <span className="font-semibold text-gray-900">San Francisco - Market St</span> location.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-3">
                  <span className="font-semibold text-red-600">⚠ Priority:</span> Address the 6 <span className="font-semibold">Time & Pay</span> issues first — 
                  they account for <span className="font-semibold text-gray-900">92% of potential fines</span> ($17,987) and include overtime premium violations 
                  that could escalate if not resolved within the current pay period.
                </p>
                <div className="flex items-center justify-between mt-4">
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                    View Priority Issues
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 mr-2">Was this helpful?</span>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="mt-8">
            <HeatmapCard
              title="Issues by Location"
              rows={locations}
              columns={categoryNames}
              data={locationHeatmapData}
            />
          </div>

          {/* Issues Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Issues</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {openIssues.length} open · {inReviewIssues.length} in review · {resolvedIssues.length} resolved
                </p>
              </div>
              <button
                onClick={() => setActiveTab("issues")}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                View all →
              </button>
            </div>

            <div className="space-y-4">
              {issues.slice(0, 4).map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onResolve={handleResolve}
                  onMarkInReview={handleMarkInReview}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "issues" && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all"
              >
                <option value="date">Sort by Date</option>
                <option value="fine">Sort by Fine Amount</option>
                <option value="risk">Sort by Risk Level</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredIssues.length} of {issues.length} issues · {openIssues.length} open · {inReviewIssues.length} in review · {resolvedIssues.length} resolved
            </p>
            {(searchQuery || filterLocation || filterCategory) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterLocation("");
                  setFilterCategory("");
                }}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onResolve={handleResolve}
                onMarkInReview={handleMarkInReview}
              />
            ))}

            {filteredIssues.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-medium text-gray-900">No issues found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-medium text-gray-900">Compliance Settings</h3>
          <p className="mt-1 text-sm text-gray-500">Configure alerts and notification preferences</p>
        </div>
      )}
      </>
      )}
    </div>
  );
}
