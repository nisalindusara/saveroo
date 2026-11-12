<!--
	Home: today's promise (what works today), search, categories, "Works today" and "Ending soon" rails,
	and the poster wall of the newest deals.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import CategoryChips from '#lib/components/public/CategoryChips.svelte';
	import DealCard from '#lib/components/public/DealCard.svelte';
	import Icon from '#lib/components/public/Icon.svelte';
	import Masonry from '#lib/components/public/Masonry.svelte';
	import Section from '#lib/components/public/Section.svelte';
	import Seo from '#lib/components/public/Seo.svelte';
	import WeekStrip from '#lib/components/public/WeekStrip.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const home = $derived(data.home);
	const dayName = $derived(t(`day.long.${data.today as 1}`));
</script>

<Seo
	title={t('app.name')}
	description={t('pub.seo.home_description')}
	jsonLd={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Saveroo', url: '/', potentialAction: { '@type': 'SearchAction', target: '/search?q={q}', 'query-input': 'required name=q' } }}
/>

<section class="hero relative overflow-hidden">
	<div class="mx-auto max-w-7xl px-4 pt-6 pb-2 md:pt-14">
		<p class="flex items-center gap-2 text-sm font-semibold text-ink-2">
			<span class="live-dot"></span>
			{t('pub.home.today_is', { day: dayName })}
		</p>
		<h1 class="font-display mt-2 text-[2.6rem] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance md:text-7xl">
			{t('pub.home.headline_1')}<br /><span class="relative inline-block text-roo">{t('pub.home.headline_2')}<svg class="swash" viewBox="0 0 200 18" preserveAspectRatio="none" aria-hidden="true"><path d="M3 13c50-9 120-12 194-6" /></svg></span>
		</h1>
		<p class="mt-4 max-w-md text-[0.95rem] text-ink-2">
			{#if home.counts.today > 0}
				{t('pub.home.today_count', { count: home.counts.today, merchants: home.counts.merchants })}
			{:else}
				{t('pub.home.intro')}
			{/if}
		</p>

		<a
			href={resolve('/(site)/search')}
			class="press mt-5 flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-ink-2 shadow-card"
		>
			<Icon name="search" size={20} stroke={2.2} class="text-roo" />
			<span class="flex-1">{t('pub.search_placeholder')}</span>
			<span class="hidden rounded-lg bg-surface-2 px-2 py-0.5 text-xs font-semibold sm:inline">{t('pub.search_hint')}</span>
		</a>

		<div class="mt-5 flex items-center gap-3">
			<WeekStrip days={[data.today]} today={data.today} size="lg" />
		</div>
	</div>
</section>

{#if data.categories.length}
	<div class="mx-auto mt-6 max-w-7xl">
		<CategoryChips categories={data.categories} />
	</div>
{/if}

{#if home.today.length}
	<Section title={t('pub.home.works_today', { day: dayName })} subtitle={t('pub.home.works_today_sub', { day: dayName })} icon="sun" tone="leaf">
		<div class="rail mx-auto max-w-7xl pb-2">
			{#each home.today as deal, i (deal.id)}
				<DealCard {deal} today={data.today} supabaseUrl={data.supabaseUrl} index={i} priority={i < 2} width="10.5rem" />
			{/each}
		</div>
	</Section>
{/if}

{#if home.ending.length}
	<Section title={t('pub.home.ending')} subtitle={t('pub.home.ending_sub')} icon="flame" tone="sun">
		<div class="rail mx-auto max-w-7xl pb-2">
			{#each home.ending as deal, i (deal.id)}
				<DealCard {deal} today={data.today} supabaseUrl={data.supabaseUrl} index={i} width="10.5rem" />
			{/each}
		</div>
	</Section>
{/if}

<Section title={t('pub.home.fresh')} subtitle={t('pub.home.fresh_sub', { count: home.counts.live })} icon="sparkle" tone="roo">
	<div class="mx-auto max-w-7xl px-4">
		{#if home.latest.length}
			<Masonry
				deals={home.latest}
				nextCursor={home.latestCursor}
				moreUrl={(cursor) => `/data/feed?cursor=${encodeURIComponent(cursor)}`}
				today={data.today}
				supabaseUrl={data.supabaseUrl}
				priority={home.today.length ? 0 : 2}
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
	.hero::before {
		content: '';
		position: absolute;
		inset: -40% -30% auto auto;
		width: 34rem;
		height: 34rem;
		border-radius: 50%;
		background: radial-gradient(closest-side, var(--roo-soft), transparent);
		opacity: 0.9;
		pointer-events: none;
		z-index: -1;
	}
	.live-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--leaf);
		box-shadow: 0 0 0 0 var(--leaf);
		animation: ping 2s var(--ease-out-expo) infinite;
	}
	@keyframes ping {
		70% {
			box-shadow: 0 0 0 0.5rem transparent;
		}
	}
	.swash {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -0.32em;
		width: 100%;
		height: 0.35em;
		fill: none;
		stroke: var(--roo);
		stroke-width: 5;
		stroke-linecap: round;
		stroke-dasharray: 220;
		stroke-dashoffset: 220;
		animation: draw 900ms 250ms var(--ease-out-expo) forwards;
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
