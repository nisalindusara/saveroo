<!--
	New deal: first choose the merchant, then fill in the deal form.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import DealForm from '#lib/components/admin/DealForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>{t('admin.deal.new')} · {t('app.name')}</title></svelte:head>

<h1 class="mb-6 text-2xl font-bold">{t('admin.deal.new')}</h1>

{#if data.step === 'merchant'}
	<p class="mb-3 text-sm text-gray-600">{t('admin.deal.pick_merchant')}</p>
	{#if data.merchants.length === 0}
		<p class="text-sm">
			{t('admin.deal.no_merchants')}
			<a class="underline" href={resolve('/admin/merchants/new')}>{t('admin.merchant.new')}</a>
		</p>
	{:else}
		<ul class="divide-y rounded-lg border">
			{#each data.merchants as m (m.id)}
				<li><a class="block px-4 py-2 hover:bg-gray-50" href="{resolve('/admin/deals/new')}?merchantId={m.id}">{m.name}</a></li>
			{/each}
		</ul>
	{/if}
{:else}
	<DealForm deal={null} merchant={data.merchant} reference={data.reference} supabaseUrl={data.supabaseUrl} error={form?.error ?? null} />
{/if}
