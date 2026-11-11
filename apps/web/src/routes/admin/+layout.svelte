<!--
	Admin area shell: side menu (top menu on phones) around every /admin page.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '@saveroo/shared/i18n';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const links = [
		{ href: resolve('/admin'), label: t('admin.nav.dashboard'), exact: true },
		{ href: resolve('/admin/deals'), label: t('admin.nav.deals') },
		{ href: resolve('/admin/merchants'), label: t('admin.nav.merchants') },
		{ href: resolve('/admin/recheck'), label: t('admin.nav.recheck') },
		{ href: resolve('/admin/import'), label: t('admin.nav.import') },
		{ href: resolve('/admin/audit'), label: t('admin.nav.audit') }
	];
	const active = (href: string, exact?: boolean) =>
		exact ? page.url.pathname === href : page.url.pathname.startsWith(href);
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 md:flex-row">
	<nav class="flex gap-1 overflow-x-auto md:w-44 md:shrink-0 md:flex-col" aria-label={t('admin.title')}>
		{#each links as link (link.href)}
			<a
				href={link.href}
				class="rounded-lg px-3 py-2 text-sm whitespace-nowrap {active(link.href, link.exact)
					? 'bg-black font-medium text-white'
					: 'hover:bg-gray-100'}"
			>
				{link.label}
			</a>
		{/each}
	</nav>
	<main class="min-w-0 flex-1">
		{@render children()}
	</main>
</div>
