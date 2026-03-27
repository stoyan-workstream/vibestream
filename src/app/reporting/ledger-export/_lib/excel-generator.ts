import type { LedgerLine, Config } from "./types";
import { round2, fmtMoney, fmtMoneyGL, fmtDate } from "./helpers";

export async function generateExcel(lines: LedgerLine[], config: Config): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  // Sheet 1: Journal Entry
  const totalDebits = round2(lines.reduce((s, l) => s + l.debit, 0));
  const totalCredits = round2(lines.reduce((s, l) => s + l.credit, 0));

  const jeData = lines.map((l) => ({
    "#": l.num,
    "Account": `${l.accountCode} ${l.accountName}`,
    "Debits": l.debit || "",
    "Credits": l.credit || "",
    "Description": l.description,
    "Name": l.name,
  }));
  jeData.push({ "#": "" as any, "Account": "TOTAL", "Debits": fmtMoney(totalDebits) as any, "Credits": fmtMoney(totalCredits) as any, "Description": "", "Name": "" });

  const jeSheet = XLSX.utils.json_to_sheet(jeData);
  jeSheet["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 28 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, jeSheet, "Journal Entry");

  // Sheet 2: General Ledger Report
  let glTotal = 0;
  const glData = lines.map((l) => {
    const amount = l.debit - l.credit;
    glTotal += amount;
    return {
      "Account": l.accountName,
      "Amount": fmtMoneyGL(amount),
      "Date": fmtDate(l.date),
      "Class": l.class,
      "DocNum": l.docNum,
      "Memo": l.memo || l.description,
      "Name": l.name,
    };
  });
  glData.push({ "Account": "Total", "Amount": fmtMoneyGL(round2(glTotal)), "Date": "", "Class": "", "DocNum": "", "Memo": "", "Name": "" });

  const glSheet = XLSX.utils.json_to_sheet(glData);
  glSheet["!cols"] = [{ wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 28 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, glSheet, "GL Report");

  // Sheet 3: Metadata
  const metaData = [
    { "Field": "Client", "Value": config.clientName },
    { "Field": "Company", "Value": config.companyName },
    { "Field": "GL File Name", "Value": config.glFileName },
    { "Field": "Journal No.", "Value": config.journalNo },
    { "Field": "Journal Date", "Value": config.journalDate },
    { "Field": "CoA Map", "Value": config.coaMap },
    { "Field": "Payroll ID", "Value": config.payrollId },
    { "Field": "Generated", "Value": new Date().toISOString().replace("T", " ").slice(0, 19) },
  ];
  const metaSheet = XLSX.utils.json_to_sheet(metaData);
  metaSheet["!cols"] = [{ wch: 28 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, metaSheet, "Info");

  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(buf);
}
