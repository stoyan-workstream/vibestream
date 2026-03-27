import type { AccountMappingRow } from "./types";

export const DEFAULT_ACCOUNT_MAPPING: AccountMappingRow[] = [
  { key: "regular_earnings", label: "Regular Earnings", accountCode: "5201", accountName: "CG Labor/Wages" },
  { key: "overtime", label: "Overtime", accountCode: "5214", accountName: "CG Overtime" },
  { key: "pto", label: "PTO", accountCode: "5201", accountName: "CG Labor/Wages" },
  { key: "travel_time", label: "Travel Time", accountCode: "5215", accountName: "CG Travel Time" },
  { key: "employer_taxes", label: "Employer Taxes", accountCode: "5204", accountName: "CG Payroll Tax" },
  { key: "employer_benefits", label: "Benefits (Employer)", accountCode: "5206", accountName: "CG Health Benefits" },
  { key: "reimbursements", label: "Reimbursements", accountCode: "5021", accountName: "Auto Reimbursement" },
  { key: "tax_liabilities", label: "Tax Liabilities", accountCode: "2110", accountName: "Payroll Liabilities" },
  { key: "cash_net", label: "Cash - Net Pay", accountCode: "1010", accountName: "Checking" },
  { key: "cash_taxes", label: "Cash - Taxes", accountCode: "1010", accountName: "Checking" },
];
