// Short labels for banks and telcos ("HNB", "ComBank") for small chips on deal cards.
// Used by the public pages; falls back to a shortened name for providers added later.
const SHORT: Record<string, string> = {
	'commercial-bank': 'ComBank',
	'sampath-bank': 'Sampath',
	hnb: 'HNB',
	'nations-trust-bank': 'NTB',
	'seylan-bank': 'Seylan',
	boc: 'BOC',
	'peoples-bank': "People's",
	'dfcc-bank': 'DFCC',
	'ndb-bank': 'NDB',
	'pan-asia-bank': 'Pan Asia',
	'union-bank': 'Union',
	'cargills-bank': 'Cargills',
	dialog: 'Dialog',
	'slt-mobitel': 'Mobitel',
	hutch: 'Hutch'
};

/** "Hatton National Bank (HNB)" -> "HNB"; unknown providers use the bracketed part or the first words. */
export function providerShortName(provider: { slug: string; name: string }): string {
	const known = SHORT[provider.slug];
	if (known) return known;
	const bracketed = /\(([^)]+)\)/.exec(provider.name)?.[1];
	if (bracketed) return bracketed;
	return provider.name.replace(/\b(bank|plc|limited|ltd)\b/gi, '').trim().split(/\s+/).slice(0, 2).join(' ');
}
