// Small text helpers: slugs for web addresses and a CSV reader.
// Used by the API (default slugs, CSV import) and the admin forms.

/** "Keells Super – Nugegoda!" -> "keells-super-nugegoda". Empty if nothing usable remains. */
export function slugify(text: string, maxLength = 80): string {
	return text
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, maxLength)
		.replace(/-+$/g, '');
}

/** Parses CSV text (comma separated, double-quoted fields, "" for a quote) into rows of cells. */
export function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let quoted = false;
	const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

	for (let i = 0; i < input.length; i++) {
		const ch = input[i];
		if (quoted) {
			if (ch === '"' && input[i + 1] === '"') {
				cell += '"';
				i++;
			} else if (ch === '"') {
				quoted = false;
			} else {
				cell += ch;
			}
		} else if (ch === '"' && cell === '') {
			quoted = true;
		} else if (ch === ',') {
			row.push(cell);
			cell = '';
		} else if (ch === '\n' || ch === '\r') {
			if (ch === '\r' && input[i + 1] === '\n') i++;
			row.push(cell);
			rows.push(row);
			row = [];
			cell = '';
		} else {
			cell += ch;
		}
	}
	if (cell !== '' || row.length > 0) {
		row.push(cell);
		rows.push(row);
	}
	return rows.filter((r) => r.some((c) => c.trim() !== ''));
}
