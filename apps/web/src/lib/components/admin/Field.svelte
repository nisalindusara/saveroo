<!--
	Label + input slot + error message, for admin forms. `error` comes from the API's per-field messages.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, error, hint, children }: { label: string; error?: string; hint?: string; children: Snippet } = $props();
</script>

<label class="block">
	<span class="block text-sm font-medium">{label}</span>
	<span class="mt-1 block">{@render children()}</span>
	{#if hint && !error}<span class="mt-1 block text-xs text-gray-500">{hint}</span>{/if}
	{#if error}<span class="mt-1 block text-sm text-red-700">{error}</span>{/if}
</label>
