// CSV reader for the admin deal import.
// Used by the API import endpoint (slugs are made by the database, see make_slug).

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
