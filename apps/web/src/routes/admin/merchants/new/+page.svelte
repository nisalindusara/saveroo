<!--
	New merchant page.
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import MerchantForm from '#lib/components/admin/MerchantForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>{t('admin.merchant.new')} · {t('app.name')}</title></svelte:head>

<h1 class="mb-6 text-2xl font-bold">{t('admin.merchant.new')}</h1>
<MerchantForm merchant={null} categories={data.categories} supabaseUrl={data.supabaseUrl} error={form?.error ?? null} />
