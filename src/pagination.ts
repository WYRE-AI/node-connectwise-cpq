/** Common CPQ list-endpoint query parameters. */
export interface CpqListParams {
  /** Manage-style conditions: strings "quoted", booleans True/False, dates [YYYY-MM-DD]. */
  conditions?: string;
  /** Comma-separated field list — strongly encouraged (QuoteView has 204 properties). */
  includeFields?: string;
  /** 1-based page number. */
  page?: number;
  /** Default 100, max 1000 (community-established, not documented). */
  pageSize?: number;
  showAllVersions?: boolean;
}

/**
 * Paginate a CPQ list endpoint. CPQ list responses are bare JSON arrays — no
 * envelope, no total count, no next link — so the only termination rule is:
 * stop when a page comes back shorter than `pageSize`.
 */
export async function* paginate<T>(
  fetchPage: (page: number, pageSize: number) => Promise<T[]>,
  pageSize = 100
): AsyncGenerator<T[], void, void> {
  let page = 1;
  for (;;) {
    const items = await fetchPage(page, pageSize);
    if (items.length > 0) yield items;
    if (items.length < pageSize) return;
    page += 1;
  }
}

/**
 * Defensively unwrap a list payload. CPQ returns bare arrays today; if the API
 * ever starts wrapping (`{ data: [...] }` and friends), callers keep working.
 */
export function unwrap<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload !== null && typeof payload === 'object') {
    for (const key of ['data', 'items', 'results', 'value']) {
      const value = (payload as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

export interface ConditionClause {
  field: string;
  /** Defaults to '='. */
  op?: '=' | '!=' | '<' | '<=' | '>' | '>=' | 'like' | 'contains' | 'in';
  value: string | number | boolean | Date;
}

/** Matches ISO dates with or without a time component (time is stripped — the API rejects it). */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T ].*)?$/;

function formatConditionValue(value: ConditionClause['value']): string {
  if (value instanceof Date) return `[${value.toISOString().slice(0, 10)}]`;
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number') return String(value);
  if (ISO_DATE.test(value)) return `[${value.slice(0, 10)}]`;
  return `"${value.replace(/"/g, '\\"')}"`;
}

/**
 * Build a Manage-style condition string: strings quoted, booleans capitalized
 * (True/False), dates bracketed date-only (`createDate >= [2026-07-01]`).
 */
export function buildConditions(clauses: ConditionClause[]): string {
  return clauses
    .map(({ field, op = '=', value }) => `${field} ${op} ${formatConditionValue(value)}`)
    .join(' and ');
}
