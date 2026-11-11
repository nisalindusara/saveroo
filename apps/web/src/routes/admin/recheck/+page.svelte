<!--
	Recheck queue: confirm each deal is still running ("Still running" moves its next check 14 days on),
	or open it to pause or end it.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '@saveroo/shared/i18n';
	import DealTable from '#lib/components/admin/DealTable.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>{t('admin.nav.recheck')} · {t('app.name')}</title></svelte:head>

<h1 class="text-2xl font-bold">{t('admin.nav.recheck')}</h1>
<p class="mt-1 text-sm text-gray-600">{t('admin.recheck.intro')}</p>
{#if form?.error}<p class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{form.error.message}</p>{/if}

<div class="mt-4">
	<DealTable deals={data.deals} dateColumn="recheckDueAt">
		{#snippet extra(deal)}
			<form method="POST" action="?/checked" use:enhance>
				<input type="hidden" name="id" value={deal.id} />
				<button class="rounded-lg border px-3 py-1 text-sm">{t('admin.action.checked')}</button>
			</form>
		{/snippet}
	</DealTable>
</div>
