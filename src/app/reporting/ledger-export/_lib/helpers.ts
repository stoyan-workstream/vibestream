export function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

export function fmtMoney(val: number): string {
  if (!val) return "";
  return `$${Math.abs(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtMoneyGL(val: number): string {
  if (val === 0) return "$0.00";
  const abs = `$${Math.abs(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return val < 0 ? `$(${abs.slice(1)})` : abs;
}

export function fmtDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const mon = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    const year = d.getUTCFullYear();
    return `${day}-${mon}-${year}`;
  } catch { return dateStr; }
}
