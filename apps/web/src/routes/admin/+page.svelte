<!--
	Admin home. In M2 it only confirms admin access; the deal posting tool is built here in M3.
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{t('admin.title')} · {t('app.name')}</title>
</svelte:head>

<main class="mx-auto max-w-md px-4 py-12">
	<h1 class="text-2xl font-bold">{t('admin.title')}</h1>
	<p class="mt-2 text-gray-600">{t('admin.welcome')}</p>
	<p class="mt-4 text-sm">{t('auth.signed_in_as', { email: data.me.email ?? '' })}</p>
</main>
