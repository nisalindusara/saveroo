<!--
	Top bar: logo, and on wider screens the main links, a search pill and the account button.
	Phones use the bottom bar for navigation, so the top bar stays slim.
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

<header class="sticky top-0 z-30 border-b border-transparent bg-bg/80 backdrop-blur-xl" style:view-transition-name="top-bar">
	<div class="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
		<a href={resolve('/(site)')} class="press shrink-0" aria-label={t('pub.home_label')}><Logo /></a>

		<nav class="ml-4 hidden items-center gap-1 text-sm font-semibold md:flex" aria-label={t('pub.nav.label')}>
			<a href={resolve('/(site)')} class="rounded-full px-3 py-1.5 hover:bg-surface-2">{t('pub.nav.home')}</a>
			<a href={resolve('/(site)/categories')} class="rounded-full px-3 py-1.5 hover:bg-surface-2">{t('pub.nav.categories')}</a>
		</nav>

		<div class="ml-auto flex items-center gap-2">
			{#if !onSearch}
				<a
					href={resolve('/(site)/search')}
					class="press hidden w-64 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink-2 shadow-card md:flex"
				>
					<Icon name="search" size={17} />
					{t('pub.search_placeholder')}
				</a>
			{/if}
			<a
				href={signedIn ? resolve('/(site)/me') : resolve('/(site)/login')}
				class="press hidden items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg md:flex"
			>
				<Icon name="user" size={16} stroke={2.2} />
				{signedIn ? t('pub.nav.me') : t('auth.login')}
			</a>
		</div>
	</div>
</header>
