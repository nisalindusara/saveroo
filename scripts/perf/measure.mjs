// Measures the public API: for each endpoint, uncached (MISS) and cached (HIT) server time
// (from the Server-Timing header) and total time, then prints p50 and p95 against the budget.
// Usage: node scripts/perf/measure.mjs <api base url> [runs per endpoint]  (see scripts/perf/README.md)
const base = process.argv[2] ?? 'http://localhost:8787';
const runs = Number(process.argv[3] ?? 40);
const BUDGET_MISS = 300;
const BUDGET_HIT = 100;

const merchant = process.env.PERF_MERCHANT ?? 'perf-scope-cinemas';
const deal = process.env.PERF_DEAL ?? 'perf-deal-1';
const endpoints = [
	'/feed',
	'/feed?category=food-dining',
	'/categories',
	`/merchants/${merchant}`,
	`/merchants/${merchant}/deals`,
	`/deals/${deal}`,
	'/search?q=scop%20cinemas',
	'/search?q=pizza%20hut'
];

const p = (values, q) => {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1)];
};

async function time(url) {
	const started = performance.now();
	const res = await fetch(url);
	await res.arrayBuffer();
	const total = performance.now() - started;
	const server = Number(/app;dur=(\d+)/.exec(res.headers.get('server-timing') ?? '')?.[1] ?? NaN);
	return { status: res.status, cache: res.headers.get('x-cache'), server, total };
}

let failed = false;
console.log(`API ${base}, ${runs} runs each. Budget p95: ${BUDGET_MISS} ms uncached, ${BUDGET_HIT} ms cached (server time).\n`);
console.log('endpoint'.padEnd(38), 'status', 'miss p50/p95'.padStart(14), 'hit p50/p95'.padStart(13), 'total p95'.padStart(10));
for (const path of endpoints) {
	const sep = path.includes('?') ? '&' : '?';
	const misses = [];
	const hits = [];
	let status = 0;
	for (let i = 0; i < runs; i++) {
		// A unique extra parameter makes a new cache key, so the request reaches the database.
		const miss = await time(`${base}${path}${sep}_run=${Date.now()}-${i}`);
		status = miss.status;
		misses.push(miss);
		hits.push(await time(`${base}${path}`));
	}
	const server = (xs) => xs.map((x) => x.server);
	const missP95 = p(server(misses), 0.95);
	const hitP95 = p(server(hits.filter((h) => h.cache === 'HIT')), 0.95);
	const ok = status === 200 && missP95 <= BUDGET_MISS && hitP95 <= BUDGET_HIT;
	failed ||= !ok;
	console.log(
		path.padEnd(38),
		String(status).padStart(6),
		`${p(server(misses), 0.5)}/${missP95} ms`.padStart(14),
		`${p(server(hits), 0.5)}/${hitP95} ms`.padStart(13),
		`${Math.round(p(misses.map((m) => m.total), 0.95))} ms`.padStart(10),
		ok ? 'ok' : 'OVER BUDGET'
	);
}
process.exit(failed ? 1 : 0);
