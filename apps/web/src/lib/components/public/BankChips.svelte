<!--
	Short bank and telco labels ("HNB", "ComBank") for the cards a deal needs; "+2" when there are more.
	Empty list means the deal is open to everyone.
-->
<script lang="ts">
	import { providerShortName } from '@saveroo/shared/providers';
	import { t } from '@saveroo/shared/i18n';

	let { providers, max = 2 }: { providers: { slug: string; name: string }[]; max?: number } = $props();
	const shown = $derived(providers.slice(0, max));
	const more = $derived(providers.length - shown.length);
</script>

<span class="flex min-w-0 items-center gap-1 overflow-hidden">
	{#if providers.length === 0}
		<span class="chip open">{t('pub.any_card')}</span>
	{:else}
		{#each shown as p (p.slug)}<span class="chip" title={p.name}>{providerShortName(p)}</span>{/each}
		{#if more > 0}<span class="chip">+{more}</span>{/if}
	{/if}
</span>

<style>
	.chip {
		display: inline-block;
		flex: none;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 0.1rem 0.4rem;
		border-radius: 0.4rem;
		background: var(--surface-2);
		color: var(--ink);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.01em;
	}
	.open {
		background: var(--leaf-soft);
		color: var(--leaf);
	}
</style>
