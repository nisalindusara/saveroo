<!--
	Admin dashboard: live, draft, expiring-soon and needs-recheck counts, with the matching deal lists.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import DealTable from '#lib/components/admin/DealTable.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const d = $derived(data.dashboard);
	const cards = $derived([
		{ label: t('admin.dashboard.live'), value: d.counts.live },
		{ label: t('admin.dashboard.drafts'), value: d.counts.drafts },
		{ label: t('admin.dashboard.expiring'), value: d.counts.expiringSoon },
		{ label: t('admin.dashboard.recheck'), value: d.counts.needsRecheck }
	]);
</script>

<svelte:head><title>{t('admin.title')} · {t('app.name')}</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-bold">{t('admin.nav.dashboard')}</h1>
	<div class="flex gap-2 text-sm">
		<a class="rounded-lg bg-black px-3 py-2 font-medium text-white" href={resolve('/admin/deals/new')}>{t('admin.deal.new')}</a>
		<a class="rounded-lg border px-3 py-2" href={resolve('/admin/merchants/new')}>{t('admin.merchant.new')}</a>
	</div>
</div>

<div class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
	{#each cards as card (card.label)}
		<div class="rounded-lg border p-4">
			<div class="text-2xl font-bold">{card.value}</div>
			<div class="text-sm text-gray-600">{card.label}</div>
		</div>
	{/each}
</div>

<section class="mt-8">
	<h2 class="text-lg font-semibold">{t('admin.dashboard.recheck')}</h2>
	<DealTable deals={d.needsRecheck} dateColumn="recheckDueAt" />
</section>
<section class="mt-8">
	<h2 class="text-lg font-semibold">{t('admin.dashboard.expiring')}</h2>
	<DealTable deals={d.expiringSoon} />
</section>
<section class="mt-8">
	<h2 class="text-lg font-semibold">{t('admin.dashboard.drafts')}</h2>
	<DealTable deals={d.drafts} dateColumn="updatedAt" />
</section>
