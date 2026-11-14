<!--
	"Shops with offers" on Home (owner's reference design): a sideways row of round shop badges that
	alternates one large circle with a 2x2 block of small ones. Shows the shop's logo, or its name on
	its colour when there is no logo; each links to the shop's page.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { imageUrl } from '@saveroo/shared/images';
	import { posterColours } from '#lib/public/cards.js';

	type Shop = { slug: string; name: string; logoKey: string | null };
	let { shops, supabaseUrl }: { shops: Shop[]; supabaseUrl: string } = $props();

	// Groups: one large shop, then up to four small ones, repeating.
	const groups = $derived.by(() => {
		const out: { big: Shop | null; small: Shop[] }[] = [];
		let i = 0;
		while (i < shops.length) {
			out.push({ big: shops[i] ?? null, small: shops.slice(i + 1, i + 5) });
			i += 5;
		}
		return out;
	});
</script>

{#snippet circle(shop: Shop, big: boolean)}
	{@const c = posterColours(shop.name)}
	<a
		href={resolve('/(site)/merchants/[slug]', { slug: shop.slug })}
		title={shop.name}
		class="bubble flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-full text-center {big ? 'big' : 'small'}"
		style:background={shop.logoKey ? '#fff' : c.bg}
		style:color={c.fg}
	>
		{#if shop.logoKey}
			<img src={imageUrl(supabaseUrl, shop.logoKey, 320)} alt={shop.name} loading="lazy" class="h-full w-full object-contain p-[14%]" />
		{:else}
			<span class="name font-black uppercase">{shop.name}</span>
		{/if}
	</a>
{/snippet}

<div class="rail items-center !gap-1 py-0.5">
	{#each groups as g, i (i)}
		{#if g.big}{@render circle(g.big, true)}{/if}
		{#if g.small.length}
			<div class="grid shrink-0 grid-cols-2 gap-1">
				{#each g.small as s (s.slug)}{@render circle(s, false)}{/each}
			</div>
		{/if}
	{/each}
</div>

<style>
	.bubble {
		border: 2px solid #fff;
		transition:
			border-color 150ms,
			transform 200ms;
	}
	.bubble:hover {
		border-color: var(--roo);
		transform: scale(1.03);
	}
	.big {
		width: 8.75rem;
		height: 8.75rem;
		padding: 0.75rem;
	}
	.small {
		width: 4.25rem;
		height: 4.25rem;
		padding: 0.35rem;
	}
	.name {
		line-height: 1.05;
		letter-spacing: 0.04em;
		overflow-wrap: anywhere;
	}
	.big .name {
		font-size: 0.95rem;
	}
	.small .name {
		font-size: 0.56rem;
	}
</style>
