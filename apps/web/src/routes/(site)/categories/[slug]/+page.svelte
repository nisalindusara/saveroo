<!--
	Category page: coloured header, sub-category and sibling chips, and the poster wall of its deals.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import CategoryChips from '#lib/components/public/CategoryChips.svelte';
	import DealGrid from '#lib/components/public/DealGrid.svelte';
	import Seo from '#lib/components/public/Seo.svelte';
	import { posterColours } from '#lib/public/cards.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const colours = $derived(posterColours(data.parent?.slug ?? data.category.slug));
</script>

<Seo
	title={t('pub.categories.page_title', { name: data.category.name })}
	description={t('pub.categories.page_description', { name: data.category.name })}
/>

<header class="relative overflow-hidden" style:background={colours.bg} style:color={colours.fg}>
	<div class="mx-auto max-w-7xl px-4 pt-6 pb-8 md:pt-12 md:pb-12">
		{#if data.parent}
			<a href={resolve('/(site)/categories/[slug]', { slug: data.parent.slug })} class="text-sm font-semibold opacity-85 hover:opacity-100">{data.parent.name}</a>
		{:else}
			<a href={resolve('/(site)/categories')} class="text-sm font-semibold opacity-85 hover:opacity-100">{t('pub.nav.categories')}</a>
		{/if}
		<h1 class="font-display mt-1 text-[2.3rem] leading-none font-extrabold tracking-[-0.04em] md:text-6xl">{data.category.name}</h1>
		<p class="mt-2 text-sm font-semibold opacity-85">
			{data.deals.length === 0 ? t('pub.categories.none_yet') : data.nextCursor ? t('pub.categories.many') : t('pub.categories.count', { count: data.deals.length })}
		</p>
	</div>
	<span class="ring" aria-hidden="true"></span>
</header>

<div class="mx-auto mt-4 max-w-7xl">
	<CategoryChips
		categories={data.children.length ? data.children : data.others}
		active={data.category.slug}
		allHref={data.children.length ? resolve('/(site)/categories/[slug]', { slug: data.parent?.slug ?? data.category.slug }) : undefined}
	/>
</div>

<div class="mx-auto mt-5 max-w-7xl px-4">
	{#key data.category.slug}
		{#if data.deals.length}
			<DealGrid
				deals={data.deals}
				nextCursor={data.nextCursor}
				moreUrl={(cursor) => `/data/feed?category=${data.category.slug}&cursor=${encodeURIComponent(cursor)}`}
				today={data.today}
				supabaseUrl={data.supabaseUrl}
			/>
		{:else}
			<div class="rounded-3xl border border-dashed border-line px-6 py-14 text-center">
				<p class="font-display text-2xl font-bold">{t('pub.categories.empty_title')}</p>
				<p class="mt-2 text-ink-2">{t('pub.categories.empty_body')}</p>
				<a href={resolve('/(site)')} class="press mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg">{t('pub.back_home')}</a>
			</div>
		{/if}
	{/key}
</div>

<style>
	.ring {
		position: absolute;
		right: -5rem;
		bottom: -7rem;
		width: 16rem;
		height: 16rem;
		border-radius: 50%;
		border: 2.5rem solid currentColor;
		opacity: 0.1;
		pointer-events: none;
	}
</style>
