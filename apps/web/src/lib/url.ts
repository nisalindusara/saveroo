// Small helper for links that keep the current filters and change one query value (e.g. paging).
// Used by admin list pages.

/** "?status=live&q=x" + ("cursor", "abc") -> "?status=live&q=x&cursor=abc". */
export function withParam(search: string, key: string, value: string): string {
	const params = new URLSearchParams(search);
	params.set(key, value);
	return `?${params}`;
}
