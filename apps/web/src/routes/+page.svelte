<!--
	Home page. In M0 it is a hello page that shows whether the API and database are reachable.
	Replaced by the real feed in M5.
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{t('app.name')}</title>
</svelte:head>

<main class="mx-auto max-w-md px-4 py-12">
	<h1 class="text-3xl font-bold">{t('app.name')}</h1>
	<p class="mt-2 text-gray-600">{t('app.tagline')}</p>

	<dl class="mt-8 space-y-2 text-sm">
		{#if data.health}
			<div class="flex justify-between">
				<dt>{t('health.api')}</dt>
				<dd>{t('health.ok')}</dd>
			</div>
			<div class="flex justify-between">
				<dt>{t('health.database')}</dt>
				<dd>{t(`health.${data.health.database}`)}</dd>
			</div>
		{:else}
			<p>{t('health.api_down')}</p>
		{/if}
	</dl>
</main>
