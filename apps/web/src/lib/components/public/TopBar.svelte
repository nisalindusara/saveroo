<!--
	Top bar on every public page: logo and the search box (on phones too, so searching is one tap), plus
	the main links and the account button on wider screens. On the search page the page's own box is used.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '@saveroo/shared/i18n';
	import Icon from './Icon.svelte';
	import Logo from './Logo.svelte';

	let { signedIn }: { signedIn: boolean } = $props();
	const onSearch = $derived(page.url.pathname.startsWith('/search'));
</script>

<header class="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-xl" style:view-transition-name="top-bar">
	<div class="mx-auto flex h-15 max-w-7xl items-center gap-3 px-4 md:gap-6">
		<a href={resolve('/(site)')} class="press shrink-0" aria-label={t('pub.home_label')}><Logo /></a>

		{#if !onSearch}
			<a
				href={resolve('/(site)/search')}
				class="search press flex min-w-0 flex-1 items-center gap-2 rounded-full border-[1.5px] border-line bg-surface py-1 pr-1 pl-3.5 text-sm text-ink-2 md:max-w-xl"
			>
				<span class="truncate">{t('pub.search_placeholder')}</span>
				<span class="ml-auto grid size-8 shrink-0 place-items-center rounded-full bg-roo text-white"><Icon name="search" size={16} stroke={2.5} /></span>
			</a>
		{/if}

		<nav class="ml-auto hidden items-center gap-1 text-sm font-semibold md:flex" aria-label={t('pub.nav.label')}>
			<a href={resolve('/(site)/categories')} class="rounded-full px-3 py-1.5 hover:bg-surface-2">{t('pub.nav.categories')}</a>
			<a
				href={signedIn ? resolve('/(site)/me') : resolve('/(site)/login')}
				class="press ml-1 flex items-center gap-2 rounded-full border-[1.5px] border-line px-4 py-1.5 hover:bg-surface-2"
			>
				<Icon name="user" size={16} stroke={2.2} />
				{signedIn ? t('pub.nav.me') : t('auth.login')}
			</a>
		</nav>
	</div>
</header>

<style>
	.search:hover {
		border-color: var(--roo);
	}
</style>
