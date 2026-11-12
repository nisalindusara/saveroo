<!--
	Home, shop-window style: category icons, a "today" banner (how many offers work today and the best
	saving), "Works today" and "Ending soon" rails, then every live deal in a grid, newest first.
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import CategoryNav from '#lib/components/public/CategoryNav.svelte';
	import DealCard from '#lib/components/public/DealCard.svelte';
	import DealGrid from '#lib/components/public/DealGrid.svelte';
	import Rail from '#lib/components/public/Rail.svelte';
	import Section from '#lib/components/public/Section.svelte';
	import Seo from '#lib/components/public/Seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const home = $derived(data.home);
	const dayName = $derived(t(`day.long.${data.today as 1}`));
	// Biggest percentage saving among today's deals, for the banner ("save up to 50% today").
	const best = $derived(Math.max(0, ...home.today.map((d) => (d.dealType === 'cashback' ? 0 : (d.discountPercent ?? 0)))));
</script>

<Seo
	title={t('app.name')}
	description={t('pub.seo.home_description')}
	jsonLd={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Saveroo', url: '/', potentialAction: { '@type': 'SearchAction', target: '/search?q={q}', 'query-input': 'required name=q' } }}
/>

{#if data.categories.length}
	<div class="mt-4">
		<CategoryNav categories={data.categories} />
	</div>
{/if}

<section class="mx-auto mt-4 max-w-7xl px-4">
	<div class="banner relative overflow-hidden rounded-3xl px-5 py-5 text-white md:px-10 md:py-9">
		<p class="text-[0.75rem] font-bold tracking-[0.16em] text-[#ffb08f] uppercase">{t('pub.home.today_is', { day: dayName })}</p>
		<h1 class="font-display mt-1.5 max-w-xl text-[1.75rem] leading-[1] font-extrabold tracking-[-0.035em] md:text-5xl">
			{#if home.counts.today > 0}
				{t('pub.home.banner_title', { count: home.counts.today })}
			{:else}
				{t('pub.home.headline_1')} {t('pub.home.headline_2')}
			{/if}
		</h1>
		<p class="mt-2 max-w-[15rem] text-[0.88rem] text-white/75 sm:max-w-md">
			{best > 0 ? t('pub.home.banner_best', { percent: best }) : t('pub.home.intro')}
		</p>
		{#if home.today.length}
			<a href="#today" class="press mt-4 inline-flex items-center rounded-full bg-roo px-5 py-2.5 text-sm font-bold text-white">{t('pub.home.banner_cta')}</a>
		{/if}
		<svg viewBox="0 0 64 64" class="mark" aria-hidden="true">
			<path fill="var(--roo)" d="M18 8h34a6 6 0 0 1 6 6v36a6 6 0 0 1-6 6H18L6 32z" />
			<circle cx="17" cy="32" r="4" fill="#1b1511" />
		</svg>
	</div>
</section>

{#if home.today.length}
	<div id="today" class="scroll-mt-20">
		<Section title={t('pub.home.works_today', { day: dayName })} subtitle={t('pub.home.works_today_sub', { day: dayName })} icon="sun" tone="leaf">
			<Rail>
				{#each home.today as deal, i (deal.id)}
					<DealCard {deal} today={data.today} supabaseUrl={data.supabaseUrl} index={i} priority={i < 2} width="15rem" />
				{/each}
			</Rail>
		</Section>
	</div>
{/if}

{#if home.ending.length}
	<Section title={t('pub.home.ending')} subtitle={t('pub.home.ending_sub')} icon="flame" tone="sun">
		<Rail>
			{#each home.ending as deal, i (deal.id)}
				<DealCard {deal} today={data.today} supabaseUrl={data.supabaseUrl} index={i} width="15rem" />
			{/each}
		</Rail>
	</Section>
{/if}

<Section title={t('pub.home.fresh')} subtitle={t('pub.home.fresh_sub', { count: home.counts.live })} icon="sparkle" tone="roo">
	<div class="mx-auto max-w-7xl px-4">
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
			<div class="rounded-3xl border border-dashed border-line px-6 py-14 text-center">
				<p class="font-display text-2xl font-bold">{t('pub.empty.title')}</p>
				<p class="mt-2 text-ink-2">{t('pub.empty.body')}</p>
			</div>
		{/if}
	</div>
</Section>

<style>
	/* Fixed dark banner in both themes, with a warm glow and the tag mark peeking in. */
	.banner {
		background:
			radial-gradient(circle at 85% 20%, rgb(255 90 31 / 0.45), transparent 45%),
			radial-gradient(circle at 10% 120%, rgb(245 163 0 / 0.25), transparent 40%),
			#1b1511;
	}
	.mark {
		position: absolute;
		right: -1.5rem;
		bottom: -2rem;
		width: 7.5rem;
		height: 7.5rem;
		transform: rotate(-14deg);
		opacity: 0.95;
	}
	@media (min-width: 768px) {
		.mark {
			right: 3rem;
			bottom: -1rem;
			width: 13rem;
			height: 13rem;
		}
	}
</style>
