<!--
	CSV import page: explains the columns, takes a file, and shows what was imported or each row's problem.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let busy = $state(false);

	const example =
		'merchant_slug,title,deal_type,discount_percent,max_saving_lkr,days,providers,card_type,starts,ends,coupon_code\n' +
		'scope-cinemas,50% off tickets,percent_off,50,1500,tue,hnb|sampath-bank,credit,2026-11-12,2026-12-31,MOVIE50';
	const exampleHref = `data:text/csv;charset=utf-8,${encodeURIComponent(example)}`;
</script>

<svelte:head><title>{t('admin.nav.import')} · {t('app.name')}</title></svelte:head>

<h1 class="text-2xl font-bold">{t('admin.nav.import')}</h1>
<div class="mt-2 space-y-2 text-sm text-gray-700">
	<p>{t('admin.import.intro')}</p>
	<p>{t('admin.import.columns')}</p>
	<p>{t('admin.import.formats')}</p>
	<a class="underline" href={exampleHref} download="saveroo-deals-example.csv">{t('admin.import.example')}</a>
</div>

<form
	method="POST"
	enctype="multipart/form-data"
	class="mt-6 flex flex-wrap items-center gap-3"
	use:enhance={() => {
		busy = true;
		return async ({ update }) => {
			await update();
			busy = false;
		};
	}}
>
	<input type="file" name="file" accept=".csv,text/csv" required class="text-sm" />
	<button class="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white" disabled={busy}>
		{busy ? t('admin.import.working') : t('admin.import.submit')}
	</button>
</form>

{#if form?.message}<p class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{form.message}</p>{/if}
{#if form?.result}
	{#if 'errors' in form.result}
		<div class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
			<p class="font-medium">{t('admin.import.failed')}</p>
			<ul class="mt-2 list-disc pl-5">
				{#each form.result.errors as e, i (i)}<li>{t('admin.import.row', { row: e.row })}: {e.message}</li>{/each}
			</ul>
		</div>
	{:else}
		<p class="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800" role="status">
			{t('admin.import.done', { count: form.result.imported })}
			<a class="underline" href="{resolve('/admin/deals')}?status=draft">{t('admin.import.see_drafts')}</a>
		</p>
	{/if}
{/if}
