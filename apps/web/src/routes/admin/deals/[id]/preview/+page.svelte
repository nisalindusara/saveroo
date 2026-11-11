<!--
	Admin preview of a deal, laid out like a phone screen. The public deal page (M5) will follow this.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { daysText, savingText } from '@saveroo/shared';
	import { t } from '@saveroo/shared/i18n';
	import { imageUrl } from '@saveroo/shared/images';
	import { formatColombo } from '@saveroo/shared/time';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const deal = $derived(data.deal);
</script>

<svelte:head><title>{t('admin.action.preview')} · {deal.title}</title></svelte:head>

<div class="mb-4 flex items-center justify-between">
	<a class="text-sm underline" href={resolve('/admin/deals/[id]', { id: deal.id })}>← {t('admin.preview.back')}</a>
	<span class="text-sm text-gray-500">{t('admin.preview.note')}</span>
</div>

<article class="mx-auto max-w-sm overflow-hidden rounded-2xl border shadow-sm">
	{#if deal.imageKey}
		<img src={imageUrl(data.supabaseUrl, deal.imageKey, 640)} alt="" class="aspect-video w-full object-cover" />
	{/if}
	<div class="space-y-3 p-4">
		<p class="text-sm text-gray-600">{data.merchant.name}</p>
		<h1 class="text-xl font-bold">{deal.title}</h1>
		<p class="text-lg font-semibold text-green-700">{savingText(deal)}</p>

		<dl class="space-y-2 text-sm">
			{#each deal.schedules as s, i (i)}
				<div>
					<dt class="inline font-medium">{t('deal.valid')}:</dt>
					<dd class="inline">
						{daysText(s.daysOfWeek)}{s.startTime ? `, ${s.startTime}–${s.endTime ?? ''}` : ''}
					</dd>
				</div>
			{:else}
				<div><dt class="inline font-medium">{t('deal.valid')}:</dt> <dd class="inline">{t('deal.every_day')}</dd></div>
			{/each}
			{#if deal.endsAt}
				<div><dt class="inline font-medium">{t('deal.ends')}:</dt> <dd class="inline">{formatColombo(deal.endsAt)}</dd></div>
			{/if}
			<div>
				<dt class="font-medium">{t('deal.cards')}:</dt>
				<dd>
					{#if data.cards.length === 0}
						{t('deal.open_to_all')}
					{:else}
						<ul class="list-disc pl-5">
							{#each data.cards as c, i (i)}
								<li>{c.provider} – {c.card ?? (c.cardType ? t(`admin.card_type.${c.cardType}`) : t('admin.eligibility.any_card'))}{c.note ? ` (${c.note})` : ''}</li>
							{/each}
						</ul>
					{/if}
				</dd>
			</div>
			{#if data.branches.length}
				<div><dt class="inline font-medium">{t('deal.where')}:</dt> <dd class="inline">{data.branches.join(', ')}</dd></div>
			{/if}
		</dl>

		{#each deal.coupons as c (c.code)}
			<p class="rounded-lg border-2 border-dashed p-3 text-center font-mono text-lg">{c.code}</p>
		{/each}
		{#if deal.howToRedeem}<p class="text-sm"><strong>{t('admin.deal.how_to_redeem')}:</strong> {deal.howToRedeem}</p>{/if}
		{#if deal.terms}<p class="text-xs whitespace-pre-line text-gray-600">{deal.terms}</p>{/if}
	</div>
</article>
