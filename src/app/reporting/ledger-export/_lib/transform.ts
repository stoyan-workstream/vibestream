import type { PayrollRow, LedgerLine, AccountMappingRow } from "./types";
import { round2 } from "./helpers";

function makeLine(
  num: number, accountCode: string, accountName: string,
  debit: number, credit: number, description: string, name: string, date: string,
): LedgerLine {
  return { num, accountCode, accountName, debit, credit, description, name, date, class: "", docNum: "", memo: "" };
}

export function transformToLedgerLines(rows: PayrollRow[], companyName: string, mapping: AccountMappingRow[]): LedgerLine[] {
  const filtered = rows
    .filter((r) => r["Company Legal Name"] === companyName)
    .sort((a, b) => a["Last Name"].localeCompare(b["Last Name"]) || a["First Name"].localeCompare(b["First Name"]));

  if (!filtered.length) return [];

  const acct = (key: string) => {
    const row = mapping.find((m) => m.key === key);
    return row ? { code: row.accountCode, name: row.accountName } : { code: "", name: "" };
  };

  const lines: LedgerLine[] = [];
  let num = 1;
  const payDate = filtered[0]["Payday (Day)"] || "";

  const wages = acct("regular_earnings");
  const taxLiab = acct("tax_liabilities");
  const cashNet = acct("cash_net");
  const cashTax = acct("cash_taxes");
  const erTaxAcct = acct("employer_taxes");

  for (const row of filtered) {
    const grossPay = parseFloat(row["Gross Pay (Sum)"] || "0");
    if (grossPay === 0) continue;
    lines.push(makeLine(
      num++, wages.code, wages.name,
      grossPay, 0, "Regular Earnings",
      `${row["Last Name"].toUpperCase()},${row["First Name"].toUpperCase()}`,
      payDate,
    ));
  }

  const totalLabor = filtered.reduce((s, r) => s + parseFloat(r["Labor Cost (Sum)"] || "0"), 0);
  const totalGross = filtered.reduce((s, r) => s + parseFloat(r["Gross Pay (Sum)"] || "0"), 0);
  const totalNet = filtered.reduce((s, r) => s + parseFloat(r["Net Pay (Sum)"] || "0"), 0);
  const employerTaxes = totalLabor - totalGross;

  if (employerTaxes > 0) {
    lines.push(makeLine(
      num++, erTaxAcct.code, erTaxAcct.name,
      round2(employerTaxes), 0, "Employer Tax Expenses", "", payDate,
    ));
  }

  if (totalNet > 0) {
    lines.push(makeLine(
      num++, cashNet.code, cashNet.name,
      0, totalNet, "Cash-Net Payroll", "", payDate,
    ));
  }

  const totalTaxes = totalLabor - totalNet;
  if (totalTaxes > 0) {
    lines.push(makeLine(
      num++, cashTax.code, cashTax.name,
      0, totalTaxes, "Cash-Taxes", "", payDate,
    ));
  }

  const employeeWithholdings = totalGross - totalNet;

  if (employerTaxes > 0) {
    const estSocialSecurity = employerTaxes * 0.52;
    const estMedicare = employerTaxes * 0.12;
    const estSUI = employerTaxes * 0.07;
    const estFUTA = employerTaxes * 0.02;
    const estOther = employerTaxes - estSocialSecurity - estMedicare - estSUI - estFUTA;

    lines.push(makeLine(num++, taxLiab.code, taxLiab.name, 0, round2(estSocialSecurity), "Employer Social Security Tax", "", payDate));
    lines.push(makeLine(num++, taxLiab.code, taxLiab.name, 0, round2(estMedicare), "Employer Medicare Tax", "", payDate));
    lines.push(makeLine(num++, taxLiab.code, taxLiab.name, 0, round2(estSUI), "Employer SUI Tax", "", payDate));
    lines.push(makeLine(num++, taxLiab.code, taxLiab.name, 0, round2(estFUTA), "FUTA Tax", "", payDate));
    if (estOther > 0.01) {
      lines.push(makeLine(num++, taxLiab.code, taxLiab.name, 0, round2(estOther), "Employer Tax Expenses", "", payDate));
    }
  }

  if (employeeWithholdings > 0) {
    const estFederal = employeeWithholdings * 0.40;
    const estEeSS = employeeWithholdings * 0.42;
    const estEeMed = employeeWithholdings * 0.18;

    lines.push(makeLine(num++, taxLiab.code, taxLiab.name, 0, round2(estFederal), "Employee Federal Income Tax", "", payDate));
    lines.push(makeLine(num++, taxLiab.code, taxLiab.name, 0, round2(estEeSS), "Employee Social Security Tax", "", payDate));
    lines.push(makeLine(num++, taxLiab.code, taxLiab.name, 0, round2(estEeMed), "Employee Medicare Tax", "", payDate));
  }

  if (totalTaxes > 0) {
    lines.push(makeLine(
      num++, taxLiab.code, taxLiab.name,
      totalTaxes, 0, "Taxes Paid", "", payDate,
    ));
  }

  return lines;
}
