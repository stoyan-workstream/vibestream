"use client";

import React, { useState } from "react";
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

const locationFinesData: Record<string, Record<string, number>> = {
  "San Francisco - Market St": { "Ready to Work": 2500, "Time & Pay": 9587, "Safety & Claims": 0, "Filing & Reporting": 0 },
  "San Francisco - Mission District": { "Ready to Work": 1500, "Time & Pay": 6400, "Safety & Claims": 0, "Filing & Reporting": 0 },
  "Oakland - Downtown": { "Ready to Work": 1000, "Time & Pay": 0, "Safety & Claims": 0, "Filing & Reporting": 0 },
  "San Jose - Santana Row": { "Ready to Work": 0, "Time & Pay": 0, "Safety & Claims": 0, "Filing & Reporting": 0 },
  "Palo Alto - University Ave": { "Ready to Work": 500, "Time & Pay": 0, "Safety & Claims": 0, "Filing & Reporting": 0 },
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
  resolvedBy?: string;
  resolvedDate?: string;
  resolutionComment?: string;
}

// Compliance rules data
interface ComplianceRule {
  id: string;
  name: string;
  category: "Time & Pay" | "Ready to Work" | "Safety & Claims" | "Filing & Reporting";
  state: string;
  city: string;
  effectiveDate: string;
  reference: string;
  status: "active" | "amended" | "upcoming";
  description: string;
}

const rulesData: ComplianceRule[] = [
  // Time & Pay Rules
  {
    id: "1",
    name: "California Minimum Wage 2026",
    category: "Time & Pay",
    state: "California",
    city: "",
    effectiveDate: "2026",
    reference: "LC 1182.12",
    status: "active",
    description: "Establishes minimum wage of $16.50/hr statewide. Fast food workers covered under AB 1228 have separate $20/hr minimum.",
  },
  {
    id: "2",
    name: "San Francisco Minimum Wage 2026",
    category: "Time & Pay",
    state: "California",
    city: "San Francisco",
    effectiveDate: "2026",
    reference: "SFMC 12R",
    status: "active",
    description: "San Francisco minimum wage of $18.67/hr, adjusted annually based on CPI.",
  },
  {
    id: "3",
    name: "California Fast Food Minimum Wage",
    category: "Time & Pay",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "AB 1228",
    status: "active",
    description: "Fast food restaurant employees minimum wage of $20/hr. Applies to establishments with 60+ locations nationally.",
  },
  {
    id: "4",
    name: "California Overtime Requirements",
    category: "Time & Pay",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "LC 510",
    status: "active",
    description: "1.5x pay for hours over 8/day or 40/week. 2x pay for hours over 12/day or over 8 on 7th consecutive day.",
  },
  {
    id: "5",
    name: "California Meal Break Requirements",
    category: "Time & Pay",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "LC 512",
    status: "active",
    description: "30-minute unpaid meal break for shifts over 5 hours. Second meal break required for shifts over 10 hours.",
  },
  {
    id: "6",
    name: "California Rest Break Requirements",
    category: "Time & Pay",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "LC 226.7",
    status: "active",
    description: "10-minute paid rest break per 4 hours worked. Must be in middle of work period when practicable.",
  },
  {
    id: "7",
    name: "San Jose Minimum Wage 2026",
    category: "Time & Pay",
    state: "California",
    city: "San Jose",
    effectiveDate: "2026",
    reference: "SJMC 4.100",
    status: "active",
    description: "San Jose minimum wage of $17.55/hr for all employers.",
  },
  {
    id: "8",
    name: "California Split Shift Premium",
    category: "Time & Pay",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "IWC Order 5",
    status: "active",
    description: "One hour of pay at minimum wage for each split shift worked.",
  },
  {
    id: "9",
    name: "Oakland Minimum Wage 2026",
    category: "Time & Pay",
    state: "California",
    city: "Oakland",
    effectiveDate: "2026",
    reference: "OMC 5.92",
    status: "active",
    description: "Oakland minimum wage of $16.50/hr, adjusted annually based on CPI.",
  },
  {
    id: "10",
    name: "Los Angeles Minimum Wage 2026",
    category: "Time & Pay",
    state: "California",
    city: "Los Angeles",
    effectiveDate: "2026",
    reference: "LAMC 187",
    status: "active",
    description: "Los Angeles minimum wage of $17.28/hr for employers with 26+ employees.",
  },
  {
    id: "11",
    name: "Berkeley Minimum Wage 2026",
    category: "Time & Pay",
    state: "California",
    city: "Berkeley",
    effectiveDate: "2026",
    reference: "BMC 13.99",
    status: "active",
    description: "Berkeley minimum wage of $18.07/hr, adjusted annually based on CPI.",
  },
  // Ready to Work Rules
  {
    id: "12",
    name: "I-9 Employment Verification",
    category: "Ready to Work",
    state: "Federal",
    city: "",
    effectiveDate: "2024",
    reference: "8 USC 1324a",
    status: "amended",
    description: "Section 1 completed by employee on first day. Section 2 completed within 3 business days of hire.",
  },
  {
    id: "13",
    name: "E-Verify Requirements",
    category: "Ready to Work",
    state: "Federal",
    city: "",
    effectiveDate: "2024",
    reference: "FAR 52.222-54",
    status: "active",
    description: "Electronic employment eligibility verification. Required for federal contractors.",
  },
  {
    id: "14",
    name: "California New Hire Reporting",
    category: "Ready to Work",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "UC 1088.5",
    status: "active",
    description: "Report new hires within 20 days to California Employment Development Department.",
  },
  {
    id: "15",
    name: "Minor Work Permit Requirements",
    category: "Ready to Work",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "LC 1299",
    status: "active",
    description: "Work permits required for minors under 18. School must issue permit before employment begins.",
  },
  {
    id: "16",
    name: "Minor Working Hours Restrictions",
    category: "Ready to Work",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "LC 1391",
    status: "active",
    description: "16-17 year olds: max 4 hrs on school days, 8 hrs on non-school days. 14-15: max 3 hrs school days.",
  },
  {
    id: "17",
    name: "Food Handler Certification",
    category: "Ready to Work",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "HSC 113948",
    status: "active",
    description: "All food handlers must obtain food handler card within 30 days of hire.",
  },
  {
    id: "18",
    name: "San Francisco Food Handler Card",
    category: "Ready to Work",
    state: "California",
    city: "San Francisco",
    effectiveDate: "2024",
    reference: "SFDPH",
    status: "active",
    description: "San Francisco requires food handler certification from SFDPH-approved providers within 30 days of hire.",
  },
  // Safety & Claims Rules
  {
    id: "19",
    name: "Cal/OSHA Heat Illness Prevention",
    category: "Safety & Claims",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "8 CCR 3395",
    status: "amended",
    description: "Water, shade, and rest required when temps exceed 80°F. Training required for all employees.",
  },
  {
    id: "20",
    name: "Cal/OSHA Injury & Illness Prevention",
    category: "Safety & Claims",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "8 CCR 3203",
    status: "active",
    description: "Written IIPP required. Must include hazard assessment, training records, and incident investigation procedures.",
  },
  {
    id: "21",
    name: "Workers Compensation Insurance",
    category: "Safety & Claims",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "LC 3700",
    status: "active",
    description: "All employers must maintain workers compensation coverage. Post notice of coverage in workplace.",
  },
  {
    id: "22",
    name: "OSHA Workplace Posting Requirements",
    category: "Safety & Claims",
    state: "Federal",
    city: "",
    effectiveDate: "2024",
    reference: "29 CFR 1903.2",
    status: "active",
    description: "OSHA Job Safety and Health poster must be displayed in conspicuous location.",
  },
  {
    id: "23",
    name: "Cal/OSHA Violence Prevention Plan",
    category: "Safety & Claims",
    state: "California",
    city: "",
    effectiveDate: "2025",
    reference: "SB 553",
    status: "upcoming",
    description: "Written workplace violence prevention plan required. Training and incident logging mandatory.",
  },
  {
    id: "24",
    name: "San Francisco Paid Sick Leave",
    category: "Safety & Claims",
    state: "California",
    city: "San Francisco",
    effectiveDate: "2024",
    reference: "SFAC 12W",
    status: "active",
    description: "1 hour of paid sick leave for every 30 hours worked. No cap for large employers.",
  },
  // Filing & Reporting Rules
  {
    id: "25",
    name: "California Pay Data Reporting",
    category: "Filing & Reporting",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "SB 1162",
    status: "active",
    description: "Annual pay data report due by second Wednesday of May. Include pay scales in job postings.",
  },
  {
    id: "26",
    name: "Form 941 Quarterly Filing",
    category: "Filing & Reporting",
    state: "Federal",
    city: "",
    effectiveDate: "2024",
    reference: "26 USC 6011",
    status: "active",
    description: "Quarterly federal tax return for wages, tips, and withheld taxes.",
  },
  {
    id: "27",
    name: "California DE-9 Quarterly Filing",
    category: "Filing & Reporting",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "UC 1088",
    status: "active",
    description: "Quarterly contribution return and report of wages to EDD.",
  },
  {
    id: "28",
    name: "California Wage Theft Notice",
    category: "Filing & Reporting",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "LC 2810.5",
    status: "active",
    description: "Written notice to employees at hire with pay rate, pay day, and employer information.",
  },
  {
    id: "29",
    name: "California Itemized Wage Statement",
    category: "Filing & Reporting",
    state: "California",
    city: "",
    effectiveDate: "2024",
    reference: "LC 226",
    status: "active",
    description: "Detailed pay stub required each pay period showing hours, rates, deductions, and employer address.",
  },
  {
    id: "30",
    name: "San Francisco Fair Chance Ordinance",
    category: "Filing & Reporting",
    state: "California",
    city: "San Francisco",
    effectiveDate: "2024",
    reference: "SFPC 4900",
    status: "active",
    description: "Prohibits asking about criminal history until after conditional offer. Must provide written notice before adverse action.",
  },
];

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
  finesData?: Record<string, Record<string, number>>;
}

interface HeatmapTooltipData {
  location: string;
  category: string;
  issues: number;
  fines: number;
  x: number;
  y: number;
}

const HeatmapCard = ({ title, rows, columns, data, finesData }: HeatmapCardProps) => {
  const [tooltip, setTooltip] = useState<HeatmapTooltipData | null>(null);
  
  const maxValue = Math.max(
    ...Object.values(data).flatMap(row => Object.values(row))
  );

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    location: string,
    category: string,
    issues: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fines = finesData?.[location]?.[category] || issues * 500; // Estimate $500 per issue if no fines data
    setTooltip({
      location,
      category,
      issues,
      fines,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const getSeverityLabel = (issues: number) => {
    if (issues === 0) return { label: "No issues", color: "text-green-600" };
    if (issues <= 2) return { label: "Low", color: "text-amber-600" };
    if (issues <= 4) return { label: "Medium", color: "text-orange-600" };
    return { label: "High", color: "text-red-600" };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 relative">
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
                        onMouseEnter={(e) => handleMouseEnter(e, row, col, value)}
                        onMouseLeave={() => setTooltip(null)}
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

      {/* Tooltip */}
      {tooltip && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-gray-900 text-white rounded-lg shadow-xl p-4 min-w-[220px]">
            {/* Location & Category */}
            <div className="mb-3">
              <p className="font-medium text-white">{tooltip.location}</p>
              <p className="text-xs text-gray-400">{tooltip.category}</p>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Issues</span>
                <span className="text-sm font-semibold">{tooltip.issues}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Est. Fines</span>
                <span className="text-sm font-semibold">${tooltip.fines.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Severity</span>
                <span className={`text-sm font-semibold ${getSeverityLabel(tooltip.issues).color}`}>
                  {getSeverityLabel(tooltip.issues).label}
                </span>
              </div>
            </div>

            {/* Action hint */}
            {tooltip.issues > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-400">Click to view issues</p>
              </div>
            )}

            {/* Arrow */}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

interface IssueCardProps {
  issue: ComplianceIssue;
  onResolve: (id: string, comment: string) => void;
  onMarkInReview: (id: string) => void;
}

const BellIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IssueCard = ({ issue, onResolve, onMarkInReview }: IssueCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showResolvePopup, setShowResolvePopup] = useState(false);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [comment, setComment] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');

  const handleResolve = () => {
    onResolve(issue.id, comment);
    setShowResolvePopup(false);
    setComment('');
  };

  const handleSetReminder = () => {
    // In a real app, this would save the reminder
    alert(`Reminder set for ${reminderDate} at ${reminderTime}`);
    setShowReminderPopup(false);
    setReminderDate('');
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 transition-all ${
      issue.status === "resolved" ? "opacity-80" : ""
    }`}>
      {/* Main Row */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium text-sm flex-shrink-0">
          {issue.worker.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Worker & Location */}
        <div className="min-w-[140px]">
          <h3 className="font-semibold text-gray-900">{issue.worker}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <LocationIcon />
            <span>{issue.location}</span>
          </div>
        </div>

        {/* Rule name with category inline - flexible middle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800 truncate">{issue.ruleName}</p>
            <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getCategoryStyle(issue.category)}`}>
              {issue.category}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            <span className="truncate">{issue.summary}</span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-500 hover:text-gray-800 transition-colors ml-2"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          </p>
        </div>

        {/* Fine amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-500">Potential Fine</p>
          <p className="text-lg font-semibold text-gray-900">${issue.potentialFine.toLocaleString()}</p>
        </div>
      </div>

      {/* Expandable detail */}
      {expanded && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">
          {issue.detail}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {issue.reportDate}
          </span>
          {issue.status === "resolved" && issue.resolvedBy && (
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-xs text-gray-600">
                Resolved by <span className="font-medium">{issue.resolvedBy}</span> on {issue.resolvedDate}
              </span>
              {issue.resolutionComment && (
                <span className="text-xs text-gray-600 italic">
                  &ldquo;{issue.resolutionComment}&rdquo;
                </span>
              )}
              <span className="flex items-center gap-1.5 px-2 py-1 text-xs text-green-600 bg-green-50 rounded w-fit mt-1">
                <CheckIcon />
                Resolved
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {issue.status === "open" && (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowReminderPopup(!showReminderPopup)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <BellIcon />
                  Remind
                </button>
                {/* Reminder Popup */}
                {showReminderPopup && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowReminderPopup(false)}
                    />
                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      <div className="p-4 space-y-3">
                        <p className="text-sm font-medium text-gray-700">Set a reminder</p>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Date</label>
                            <input
                              type="date"
                              value={reminderDate}
                              onChange={(e) => setReminderDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Time</label>
                            <input
                              type="time"
                              value={reminderTime}
                              onChange={(e) => setReminderTime(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleSetReminder}
                          disabled={!reminderDate}
                          className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Set Reminder
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => onMarkInReview(issue.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ClockIcon />
                Mark In Review
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowResolvePopup(!showResolvePopup)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <CheckIcon />
                  Resolve
                </button>
                {/* Resolve Popup */}
                {showResolvePopup && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowResolvePopup(false)}
                    />
                    <div className="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      <div className="p-4 space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Add a comment (optional)
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Describe how this was resolved..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                        />
                        <button
                          onClick={handleResolve}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <CheckIcon />
                          Confirm Resolution
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          {issue.status === "in_review" && (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowReminderPopup(!showReminderPopup)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <BellIcon />
                  Remind
                </button>
                {showReminderPopup && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowReminderPopup(false)}
                    />
                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      <div className="p-4 space-y-3">
                        <p className="text-sm font-medium text-gray-700">Set a reminder</p>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Date</label>
                            <input
                              type="date"
                              value={reminderDate}
                              onChange={(e) => setReminderDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Time</label>
                            <input
                              type="time"
                              value={reminderTime}
                              onChange={(e) => setReminderTime(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleSetReminder}
                          disabled={!reminderDate}
                          className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Set Reminder
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 bg-amber-50 rounded-lg">
                <ClockIcon />
                In Review
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowResolvePopup(!showResolvePopup)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <CheckIcon />
                  Resolve
                </button>
                {showResolvePopup && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowResolvePopup(false)}
                    />
                    <div className="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      <div className="p-4 space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Add a comment (optional)
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Describe how this was resolved..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                        />
                        <button
                          onClick={handleResolve}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <CheckIcon />
                          Confirm Resolution
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// AI Overview Card with cursor-following gradient
const AIOverviewCard = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Border color shifts based on position
  const borderHue = 210 + (mousePos.x / 100) * 30;

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePos({ x: 50, y: 50 });
      }}
      className="relative rounded-xl p-6 mt-8 overflow-hidden bg-white border border-gray-200 transition-colors duration-500"
      style={{ 
        borderColor: isHovering ? `hsl(${borderHue}, 60%, 75%)` : undefined,
      }}
    >
      {/* Ambient animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blob 1 - top left corner, large cyan - slight cursor react */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl bg-sky-200/25 animate-blob-1"
          style={{
            left: `calc(-120px + ${mousePos.x * 0.15}px)`,
            top: `calc(-120px + ${mousePos.y * 0.15}px)`,
            transition: 'left 1.5s ease-out, top 1.5s ease-out',
          }}
        />
        {/* Blob 2 - top right, violet - medium cursor react */}
        <div 
          className="absolute w-[350px] h-[350px] rounded-full blur-3xl bg-violet-200/20 animate-blob-2"
          style={{
            right: `calc(-100px + ${(100 - mousePos.x) * 0.2}px)`,
            top: `calc(-80px + ${mousePos.y * 0.1}px)`,
            transition: 'right 1.8s ease-out, top 1.8s ease-out',
          }}
        />
        {/* Blob 3 - bottom right, large indigo - strong cursor react */}
        <div 
          className="absolute w-[450px] h-[450px] rounded-full blur-3xl bg-indigo-200/20 animate-blob-3"
          style={{
            right: `calc(-150px + ${(100 - mousePos.x) * 0.25}px)`,
            bottom: `calc(-180px + ${(100 - mousePos.y) * 0.25}px)`,
            transition: 'right 2s ease-out, bottom 2s ease-out',
          }}
        />
        {/* Blob 4 - bottom left, teal - slight cursor react */}
        <div 
          className="absolute w-[300px] h-[300px] rounded-full blur-3xl bg-cyan-200/25 animate-blob-4"
          style={{
            left: `calc(-80px + ${mousePos.x * 0.1}px)`,
            bottom: `calc(-100px + ${(100 - mousePos.y) * 0.15}px)`,
            transition: 'left 1.6s ease-out, bottom 1.6s ease-out',
          }}
        />
        {/* Blob 5 - wanderer, purple */}
        <div 
          className="absolute left-[25%] top-[15%] w-[250px] h-[250px] rounded-full blur-3xl bg-purple-200/20 animate-blob-5"
        />
        {/* Blob 6 - small accent, moves a lot */}
        <div 
          className="absolute right-[15%] bottom-[25%] w-[180px] h-[180px] rounded-full blur-2xl bg-blue-200/25 animate-blob-6"
        />
        
        {/* Primary cursor glow - follows smoothly */}
        <div 
          className="absolute w-[350px] h-[350px] rounded-full blur-3xl"
          style={{
            background: 'rgba(56, 189, 248, 0.12)',
            left: `calc(${mousePos.x}% - 175px)`,
            top: `calc(${mousePos.y}% - 175px)`,
            opacity: isHovering ? 0.8 : 0,
            transition: 'left 0.8s ease-out, top 0.8s ease-out, opacity 0.5s ease-out',
          }}
        />
      </div>
      
      <div className="relative flex items-start gap-4">
        <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden">
          {/* Rotating gradient border */}
          <style>{`
            @keyframes border-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div 
            className="absolute"
            style={{
              inset: '-50%',
              background: 'conic-gradient(#60a5fa, #818cf8, #a78bfa, #93c5fd, #6366f1, #60a5fa)',
              animation: 'border-spin 3s linear infinite',
            }}
          />
          {/* Inner background */}
          <div className="absolute inset-[2px] rounded-md bg-gradient-to-br from-blue-500 to-indigo-600" />
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8)) drop-shadow(0 0 8px rgba(147,197,253,0.6))' }} />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">AI Overview</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Beta</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            You have <span className="font-semibold text-gray-900">17 compliance issues</span> that require attention, 
            with potential fines totaling <span className="font-semibold text-gray-900">$19,487</span>. 
            The majority of issues (<span className="font-semibold">65%</span>) are related to <span className="font-semibold text-gray-900">Ready to Work</span> violations, 
            primarily I-9 form completion delays at your <span className="font-semibold text-gray-900">San Francisco - Market St</span> location.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            <span className="font-semibold text-amber-600">⚠ Priority:</span> Address the 6 <span className="font-semibold">Time & Pay</span> issues first — 
            they account for <span className="font-semibold text-gray-900">92% of potential fines</span> ($17,987) and include overtime premium violations 
            that could escalate if not resolved within the current pay period.
          </p>
          <div className="flex items-center justify-between mt-4">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-blue-500/25">
              View Priority Issues
            </button>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-2">Was this helpful?</span>
              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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
  );
};

// Rule category icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Time & Pay":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "Ready to Work":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "Safety & Claims":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "Filing & Reporting":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
  }
};

const getCategoryIconBgColor = (category: string) => {
  switch (category) {
    case "Time & Pay":
      return "bg-blue-50 text-blue-600";
    case "Ready to Work":
      return "bg-amber-50 text-amber-600";
    case "Safety & Claims":
      return "bg-red-50 text-red-600";
    case "Filing & Reporting":
      return "bg-purple-50 text-purple-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-50 text-green-700";
    case "amended":
      return "bg-blue-50 text-blue-700";
    case "upcoming":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

interface RuleCardProps {
  rule: ComplianceRule;
  onClick: () => void;
  isSelected: boolean;
}

const RuleCard = ({ rule, onClick, isSelected }: RuleCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer ${
        isSelected ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getCategoryIconBgColor(rule.category)}`}>
          {getCategoryIcon(rule.category)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 leading-tight">{rule.name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{rule.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeStyle(rule.status)}`}>
              {rule.reference}
            </span>
            <span className="text-xs text-gray-400">{rule.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rule Detail Sidebar
interface RuleDetailSidebarProps {
  rule: ComplianceRule | null;
  onClose: () => void;
}

const RuleDetailSidebar = ({ rule, onClose }: RuleDetailSidebarProps) => {
  if (!rule) return null;

  const getJurisdictionLabel = () => {
    if (rule.city) {
      return `${rule.city}, ${rule.state}`;
    }
    return rule.state;
  };

  const getEffectiveDateRange = () => {
    const startYear = parseInt(rule.effectiveDate);
    if (rule.status === "upcoming") {
      return `Starting ${rule.effectiveDate}`;
    }
    return `Effective since ${rule.effectiveDate}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryIconBgColor(rule.category)}`}>
              {getCategoryIcon(rule.category)}
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryStyle(rule.category)}`}>
              {rule.category}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
            {rule.name}
          </h1>

          {/* Rule Info Card */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Rule Info</h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(rule.status)} capitalize`}>
                {rule.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Reference Code</span>
                <span className="text-sm font-medium text-gray-900">{rule.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Jurisdiction</span>
                <span className="text-sm font-medium text-gray-900">{getJurisdictionLabel()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Effective Date</span>
                <span className="text-sm font-medium text-gray-900">{getEffectiveDateRange()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Category</span>
                <span className="text-sm font-medium text-gray-900">{rule.category}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Adoption Timeline</h2>
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
              
              <div className="relative mb-4">
                <div className={`absolute -left-4 w-3 h-3 rounded-full ${
                  rule.status === "active" ? "bg-green-500" : 
                  rule.status === "upcoming" ? "bg-amber-500" : "bg-blue-500"
                }`} />
                <p className="text-sm font-medium text-gray-900">
                  {rule.status === "upcoming" ? "Effective" : "In Effect"} {rule.effectiveDate}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {rule.status === "upcoming" ? "Upcoming regulation" : "Currently enforced"}
                </p>
              </div>

              {rule.status === "amended" && (
                <div className="relative mb-4">
                  <div className="absolute -left-4 w-3 h-3 rounded-full bg-blue-500" />
                  <p className="text-sm font-medium text-gray-900">Recently Amended</p>
                  <p className="text-xs text-gray-500 mt-0.5">Updated requirements in effect</p>
                </div>
              )}

              <div className="relative">
                <div className="absolute -left-4 w-3 h-3 rounded-full bg-gray-300" />
                <p className="text-sm font-medium text-gray-500">Originally Enacted</p>
                <p className="text-xs text-gray-400 mt-0.5">Based on {rule.state} labor code</p>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Overview</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {rule.description}
            </p>
          </div>

          {/* Compliance Tips */}
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-amber-900 mb-1">Compliance Tip</h3>
                <p className="text-sm text-amber-700">
                  Ensure all managers and supervisors are trained on this requirement. 
                  Document compliance procedures and keep records for at least 3 years.
                </p>
              </div>
            </div>
          </div>

          {/* Related Issues */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Related Issues</h2>
              <span className="text-xs text-gray-400">Based on this rule</span>
            </div>
            <div className="text-center py-6 text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No open issues for this rule</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              View Full Documentation
            </button>
            <button className="px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Compliance() {
  const [activeTab, setActiveTab] = useState<"overview" | "issues" | "rules" | "settings">("overview");
  const [issues, setIssues] = useState(issuesData);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Filter and sort state for issues
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "fine" | "risk">("date");

  // Filter state for rules
  const [rulesSearchQuery, setRulesSearchQuery] = useState("");
  const [rulesFilterCategory, setRulesFilterCategory] = useState<string>("");
  const [rulesFilterState, setRulesFilterState] = useState<string>("");
  const [rulesFilterCity, setRulesFilterCity] = useState<string>("");
  const [rulesFilterStatus, setRulesFilterStatus] = useState<string>("");
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);

  const handleResolve = (id: string, comment: string) => {
    const today = new Date();
    const resolvedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { 
        ...issue, 
        status: "resolved" as const,
        resolvedBy: "Current User",
        resolvedDate,
        resolutionComment: comment || undefined
      } : issue
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

  // Get unique values for rules filters
  const uniqueRulesCategories = Array.from(new Set(rulesData.map(r => r.category))).sort();
  const uniqueStates = Array.from(new Set(rulesData.map(r => r.state))).sort();
  const uniqueCities = Array.from(new Set(rulesData.map(r => r.city).filter(c => c !== ""))).sort();
  const uniqueStatuses = Array.from(new Set(rulesData.map(r => r.status))).sort();

  // Filter rules
  const filteredRules = rulesData.filter(rule => {
    const matchesSearch = rulesSearchQuery === "" ||
      rule.name.toLowerCase().includes(rulesSearchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(rulesSearchQuery.toLowerCase()) ||
      rule.reference.toLowerCase().includes(rulesSearchQuery.toLowerCase());
    const matchesCategory = rulesFilterCategory === "" || rule.category === rulesFilterCategory;
    const matchesState = rulesFilterState === "" || rule.state === rulesFilterState;
    const matchesCity = rulesFilterCity === "" || rule.city === rulesFilterCity;
    const matchesStatus = rulesFilterStatus === "" || rule.status === rulesFilterStatus;
    return matchesSearch && matchesCategory && matchesState && matchesCity && matchesStatus;
  });

  // Group rules by category
  const rulesByCategory = filteredRules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, ComplianceRule[]>);

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
        <div className="space-y-8">
          {/* Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compliance Issues</h3>
                <div className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-semibold text-gray-900 mt-2">17</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Potential Fines</h3>
                <div className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-semibold text-gray-900 mt-2">$19,487</p>
            </div>
          </div>

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Unlock Compliance Shield</h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
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
            </div>
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
            { id: "rules", label: "Rules" },
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
          <AIOverviewCard />

          {/* Heatmap */}
          <div className="mt-8">
            <HeatmapCard
              title="Issues by Location"
              rows={locations}
              columns={categoryNames}
              data={locationHeatmapData}
              finesData={locationFinesData}
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

      {activeTab === "rules" && (
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
                value={rulesSearchQuery}
                onChange={(e) => setRulesSearchQuery(e.target.value)}
                placeholder="Filter rules by name, reference, or description..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={rulesFilterCategory}
                onChange={(e) => setRulesFilterCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all"
              >
                <option value="">All Categories</option>
                {uniqueRulesCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* State Filter */}
            <div className="relative">
              <select
                value={rulesFilterState}
                onChange={(e) => setRulesFilterState(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all"
              >
                <option value="">All States</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* City Filter */}
            <div className="relative">
              <select
                value={rulesFilterCity}
                onChange={(e) => setRulesFilterCity(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all"
              >
                <option value="">All Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={rulesFilterStatus}
                onChange={(e) => setRulesFilterStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status} className="capitalize">{status}</option>
                ))}
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
              Rules ({filteredRules.length})
            </p>
            {(rulesSearchQuery || rulesFilterCategory || rulesFilterState || rulesFilterCity || rulesFilterStatus) && (
              <button
                onClick={() => {
                  setRulesSearchQuery("");
                  setRulesFilterCategory("");
                  setRulesFilterState("");
                  setRulesFilterCity("");
                  setRulesFilterStatus("");
                }}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Rules Grid by Category */}
          {Object.entries(rulesByCategory).map(([category, rules]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {rules.map((rule) => (
                  <RuleCard 
                    key={rule.id} 
                    rule={rule} 
                    onClick={() => setSelectedRule(rule)}
                    isSelected={selectedRule?.id === rule.id}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredRules.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-medium text-gray-900">No rules found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
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

      {/* Rule Detail Sidebar */}
      <RuleDetailSidebar 
        rule={selectedRule} 
        onClose={() => setSelectedRule(null)} 
      />
    </div>
  );
}
