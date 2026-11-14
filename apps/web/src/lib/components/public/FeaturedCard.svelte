<!--
	White card inside Home's grey "Featured deals" panel (owner's reference design): image with a label
	pill (bottom left) and the shop's logo box (bottom right), then shop and title.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { imageUrl } from '@saveroo/shared/images';
	import type { PublicDealCard } from '@saveroo/shared';
	import { posterColours } from '#lib/public/cards.js';

	let { deal, label, supabaseUrl }: { deal: PublicDealCard; label: string; supabaseUrl: string } = $props();
	const colours = $derived(posterColours(deal.merchant.name));
</script>

<a href={resolve('/(site)/deals/[slug]', { slug: deal.slug })} class="card group flex w-[17.4rem] flex-col rounded-xl bg-surface px-2.5 pt-2.5 pb-5">
	<div class="relative h-[9.9rem] overflow-hidden rounded-lg" style:background={colours.bg}>
		{#if deal.imageKey}
			<img src={imageUrl(supabaseUrl, deal.imageKey, 640)} alt="" loading="lazy" decoding="async" class="poster h-full w-full object-cover" />
		{/if}
		<span class="absolute bottom-2.5 left-2.5 rounded-md bg-white px-2 py-[3px] text-[0.72rem] font-bold text-[#1a1f26]">{label}</span>
		<span class="absolute right-2.5 bottom-2.5 grid size-12 place-items-center overflow-hidden rounded-lg bg-white shadow-[0_2px_6px_rgb(0_0_0/0.12)]">
			{#if deal.merchant.logoKey}
				<img src={imageUrl(supabaseUrl, deal.merchant.logoKey, 320)} alt="" loading="lazy" class="h-full w-full object-contain p-1" />
			{:else}
				<span class="text-lg font-black" style:color={colours.bg}>{deal.merchant.name[0]}</span>
			{/if}
		</span>
	</div>
	<div class="px-1 pt-2.5">
		<p class="mb-1 truncate text-[0.8rem] text-ink-2">{deal.merchant.name}</p>
		<h3 class="line-clamp-2 text-[0.94rem] leading-[1.35] font-bold transition-colors group-hover:text-roo-ink">{deal.title}</h3>
	</div>
</a>

<style>
	.card {
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.04);
		transition: transform 180ms ease;
	}
	.card:hover {
		transform: translateY(-2px);
	}
	.poster {
		transition: transform 300ms ease;
	}
	.card:hover .poster {
		transform: scale(1.03);
	}
</style>
