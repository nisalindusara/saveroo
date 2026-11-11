<!--
	Audit log list: when, who, what changed. Each entry can be expanded to show the full before/after.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '@saveroo/shared/i18n';
	import { formatColombo } from '@saveroo/shared/time';
	import { withParam } from '#lib/url.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const olderSearch = $derived(withParam(page.url.search, 'before', data.nextCursor ?? ''));
	const entityHref = (type: string, id: string) =>
		type === 'deal' ? resolve('/admin/deals/[id]', { id }) : type === 'merchant' ? resolve('/admin/merchants/[id]', { id }) : null;
</script>

<svelte:head><title>{t('admin.nav.audit')} · {t('app.name')}</title></svelte:head>

<h1 class="text-2xl font-bold">{t('admin.nav.audit')}</h1>
{#if data.filtered}<a class="mt-1 inline-block text-sm underline" href={resolve('/admin/audit')}>{t('admin.audit.show_all')}</a>{/if}

{#if data.entries.length === 0}
	<p class="mt-6 text-sm text-gray-500">{t('admin.empty')}</p>
{:else}
	<ul class="mt-4 divide-y rounded-lg border">
		{#each data.entries as e (e.id)}
			{@const href = e.entityId ? entityHref(e.entityType, e.entityId) : null}
			<li class="p-3 text-sm">
				<div class="flex flex-wrap gap-x-3">
					<span class="text-gray-500">{formatColombo(e.createdAt)}</span>
					<span class="font-medium">{e.actorName ?? t('admin.audit.system')}</span>
					<span>{t(`admin.audit.action.${e.action as 'create'}`)} {t(`admin.audit.entity.${e.entityType as 'deal'}`)}</span>
					{#if href}<a class="underline" {href}>{t('admin.audit.open')}</a>{/if}
				</div>
				<details class="mt-1">
					<summary class="cursor-pointer text-xs text-gray-500">{t('admin.audit.details')}</summary>
					<pre class="mt-1 max-h-80 overflow-auto rounded bg-gray-50 p-2 text-xs">{JSON.stringify(e.diff, null, 2)}</pre>
				</details>
			</li>
		{/each}
	</ul>
	{#if data.nextCursor}<a class="mt-4 inline-block text-sm underline" href="{resolve('/admin/audit')}{olderSearch}">{t('admin.older')}</a>{/if}
{/if}
