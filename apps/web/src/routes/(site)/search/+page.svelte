<!--
	Search: results follow your typing (shops first, then deals); recent searches are kept on this device
	only; categories help when the box is empty. Works without JavaScript as a normal form.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import { imageUrl } from '@saveroo/shared/images';
	import CategoryChips from '#lib/components/public/CategoryChips.svelte';
	import Icon from '#lib/components/public/Icon.svelte';
	import Masonry from '#lib/components/public/Masonry.svelte';
	import Seo from '#lib/components/public/Seo.svelte';
	import { posterColours } from '#lib/public/cards.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	// svelte-ignore state_referenced_locally
	let query = $state(data.q);
	let input = $state<HTMLInputElement>();
	let recent = $state<string[]>([]);
	let timer: ReturnType<typeof setTimeout> | undefined;
	const RECENT_KEY = 'saveroo:recent-searches';

	onMount(() => {
		try {
			recent = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]').slice(0, 6);
		} catch {
			recent = [];
		}
		if (!data.q) input?.focus();
	});

	function remember(q: string) {
		if (q.length < 2) return;
		recent = [q, ...recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 6);
		try {
			localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
		} catch {
			// Private mode or storage full: recent searches just are not kept.
		}
	}

	function search(q: string, delay = 280) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			const trimmed = q.trim();
			if (trimmed === data.q) return;
			const target = trimmed.length >= 2 ? `${resolve('/(site)/search')}?q=${encodeURIComponent(trimmed)}` : resolve('/(site)/search');
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- target is built from resolve() above
			goto(target, { replace: true, reset: false });
			if (trimmed.length >= 3) remember(trimmed);
		}, delay);
	}
</script>

<Seo
	title={data.q ? t('pub.search.title_for', { q: data.q }) : t('pub.nav.search')}
	description={t('pub.search.description')}
	noindex={data.q !== ''}
/>

<div class="sticky top-14 z-20 bg-bg/90 pt-3 pb-3 backdrop-blur-xl">
	<form method="GET" action={resolve('/(site)/search')} class="mx-auto max-w-3xl px-4" onsubmit={(e) => (e.preventDefault(), search(query, 0))}>
		<label class="search flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 shadow-card">
			<Icon name="search" size={21} stroke={2.3} class="text-roo" />
			<input
				bind:this={input}
				bind:value={query}
				oninput={() => search(query)}
				name="q"
				type="search"
				enterkeyhint="search"
				autocomplete="off"
				placeholder={t('pub.search_placeholder')}
				aria-label={t('pub.nav.search')}
				class="w-full bg-transparent py-3.5 text-[1.05rem] font-medium outline-none placeholder:text-ink-2"
			/>
			{#if query}
				<button type="button" class="press grid size-7 place-items-center rounded-full bg-surface-2" onclick={() => ((query = ''), search('', 0), input?.focus())} aria-label={t('pub.search.clear')}>
					<Icon name="x" size={15} stroke={2.6} />
				</button>
			{/if}
		</label>
	</form>
</div>

<div class="mx-auto max-w-7xl">
	{#if !data.q}
		{#if recent.length}
			<section class="mt-4 px-4">
				<h2 class="label">{t('pub.search.recent')}</h2>
				<div class="mt-2 flex flex-wrap gap-2">
					{#each recent as r (r)}
						<button class="press flex items-center gap-1.5 rounded-full bg-surface-2 px-3.5 py-2 text-sm font-medium" onclick={() => ((query = r), search(r, 0))}>
							<Icon name="clock" size={14} />{r}
						</button>
					{/each}
				</div>
			</section>
		{/if}
		<section class="mt-6">
			<h2 class="label px-4">{t('pub.search.browse')}</h2>
			<div class="mt-2"><CategoryChips categories={data.categories} /></div>
		</section>
		<p class="mt-10 px-4 text-center text-sm text-ink-2">{t('pub.search.tip')}</p>
	{:else if data.failed}
		<p class="mt-10 px-4 text-center text-ink-2">{t('pub.search.failed')}</p>
	{:else}
		{#if data.merchants.length}
			<section class="mt-3">
				<h2 class="label px-4">{t('pub.search.shops')}</h2>
				<div class="rail mt-2 pb-1">
					{#each data.merchants as m (m.slug)}
						{@const colours = posterColours(m.name)}
						<a href={resolve('/(site)/merchants/[slug]', { slug: m.slug })} class="press flex w-60 items-center gap-3 rounded-2xl border border-line bg-surface p-3">
							<span class="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl" style:background={colours.bg}>
								{#if m.logoKey}
									<img src={imageUrl(data.supabaseUrl, m.logoKey, 320)} alt="" class="h-full w-full object-cover" />
								{:else}
									<span class="font-display text-lg font-extrabold" style:color={colours.fg}>{m.name[0]}</span>
								{/if}
							</span>
							<span class="min-w-0">
								<span class="block truncate font-semibold">{m.name}</span>
								<span class="block text-xs text-ink-2">{t('pub.merchant.live_deals', { count: m.liveDeals })}</span>
							</span>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<section class="mt-6 px-4">
			<h2 class="label">{t('pub.search.deals')}</h2>
			<div class="mt-3">
				{#if data.deals.length}
					{#key data.q}
						<Masonry
							deals={data.deals}
							nextCursor={data.nextCursor}
							moreUrl={(cursor) => `/data/search?q=${encodeURIComponent(data.q)}&cursor=${encodeURIComponent(cursor)}`}
							today={data.today}
							supabaseUrl={data.supabaseUrl}
						/>
					{/key}
				{:else}
					<div class="rounded-3xl border border-dashed border-line px-6 py-12 text-center">
						<p class="font-display text-xl font-bold">{t('pub.search.none', { q: data.q })}</p>
						<p class="mt-2 text-ink-2">{t('pub.search.none_tip')}</p>
					</div>
				{/if}
			</div>
		</section>
	{/if}
</div>

<style>
	.label {
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-2);
	}
	.search:focus-within {
		border-color: var(--roo);
		box-shadow: 0 0 0 4px var(--roo-soft);
	}
	input[type='search']::-webkit-search-cancel-button {
		display: none;
	}
</style>
