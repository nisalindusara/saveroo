<!--
	Merchant page: cover and logo, quick facts, the poster wall of its live deals and its branches.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import { imageUrl } from '@saveroo/shared/images';
	import ExternalLink from '#lib/components/public/ExternalLink.svelte';
	import Icon from '#lib/components/public/Icon.svelte';
	import DealGrid from '#lib/components/public/DealGrid.svelte';
	import Seo from '#lib/components/public/Seo.svelte';
	import { posterColours } from '#lib/public/cards.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const m = $derived(data.merchant);
	const colours = $derived(posterColours(m.name));
	const mapsUrl = (b: { name: string; city: string | null; lat: number | null; lng: number | null }) =>
		b.lat !== null && b.lng !== null
			? `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`
			: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${m.name} ${b.name} ${b.city ?? ''}`)}`;
</script>

<Seo
	title={t('pub.merchant.title', { name: m.name })}
	description={m.description?.slice(0, 160) ?? t('pub.merchant.description', { name: m.name })}
	image={m.coverKey ? imageUrl(data.supabaseUrl, m.coverKey, 1280) : undefined}
/>

<header class="relative">
	<div class="cover relative h-40 overflow-hidden md:h-64" style:background={colours.bg}>
		{#if m.coverKey}
			<img src={imageUrl(data.supabaseUrl, m.coverKey, 1280)} alt="" class="h-full w-full object-cover" fetchpriority="high" />
		{:else}
			<span class="ring" style:color={colours.fg} aria-hidden="true"></span>
		{/if}
	</div>
	<div class="mx-auto max-w-7xl px-4">
		<div class="relative z-10 -mt-10 flex items-end gap-4">
			<div class="grid size-20 shrink-0 place-items-center overflow-hidden rounded-[1.4rem] border-4 border-bg bg-surface shadow-card md:size-28">
				{#if m.logoKey}
					<img src={imageUrl(data.supabaseUrl, m.logoKey, 320)} alt={m.name} class="h-full w-full object-cover" />
				{:else}
					<span class="font-display text-3xl font-extrabold" style:color={colours.bg}>{m.name[0]}</span>
				{/if}
			</div>
		</div>
		<h1 class="font-display mt-3 flex items-center gap-2 text-[2rem] leading-none font-extrabold tracking-[-0.04em] md:text-5xl">
			{m.name}
			{#if m.isVerified}<Icon name="shield" size={24} stroke={2.2} class="text-leaf" label={t('pub.merchant.verified')} />{/if}
		</h1>
		<div class="mt-3 flex flex-wrap gap-2 text-[0.8rem] font-semibold">
			<span class="fact"><Icon name="sparkle" size={14} />{t('pub.merchant.live_deals', { count: data.deals.length + (data.nextCursor ? '+' : '') })}</span>
			{#if m.category}<a href={resolve('/(site)/categories/[slug]', { slug: m.category.slug })} class="fact press">{m.category.name}</a>{/if}
			{#if m.hasPhysicalStores && m.branches.length}<span class="fact"><Icon name="store" size={14} />{t('pub.merchant.branches', { count: m.branches.length })}</span>{/if}
			{#if m.isOnline}<span class="fact"><Icon name="globe" size={14} />{t('pub.channel.online')}</span>{/if}
			{#if m.websiteUrl}
				<ExternalLink href={m.websiteUrl} class="fact press text-roo-ink">{t('pub.merchant.website')}<Icon name="external" size={13} /></ExternalLink>
			{/if}
		</div>
		{#if m.description}<p class="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-ink-2">{m.description}</p>{/if}
	</div>
</header>

<section class="mx-auto mt-8 max-w-7xl px-4">
	<h2 class="font-display text-[1.35rem] font-extrabold tracking-tight">{t('pub.merchant.offers')}</h2>
	<div class="mt-3.5">
		{#if data.deals.length}
			<DealGrid
				deals={data.deals}
				nextCursor={data.nextCursor}
				moreUrl={(cursor) => `/data/feed?merchant=${m.slug}&cursor=${encodeURIComponent(cursor)}`}
				today={data.today}
				supabaseUrl={data.supabaseUrl}
			/>
		{:else}
			<p class="rounded-3xl border border-dashed border-line px-6 py-10 text-center text-ink-2">{t('pub.merchant.no_offers')}</p>
		{/if}
	</div>
</section>

{#if m.branches.length}
	<section class="mx-auto mt-10 max-w-7xl px-4">
		<h2 class="font-display text-[1.35rem] font-extrabold tracking-tight">{t('pub.merchant.where')}</h2>
		<ul class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each m.branches as b (b.name)}
				<li class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3.5">
					<span class="min-w-0">
						<span class="block font-semibold">{b.name}</span>
						<span class="block truncate text-sm text-ink-2">{[b.address, b.city].filter(Boolean).join(', ')}</span>
					</span>
					<span class="flex shrink-0 gap-1.5">
						{#if b.phone}<a href="tel:{b.phone}" class="icon-btn press" aria-label={t('pub.merchant.call', { branch: b.name })}><Icon name="phone" size={17} /></a>{/if}
						<ExternalLink href={mapsUrl(b)} class="icon-btn press" label={t('pub.deal.directions')}><Icon name="pin" size={17} /></ExternalLink>
					</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.fact {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.35rem 0.7rem;
		border-radius: 999px;
		background: var(--surface);
		border: 1px solid var(--line);
	}
	.icon-btn {
		display: grid;
		place-items: center;
		width: 2.3rem;
		height: 2.3rem;
		border-radius: 50%;
		background: var(--surface-2);
	}
	.ring {
		position: absolute;
		right: 8%;
		top: -4rem;
		width: 14rem;
		height: 14rem;
		border-radius: 50%;
		border: 2.2rem solid currentColor;
		opacity: 0.14;
	}
</style>
