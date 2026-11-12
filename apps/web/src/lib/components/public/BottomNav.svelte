<!--
	Floating bottom bar on phones: Home, Search, Categories, Me. The highlight slides to the active tab.
	Wallet and Saved join it in M6 and M7.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '@saveroo/shared/i18n';
	import Icon, { type IconName } from './Icon.svelte';

	const tabs: { href: string; icon: IconName; label: string; match: (path: string) => boolean }[] = [
		{ href: resolve('/(site)'), icon: 'home', label: t('pub.nav.home'), match: (p) => p === '/' },
		{ href: resolve('/(site)/search'), icon: 'search', label: t('pub.nav.search'), match: (p) => p.startsWith('/search') },
		{ href: resolve('/(site)/categories'), icon: 'grid', label: t('pub.nav.categories'), match: (p) => p.startsWith('/categories') },
		{ href: resolve('/(site)/me'), icon: 'user', label: t('pub.nav.me'), match: (p) => p === '/me' || p === '/login' }
	];
	const active = $derived(tabs.findIndex((tab) => tab.match(page.url.pathname)));
	// Deal pages have their own bottom bar (share) and a back button, like most detail screens.
	const hidden = $derived(page.url.pathname.startsWith('/deals/'));
</script>

{#if !hidden}
<nav
	class="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] md:hidden"
	aria-label={t('pub.nav.label')}
	style:view-transition-name="bottom-nav"
>
	<div class="relative mx-auto grid max-w-sm grid-cols-4 rounded-[1.4rem] border border-line bg-surface/85 p-1.5 shadow-card backdrop-blur-xl">
		{#if active >= 0}
			<span class="indicator" style:transform="translateX({active * 100}%)"></span>
		{/if}
		{#each tabs as tab, i (tab.href)}
			<a
				href={tab.href}
				class="press relative z-10 flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[0.66rem] font-semibold transition-colors {i === active ? 'text-ink' : 'text-ink-2'}"
				aria-current={i === active ? 'page' : undefined}
			>
				<Icon name={tab.icon} size={21} stroke={i === active ? 2.4 : 1.9} />
				{tab.label}
			</a>
		{/each}
	</div>
</nav>
{/if}

<style>
	.indicator {
		position: absolute;
		top: 0.375rem;
		bottom: 0.375rem;
		left: 0.375rem;
		width: calc((100% - 0.75rem) / 4);
		border-radius: 1rem;
		background: var(--roo-soft);
		transition: transform 420ms var(--ease-spring);
	}
</style>
