<!--
	Header on every public page (owner's reference layout): SAVEROO wordmark, a large tan search pill,
	then App and "Sell on Saveroo" (wide screens), Saved, Alerts and Cart icons and the account pill; below,
	a row of category tabs with icons that scrolls sideways (round arrow on the right).
	App, Sell, Saved, Alerts and Cart are not built yet: they open a short "coming soon" note (no fake
	counts). On the search page the page's own search box is used instead of the pill.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '@saveroo/shared/i18n';
	import Icon, { categoryIcon, type IconName } from './Icon.svelte';
	import Logo from './Logo.svelte';

	let { signedIn, categories }: { signedIn: boolean; categories: { slug: string; name: string; icon: string | null }[] } = $props();
	const onSearch = $derived(page.url.pathname.startsWith('/search'));
	const activeCategory = $derived(page.params.slug && page.url.pathname.startsWith('/categories/') ? page.params.slug : null);

	let tabs = $state<HTMLElement>();
	let atEnd = $state(false);
	const update = () => tabs && (atEnd = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 8);

	// Which "coming soon" note is open (one at a time); closes on outside click or Escape.
	type Soon = 'app' | 'sell' | 'saved' | 'alerts' | 'cart';
	let open = $state<Soon | null>(null);
	const toggle = (key: Soon) => (open = open === key ? null : key);
	const icons: { key: Exclude<Soon, 'app' | 'sell'>; icon: IconName }[] = [
		{ key: 'saved', icon: 'heart' },
		{ key: 'alerts', icon: 'bell' },
		{ key: 'cart', icon: 'shopping-cart' }
	];

	onMount(() => {
		update();
		const close = (e: Event) => {
			if (e instanceof KeyboardEvent ? e.key === 'Escape' : !(e.target as HTMLElement).closest('[data-soon]')) open = null;
		};
		document.addEventListener('click', close);
		document.addEventListener('keydown', close);
		return () => {
			document.removeEventListener('click', close);
			document.removeEventListener('keydown', close);
		};
	});
</script>

{#snippet note(key: Soon)}
	{#if open === key}
		<div class="note absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border border-line bg-surface p-3.5 text-left text-[13px] leading-snug font-normal text-ink shadow-card" role="status">
			<span class="mb-1 block font-bold">{t(`pub.nav.${key}`)}</span>{t(`pub.soon.${key}`)}
		</div>
	{/if}
{/snippet}

<header class="sticky top-0 z-40 border-b border-line bg-bg" style:view-transition-name="top-bar">
	<div class="mx-auto max-w-[1280px] px-4 pt-3.5 pb-1 sm:px-6">
		<div class="flex items-center gap-3 sm:gap-5 lg:gap-8">
			<a href={resolve('/(site)')} class="press shrink-0" aria-label={t('pub.home_label')}><Logo /></a>

			{#if !onSearch}
				<a
					href={resolve('/(site)/search')}
					class="search flex h-12 min-w-0 flex-1 items-center rounded-full border-2 border-roo bg-surface pr-1.5 pl-5 lg:max-w-[560px]"
				>
					<span class="truncate text-[15px] font-medium text-ink">{t('pub.search_placeholder')}</span>
					<span class="ml-auto grid size-[38px] shrink-0 place-items-center rounded-full bg-roo-btn text-white"><Icon name="search" size={18} stroke={2.3} /></span>
				</a>
			{:else}
				<span class="flex-1"></span>
			{/if}

			<div class="ml-auto flex shrink-0 items-center gap-1 text-[14.5px] font-medium sm:gap-2">
				<div class="relative hidden md:block" data-soon>
					<button class="util text-roo-ink" onclick={() => toggle('app')} aria-expanded={open === 'app'}>
						<span class="grid size-5 place-items-center rounded-[5px] border-[1.5px] border-current"><Icon name="smartphone" size={13} stroke={2} /></span>
						{t('pub.nav.app')}
					</button>
					{@render note('app')}
				</div>
				<span class="divider hidden md:block" aria-hidden="true"></span>
				<div class="relative hidden lg:block" data-soon>
					<button class="util" onclick={() => toggle('sell')} aria-expanded={open === 'sell'}>
						<Icon name="store" size={20} stroke={1.7} />{t('pub.nav.sell')}
					</button>
					{@render note('sell')}
				</div>
				<span class="divider hidden lg:block" aria-hidden="true"></span>
				{#each icons as item (item.key)}
					<div class="relative hidden sm:block" data-soon>
						<button class="icon-btn" onclick={() => toggle(item.key)} aria-label={t(`pub.nav.${item.key}`)} aria-expanded={open === item.key}>
							<Icon name={item.icon} size={22} stroke={1.7} />
						</button>
						{@render note(item.key)}
					</div>
				{/each}
				<a
					href={signedIn ? resolve('/(site)/me') : resolve('/(site)/login')}
					class="ml-1 flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2.5 text-ink transition-colors hover:bg-[#e5e7eb]"
					aria-label={signedIn ? t('pub.nav.me') : t('auth.login')}
				>
					<Icon name="user" size={20} stroke={1.8} />
					<Icon name="chevronDown" size={16} stroke={2} />
				</a>
			</div>
		</div>

		{#if categories.length}
			<div class="relative mt-3">
				<nav bind:this={tabs} onscroll={update} class="tabs flex items-center gap-8 overflow-x-auto py-2.5 pr-12 pl-1 text-[15.5px] font-medium" aria-label={t('pub.nav.categories')}>
					{#each categories as c (c.slug)}
						<a
							href={resolve('/(site)/categories/[slug]', { slug: c.slug })}
							class="tab flex shrink-0 items-center gap-2.5 whitespace-nowrap"
							aria-current={activeCategory === c.slug ? 'page' : undefined}
						>
							<Icon name={categoryIcon(c.icon)} size={21} stroke={1.6} />{c.name}
						</a>
					{/each}
					<a href={resolve('/(site)/categories')} class="tab flex shrink-0 items-center gap-2.5 whitespace-nowrap">
						<Icon name="grid" size={21} stroke={1.6} />{t('pub.nav.all_categories')}
					</a>
				</nav>
				{#if !atEnd}
					<button
						class="absolute top-1/2 right-0 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-ink shadow-card"
						onclick={() => tabs?.scrollBy({ left: 220, behavior: 'smooth' })}
						aria-label={t('pub.nav.more_categories')}
					>
						<Icon name="chevron" size={20} stroke={2} />
					</button>
				{/if}
			</div>
		{/if}
	</div>
</header>

<style>
	.search:focus-visible,
	.search:hover {
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--roo) 25%, transparent);
	}
	.util {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.5rem;
		border-radius: 0.5rem;
		white-space: nowrap;
		transition: background 150ms;
	}
	.util:hover,
	.icon-btn:hover {
		background: var(--surface-2);
	}
	.icon-btn {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 999px;
		color: var(--ink);
		transition: background 150ms;
	}
	.divider {
		width: 1px;
		height: 1.6rem;
		margin-inline: 0.5rem;
		background: var(--line);
	}
	.tabs {
		scrollbar-width: none;
	}
	.tabs::-webkit-scrollbar {
		display: none;
	}
	.tab {
		color: #2d3138;
		transition: color 150ms;
	}
	.tab :global(svg) {
		color: #2d3138;
	}
	.tab:hover,
	.tab[aria-current='page'],
	.tab:hover :global(svg),
	.tab[aria-current='page'] :global(svg) {
		color: var(--roo-ink);
	}
	.tab[aria-current='page'] {
		text-decoration: underline;
		text-decoration-color: var(--roo);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.55rem;
	}
	@media (prefers-color-scheme: dark) {
		.tab,
		.tab :global(svg) {
			color: var(--ink);
		}
	}
</style>
