// Sri Lanka time helpers: times are stored in UTC and typed or shown in Asia/Colombo (UTC+05:30, no DST).
// Used by the admin forms, the CSV import and (later) every page that shows a date.
const OFFSET_MINUTES = 5 * 60 + 30;
const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-11-12T10:00" (Colombo wall clock, as from <input type="datetime-local">) to a UTC ISO string. */
export function colomboLocalToUtc(local: string): string {
	const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/.exec(local.trim());
	if (!match) throw new Error(`Not a local date or date-time: ${local}`);
	const [, y, mo, d, h = '00', mi = '00'] = match;
	const wall = new Date(Date.UTC(+y!, +mo! - 1, +d!, +h, +mi));
	// Date.UTC rolls 30 Feb over to 2 Mar; reject anything that does not come back unchanged.
	if (
		wall.getUTCFullYear() !== +y! ||
		wall.getUTCMonth() !== +mo! - 1 ||
		wall.getUTCDate() !== +d! ||
		wall.getUTCHours() !== +h ||
		wall.getUTCMinutes() !== +mi
	) {
		throw new Error(`Invalid date: ${local}`);
	}
	return new Date(wall.getTime() - OFFSET_MINUTES * 60_000).toISOString();
}

/** UTC ISO string to "YYYY-MM-DDTHH:mm" in Colombo time (for datetime-local inputs). */
export function utcToColomboLocal(iso: string): string {
	const date = new Date(new Date(iso).getTime() + OFFSET_MINUTES * 60_000);
	return (
		`${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}` +
		`T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
	);
}

/** UTC ISO string to a short readable Colombo date-time, e.g. "12 Nov 2026, 10:00". */
export function formatColombo(iso: string): string {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: 'Asia/Colombo',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	}).format(new Date(iso));
}
