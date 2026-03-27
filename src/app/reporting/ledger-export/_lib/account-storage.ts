import type { AccountMappingRow } from "./types";
import { DEFAULT_ACCOUNT_MAPPING } from "./constants";

const GLOBAL_KEY = "gl_mapping_GLOBAL_DEFAULTS";

export function loadGlobalDefaults(): AccountMappingRow[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNT_MAPPING.map((r) => ({ ...r }));
  try {
    const stored = localStorage.getItem(GLOBAL_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return DEFAULT_ACCOUNT_MAPPING.map((r) => ({ ...r }));
}

export function saveGlobalDefaults(mapping: AccountMappingRow[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(mapping));
  } catch { /* ignore */ }
}

export function loadCompanyMapping(companyName: string): AccountMappingRow[] {
  if (typeof window === "undefined") return loadGlobalDefaults();
  try {
    const stored = localStorage.getItem(`gl_mapping_${companyName}`);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return loadGlobalDefaults();
}

export function saveCompanyMapping(companyName: string, mapping: AccountMappingRow[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`gl_mapping_${companyName}`, JSON.stringify(mapping));
  } catch { /* ignore */ }
}

export function hasCompanyOverride(companyName: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`gl_mapping_${companyName}`) !== null;
}

export function clearCompanyOverride(companyName: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`gl_mapping_${companyName}`);
}

export function resetGlobalDefaults(): AccountMappingRow[] {
  const fresh = DEFAULT_ACCOUNT_MAPPING.map((r) => ({ ...r }));
  if (typeof window !== "undefined") {
    try { localStorage.removeItem(GLOBAL_KEY); } catch { /* ignore */ }
  }
  return fresh;
}
