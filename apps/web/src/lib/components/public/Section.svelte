<!--
	A titled home/merchant section with an optional "See all" link; the content goes in the slot.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { t } from '@saveroo/shared/i18n';
	import Icon, { type IconName } from './Icon.svelte';

	let {
		title,
		subtitle,
		icon,
		href,
		tone = 'ink',
		children
	}: {
		title: string;
		subtitle?: string;
		icon?: IconName;
		href?: string;
		tone?: 'ink' | 'leaf' | 'sun' | 'roo';
		children: Snippet;
	} = $props();

	const tones = { ink: 'bg-ink text-bg', leaf: 'bg-leaf text-white', sun: 'bg-sun text-ink', roo: 'bg-roo text-white' };
</script>

<section class="mt-9">
	<div class="mx-auto flex max-w-7xl items-end justify-between gap-3 px-4">
		<div class="flex items-center gap-2.5">
			{#if icon}
				<span class="grid size-8 place-items-center rounded-xl {tones[tone]}"><Icon name={icon} size={17} stroke={2.3} /></span>
			{/if}
			<div>
				<h2 class="font-display text-[1.35rem] leading-tight font-extrabold tracking-tight">{title}</h2>
				{#if subtitle}<p class="text-[0.8rem] text-ink-2">{subtitle}</p>{/if}
			</div>
		</div>
		{#if href}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- callers pass resolved paths -->
			<a {href} class="press flex shrink-0 items-center gap-0.5 text-sm font-semibold text-roo-ink">
				{t('pub.see_all')}<Icon name="chevron" size={16} stroke={2.4} />
			</a>
		{/if}
	</div>
	<div class="mt-3.5">{@render children()}</div>
</section>
