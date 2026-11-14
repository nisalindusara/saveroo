<!--
	Tall "story" card (owner's reference design): the deal poster filling the card, a dark fade at the
	bottom, the title, and an underlined arrow line with the urgency and saving. Used for Home's
	"Ending soon" row.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { cardValue } from '@saveroo/shared/deal-text';
	import { t } from '@saveroo/shared/i18n';
	import { imageUrl } from '@saveroo/shared/images';
	import type { PublicDealCard } from '@saveroo/shared';
	import { endsWithin, posterColours } from '#lib/public/cards.js';

	let { deal, supabaseUrl, index = 0 }: { deal: PublicDealCard; supabaseUrl: string; index?: number } = $props();
	const days = $derived(endsWithin(deal, 7));
	const colours = $derived(posterColours(deal.merchant.name));
	const urgency = $derived(
		days === 0 ? t('pub.card.last_day') : days === 1 ? t('pub.card.ends_tomorrow') : days !== null ? t('pub.card.ends_in', { days }) : ''
	);
</script>

<a
	href={resolve('/(site)/deals/[slug]', { slug: deal.slug })}
	class="story rise group relative block h-[16.5rem] w-[17rem] overflow-hidden rounded-2xl"
	style:--i={Math.min(index, 10)}
	style:background={colours.bg}
>
	{#if deal.imageKey}
		<img src={imageUrl(supabaseUrl, deal.imageKey, 640)} alt="" loading="lazy" decoding="async" class="poster h-full w-full object-cover" />
	{/if}
	<div class="shade absolute inset-0"></div>
	<div class="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
		<p class="text-[0.75rem] font-semibold text-white/80">{deal.merchant.name}</p>
		<h3 class="line-clamp-2 text-[1.15rem] leading-[1.2] font-extrabold tracking-[-0.01em]">{deal.title}</h3>
		<p class="mt-1.5 flex items-start gap-2 text-[0.84rem] leading-[1.35]">
			<span aria-hidden="true">→</span>
			<span class="font-bold underline decoration-white/90 underline-offset-2 transition-colors group-hover:text-[#e5c194]">
				{[urgency, cardValue(deal).main].filter(Boolean).join(' · ')}
			</span>
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
