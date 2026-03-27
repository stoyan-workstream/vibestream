export interface PayrollRow {
  "Checkhq Payroll Id": string;
  "Payroll Name": string;
  "Payday (Day)": string;
  "Company Legal Name": string;
  "Last Name": string;
  "First Name": string;
  "Labor Cost (Sum)": string;
  "Gross Pay (Sum)": string;
  "Net Pay (Sum)": string;
  "Hours Worked (Sum)": string;
  [key: string]: string;
}

export interface LedgerLine {
  num: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  name: string;
  date: string;
  class: string;
  docNum: string;
  memo: string;
}

export interface Config {
  clientName: string;
  companyName: string;
  glFileName: string;
  journalNo: string;
  journalDate: string;
  coaMap: string;
  payrollId: string;
}

export interface AccountMappingRow {
  key: string;
  label: string;
  accountCode: string;
  accountName: string;
}
