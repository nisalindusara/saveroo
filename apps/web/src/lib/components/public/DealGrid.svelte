<!--
	Poster wall: deal cards in balanced columns (2 on phones, up to 5 on wide screens) using each poster's
	known shape. Loads the next page when the end comes into view (or with the button), appending only.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { t } from '@saveroo/shared/i18n';
	import type { PublicDealCard } from '@saveroo/shared';
	import { columnsFor, distribute } from '#lib/public/cards.js';
	import DealCard from './DealCard.svelte';

	let {
		deals,
		nextCursor,
		moreUrl,
		today,
		supabaseUrl,
		priority = 2
	}: {
		deals: PublicDealCard[];
		nextCursor: string | null;
		/** Address that returns the next page as `{ data, nextCursor }` for a cursor; null disables paging. */
		moreUrl: ((cursor: string) => string) | null;
		today: number;
		supabaseUrl: string;
		/** How many of the first cards load their image right away. */
		priority?: number;
	} = $props();

	// Server render assumes a phone (2 columns); the browser re-balances for its width.
	let count = $state(2);
	// Cards rise in when they first appear; re-arranging columns (wider screen) must not replay it.
	const seen = new SvelteSet<string>();
	let settled = $state(false);
	// svelte-ignore state_referenced_locally
	let all = $state<PublicDealCard[]>([...deals]);
	// svelte-ignore state_referenced_locally
	let cursor = $state(nextCursor);
	let loading = $state(false);
	let failed = $state(false);
	let sentinel = $state<HTMLElement>();

	const layout = $derived(distribute(all, count).columns);
	const order = $derived(new Map(all.map((d, i) => [d.id, i])));

	async function loadMore() {
		if (!cursor || !moreUrl || loading) return;
		loading = true;
		failed = false;
		try {
			const res = await fetch(moreUrl(cursor));
			if (!res.ok) throw new Error(String(res.status));
			const page = (await res.json()) as { data: PublicDealCard[]; nextCursor: string | null };
			const seen = new Set(all.map((d) => d.id));
			all.push(...page.data.filter((d) => !seen.has(d.id)));
			cursor = page.nextCursor;
		} catch {
			failed = true;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		const media = [720, 1100, 1400].map((w) => matchMedia(`(min-width: ${w}px)`));
		const update = () => (count = columnsFor(innerWidth));
		update();
		for (const d of all) seen.add(d.id);
		requestAnimationFrame(() => (settled = true));
		media.forEach((m) => m.addEventListener('change', update));

		const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && loadMore(), {
			rootMargin: '900px 0px'
		});
		if (sentinel) observer.observe(sentinel);
		return () => {
			observer.disconnect();
			media.forEach((m) => m.removeEventListener('change', update));
		};
	});
</script>

<div class="grid items-start gap-3 sm:gap-4" style:grid-template-columns="repeat({count}, minmax(0, 1fr))">
	{#each layout as column, c (c)}
		<div class="flex min-w-0 flex-col gap-4 sm:gap-5">
			{#each column as deal (deal.id)}
				{@const i = order.get(deal.id) ?? 0}
				<DealCard {deal} {today} {supabaseUrl} index={i % 12} priority={i < priority} animate={!settled || !seen.has(deal.id)} />
			{/each}
		</div>
	{/each}
</div>

{#if cursor && moreUrl}
	<div bind:this={sentinel} class="flex justify-center py-8">
		<button class="press rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold shadow-card" onclick={loadMore} disabled={loading}>
			{loading ? t('pub.loading') : failed ? t('pub.retry') : t('pub.more')}
		</button>
	</div>
{:else if all.length > 8}
	<p class="py-10 text-center text-sm text-ink-2">{t('pub.end_of_list')}</p>
{/if}
