import type { DbQuestion } from '@/lib/db';

export interface RowError {
  row: number;
  column: string;
  message: string;
}

export interface ParseResult {
  valid: DbQuestion[];
  errors: RowError[];
}

export function splitRow(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

export function opt(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function req(
  value: string,
  row: number,
  column: string,
  errors: RowError[],
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    errors.push({ row, column, message: `Le champ "${column}" est requis.` });
    return null;
  }
  return trimmed;
}
