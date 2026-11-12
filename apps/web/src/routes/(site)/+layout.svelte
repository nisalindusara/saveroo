<!--
	Frame for public pages: top bar, page content, footer, and the floating bottom bar on phones.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import BottomNav from '#lib/components/public/BottomNav.svelte';
	import Logo from '#lib/components/public/Logo.svelte';
	import TopBar from '#lib/components/public/TopBar.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<TopBar signedIn={data.user !== null} />

<div class="min-h-[70vh] pb-28 md:pb-12">
	{@render children()}
</div>

<footer class="border-t border-line pb-32 md:pb-10">
	<div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-8 text-sm text-ink-2 md:flex-row md:items-center md:justify-between">
		<div>
			<Logo />
			<p class="mt-2 max-w-sm">{t('pub.footer.tagline')}</p>
		</div>
		<nav class="flex flex-wrap gap-x-5 gap-y-2 font-medium" aria-label={t('pub.footer.label')}>
			<a href={resolve('/(site)/categories')} class="hover:text-ink">{t('pub.nav.categories')}</a>
			<a href={resolve('/(site)/search')} class="hover:text-ink">{t('pub.nav.search')}</a>
			<a href={resolve('/(site)/login')} class="hover:text-ink">{t('auth.login')}</a>
		</nav>
	</div>
	<p class="mx-auto mt-6 max-w-7xl px-4 text-xs text-ink-2">{t('pub.footer.free', { year: new Date().getFullYear() })}</p>
</footer>

<BottomNav />
