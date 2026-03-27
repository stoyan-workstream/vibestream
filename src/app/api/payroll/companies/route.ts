import { NextRequest, NextResponse } from "next/server";
import { querySnowflake } from "@/lib/snowflake";

const STG = "PROD.STG_CHECKHQ_PROD";

// GET /api/payroll/companies?company_id=66398
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("company_id");

  try {
    if (companyId) {
      // List paydays for a specific company
      const rows = await querySnowflake<{ PAYDAY: string; PAYROLL_COUNT: number; STATUS: string }>(
        `SELECT payday, COUNT(*) as payroll_count, status
         FROM ${STG}.checkhq_payrolls
         WHERE (company_id = ? OR checkhq_company_id = ?)
         GROUP BY payday, status
         ORDER BY payday DESC
         LIMIT 20`,
        [companyId, companyId],
      );
      return NextResponse.json({ paydays: rows });
    } else {
      // List companies with recent payrolls
      const rows = await querySnowflake<{ COMPANY_ID: string; LATEST_PAYDAY: string; PAYROLL_COUNT: number }>(
        `SELECT company_id, MAX(payday) as latest_payday, COUNT(*) as payroll_count
         FROM ${STG}.checkhq_payrolls
         WHERE status IN ('paid', 'partially_paid')
         GROUP BY company_id
         ORDER BY latest_payday DESC
         LIMIT 20`,
      );
      return NextResponse.json({ companies: rows });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
