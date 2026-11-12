<!--
	Saveroo's line icons (24 px grid, drawn for this app, no icon library). Decorative unless `label` is set.
-->
<script lang="ts" module>
	const circle = (cx: number, cy: number, r: number) =>
		`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

	export const ICONS = {
		search: [circle(11, 11, 7), 'M20.5 20.5 16 16'],
		home: ['M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6.5H9V21H4.5a1 1 0 0 1-1-1z'],
		grid: ['M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z', 'M14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z', 'M4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z', 'M14 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z'],
		user: [circle(12, 8, 4), 'M4 21a8 8 0 0 1 16 0'],
		share: ['M12 3v12', 'M7.5 7.5 12 3l4.5 4.5', 'M5 12.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5'],
		copy: ['M9 9.5A1.5 1.5 0 0 1 10.5 8h8A1.5 1.5 0 0 1 20 9.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 9 18.5z', 'M5 15.5h-.5A1.5 1.5 0 0 1 3 14V5.5A1.5 1.5 0 0 1 4.5 4H13a1.5 1.5 0 0 1 1.5 1.5V6'],
		check: ['M5 12.5 10 17.5 19.5 7'],
		clock: [circle(12, 12, 9), 'M12 7.5V12l3 2'],
		pin: ['M12 21.5s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z', circle(12, 9.5, 2.5)],
		back: ['M19 12H5', 'M11 6l-6 6 6 6'],
		chevron: ['M9.5 6l6 6-6 6'],
		x: ['M6 6l12 12', 'M18 6 6 18'],
		external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'],
		calendar: ['M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z', 'M4 10h16', 'M8.5 3v4', 'M15.5 3v4'],
		card: ['M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M3 10.5h18', 'M7 15h4'],
		globe: [circle(12, 12, 9), 'M3 12h18', 'M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9', 'M12 3c-2.5 2.5-3.8 5.5-3.8 9s1.3 6.5 3.8 9'],
		store: ['M4 9 5.5 4h13L20 9', 'M5 9v11h14V9', 'M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0', 'M10 20v-5h4v5'],
		shield: ['M12 3l7.5 3v6c0 4.4-3.2 8.2-7.5 9-4.3-.8-7.5-4.6-7.5-9V6z', 'M8.7 12.2l2.3 2.3 4.4-4.6'],
		flame: ['M12 21a6 6 0 0 1-6-6c0-3.5 2.5-5.5 3.5-8 1 2 1.5 3 3 3.5-.3-2.7.6-5 2.5-7.5.4 3.3 3 5.5 3 9a6 6 0 0 1-6 9z'],
		sun: [circle(12, 12, 4), 'M12 2.5v2', 'M12 19.5v2', 'M4.6 4.6 6 6', 'M18 18l1.4 1.4', 'M2.5 12h2', 'M19.5 12h2', 'M4.6 19.4 6 18', 'M18 6l1.4-1.4'],
		whatsapp: ['M4.5 19.5 5.6 16A8.5 8.5 0 1 1 8.4 19z', 'M9 8.6c.1 3.4 3 6.3 6.4 6.4l1.1-1.4-1.9-1-.9.8A4.7 4.7 0 0 1 11.6 11l.8-.9-1-1.9z'],
		sparkle: ['M12 3c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7z'],
		phone: ['M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z']
	} as const;
	export type IconName = keyof typeof ICONS;
</script>

<script lang="ts">
	let { name, size = 20, stroke = 2, label, class: className = '' }: {
		name: IconName;
		size?: number;
		stroke?: number;
		label?: string;
		class?: string;
	} = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	class="shrink-0 {className}"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	{#each ICONS[name] as d, i (i)}<path {d} />{/each}
</svg>
