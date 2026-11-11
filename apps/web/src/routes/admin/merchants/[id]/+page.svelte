<!--
	Edit merchant page, with shortcuts to add a deal for this merchant and to its change history.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import MerchantForm from '#lib/components/admin/MerchantForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>{data.merchant.name} · {t('app.name')}</title></svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-bold">{data.merchant.name}</h1>
	<div class="flex gap-2 text-sm">
		<a class="rounded-lg bg-black px-3 py-2 font-medium text-white" href="{resolve('/admin/deals/new')}?merchantId={data.merchant.id}">{t('admin.deal.new')}</a>
		<a class="rounded-lg border px-3 py-2" href="{resolve('/admin/audit')}?entityType=merchant&entityId={data.merchant.id}">{t('admin.history')}</a>
	</div>
</div>

{#if (form?.saved || data.saved) && !form?.error}
	<p class="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800" role="status">{t('admin.saved')}</p>
{/if}

{#key data.merchant.updatedAt}
	<MerchantForm merchant={data.merchant} categories={data.categories} supabaseUrl={data.supabaseUrl} error={form?.error ?? null} />
{/key}
