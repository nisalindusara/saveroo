<!--
	Tall "story" card (owner's reference design): a picture filling the card, a dark fade at the bottom,
	the title, and an underlined arrow line. Used on Home for story promotions, or for deals ending soon
	when there are none (the page builds the title and line).
-->
<script lang="ts">
	import { imageUrl } from '@saveroo/shared/images';
	import { posterColours } from '#lib/public/cards.js';

	let {
		href,
		title,
		line,
		imageKey,
		seed,
		supabaseUrl,
		index = 0
	}: {
		/** Resolved site path or full address. */
		href: string;
		title: string;
		line: string;
		imageKey: string | null;
		/** Picks the background colour when there is no picture. */
		seed: string;
		supabaseUrl: string;
		index?: number;
	} = $props();
	const colours = $derived(posterColours(seed));
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- callers pass resolved paths -->
<a {href}
	class="story rise group relative block h-[265px] w-[274px] shrink-0 overflow-hidden rounded-2xl"
	style:--i={Math.min(index, 10)}
	style:background={colours.bg}
>
	{#if imageKey}
		<img src={imageUrl(supabaseUrl, imageKey, 640)} alt="" loading="lazy" decoding="async" class="poster h-full w-full object-cover" />
	{/if}
	<div class="shade absolute inset-0"></div>
	<div class="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
		<h3 class="line-clamp-2 text-[18.5px] leading-[1.2] font-extrabold tracking-[-0.01em]">{title}</h3>
		<p class="mt-1.5 flex items-start gap-2 text-[13.5px] leading-[1.35]">
			<span class="mt-0.5 shrink-0 font-normal text-white/95" aria-hidden="true">→</span>
			<span class="font-bold underline decoration-white/90 underline-offset-2 transition-colors group-hover:text-[#e5c194]">{line}</span>
		</p>
	</div>
</a>

<style>
	.shade {
		background: linear-gradient(to top, rgb(0 0 0 / 0.86) 0%, rgb(0 0 0 / 0.42) 45%, transparent 75%);
	}
	.poster {
		transition: transform 300ms ease;
	}
	.story:hover .poster {
		transform: scale(1.03);
	}
</style>
