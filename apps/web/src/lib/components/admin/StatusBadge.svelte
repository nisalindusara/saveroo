<!--
	Coloured label for a deal status (draft, live, paused, expired...). Used in admin tables and the deal page.
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import type { AdminDealListItem } from '@saveroo/shared';

	let { status }: { status: AdminDealListItem['status'] } = $props();

	const colours: Record<string, string> = {
		live: 'bg-green-100 text-green-800',
		draft: 'bg-gray-100 text-gray-700',
		pending: 'bg-blue-100 text-blue-800',
		paused: 'bg-amber-100 text-amber-800',
		expired: 'bg-red-100 text-red-800',
		rejected: 'bg-red-100 text-red-800'
	};
</script>

<span class="rounded-full px-2 py-0.5 text-xs font-medium {colours[status]}">{t(`admin.status.${status}`)}</span>
