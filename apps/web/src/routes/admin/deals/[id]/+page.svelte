<!--
	Deal page for admins: status and actions at the top (publish, pause, resume, end, mark checked,
	preview, history), duplicate warning, then the edit form.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import { formatColombo } from '@saveroo/shared/time';
	import DealForm from '#lib/components/admin/DealForm.svelte';
	import StatusBadge from '#lib/components/admin/StatusBadge.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const deal = $derived(data.deal);
	const button = 'rounded-lg border px-3 py-2 text-sm';
	const notice = $derived(
		form?.error
			? null
			: form?.statusChanged
				? t(`admin.status_changed.${form.statusChanged}`)
				: form?.checked
					? t('admin.deal.checked_done')
					: form?.saved || data.saved
						? t('admin.saved')
						: null
	);
</script>

<svelte:head><title>{deal.title} · {t('app.name')}</title></svelte:head>

<div class="flex flex-wrap items-start justify-between gap-3">
	<div>
		<h1 class="text-2xl font-bold">{deal.title}</h1>
		<p class="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
			<StatusBadge status={deal.status} />
			<a class="underline" href={resolve('/admin/merchants/[id]', { id: deal.merchantId })}>{deal.merchantName}</a>
			{#if deal.recheckDueAt}<span>· {t('admin.deal.recheck_due')}: {formatColombo(deal.recheckDueAt)}</span>{/if}
		</p>
	</div>
	<div class="flex flex-wrap gap-2">
		<form method="POST" action="?/status" use:enhance class="flex flex-wrap gap-2">
			{#if ['draft', 'pending', 'paused'].includes(deal.status)}
				<button name="status" value="live" class="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white">
					{deal.status === 'paused' ? t('admin.action.resume') : t('admin.action.publish')}
				</button>
			{/if}
			{#if deal.status === 'live'}
				<button name="status" value="paused" class={button}>{t('admin.action.pause')}</button>
			{/if}
			{#if ['live', 'paused'].includes(deal.status)}
				<button name="status" value="expired" class={button}>{t('admin.action.end')}</button>
			{/if}
		</form>
		{#if deal.status === 'live'}
			<form method="POST" action="?/checked" use:enhance>
				<button class={button}>{t('admin.action.checked')}</button>
			</form>
		{/if}
		<a class={button} href={resolve('/admin/deals/[id]/preview', { id: deal.id })}>{t('admin.action.preview')}</a>
		<a class={button} href="{resolve('/admin/audit')}?entityType=deal&entityId={deal.id}">{t('admin.history')}</a>
	</div>
</div>

{#if notice}
	<p class="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800" role="status">{notice}</p>
{/if}
{#if form?.error && !('fields' in form.error && form.error.fields)}
	<p class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{form.error.message}</p>
{/if}

{#if data.duplicates.length}
	<div class="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900" role="status">
		<p class="font-medium">{t('admin.deal.duplicates')}</p>
		<ul class="mt-1 list-disc pl-5">
			{#each data.duplicates as dup (dup.id)}
				<li><a class="underline" href={resolve('/admin/deals/[id]', { id: dup.id })}>{dup.title}</a> ({t(`admin.status.${dup.status as 'live'}`)})</li>
			{/each}
		</ul>
	</div>
{/if}

<div class="mt-8">
	{#key deal.updatedAt}
		<DealForm {deal} merchant={data.merchant} reference={data.reference} supabaseUrl={data.supabaseUrl} error={form?.error ?? null} />
	{/key}
</div>
