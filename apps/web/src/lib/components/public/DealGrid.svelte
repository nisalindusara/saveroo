<!--
	Deal grid: cards in even rows (1 column on phones, 2, 3, then 4 on wide screens), like a shop window.
	Loads the next page when the end comes into view (or with the button), appending only.
	Used on Home, category, merchant and search pages.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '@saveroo/shared/i18n';
	import type { PublicDealCard } from '@saveroo/shared';
	import DealCard from './DealCard.svelte';

	let {
		deals,
		nextCursor,
		moreUrl,
		today,
		supabaseUrl,
		priority = 1
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

	// svelte-ignore state_referenced_locally
	let all = $state<PublicDealCard[]>([...deals]);
	// svelte-ignore state_referenced_locally
	let cursor = $state(nextCursor);
	let loading = $state(false);
	let failed = $state(false);
	let sentinel = $state<HTMLElement>();

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
		const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && loadMore(), {
			rootMargin: '900px 0px'
		});
		if (sentinel) observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<div class="grid grid-cols-1 gap-x-4 gap-y-7 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4">
	{#each all as deal, i (deal.id)}
		<DealCard {deal} {today} {supabaseUrl} index={i % 12} priority={i < priority} />
	{/each}
</div>

{#if cursor && moreUrl}
	<div bind:this={sentinel} class="flex justify-center py-8">
		<button class="press rounded-full border border-line bg-surface px-6 py-2.5 text-sm font-semibold" onclick={loadMore} disabled={loading}>
			{loading ? t('pub.loading') : failed ? t('pub.retry') : t('pub.more')}
		</button>
	</div>
{:else if all.length > 8}
	<p class="py-10 text-center text-sm text-ink-2">{t('pub.end_of_list')}</p>
{/if}
