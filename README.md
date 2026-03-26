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
| `/reporting/ledger-export` | GL PDF export from Check payroll CSV |

## Features

### Built-in Reports
Collapsible sidebar with category navigation, star favorites, search (⌘K), sort options, and multiple view modes (flat, grouped cards, accordion).

### Dashboards
Tab-based interface for switching between Hiring, Payroll, Onboarding, and WorkstreamIQ dashboards. No page reloads.

### Ledger Export
Upload a Check payroll CSV, select a company, download a branded GL PDF. Produces two sections per company:
- **Journal Entry** — per-employee debits/credits
- **General Ledger Report** — account-level transactions

PDFs include Workstream logo, blue accent bar, page numbers, and footer attribution. Supports batch export for all companies at once.

**Tech:** jsPDF + autoTable for table layout, pdf-lib for PNG logo embedding.

## Dependencies

| Package | Purpose |
|---|---|
| `next` | Framework |
| `react` / `react-dom` | UI |
| `lucide-react` | Icons |
| `jspdf` + `jspdf-autotable` | PDF table generation |
| `pdf-lib` | PNG logo embedding in PDFs |

## Key Files

| File | Purpose |
|---|---|
| `src/app/reporting/ledger-export/page.tsx` | GL PDF export page |
| `src/app/reporting/built-in-reports/page.tsx` | Sidebar report browser |
| `src/app/reporting/dashboards/page.tsx` | Dashboard tabs |
| `src/components/Sidebar.tsx` | Main nav sidebar |
| `public/workstream_logo.png` | Logo used in PDF branding |

## Deployment

Deploy on [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js) or any platform that supports Next.js. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
