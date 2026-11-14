<!--
	Home (owner's reference design; the promo strip and banner come from the (site) layout): "Works today"
	row with a day pill, "Ending soon" story cards, a grey "Featured deals" panel (or "New this week"
	when nothing is featured), a grey "Shops with offers" panel of round shop badges, then all offers in
	a 3-column grid with "See more".
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import BrandCircles from '#lib/components/public/BrandCircles.svelte';
	import DealCard from '#lib/components/public/DealCard.svelte';
	import DealGrid from '#lib/components/public/DealGrid.svelte';
	import FeaturedCard from '#lib/components/public/FeaturedCard.svelte';
	import Icon from '#lib/components/public/Icon.svelte';
	import Rail from '#lib/components/public/Rail.svelte';
	import Section from '#lib/components/public/Section.svelte';
	import Seo from '#lib/components/public/Seo.svelte';
	import StoryCard from '#lib/components/public/StoryCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const home = $derived(data.home);
	const dayName = $derived(t(`day.long.${data.today as 1}`));
	const all = $derived([...home.today, ...home.ending, ...home.latest]);

	// Featured deals; when none are featured, the newest deals of the past week instead.
	const featured = $derived.by(() => {
		const unique = all.filter((d, i) => all.findIndex((x) => x.id === d.id) === i);
		const picked = unique.filter((d) => d.isFeatured);
		if (picked.length) return { title: t('pub.home.featured'), label: t('pub.home.featured_label'), deals: picked.slice(0, 10) };
		const weekAgo = Date.now() - 7 * 86_400_000;
		const fresh = home.latest.filter((d) => new Date(d.startsAt).getTime() >= weekAgo);
		return { title: t('pub.home.new_week'), label: t('pub.home.new_label'), deals: fresh.slice(0, 10) };
	});

	// Every shop with a deal on this page, once.
	const shops = $derived.by(() => {
		return all.filter((d, i) => all.findIndex((x) => x.merchant.slug === d.merchant.slug) === i).map((d) => d.merchant);
	});
</script>

<Seo
	title={t('app.name')}
	description={t('pub.seo.home_description')}
	jsonLd={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Saveroo', url: '/', potentialAction: { '@type': 'SearchAction', target: '/search?q={q}', 'query-input': 'required name=q' } }}
/>

<h1 class="sr-only">{t('pub.home.headline_1')} {t('pub.home.headline_2')}</h1>

{#if home.today.length}
	<Section title={t('pub.home.works_today_title')} id="today">
		{#snippet right()}
			<span class="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-2 px-4 py-2 text-[0.8rem]">
				<Icon name="calendar" size={15} stroke={2} />
				<span class="font-semibold">{dayName}</span>
				<span class="hidden text-ink-2 sm:inline">· {t('pub.home.offers_count', { count: home.counts.today })}</span>
			</span>
		{/snippet}
		<Rail>
			{#each home.today as deal, i (deal.id)}
				<DealCard {deal} today={data.today} supabaseUrl={data.supabaseUrl} index={i} priority={i < 2} width="17rem" />
			{/each}
		</Rail>
	</Section>
{/if}

{#if home.ending.length}
	<Section title={t('pub.home.ending')} id="ending">
		<Rail arrowTop="8.25rem">
			{#each home.ending as deal, i (deal.id)}
				<StoryCard {deal} supabaseUrl={data.supabaseUrl} index={i} />
			{/each}
		</Rail>
	</Section>
{/if}

{#if featured.deals.length}
	<section class="panel mx-4 mb-8 pt-5 pb-6 sm:mx-7">
		<h2 class="mb-4 flex items-center gap-2 px-5 text-lg font-extrabold tracking-[-0.01em]">
			<Icon name="sparkle" size={19} stroke={1.9} />{featured.title}
		</h2>
		<Rail arrowTop="5.6rem">
			{#each featured.deals as deal (deal.id)}
				<FeaturedCard {deal} label={featured.label} supabaseUrl={data.supabaseUrl} />
			{/each}
		</Rail>
	</section>
{/if}

{#if shops.length > 2}
	<section class="panel mx-4 mb-9 pt-5 pb-6 sm:mx-7">
		<h2 class="mb-4 flex items-center gap-2 px-5 text-lg font-extrabold tracking-[-0.01em]">
			<Icon name="shield" size={19} stroke={1.9} />{t('pub.home.shops')}
		</h2>
		<BrandCircles {shops} supabaseUrl={data.supabaseUrl} />
	</section>
{/if}

<Section title={t('pub.home.fresh')}>
	<div class="px-4 sm:px-7">
		{#if home.latest.length}
			<DealGrid
				deals={home.latest}
				nextCursor={home.latestCursor}
				moreUrl={(cursor) => `/data/feed?cursor=${encodeURIComponent(cursor)}`}
				today={data.today}
				supabaseUrl={data.supabaseUrl}
				priority={home.today.length ? 0 : 1}
			/>
		{:else}
			<div class="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
				<p class="text-2xl font-bold">{t('pub.empty.title')}</p>
				<p class="mt-2 text-ink-2">{t('pub.empty.body')}</p>
			</div>
		{/if}
	</div>
</Section>

<style>
	/* Grey rounded panels, as in the reference design. */
	.panel {
		border-radius: 1rem;
		background: #f1f3f6;
		border: 1px solid rgb(229 231 235 / 0.7);
	}
	.panel :global(.rail) {
		padding-inline: 1.25rem;
		scroll-padding-inline: 1.25rem;
	}
	@media (prefers-color-scheme: dark) {
		.panel {
			background: var(--surface-2);
			border-color: var(--line);
		}
	}
</style>
