<!--
	Table of deals for the admin area (dashboard, deal list, recheck list). Each title opens the deal.
	`extra` adds an action cell per row (e.g. "Mark checked").
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import { formatColombo } from '@saveroo/shared/time';
	import type { AdminDealListItem } from '@saveroo/shared';
	import StatusBadge from './StatusBadge.svelte';

	let {
		deals,
		dateColumn = 'endsAt',
		extra
	}: {
		deals: AdminDealListItem[];
		dateColumn?: 'endsAt' | 'recheckDueAt' | 'updatedAt';
		extra?: Snippet<[AdminDealListItem]>;
	} = $props();

	const dateLabel = {
		endsAt: t('admin.deal.ends'),
		recheckDueAt: t('admin.deal.recheck_due'),
		updatedAt: t('admin.deal.updated')
	};
</script>

{#if deals.length === 0}
	<p class="py-4 text-sm text-gray-500">{t('admin.empty')}</p>
{:else}
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead class="border-b text-xs text-gray-500 uppercase">
				<tr>
					<th class="py-2 pr-3">{t('admin.deal.title')}</th>
					<th class="py-2 pr-3">{t('admin.deal.merchant')}</th>
					<th class="py-2 pr-3">{t('admin.deal.status')}</th>
					<th class="py-2 pr-3">{dateLabel[dateColumn]}</th>
					{#if extra}<th class="py-2"></th>{/if}
				</tr>
			</thead>
			<tbody>
				{#each deals as deal (deal.id)}
					<tr class="border-b last:border-0">
						<td class="py-2 pr-3">
							<a class="font-medium underline" href={resolve('/admin/deals/[id]', { id: deal.id })}>{deal.title}</a>
						</td>
						<td class="py-2 pr-3 text-gray-600">{deal.merchantName}</td>
						<td class="py-2 pr-3"><StatusBadge status={deal.status} /></td>
						<td class="py-2 pr-3 whitespace-nowrap text-gray-600">
							{deal[dateColumn] ? formatColombo(deal[dateColumn]!) : '–'}
						</td>
						{#if extra}<td class="py-2 text-right">{@render extra(deal)}</td>{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
