/**
 * Tiny RFC-4180 CSV writer. We control quoting ourselves so Thai text survives
 * Excel: callers prepend the UTF-8 BOM via `csvWithBom`.
 */

export type CsvCell = string | number | boolean | null | undefined

/** U+FEFF — Excel's "this file is UTF-8" hint. */
export const UTF8_BOM = String.fromCharCode(0xfeff)

export function csvEscape(value: CsvCell): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`
  return s
}

export function toCsv(rows: CsvCell[][]): string {
  // CRLF row endings per RFC 4180 — Excel's preference.
  return rows.map((row) => row.map(csvEscape).join(',')).join('\r\n')
}

/** UTF-8 BOM first so Excel detects Unicode instead of mojibake-ing Thai. */
export function csvWithBom(rows: CsvCell[][]): string {
  return UTF8_BOM + toCsv(rows)
}
