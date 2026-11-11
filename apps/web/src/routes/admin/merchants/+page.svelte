<!--
	Admin merchant list: search by name, open a merchant, or add a new one.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{t('admin.nav.merchants')} · {t('app.name')}</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-bold">{t('admin.nav.merchants')}</h1>
	<a class="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white" href={resolve('/admin/merchants/new')}>{t('admin.merchant.new')}</a>
</div>

<form method="GET" class="mt-4 flex gap-2">
	<input name="q" value={data.q} placeholder={t('admin.search')} class="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2" />
	<button class="rounded-lg border px-3 py-2 text-sm">{t('admin.search')}</button>
</form>

{#if data.merchants.length === 0}
	<p class="mt-6 text-sm text-gray-500">{t('admin.empty')}</p>
{:else}
	<table class="mt-4 w-full text-left text-sm">
		<thead class="border-b text-xs text-gray-500 uppercase">
			<tr>
				<th class="py-2 pr-3">{t('admin.merchant.name')}</th>
				<th class="py-2 pr-3">{t('admin.merchant.branches')}</th>
				<th class="py-2 pr-3">{t('admin.merchant.live_deals')}</th>
				<th class="py-2">{t('admin.merchant.status')}</th>
			</tr>
		</thead>
		<tbody>
			{#each data.merchants as m (m.id)}
				<tr class="border-b last:border-0">
					<td class="py-2 pr-3"><a class="font-medium underline" href={resolve('/admin/merchants/[id]', { id: m.id })}>{m.name}</a></td>
					<td class="py-2 pr-3">{m.branchCount}</td>
					<td class="py-2 pr-3">{m.liveDealCount}</td>
					<td class="py-2">{m.status === 'active' ? t('admin.merchant.active') : t('admin.merchant.hidden')}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
