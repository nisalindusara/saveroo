<!--
	CSV import page: explains the columns, lists the codes to use (merchants, banks, categories), offers an
	example file built from real merchants and banks, and shows what was imported or each row's problem.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let busy = $state(false);

	/** Builds the example file from real merchant and bank codes and downloads it. */
	function downloadExample() {
		const merchant = data.merchants[0]?.slug ?? 'your-merchant-slug';
		const banks = data.providers.slice(0, 2).map((p) => p.slug).join('|');
		const example =
			'merchant_slug,title,deal_type,discount_percent,max_saving_lkr,days,providers,card_type,starts,ends,coupon_code\n' +
			`${merchant},20% off on Tuesdays,percent_off,20,1500,tue,${banks},credit,2026-12-01,31/12/2026,SAVE20\n` +
			`${merchant},Free gift with every purchase,freebie,,,sat|sun,,,,,\n`;
		const link = document.createElement('a');
		link.href = URL.createObjectURL(new Blob([example], { type: 'text/csv' }));
		link.download = 'saveroo-deals-example.csv';
		link.click();
		URL.revokeObjectURL(link.href);
	}
</script>

<svelte:head><title>{t('admin.nav.import')} · {t('app.name')}</title></svelte:head>

<h1 class="text-2xl font-bold">{t('admin.nav.import')}</h1>
<div class="mt-2 space-y-2 text-sm text-gray-700">
	<p>{t('admin.import.intro')}</p>
	<p>{t('admin.import.columns')}</p>
	<p>{t('admin.import.formats')}</p>
	<button type="button" class="underline" onclick={downloadExample}>{t('admin.import.example')}</button>
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

<h2 class="mt-10 text-lg font-semibold">{t('admin.import.codes')}</h2>
<p class="text-sm text-gray-600">{t('admin.import.codes_hint')}</p>
<div class="mt-3 grid gap-6 text-sm md:grid-cols-3">
	{#each [{ title: t('admin.import.codes_merchants'), rows: data.merchants }, { title: t('admin.import.codes_providers'), rows: data.providers }, { title: t('admin.import.codes_categories'), rows: data.categories }] as group (group.title)}
		<div>
			<h3 class="font-medium">{group.title}</h3>
			<ul class="mt-1 space-y-0.5">
				{#each group.rows as row (row.slug)}<li><code class="rounded bg-gray-100 px-1">{row.slug}</code> {row.name}</li>{/each}
			</ul>
		</div>
	{/each}
</div>
