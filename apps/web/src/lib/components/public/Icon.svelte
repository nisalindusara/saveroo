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
		phone: ['M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z'],
		megaphone: ['M11 5.9v13.3a1.8 1.8 0 0 1-3.4.6l-2.1-6.1', 'M18 13a3 3 0 1 0 0-6', 'M5.4 13.7A4 4 0 0 1 7 6h1.8c4.1 0 7.6-1.2 9.2-3v14c-1.6-1.8-5.1-3-9.2-3H7a4 4 0 0 1-1.6-.3z'],
		chevronDown: ['M6 9.5l6 6 6-6'],
		tag: ['M3.5 12.5V5a1.5 1.5 0 0 1 1.5-1.5h7.5l8 8a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0z', circle(8, 8, 1.3)],
		// Category icons (names match categories.icon in the database).
		utensils: ['M7 3v8', 'M4.5 3v5a2.5 2.5 0 0 0 5 0V3', 'M7 11v10', 'M17 21V3c-2 1.5-3 4-3 7v3h3'],
		'shopping-basket': ['M3.5 10h17l-1.6 9.2a1 1 0 0 1-1 .8H6.1a1 1 0 0 1-1-.8z', 'M8 10l3-6', 'M16 10l-3-6', 'M9.5 14v3', 'M14.5 14v3'],
		shirt: ['M8 3.5 3.5 6l1.8 4 2.2-1v11.5h9V9l2.2 1 1.8-4L16 3.5c-.6 1.6-2.1 2.6-4 2.6s-3.4-1-4-2.6z'],
		smartphone: ['M7 3.5A1.5 1.5 0 0 1 8.5 2h7A1.5 1.5 0 0 1 17 3.5v17a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5z', 'M11 18.5h2'],
		plane: ['M21 4.5c-.8-.8-2.3-.4-3.3.6L14 8.8 5.5 6.5 3.8 8.2l7 3.7-3.4 3.4-2.6-.4-1.3 1.3 3.3 2 2 3.3 1.3-1.3-.4-2.6 3.4-3.4 3.7 7 1.7-1.7L15.2 10l3.7-3.7c1-1 1.4-2.5.6-3.3z'],
		'heart-pulse': ['M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11z', 'M5 12h3.5l1.5-2.5 2 5 1.5-2.5H19'],
		sofa: ['M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3', 'M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z', 'M6 18v2', 'M18 18v2'],
		gem: ['M6.5 4h11L21 9l-9 11L3 9z', 'M3 9h18', 'M9.5 4 8 9l4 11 4-11-1.5-5'],
		clapperboard: ['M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z', 'M3.6 6.3 18.8 2.8l.7 3-15.2 3.5z', 'M8.2 5.3l2 3', 'M13.2 4.2l2 3'],
		'shopping-cart': ['M3 4h2.5l2.2 10.5a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6.3', circle(9, 19.5, 1.3), circle(17, 19.5, 1.3)],
		fuel: ['M4.5 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16', 'M3 21h12', 'M7 8.5h4', 'M13.5 11h2a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 0 3 0V8l-3-3'],
		'book-open': ['M12 7c-1.5-2-4-2.5-8.5-2.5v13c4.5 0 7 .5 8.5 2.5 1.5-2 4-2.5 8.5-2.5v-13C16 4.5 13.5 5 12 7z', 'M12 7v13'],
		baby: [circle(12, 13, 7.5), 'M9.5 16a3.5 3.5 0 0 0 5 0', 'M9.2 11.5h.01', 'M14.8 11.5h.01', 'M12 5.5c0-1.4 1-2.5 2.3-2.5'],
		wrench: ['M15 3.5a5 5 0 0 0-4.6 6.9L4 16.8a1.9 1.9 0 0 0 2.7 2.7l6.4-6.4A5 5 0 0 0 20.5 9l-3 3-3-1-1-3 3-3a5 5 0 0 0-1.5-1.5z'],
		coffee: ['M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z', 'M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16', 'M8 3.5V6', 'M12 3.5V6'],
		pizza: ['M12 21 3.5 6.5c5-3 12-3 17 0z', 'M5.2 9.5c4-2 9.6-2 13.6 0', circle(10.5, 12.5, 1), circle(13.5, 15.5, 1)]
	} as const;
	export type IconName = keyof typeof ICONS;

	/** Icon for a category's `icon` value, or a generic tag when it has none we draw. */
	export function categoryIcon(icon: string | null): IconName {
		return icon && icon in ICONS ? (icon as IconName) : 'tag';
	}
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
