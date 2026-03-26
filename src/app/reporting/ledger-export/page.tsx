"use client";

import { useState, useCallback, useMemo } from "react";
import { Upload, FileText, Download, Building2, Calendar, ChevronDown, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface PayrollRow {
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

interface LedgerLine {
  num: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  name: string;
  date: string;
  // Future fields — populated when Check provides richer data
  class: string;
  docNum: string;
  memo: string;
}

interface Config {
  clientName: string;
  companyName: string;
  glFileName: string;
  journalNo: string;
  journalDate: string;
  coaMap: string;
  payrollId: string;
}

// ── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(text: string): PayrollRow[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row as PayrollRow;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

// ── Data Transform ───────────────────────────────────────────────────────────
// When Check provides richer GL data, update this function to map actual
// account codes, pay type breakdowns, itemized taxes, and benefit lines.

function makeLine(
  num: number, accountCode: string, accountName: string,
  debit: number, credit: number, description: string, name: string, date: string,
): LedgerLine {
  return { num, accountCode, accountName, debit, credit, description, name, date, class: "", docNum: "", memo: "" };
}

function transformToLedgerLines(rows: PayrollRow[], companyName: string): LedgerLine[] {
  const filtered = rows
    .filter((r) => r["Company Legal Name"] === companyName)
    .sort((a, b) => a["Last Name"].localeCompare(b["Last Name"]) || a["First Name"].localeCompare(b["First Name"]));

  if (!filtered.length) return [];

  const lines: LedgerLine[] = [];
  let num = 1;
  const payDate = filtered[0]["Payday (Day)"] || "";

  // ── Debit: Labor Cost per employee ──
  for (const row of filtered) {
    const laborCost = parseFloat(row["Labor Cost (Sum)"] || "0");
    if (laborCost === 0) continue;
    lines.push(makeLine(
      num++, "5201", "CG Labor/Wages",
      laborCost, 0, "Regular Earnings",
      `${row["Last Name"].toUpperCase()},${row["First Name"].toUpperCase()}`,
      payDate,
    ));
  }

  // ── Credit: Cash-Net Payroll ──
  const totalNet = filtered.reduce((s, r) => s + parseFloat(r["Net Pay (Sum)"] || "0"), 0);
  if (totalNet > 0) {
    lines.push(makeLine(
      num++, "1010", `${companyName} Cash Account`,
      0, totalNet, "Cash-Net Payroll", "", payDate,
    ));
  }

  // ── Credit: Cash-Taxes (separate from net payroll) ──
  const totalLabor = filtered.reduce((s, r) => s + parseFloat(r["Labor Cost (Sum)"] || "0"), 0);
  const totalGross = filtered.reduce((s, r) => s + parseFloat(r["Gross Pay (Sum)"] || "0"), 0);
  const totalTaxes = totalLabor - totalNet; // employer taxes + employee withholdings
  const cashTaxes = totalTaxes - 0; // When Check provides data, split employer vs employee taxes
  if (cashTaxes > 0) {
    lines.push(makeLine(
      num++, "1010", `${companyName} Cash Account`,
      0, cashTaxes, "Cash-Taxes", "", payDate,
    ));
  }

  // ── Credit: Itemized Tax Liabilities ──
  // Placeholder: split into the categories that appear in the reference PDF.
  // When Check provides actual tax breakdowns, replace these with real amounts.
  const employerTaxes = totalLabor - totalGross;
  const employeeWithholdings = totalGross - totalNet;

  // Employer tax estimates (placeholder split — real data will replace this)
  if (employerTaxes > 0) {
    const estSocialSecurity = employerTaxes * 0.52;
    const estMedicare = employerTaxes * 0.12;
    const estSUI = employerTaxes * 0.07;
    const estFUTA = employerTaxes * 0.02;
    const estOther = employerTaxes - estSocialSecurity - estMedicare - estSUI - estFUTA;

    lines.push(makeLine(num++, "2110", "Payroll Liabilities", 0, round2(estSocialSecurity), "Employer Social Security Tax", "", payDate));
    lines.push(makeLine(num++, "2110", "Payroll Liabilities", 0, round2(estMedicare), "Employer Medicare Tax", "", payDate));
    lines.push(makeLine(num++, "2110", "Payroll Liabilities", 0, round2(estSUI), "Employer SUI Tax", "", payDate));
    lines.push(makeLine(num++, "2110", "Payroll Liabilities", 0, round2(estFUTA), "FUTA Tax", "", payDate));
    if (estOther > 0.01) {
      lines.push(makeLine(num++, "2110", "Payroll Liabilities", 0, round2(estOther), "Employer Tax Expenses", "", payDate));
    }
  }

  // Employee withholding estimates (placeholder split)
  if (employeeWithholdings > 0) {
    const estFederal = employeeWithholdings * 0.40;
    const estEeSS = employeeWithholdings * 0.42;
    const estEeMed = employeeWithholdings * 0.18;

    lines.push(makeLine(num++, "2110", "Payroll Liabilities", 0, round2(estFederal), "Employee Federal Income Tax", "", payDate));
    lines.push(makeLine(num++, "2110", "Payroll Liabilities", 0, round2(estEeSS), "Employee Social Security Tax", "", payDate));
    lines.push(makeLine(num++, "2110", "Payroll Liabilities", 0, round2(estEeMed), "Employee Medicare Tax", "", payDate));
  }

  // ── Debit: Taxes Paid (offset for tax liabilities) ──
  if (totalTaxes > 0) {
    lines.push(makeLine(
      num++, "2110", "Payroll Liabilities",
      totalTaxes, 0, "Taxes Paid", "", payDate,
    ));
  }

  return lines;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

function fmtMoney(val: number): string {
  if (!val) return "";
  return `$${Math.abs(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Format for GL Report: positive = $X.XX, negative = $(X.XX) */
function fmtMoneyGL(val: number): string {
  if (val === 0) return "$0.00";
  const abs = `$${Math.abs(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return val < 0 ? `$(${abs.slice(1)})` : abs;
}

/** Format date as DD-Mon-YYYY to match ADP reference (e.g. 28-Nov-2025) */
function fmtDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const mon = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    const year = d.getUTCFullYear();
    return `${day}-${mon}-${year}`;
  } catch { return dateStr; }
}

// ── PDF Generation (client-side with jsPDF) ──────────────────────────────────

const WS_BLUE: [number, number, number] = [27, 102, 255]; // #1B66FF
const WS_LOGO_URL = "/workstream_logo.png";

async function generatePDF(lines: LedgerLine[], config: Config): Promise<Uint8Array> {
  const { jsPDF } = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = autoTableModule.default || autoTableModule.autoTable;

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const topStart = 56; // content starts below branding bar

  // ── Branding helper: adds header bar + footer text to current page ──
  // Logo is stamped separately by pdf-lib after jsPDF finishes (jsPDF can't decode this PNG)
  function addBranding(pageNum: number, totalPages: number) {
    const savedFontSize = doc.getFontSize();

    // Top accent bar
    doc.setFillColor(...WS_BLUE);
    doc.rect(0, 0, pageWidth, 4, "F");

    // Reset state
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(0, 0, 0);
    doc.setFontSize(savedFontSize);

    // Footer: thin line + page number + attribution
    const footerY = pageHeight - 28;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130, 130, 130);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY + 12, { align: "right" });
    doc.text("Generated by Workstream", margin, footerY + 12);
    doc.setTextColor(0, 0, 0);
  }

  // ── Pages 1+: Journal Entry ──

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Journal Entry #${config.journalNo}`, margin, topStart);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Journal date:", margin, topStart + 16);
  doc.text(config.journalDate, margin + 58, topStart + 16);
  doc.text("Journal no.", pageWidth / 2, topStart + 16);
  doc.text(config.journalNo, pageWidth / 2 + 48, topStart + 16);

  const totalDebits = round2(lines.reduce((s, l) => s + l.debit, 0));
  const totalCredits = round2(lines.reduce((s, l) => s + l.credit, 0));

  const jeRows = lines.map((l) => [
    String(l.num),
    `${l.accountCode} ${l.accountName}`,
    l.debit ? fmtMoney(l.debit) : "",
    l.credit ? fmtMoney(l.credit) : "",
    l.description,
    l.name,
  ]);
  jeRows.push(["", "", fmtMoney(totalDebits), fmtMoney(totalCredits), "", ""]);

  autoTable(doc, {
    startY: topStart + 28,
    head: [["#", "ACCOUNT", "DEBITS", "CREDITS", "DESCRIPTION", "NAME"]],
    body: jeRows,
    theme: "plain",
    showHead: "everyPage",
    styles: { fontSize: 6.5, cellPadding: 2, font: "helvetica", overflow: "linebreak", halign: "left" },
    headStyles: { fillColor: [217, 217, 217], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 6.5, halign: "left" },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 180 },
      2: { cellWidth: 60 },
      3: { cellWidth: 60 },
      4: { cellWidth: 105 },
      5: { cellWidth: contentWidth - 24 - 180 - 60 - 60 - 105 },
    },
    alternateRowStyles: { fillColor: [247, 247, 247] },
    margin: { left: margin, right: margin, top: topStart + 28, bottom: 48 },
    didParseCell: (data: any) => {
      if (data.section === "body") {
        // Right-align numeric body values (#, DEBITS, CREDITS)
        if (data.column.index === 0 || data.column.index === 2 || data.column.index === 3) {
          data.cell.styles.halign = "right";
        }
        // Style totals row
        if (data.row.index === jeRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [255, 255, 255];
        }
      }
    },
  });

  // ── New page: General Ledger Report ──

  doc.addPage();
  let y = topStart;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("General Ledger Report", margin, y);
  y += 18;

  // Header metadata — two-column with fixed label positions
  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
  const valX = margin + 170; // value column x-position

  doc.setFontSize(8);
  const metaRows: [string, string, string?, string?][] = [
    ["Client:", config.clientName, "CoA Map:", config.coaMap],
    ["GL File Name:", config.glFileName],
    ["Completion Date/Time:", nowStr],
    ["Last Download Attempt Date/Time:", "n/a"],
    ["File Specification:", config.coaMap],
  ];
  for (const row of metaRows) {
    doc.setFont("helvetica", "bold");
    doc.text(row[0], margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(row[1], valX, y);
    if (row[2] && row[3]) {
      doc.setFont("helvetica", "bold");
      doc.text(row[2], pageWidth / 2 + 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(row[3], pageWidth / 2 + 72, y);
    }
    y += 12;
  }
  y += 8;

  // Section title with rule
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("General Ledger Transactions", margin, y);
  y += 4;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // GL Report: every line individually, 7 columns
  const glRows: string[][] = [];
  let glTotal = 0;

  for (const line of lines) {
    const signedAmount = line.debit - line.credit;
    glTotal += signedAmount;
    glRows.push([
      line.accountName,
      fmtMoneyGL(signedAmount),
      fmtDate(line.date),
      line.class,
      line.docNum,
      line.memo || line.description,
      line.name,
    ]);
  }
  glRows.push(["Total:", fmtMoneyGL(round2(glTotal)), "", "", "", "", ""]);

  autoTable(doc, {
    startY: y,
    head: [["Account", "Amount", "Date", "Class", "DocNum", "Memo", "Name"]],
    body: glRows,
    theme: "grid",
    showHead: "everyPage",
    styles: { fontSize: 6, cellPadding: 1.5, font: "helvetica", overflow: "linebreak", lineColor: [200, 200, 200], lineWidth: 0.25, halign: "left" },
    headStyles: { fillColor: [217, 217, 217], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 6, halign: "left" },
    bodyStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.28 },
      1: { cellWidth: contentWidth * 0.12 },
      2: { cellWidth: contentWidth * 0.12 },
      3: { cellWidth: contentWidth * 0.06 },
      4: { cellWidth: contentWidth * 0.07 },
      5: { cellWidth: contentWidth * 0.20 },
      6: { cellWidth: contentWidth * 0.15 },
    },
    margin: { left: margin, right: margin, top: topStart, bottom: 48 },
    didParseCell: (data: any) => {
      if (data.section === "body") {
        // Right-align Amount values only
        if (data.column.index === 1) {
          data.cell.styles.halign = "right";
        }
        // Style totals row
        if (data.row.index === glRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // Footer text + payroll source table on a new page together
  doc.addPage();
  let pyY = topStart;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("This GL file contains data from the following payrolls:", margin, pyY);
  pyY += 14;

  autoTable(doc, {
    startY: pyY,
    head: [["Company", "Service Center", "Year/Week Number", "Pay Date", "Batch Number"]],
    body: [[
      config.companyName,
      "",
      "",
      fmtDate(config.journalDate),
      config.payrollId || "",
    ]],
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 3, font: "helvetica", lineColor: [200, 200, 200], lineWidth: 0.25 },
    headStyles: { fillColor: [217, 217, 217], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 7 },
    margin: { left: margin, right: margin },
  });

  // ── Apply branding to all pages ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addBranding(i, totalPages);
  }

  // ── Post-process with pdf-lib to stamp the PNG logo on every page ──
  const jsPdfBytes = new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);

  try {
    const { PDFDocument } = await import("pdf-lib");
    const pdfDoc = await PDFDocument.load(jsPdfBytes);

    // Fetch logo PNG from public directory
    const logoResponse = await fetch(WS_LOGO_URL);
    const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());

    const logoImage = await pdfDoc.embedPng(logoBytes);
    // Scale to 110pt wide, vertically centered between blue bar (4pt) and content start (56pt)
    const logoW = 110;
    const logoH = logoImage.height * (logoW / logoImage.width);
    const logoTopFromPage = 4 + (52 - logoH) / 2; // center in the 52pt gap between bar and content

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawImage(logoImage, {
        x: width - margin - logoW,
        y: height - logoTopFromPage - logoH,
        width: logoW,
        height: logoH,
      });
    }

    return await pdfDoc.save();
  } catch (err) {
    console.warn("Logo embedding failed — PDF generated without logo", err);
    return jsPdfBytes;
  }
}


// ── Page Component ───────────────────────────────────────────────────────────

export default function LedgerExportPage() {
  const [csvData, setCsvData] = useState<PayrollRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [journalDate, setJournalDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const companies = useMemo(() => {
    const names = [...new Set(csvData.map((r) => r["Company Legal Name"]))].filter(Boolean).sort();
    return names;
  }, [csvData]);

  const companySummary = useMemo(() => {
    if (!selectedCompany || !csvData.length) return null;
    const rows = csvData.filter((r) => r["Company Legal Name"] === selectedCompany);
    return {
      employees: rows.length,
      totalLaborCost: rows.reduce((s, r) => s + parseFloat(r["Labor Cost (Sum)"] || "0"), 0),
      totalGrossPay: rows.reduce((s, r) => s + parseFloat(r["Gross Pay (Sum)"] || "0"), 0),
      totalNetPay: rows.reduce((s, r) => s + parseFloat(r["Net Pay (Sum)"] || "0"), 0),
      payDate: rows[0]?.["Payday (Day)"] || "",
    };
  }, [csvData, selectedCompany]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setGenerated(false);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const rows = parseCSV(text);
        if (!rows.length) { setError("No data found in CSV"); return; }
        const requiredCols = ["Company Legal Name", "Last Name", "First Name", "Labor Cost (Sum)", "Gross Pay (Sum)", "Net Pay (Sum)"];
        const missingCols = requiredCols.filter((col) => !(col in rows[0]));
        if (missingCols.length) { setError(`CSV is missing required columns: ${missingCols.join(", ")}`); return; }
        setCsvData(rows);
        setSelectedCompany("");
      } catch {
        setError("Failed to parse CSV file");
      }
    };
    reader.readAsText(file);
  }, []);

  const buildConfig = useCallback((company: string): Config => {
    const dateStr = journalDate.replace(/\//g, "-");
    const shortCompany = company.split(",")[0].trim().split(" ")[0];
    return {
      clientName: clientName || company,
      companyName: company,
      glFileName: `${shortCompany} Payroll ${dateStr}.IIF`,
      journalNo: `Payroll ${dateStr}`,
      journalDate,
      coaMap: "QB's Online GL Master",
      payrollId: csvData.find((r) => r["Company Legal Name"] === company)?.["Checkhq Payroll Id"] || "",
    };
  }, [journalDate, clientName, csvData]);

  // Validate that the journal date is a real date
  const isValidDate = useCallback((dateStr: string): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    // Ensure the date components match (catches 2026-01-90 → invalid)
    const [y, m, day] = dateStr.split("-").map(Number);
    return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m && d.getUTCDate() === day;
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedCompany || !journalDate) return;
    if (!isValidDate(journalDate)) { setError("Please enter a valid date"); return; }
    setGenerating(true);
    setError("");

    try {
      const lines = transformToLedgerLines(csvData, selectedCompany);
      if (!lines.length) { setError("No data found for selected company"); setGenerating(false); return; }

      const config = buildConfig(selectedCompany);
      const dateStr = journalDate.replace(/\//g, "-");
      const shortCompany = selectedCompany.split(",")[0].trim().split(" ")[0];

      const pdfBytes = await generatePDF(lines, config);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GL_Report_${shortCompany}_${dateStr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setGenerated(true);
    } catch (err) {
      setError(`PDF generation failed: ${err}`);
    } finally {
      setGenerating(false);
    }
  }, [csvData, selectedCompany, journalDate, buildConfig, isValidDate]);

  const handleGenerateAll = useCallback(async () => {
    if (!journalDate || !companies.length) return;
    if (!isValidDate(journalDate)) { setError("Please enter a valid date"); return; }
    setGenerating(true);
    setError("");

    try {
      for (const company of companies) {
        const lines = transformToLedgerLines(csvData, company);
        if (!lines.length) continue;

        const config = buildConfig(company);
        const dateStr = journalDate.replace(/\//g, "-");
        const shortCompany = company.split(",")[0].trim().split(" ")[0];

        const pdfBytes = await generatePDF(lines, config);
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `GL_Report_${shortCompany}_${dateStr}.pdf`;
        a.click();
        URL.revokeObjectURL(url);

        await new Promise((r) => setTimeout(r, 300));
      }
      setGenerated(true);
    } catch (err) {
      setError(`PDF generation failed: ${err}`);
    } finally {
      setGenerating(false);
    }
  }, [csvData, companies, journalDate, buildConfig, isValidDate]);

  return (
    <div className="p-8 lg:p-12 min-h-full w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ledger Export</h1>
        <p className="text-gray-500 mt-1">
          Generate General Ledger PDFs from Check payroll data, formatted for QuickBooks / ADP import.
        </p>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-100 px-4 py-3 mb-6">
        <p className="text-sm text-blue-700">
          Upload a Check payroll CSV &rarr; pick a company &rarr; download a GL PDF ready to send to your client.
          The PDF includes a <strong>Journal Entry</strong> with debits and credits per employee and a <strong>General Ledger Report</strong> summary.
        </p>
      </div>

      {/* Step 1: Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">1</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Upload Payroll CSV</h2>
          <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>
        </div>
        <p className="text-sm text-gray-500 ml-11 mb-4">
          Export from Check &rarr; Payroll Journal Report. The CSV must include: Company Legal Name, First/Last Name, Labor Cost, Gross Pay, Net Pay, and Payday columns.
        </p>

        <label className="block cursor-pointer">
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            fileName ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}>
            {fileName ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">{fileName}</p>
                  <p className="text-sm text-gray-500">{csvData.length} employee records &middot; {companies.length} companies</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="font-medium text-gray-700">Drop your Check payroll CSV here or click to browse</p>
                <p className="text-sm text-gray-400 mt-1">.csv files only</p>
              </>
            )}
          </div>
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Step 2: Configure */}
      {csvData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">2</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Configure Report</h2>
          </div>
          <p className="text-sm text-gray-500 ml-11 mb-4">
            These fields populate the PDF header, journal entry metadata, and file naming.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Building2 className="w-4 h-4 inline mr-1" /> Company <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-1.5">Filters the CSV to this company&apos;s employees. Only their payroll data appears in the PDF.</p>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm hover:border-blue-400 transition-colors"
              >
                <span className={selectedCompany ? "text-gray-900" : "text-gray-400"}>
                  {selectedCompany || "Select a company..."}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {companies.map((c) => {
                    const count = csvData.filter((r) => r["Company Legal Name"] === c).length;
                    return (
                      <button
                        key={c}
                        onClick={() => { setSelectedCompany(c); setDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors flex justify-between items-center"
                      >
                        <span className="text-gray-900">{c}</span>
                        <span className="text-xs text-gray-400">{count} employees</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Journal Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" /> Journal Date <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-1.5">Sets the journal entry date, journal number (e.g. &quot;Payroll 2025-01-30&quot;), and PDF file name.</p>
              <input
                type="date"
                value={journalDate}
                onChange={(e) => setJournalDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Client Name (optional) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name <span className="text-xs font-normal text-gray-400 ml-1">Optional</span>
              </label>
              <p className="text-xs text-gray-400 mb-1.5">Appears as &quot;Client&quot; in the GL Report header. If left blank, the company legal name is used.</p>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., h8402 - Home Instead"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Summary Card */}
          {companySummary && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-gray-500">Employees</p>
                <p className="text-lg font-semibold text-gray-900">{companySummary.employees}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Labor Cost</p>
                <p className="text-lg font-semibold text-gray-900">{fmtMoney(companySummary.totalLaborCost)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gross Pay</p>
                <p className="text-lg font-semibold text-gray-900">{fmtMoney(companySummary.totalGrossPay)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Net Pay</p>
                <p className="text-lg font-semibold text-gray-900">{fmtMoney(companySummary.totalNetPay)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pay Date</p>
                <p className="text-lg font-semibold text-gray-900">{fmtDate(companySummary.payDate)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Generate */}
      {csvData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">3</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Generate PDF</h2>
          </div>
          <p className="text-sm text-gray-500 ml-11 mb-4">
            Download a PDF for the selected company, or generate one PDF per company in the CSV.
            Files are named <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">GL_Report_&#123;Company&#125;_&#123;Date&#125;.pdf</span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={!selectedCompany || !journalDate || generating}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                !selectedCompany || !journalDate || generating
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "text-white shadow-sm hover:opacity-90"
              }`}
              style={selectedCompany && journalDate && !generating ? { backgroundColor: "var(--workstream-blue)" } : {}}
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Generate Selected Company
            </button>

            <button
              onClick={handleGenerateAll}
              disabled={!journalDate || generating || companies.length === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                !journalDate || generating || companies.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white shadow-sm hover:bg-gray-800"
              }`}
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Generate All Companies ({companies.length})
            </button>
          </div>

          {generated && (
            <div className="mt-4 flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">PDF downloaded successfully</span>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
