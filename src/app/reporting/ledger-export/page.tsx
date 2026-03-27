"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Upload, Download, FileSpreadsheet, FileText, ChevronDown, ChevronRight,
  Loader2, CheckCircle2, AlertCircle, X, RotateCcw, Archive, Eye,
} from "lucide-react";

import type { PayrollRow, Config, AccountMappingRow } from "./_lib/types";
import { parseCSV } from "./_lib/csv-parser";
import { transformToLedgerLines } from "./_lib/transform";
import { generatePDF } from "./_lib/pdf-generator";
import { generateExcel } from "./_lib/excel-generator";
import { bundleAsZip } from "./_lib/zip-bundler";
import { fmtMoney, fmtDate, round2 } from "./_lib/helpers";
import {
  loadGlobalDefaults, saveGlobalDefaults, loadCompanyMapping,
  saveCompanyMapping, hasCompanyOverride, clearCompanyOverride, resetGlobalDefaults,
} from "./_lib/account-storage";

// ── Page Component ───────────────────────────────────────────────────────────

export default function LedgerExportPage() {
  // CSV state
  const [csvData, setCsvData] = useState<PayrollRow[]>([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selection
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [previewCompany, setPreviewCompany] = useState("");

  // Config
  const [journalDate, setJournalDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [globalMapping, setGlobalMapping] = useState<AccountMappingRow[]>(() => loadGlobalDefaults());
  const [companyMappings, setCompanyMappings] = useState<Record<string, AccountMappingRow[]>>({});

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"journal" | "gl">("journal");

  // Generation
  const [generating, setGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState("");
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");

  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  // Derived
  const companies = useMemo(() => {
    return [...new Set(csvData.map((r) => r["Company Legal Name"]))].filter(Boolean).sort();
  }, [csvData]);

  const effectiveMapping = useCallback((company: string): AccountMappingRow[] => {
    if (companyMappings[company]) return companyMappings[company];
    return loadCompanyMapping(company);
  }, [companyMappings]);

  const previewLines = useMemo(() => {
    if (!previewCompany || !csvData.length) return [];
    return transformToLedgerLines(csvData, previewCompany, effectiveMapping(previewCompany));
  }, [csvData, previewCompany, effectiveMapping]);

  const companySummary = useMemo(() => {
    if (!selectedCompanies.size || !csvData.length) return null;
    const rows = csvData.filter((r) => selectedCompanies.has(r["Company Legal Name"]));
    if (!rows.length) return null;
    return {
      employees: rows.length,
      totalLaborCost: rows.reduce((s, r) => s + parseFloat(r["Labor Cost (Sum)"] || "0"), 0),
      totalGrossPay: rows.reduce((s, r) => s + parseFloat(r["Gross Pay (Sum)"] || "0"), 0),
      totalNetPay: rows.reduce((s, r) => s + parseFloat(r["Net Pay (Sum)"] || "0"), 0),
      payDate: rows[0]?.["Payday (Day)"] || "",
    };
  }, [csvData, selectedCompanies]);

  // Hydrate global mapping from localStorage on mount
  useEffect(() => {
    setGlobalMapping(loadGlobalDefaults());
  }, []);

  // Load company mappings when CSV loads
  useEffect(() => {
    if (companies.length) {
      const mappings: Record<string, AccountMappingRow[]> = {};
      for (const c of companies) {
        if (hasCompanyOverride(c)) {
          mappings[c] = loadCompanyMapping(c);
        }
      }
      setCompanyMappings(mappings);
    }
  }, [companies]);

  // Auto-select first company for preview
  useEffect(() => {
    if (companies.length && !previewCompany) {
      setPreviewCompany(companies[0]);
    }
  }, [companies, previewCompany]);

  // ── Handlers ──

  const handleFileUpload = useCallback((file: File) => {
    setError("");
    setGenerated(false);
    setFileName(file.name);
    setSelectedCompanies(new Set());
    setPreviewCompany("");
    setPreviewOpen(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const rows = parseCSV(text);
        if (!rows.length) { setError("No data found in this file"); return; }
        const requiredCols = ["Company Legal Name", "Last Name", "First Name", "Labor Cost (Sum)", "Gross Pay (Sum)", "Net Pay (Sum)"];
        const missingCols = requiredCols.filter((col) => !(col in rows[0]));
        if (missingCols.length) { setError(`Missing columns: ${missingCols.join(", ")}`); return; }
        setCsvData(rows);
      } catch {
        setError("Could not read this file. Please check the format.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) handleFileUpload(file);
    else setError("Please upload a .csv file");
  }, [handleFileUpload]);

  const toggleCompany = useCallback((company: string) => {
    setSelectedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(company)) next.delete(company);
      else next.add(company);
      // Set preview to the company if it was just selected, or first remaining
      if (next.has(company)) {
        setPreviewCompany(company);
      } else if (next.size > 0) {
        setPreviewCompany([...next][0]);
      } else {
        setPreviewCompany("");
      }
      return next;
    });
    setGenerated(false);
  }, []);

  const selectAllCompanies = useCallback(() => {
    if (selectedCompanies.size === companies.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(new Set(companies));
    }
    setGenerated(false);
  }, [companies, selectedCompanies.size]);

  const updateGlobalMapping = useCallback((index: number, field: "accountCode" | "accountName", value: string) => {
    setGlobalMapping((prev) => {
      const next = prev.map((r) => ({ ...r }));
      next[index][field] = value;
      saveGlobalDefaults(next);
      return next;
    });
  }, []);

  const updateCompanyMapping = useCallback((company: string, index: number, field: "accountCode" | "accountName", value: string) => {
    setCompanyMappings((prev) => {
      const current = prev[company] || loadCompanyMapping(company);
      const next = current.map((r) => ({ ...r }));
      next[index][field] = value;
      saveCompanyMapping(company, next);
      return { ...prev, [company]: next };
    });
  }, []);

  const resetCompanyMapping = useCallback((company: string) => {
    clearCompanyOverride(company);
    setCompanyMappings((prev) => {
      const next = { ...prev };
      delete next[company];
      return next;
    });
  }, []);

  const isValidDate = useCallback((dateStr: string): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const [y, m, day] = dateStr.split("-").map(Number);
    return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m && d.getUTCDate() === day;
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

  const generateFile = useCallback(async (company: string): Promise<{ name: string; data: Uint8Array }> => {
    const mapping = effectiveMapping(company);
    const lines = transformToLedgerLines(csvData, company, mapping);
    const config = buildConfig(company);
    const dateStr = journalDate.replace(/\//g, "-");
    const shortCompany = company.split(",")[0].trim().split(" ")[0];
    const ext = exportFormat === "pdf" ? "pdf" : "xlsx";

    const data = exportFormat === "pdf"
      ? await generatePDF(lines, config)
      : await generateExcel(lines, config);

    return { name: `GL_Report_${shortCompany}_${dateStr}.${ext}`, data };
  }, [csvData, journalDate, exportFormat, buildConfig, effectiveMapping]);

  const downloadBlob = useCallback((data: Uint8Array, filename: string, mime: string) => {
    const blob = new Blob([data.buffer as ArrayBuffer], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedCompanies.size || !journalDate) return;
    if (!isValidDate(journalDate)) { setError("Please pick a valid date"); return; }
    setGenerating(true);
    setError("");
    setGenerated(false);

    try {
      const companiesList = [...selectedCompanies];

      if (companiesList.length === 1) {
        setGeneratingProgress(`Generating report...`);
        const file = await generateFile(companiesList[0]);
        const mime = exportFormat === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        downloadBlob(file.data, file.name, mime);
      } else {
        const files: Array<{ name: string; data: Uint8Array }> = [];
        for (let i = 0; i < companiesList.length; i++) {
          const company = companiesList[i];
          const short = company.split(",")[0].trim().split(" ")[0];
          setGeneratingProgress(`Generating ${short} (${i + 1} of ${companiesList.length})...`);
          const lines = transformToLedgerLines(csvData, company, effectiveMapping(company));
          if (!lines.length) continue;
          const file = await generateFile(company);
          files.push(file);
        }
        if (files.length) {
          setGeneratingProgress("Bundling into ZIP...");
          const dateStr = journalDate.replace(/\//g, "-");
          const zipData = await bundleAsZip(files);
          downloadBlob(zipData, `GL_Reports_${dateStr}.zip`, "application/zip");
        }
      }
      setGenerated(true);
    } catch (err) {
      setError(`Export failed: ${err}`);
    } finally {
      setGenerating(false);
      setGeneratingProgress("");
    }
  }, [selectedCompanies, journalDate, csvData, exportFormat, isValidDate, generateFile, downloadBlob, effectiveMapping]);

  // ── Computed UI state ──
  const canGenerate = selectedCompanies.size > 0 && journalDate && !generating;
  const totalDebits = round2(previewLines.reduce((s, l) => s + l.debit, 0));
  const totalCredits = round2(previewLines.reduce((s, l) => s + l.credit, 0));

  // ── Render ──

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Ledger Export</h1>
            <p className="mt-1 text-gray-500">Generate general ledger reports from your payroll data.</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 px-8 py-6 space-y-6">

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 1: ACCOUNT MAPPING (SETTINGS)
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Section header with blue accent */}
          <div className="border-l-4 border-l-[var(--workstream-blue)] bg-gradient-to-r from-blue-50/60 to-white px-6 py-4">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--workstream-blue)]/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--workstream-blue)]">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-semibold text-gray-900">Account Mapping</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Set which GL accounts each pay type maps to
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Settings body */}
          {settingsOpen && (
            <div className="px-6 pb-5 pt-4 border-t border-gray-100">
              {/* Default mapping table */}
              <MappingTable mapping={globalMapping} onUpdate={updateGlobalMapping} />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => { setGlobalMapping(resetGlobalDefaults()); }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Reset defaults
                </button>
              </div>

              {/* Company-specific overrides */}
              {Object.keys(companyMappings).length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-3">Companies with custom mappings</p>
                  <div className="space-y-3">
                    {Object.entries(companyMappings).map(([company, mapping]) => (
                      <CompanyMappingCard
                        key={company}
                        company={company}
                        mapping={mapping}
                        onUpdate={(i, field, val) => updateCompanyMapping(company, i, field, val)}
                        onReset={() => resetCompanyMapping(company)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 2: GENERATE — Step-by-step cards
            ══════════════════════════════════════════════════════════════════════ */}

        {/* Step 1: Upload */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-l-4 border-l-[var(--workstream-blue)] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[var(--workstream-blue)] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">1</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Upload Payroll CSV</h2>
                <p className="text-xs text-gray-500 mt-0.5">Export from Check &rarr; Payroll Journal Report</p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-5 pt-2 border-t border-gray-100">
            {!csvData.length ? (
              <label
                className="block cursor-pointer mt-2"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className={`
                  border-2 border-dashed rounded-xl py-10 px-6 text-center transition-all duration-200
                  ${isDragging
                    ? "border-[var(--workstream-blue)] bg-blue-50/60"
                    : "border-gray-200 bg-gray-50/50 hover:border-[var(--workstream-blue)]/40 hover:bg-blue-50/30"
                  }
                `}>
                  <div className={`
                    w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center
                    ${isDragging ? "bg-[var(--workstream-blue)]/10" : "bg-white border border-gray-200"}
                  `}>
                    <Upload className={`w-4 h-4 ${isDragging ? "text-[var(--workstream-blue)]" : "text-gray-400"}`} />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Drop your payroll CSV here</p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                </div>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleInputChange} className="hidden" />
              </label>
            ) : (
              <div className="flex items-center justify-between mt-2 bg-emerald-50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{fileName}</p>
                    <p className="text-xs text-gray-500">
                      {csvData.length} employees across {companies.length} {companies.length === 1 ? "company" : "companies"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCsvData([]); setFileName(""); setSelectedCompanies(new Set());
                    setPreviewCompany(""); setPreviewOpen(false); setGenerated(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-md border border-gray-200"
                >
                  <X className="w-3 h-3" /> Replace
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Select, Configure & Export */}
        {csvData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-l-4 border-l-[var(--workstream-blue)] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--workstream-blue)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">2</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Select &amp; Export</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Choose companies, configure settings, and download your report</p>
                  </div>
                </div>
                <button
                  onClick={selectAllCompanies}
                  className="text-xs font-medium text-[var(--workstream-blue)] hover:underline"
                >
                  {selectedCompanies.size === companies.length ? "Deselect all" : "Select all"}
                </button>
              </div>
            </div>

            <div className="px-6 pb-5 pt-4 border-t border-gray-100 space-y-5">
              {/* Company chips */}
              <div className="flex flex-wrap gap-2">
                {companies.map((c) => {
                  const isSelected = selectedCompanies.has(c);
                  const count = csvData.filter((r) => r["Company Legal Name"] === c).length;
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCompany(c)}
                      className={`
                        inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium
                        transition-all duration-150 border
                        ${isSelected
                          ? "bg-[var(--workstream-blue)] border-[var(--workstream-blue)] text-white shadow-sm"
                          : "bg-white border-gray-200 text-gray-700 hover:border-[var(--workstream-blue)]/40 hover:bg-blue-50/30"
                        }
                      `}
                    >
                      <span>{c}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded ${isSelected ? "bg-white/20" : "bg-gray-100 text-gray-400"}`}>
                        {count} emp.
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Summary stats */}
              {companySummary && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                  {[
                    { label: "Employees", value: String(companySummary.employees) },
                    { label: "Labor Cost", value: fmtMoney(companySummary.totalLaborCost) },
                    { label: "Gross Pay", value: fmtMoney(companySummary.totalGrossPay) },
                    { label: "Net Pay", value: fmtMoney(companySummary.totalNetPay) },
                    { label: "Pay Date", value: fmtDate(companySummary.payDate) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 tabular-nums">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Config row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Pay date</label>
                  <input
                    type="date"
                    value={journalDate}
                    onChange={(e) => { setJournalDate(e.target.value); setGenerated(false); }}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-[var(--workstream-blue)]/20 focus:border-[var(--workstream-blue)]
                      transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Client name <span className="text-gray-400 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Uses company name if empty"
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-[var(--workstream-blue)]/20 focus:border-[var(--workstream-blue)]
                      transition-all placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Format</label>
                  <div className="flex bg-gray-100 border border-gray-200 rounded-lg p-1 h-[42px]">
                    <button
                      onClick={() => setExportFormat("pdf")}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all ${
                        exportFormat === "pdf"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" /> PDF
                    </button>
                    <button
                      onClick={() => setExportFormat("excel")}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all ${
                        exportFormat === "excel"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview toggle */}
              {previewLines.length > 0 && (
                <div>
                  <button
                    onClick={() => setPreviewOpen(!previewOpen)}
                    className="flex items-center gap-2 text-xs font-medium text-[var(--workstream-blue)] hover:underline transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview ledger
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${previewOpen ? "rotate-90" : ""}`} />
                  </button>

                  {previewOpen && (
                    <div className="mt-3">
                      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 mb-3 w-fit">
                        <button
                          onClick={() => setPreviewTab("journal")}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            previewTab === "journal" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                          }`}
                        >
                          Journal Entry
                        </button>
                        <button
                          onClick={() => setPreviewTab("gl")}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            previewTab === "gl" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                          }`}
                        >
                          GL Report
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="max-h-[360px] overflow-auto">
                          {previewTab === "journal" ? (
                            <table className="w-full text-xs">
                              <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-50 border-b border-gray-200">
                                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 w-10">#</th>
                                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Account</th>
                                  <th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-24">Debits</th>
                                  <th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-24">Credits</th>
                                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Description</th>
                                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Name</th>
                                </tr>
                              </thead>
                              <tbody>
                                {previewLines.map((l, i) => (
                                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                                    <td className="px-3 py-2 text-gray-400 tabular-nums">{l.num}</td>
                                    <td className="px-3 py-2 text-gray-800 font-medium">{l.accountCode} {l.accountName}</td>
                                    <td className="px-3 py-2 text-right tabular-nums text-gray-900">{l.debit ? fmtMoney(l.debit) : ""}</td>
                                    <td className="px-3 py-2 text-right tabular-nums text-gray-900">{l.credit ? fmtMoney(l.credit) : ""}</td>
                                    <td className="px-3 py-2 text-gray-500">{l.description}</td>
                                    <td className="px-3 py-2 text-gray-500">{l.name}</td>
                                  </tr>
                                ))}
                                <tr className="bg-gray-100 font-semibold border-t border-gray-200">
                                  <td className="px-3 py-2.5"></td>
                                  <td className="px-3 py-2.5 text-gray-800">Total</td>
                                  <td className="px-3 py-2.5 text-right tabular-nums text-gray-900">{fmtMoney(totalDebits)}</td>
                                  <td className="px-3 py-2.5 text-right tabular-nums text-gray-900">{fmtMoney(totalCredits)}</td>
                                  <td className="px-3 py-2.5"></td>
                                  <td className="px-3 py-2.5"></td>
                                </tr>
                              </tbody>
                            </table>
                          ) : (
                            <table className="w-full text-xs">
                              <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-50 border-b border-gray-200">
                                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Account</th>
                                  <th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-24">Amount</th>
                                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 w-24">Date</th>
                                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Memo</th>
                                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600">Name</th>
                                </tr>
                              </thead>
                              <tbody>
                                {previewLines.map((l, i) => {
                                  const amount = l.debit - l.credit;
                                  return (
                                    <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                                      <td className="px-3 py-2 text-gray-800 font-medium">{l.accountName}</td>
                                      <td className={`px-3 py-2 text-right tabular-nums ${amount < 0 ? "text-red-600" : "text-gray-900"}`}>
                                        {fmtMoney(Math.abs(amount))}{amount < 0 && " CR"}
                                      </td>
                                      <td className="px-3 py-2 text-gray-500 tabular-nums">{fmtDate(l.date)}</td>
                                      <td className="px-3 py-2 text-gray-500">{l.memo || l.description}</td>
                                      <td className="px-3 py-2 text-gray-500">{l.name}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Export bar */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {selectedCompanies.size === 0 ? (
                    "Select at least one company to export"
                  ) : (
                    <>
                      <span className="font-semibold text-gray-700">
                        {selectedCompanies.size} {selectedCompanies.size === 1 ? "company" : "companies"}
                      </span>
                      {selectedCompanies.size > 1 && " — downloads as ZIP"}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {generated && (
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Downloaded</span>
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center gap-1.5 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">{error}</span>
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className={`
                      inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150
                      ${canGenerate
                        ? "bg-[var(--workstream-blue)] text-white shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.98]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{generatingProgress || "Generating..."}</span>
                      </>
                    ) : (
                      <>
                        {selectedCompanies.size > 1 ? <Archive className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        <span>Download {exportFormat === "pdf" ? "PDF" : "Excel"}{selectedCompanies.size > 1 ? "s" : ""}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        </div>
      </main>
    </div>
  );
}


// ── Sub-Components ───────────────────────────────────────────────────────────

function MappingTable({
  mapping,
  onUpdate,
}: {
  mapping: AccountMappingRow[];
  onUpdate: (index: number, field: "accountCode" | "accountName", value: string) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-[35%]">Pay Type</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-[20%]">Account #</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Account Name</th>
          </tr>
        </thead>
        <tbody>
          {mapping.map((row, i) => (
            <tr key={row.key} className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
              <td className="px-4 py-2.5 text-gray-800 font-medium">{row.label}</td>
              <td className="px-2 py-1.5">
                <input
                  type="text"
                  value={row.accountCode}
                  onChange={(e) => onUpdate(i, "accountCode", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-[var(--workstream-blue)]/20 focus:border-[var(--workstream-blue)]
                    transition-all tabular-nums"
                />
              </td>
              <td className="px-2 py-1.5">
                <input
                  type="text"
                  value={row.accountName}
                  onChange={(e) => onUpdate(i, "accountName", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-[var(--workstream-blue)]/20 focus:border-[var(--workstream-blue)]
                    transition-all"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompanyMappingCard({
  company,
  mapping,
  onUpdate,
  onReset,
}: {
  company: string;
  mapping: AccountMappingRow[];
  onUpdate: (index: number, field: "accountCode" | "accountName", value: string) => void;
  onReset: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-xs font-semibold text-gray-900">{company}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Custom</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
        <button
          onClick={onReset}
          className="text-[11px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
      {expanded && (
        <div className="border-t border-gray-200">
          <MappingTable mapping={mapping} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}
