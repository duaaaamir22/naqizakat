/**
 * Local, device-only store of saved zakat assessments.
 * Used by the dashboard to summarise net zakatable wealth and zakat due over time.
 */

export interface ZakatRecord {
  id: string;
  /** ISO date (YYYY-MM-DD) of the assessment. */
  date: string;
  totalGross: number;
  deductions: number;
  totalZakatable: number;
  nisabThreshold: number;
  zakatDue: number;
  isLiable: boolean;
  breakdown: { label: string; value: number }[];
}

const STORAGE_KEY = "naqi.zakat.history.v2-aed";
const LEGACY_USD_STORAGE_KEY = "naqi.zakat.history.v1";
const AED_PER_USD = 3.6725;

function isRecord(value: unknown): value is ZakatRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as Partial<ZakatRecord>;
  return (
    typeof r.id === "string" &&
    typeof r.date === "string" &&
    typeof r.totalZakatable === "number" &&
    typeof r.zakatDue === "number"
  );
}

/** Reads saved assessments, newest last (sorted by date ascending). */
export function loadHistory(): ZakatRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const currentRaw = window.localStorage.getItem(STORAGE_KEY);
    const legacyRaw = window.localStorage.getItem(LEGACY_USD_STORAGE_KEY);
    const raw = currentRaw ?? legacyRaw;
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const records = parsed
      .filter(isRecord)
      .map((r) => ({ ...r, breakdown: Array.isArray(r.breakdown) ? r.breakdown : [] }))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (!currentRaw && legacyRaw) {
      const converted = records.map((record) => ({
        ...record,
        totalGross: record.totalGross * AED_PER_USD,
        deductions: record.deductions * AED_PER_USD,
        totalZakatable: record.totalZakatable * AED_PER_USD,
        nisabThreshold: record.nisabThreshold * AED_PER_USD,
        zakatDue: record.zakatDue * AED_PER_USD,
        breakdown: record.breakdown.map((item) => ({
          ...item,
          value: item.value * AED_PER_USD,
        })),
      }));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(converted));
      return converted;
    }
    return records;
  } catch {
    return [];
  }
}

function write(records: ZakatRecord[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-200)));
    window.dispatchEvent(new Event("naqi:history-changed"));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function saveRecord(record: Omit<ZakatRecord, "id">): ZakatRecord {
  const full: ZakatRecord = {
    ...record,
    id: `${record.date}-${Math.random().toString(36).slice(2, 8)}`,
  };
  write([...loadHistory(), full]);
  return full;
}

export function deleteRecord(id: string) {
  write(loadHistory().filter((r) => r.id !== id));
}

export function clearHistory() {
  write([]);
}

export interface HistorySummary {
  count: number;
  latestZakatable: number;
  latestZakatDue: number;
  totalZakatDue: number;
  averageZakatable: number;
  zakatableChangePct: number | null;
  firstDate: string | null;
  latestDate: string | null;
}

export function summarise(records: ZakatRecord[]): HistorySummary {
  if (records.length === 0) {
    return {
      count: 0,
      latestZakatable: 0,
      latestZakatDue: 0,
      totalZakatDue: 0,
      averageZakatable: 0,
      zakatableChangePct: null,
      firstDate: null,
      latestDate: null,
    };
  }

  const latest = records[records.length - 1]!;
  const previous = records.length > 1 ? records[records.length - 2] : undefined;
  const totalZakatDue = records.reduce((sum, r) => sum + r.zakatDue, 0);
  const averageZakatable =
    records.reduce((sum, r) => sum + r.totalZakatable, 0) / records.length;

  const changePct =
    previous && previous.totalZakatable > 0
      ? ((latest.totalZakatable - previous.totalZakatable) / previous.totalZakatable) * 100
      : null;

  return {
    count: records.length,
    latestZakatable: latest.totalZakatable,
    latestZakatDue: latest.zakatDue,
    totalZakatDue,
    averageZakatable,
    zakatableChangePct: changePct,
    firstDate: records[0]!.date,
    latestDate: latest.date,
  };
}
