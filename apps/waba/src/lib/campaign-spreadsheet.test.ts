import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';

describe('Campaign spreadsheet compatibility', () => {
  it.each(['xlsx', 'xls', 'csv'] as const)('preserves recipient columns when importing %s', (bookType) => {
    const rows = [{ Name: 'Test Contact', 'Mobile Number': '919876543210', Offer: 'Service visit' }];
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), 'Recipients');
    const bytes = XLSX.write(book, { bookType, type: 'array' });
    const imported = XLSX.read(bytes, { type: 'array' });
    const sheet = imported.Sheets[imported.SheetNames[0]];
    const [recipient] = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    expect(recipient.Name).toBe(rows[0].Name);
    expect(String(recipient['Mobile Number'])).toBe(rows[0]['Mobile Number']);
    expect(recipient.Offer).toBe(rows[0].Offer);
  });
});
