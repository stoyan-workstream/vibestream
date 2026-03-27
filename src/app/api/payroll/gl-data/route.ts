import { NextRequest, NextResponse } from "next/server";
import { querySnowflake } from "@/lib/snowflake";

const STG = "PROD.STG_CHECKHQ_PROD";

interface EarningRow {
  PAYEE_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  PAYDAY: string;
  LABEL: string;
  AMOUNT: number;
  HOURS_WORKED: number;
}

interface TaxRow {
  LABEL: string;
  EMPLOYEE_TAX_AMOUNT: number;
  COMPANY_TAX_AMOUNT: number;
}

interface SummaryRow {
  PAYEE_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  NET_PAY: number;
}

// GET /api/payroll/gl-data?company_id=xxx&payday=2026-01-30
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("company_id");
  const payday = req.nextUrl.searchParams.get("payday");

  if (!companyId || !payday) {
    return NextResponse.json(
      { error: "company_id and payday are required" },
      { status: 400 },
    );
  }

  try {
    // Per-employee earnings (line_type = 'earning')
    const earnings = await querySnowflake<EarningRow>(
      `SELECT
        l.payee_id,
        e.first_name,
        e.last_name,
        l.payday,
        l.label,
        l.amount,
        l.hours_worked
      FROM ${STG}.checkhq_payroll_item_lines l
      JOIN ${STG}.checkhq_employees e ON l.payee_id = e.checkhq_employee_id
      WHERE (l.company_id = ? OR l.checkhq_company_id = ?)
        AND l.payday = ?
        AND l.payroll_status IN ('paid', 'partially_paid')
        AND l.payee_type = 'employee'
        AND l.line_type = 'earning'
      ORDER BY e.last_name, e.first_name`,
      [companyId, companyId, payday],
    );

    // Itemized taxes aggregated by label (from intermediate taxes table)
    const taxes = await querySnowflake<TaxRow>(
      `SELECT
        t.label,
        SUM(t.employee_tax_amount) AS employee_tax_amount,
        SUM(t.company_tax_amount) AS company_tax_amount
      FROM ${STG}.checkhq_payroll_item_taxes t
      WHERE (t.company_id = ? OR t.checkhq_company_id = ?)
        AND t.payday = ?
        AND t.payroll_status IN ('paid', 'partially_paid')
        AND t.payee_type = 'employee'
      GROUP BY t.label`,
      [companyId, companyId, payday],
    );

    // Per-employee net pay (from payroll_items)
    const netPays = await querySnowflake<SummaryRow>(
      `SELECT
        pi.payee_id,
        e.first_name,
        e.last_name,
        pi.net_pay
      FROM ${STG}.checkhq_payroll_items pi
      JOIN ${STG}.checkhq_payrolls p ON pi.checkhq_payroll_id = p.checkhq_payroll_id
      JOIN ${STG}.checkhq_employees e ON pi.payee_id = e.checkhq_employee_id
      WHERE (p.company_id = ? OR p.checkhq_company_id = ?)
        AND p.payday = ?
        AND p.status IN ('paid', 'partially_paid')
        AND pi.payee_type = 'employee'
      ORDER BY e.last_name, e.first_name`,
      [companyId, companyId, payday],
    );

    // Aggregate earnings per employee (labor cost = sum of all earning amounts)
    const employeeMap: Record<string, { firstName: string; lastName: string; laborCost: number }> = {};
    for (const e of earnings) {
      if (!employeeMap[e.PAYEE_ID]) {
        employeeMap[e.PAYEE_ID] = { firstName: e.FIRST_NAME, lastName: e.LAST_NAME, laborCost: 0 };
      }
      employeeMap[e.PAYEE_ID].laborCost += e.AMOUNT || 0;
    }

    const taxSummary: Record<string, { employee: number; company: number }> = {};
    for (const t of taxes) {
      taxSummary[t.LABEL] = {
        employee: t.EMPLOYEE_TAX_AMOUNT || 0,
        company: t.COMPANY_TAX_AMOUNT || 0,
      };
    }

    const totalNet = netPays.reduce((s, r) => s + (r.NET_PAY || 0), 0);
    const totalLaborCost = Object.values(employeeMap).reduce((s, e) => s + e.laborCost, 0);

    return NextResponse.json({
      employees: Object.entries(employeeMap).map(([id, e]) => ({
        payeeId: id,
        firstName: e.firstName,
        lastName: e.lastName,
        laborCost: e.laborCost,
      })),
      netPays: netPays.map((r) => ({
        payeeId: r.PAYEE_ID,
        firstName: r.FIRST_NAME,
        lastName: r.LAST_NAME,
        netPay: r.NET_PAY,
      })),
      taxSummary,
      meta: {
        companyId,
        payday,
        employeeCount: Object.keys(employeeMap).length,
        totalNet,
        totalLaborCost,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("GL data query failed:", msg);
    return NextResponse.json(
      { error: "Failed to fetch payroll data", detail: msg },
      { status: 500 },
    );
  }
}
