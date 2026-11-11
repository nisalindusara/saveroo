<!--
	Admin deal list with status filter, title search and paging.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '@saveroo/shared/i18n';
	import DealTable from '#lib/components/admin/DealTable.svelte';
	import { withParam } from '#lib/url.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const STATUSES = ['draft', 'live', 'paused', 'expired', 'pending', 'rejected'] as const;

	const olderSearch = $derived(withParam(page.url.search, 'cursor', data.nextCursor ?? ''));
</script>

<svelte:head><title>{t('admin.nav.deals')} · {t('app.name')}</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-bold">{t('admin.nav.deals')}</h1>
	<a class="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white" href={resolve('/admin/deals/new')}>{t('admin.deal.new')}</a>
</div>

<form method="GET" class="mt-4 flex flex-wrap gap-2">
	<input name="q" value={data.q} placeholder={t('admin.search')} class="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2" />
	<select name="status" value={data.status} class="rounded-lg border border-gray-300 px-3 py-2" aria-label={t('admin.deal.status')}>
		<option value="">{t('admin.all_statuses')}</option>
		{#each STATUSES as s (s)}<option value={s}>{t(`admin.status.${s}`)}</option>{/each}
	</select>
	<button class="rounded-lg border px-3 py-2 text-sm">{t('admin.search')}</button>
</form>

<div class="mt-4">
	<DealTable deals={data.deals} dateColumn="updatedAt" />
</div>

{#if data.nextCursor}
	<a class="mt-4 inline-block text-sm underline" href="{resolve('/admin/deals')}{olderSearch}">{t('admin.older')}</a>
{/if}
