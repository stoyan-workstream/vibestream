# Vibestream

Internal reporting and payroll tools for Workstream. Built with [Next.js](https://nextjs.org) 16, React 19, and TypeScript.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/stoyan-workstream/vibestream.git
cd vibestream
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Pages auto-update as you edit.

### Build

```bash
npm run build
npm start
```

## Routes

| Route | Description |
|---|---|
| `/reporting/built-in-reports` | Flat list view with sidebar navigation |
| `/reporting/built-in-reports-accordion` | Original accordion view |
| `/reporting/custom-reports` | Custom reports (iframe embed) |
| `/reporting/dashboards` | Tab-based dashboards (Hiring, Payroll, Onboarding, WorkstreamIQ) |
| `/reporting/ledger-export` | GL PDF/Excel export from Check payroll CSV |
| `/api/payroll/companies` | Snowflake API — list companies and paydays |
| `/api/payroll/gl-data` | Snowflake API — per-employee earnings, taxes, net pay |

## Features

### Built-in Reports
Collapsible sidebar with category navigation, star favorites, search (⌘K), sort options, and multiple view modes (flat, grouped cards, accordion).

### Dashboards
Tab-based interface for switching between Hiring, Payroll, Onboarding, and WorkstreamIQ dashboards. No page reloads.

### Ledger Export
Two-section page for generating GL reports from Check payroll data:
- **Account Mapping** (Settings) — configure which GL accounts each pay type maps to. Global defaults apply to all companies; per-company overrides are saved separately in localStorage.
- **Generate** (Upload → Select → Export) — upload a CSV, select companies, preview the ledger, and download as PDF or Excel. Multi-company exports bundle into a ZIP.

PDFs include Workstream logo, blue accent bar, page numbers, and footer attribution.

**Tech:** jsPDF + autoTable for PDF, xlsx (SheetJS) for Excel, jszip for multi-file bundling, pdf-lib for PNG logo embedding. Business logic is modularized under `src/app/reporting/ledger-export/_lib/`.

## Dependencies

| Package | Purpose |
|---|---|
| `next` | Framework |
| `react` / `react-dom` | UI |
| `lucide-react` | Icons |
| `jspdf` + `jspdf-autotable` | PDF table generation |
| `pdf-lib` | PNG logo embedding in PDFs |
| `xlsx` | Excel export (SheetJS) |
| `jszip` | ZIP bundling for multi-company exports |
| `snowflake-sdk` | Snowflake warehouse queries (API routes) |

## Key Files

| File | Purpose |
|---|---|
| `src/app/reporting/ledger-export/page.tsx` | Ledger Export page (UI) |
| `src/app/reporting/ledger-export/_lib/` | Business logic modules (types, CSV parser, transform, PDF/Excel generators, ZIP bundler, account storage) |
| `src/lib/snowflake.ts` | Snowflake connection + query helper |
| `src/app/reporting/built-in-reports/page.tsx` | Sidebar report browser |
| `src/app/reporting/dashboards/page.tsx` | Dashboard tabs |
| `src/components/Sidebar.tsx` | Main nav sidebar |
| `public/workstream_logo.png` | Logo used in PDF branding |

## Deployment

Deploy on [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js) or any platform that supports Next.js. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
