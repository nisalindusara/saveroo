<!--
	Header on every public page (owner's reference design): SAVEROO wordmark, tan search pill, account
	pill, and a row of category tabs with icons that scrolls sideways (arrow button on the right).
	On the search page the page's own search box is used instead of the pill.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '@saveroo/shared/i18n';
	import Icon, { categoryIcon } from './Icon.svelte';
	import Logo from './Logo.svelte';

	let { signedIn, categories }: { signedIn: boolean; categories: { slug: string; name: string; icon: string | null }[] } = $props();
	const onSearch = $derived(page.url.pathname.startsWith('/search'));
	const activeCategory = $derived(page.params.slug && page.url.pathname.startsWith('/categories/') ? page.params.slug : null);

	let tabs = $state<HTMLElement>();
	let atEnd = $state(false);
	const update = () => tabs && (atEnd = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 8);
	onMount(update);
</script>

<header class="sticky top-0 z-40 border-b border-line bg-bg" style:view-transition-name="top-bar">
	<div class="mx-auto max-w-[1280px] px-4 pt-3 pb-1.5 sm:px-6">
		<div class="flex items-center gap-3 sm:gap-6">
			<a href={resolve('/(site)')} class="press shrink-0" aria-label={t('pub.home_label')}><Logo /></a>

			{#if !onSearch}
				<a
					href={resolve('/(site)/search')}
					class="search flex h-11 min-w-0 flex-1 items-center rounded-full border-[1.5px] border-roo bg-surface pr-1.5 pl-4 sm:max-w-[455px]"
				>
					<span class="truncate text-[0.9rem] font-medium text-ink-2">{t('pub.search_placeholder')}</span>
					<span class="ml-auto grid size-[34px] shrink-0 place-items-center rounded-full bg-roo text-white"><Icon name="search" size={16} stroke={2.4} /></span>
				</a>
			{:else}
				<span class="flex-1"></span>
			{/if}

			<a
				href={signedIn ? resolve('/(site)/me') : resolve('/(site)/login')}
				class="press ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-surface-2 px-3 py-2 text-[0.85rem] font-medium text-ink"
				aria-label={signedIn ? t('pub.nav.me') : t('auth.login')}
			>
				<Icon name="user" size={17} stroke={1.9} />
				<span class="hidden md:inline">{signedIn ? t('pub.nav.me') : t('auth.login')}</span>
			</a>
		</div>

		{#if categories.length}
			<div class="relative mt-2.5">
				<nav bind:this={tabs} onscroll={update} class="tabs flex items-center gap-5 overflow-x-auto pr-10 text-[0.84rem] font-medium" aria-label={t('pub.nav.categories')}>
					{#each categories as c (c.slug)}
						<a
							href={resolve('/(site)/categories/[slug]', { slug: c.slug })}
							class="tab flex shrink-0 items-center gap-2 py-1.5 whitespace-nowrap"
							aria-current={activeCategory === c.slug ? 'page' : undefined}
						>
							<Icon name={categoryIcon(c.icon)} size={16} stroke={1.8} />{c.name}
						</a>
					{/each}
					<a href={resolve('/(site)/categories')} class="tab flex shrink-0 items-center gap-2 py-1.5 whitespace-nowrap">
						<Icon name="grid" size={16} stroke={1.8} />{t('pub.nav.all_categories')}
					</a>
				</nav>
				{#if !atEnd}
					<button
						class="absolute top-1/2 right-0 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-ink shadow-card"
						onclick={() => tabs?.scrollBy({ left: 180, behavior: 'smooth' })}
						aria-label={t('pub.nav.more_categories')}
					>
						<Icon name="chevron" size={16} stroke={2.2} />
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
	.tabs {
		scrollbar-width: none;
	}
	.tabs::-webkit-scrollbar {
		display: none;
	}
	.tab {
		color: var(--ink);
		border-bottom: 2px solid transparent;
		transition: color 150ms;
	}
	.tab:hover,
	.tab[aria-current='page'] {
		color: var(--roo-ink);
	}
	.tab[aria-current='page'] {
		border-bottom-color: var(--roo);
	}
</style>
