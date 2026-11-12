<!--
	Deal card for feeds and rails: the poster at its own shape (space reserved, so nothing jumps), the Roo
	tag, "Today" / "Ends in" badges, merchant, title, week strip and bank chips. The poster shares a
	view-transition name with the deal page hero, so it glides into place when opened.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import { imageSrcset, imageUrl } from '@saveroo/shared/images';
	import type { PublicDealCard } from '@saveroo/shared';
	import { CARD_SIZES, endsWithin, posterColours, posterRatio, validOn } from '#lib/public/cards.js';
	import BankChips from './BankChips.svelte';
	import Icon from './Icon.svelte';
	import RooTag from './RooTag.svelte';
	import WeekStrip from './WeekStrip.svelte';

	let {
		deal,
		today,
		supabaseUrl,
		index = 0,
		priority = false,
		width
	}: {
		deal: PublicDealCard;
		today: number;
		supabaseUrl: string;
		index?: number;
		/** Load the image right away (first cards on screen). */
		priority?: boolean;
		/** Fixed width in rails (e.g. "10.5rem"); fills its column when not set. */
		width?: string;
	} = $props();

	const ratio = $derived(posterRatio(deal));
	const isToday = $derived(validOn(deal, today));
	const daysLeft = $derived(endsWithin(deal, 7));
	const colours = $derived(posterColours(deal.merchant.name));
	const legacy = $derived(deal.imageKey !== null && deal.imageRatio === null);
</script>

<a
	href={resolve('/(site)/deals/[slug]', { slug: deal.slug })}
	class="card press group rise block"
	style:--i={Math.min(index, 10)}
	style:width
	data-sveltekit-preload-data="hover"
>
	<div
		class="poster relative overflow-hidden rounded-[1.25rem] bg-surface-2 shadow-card"
		style:aspect-ratio={ratio}
		style:view-transition-name="deal-{deal.id}"
	>
		{#if deal.imageKey}
			<img
				src={imageUrl(supabaseUrl, deal.imageKey, 640)}
				srcset={imageSrcset(supabaseUrl, deal.imageKey)}
				sizes={width ? '11rem' : CARD_SIZES}
				alt={deal.title}
				loading={priority ? 'eager' : 'lazy'}
				fetchpriority={priority ? 'high' : 'auto'}
				decoding="async"
				class="h-full w-full transition-transform duration-500 group-hover:scale-[1.03] {legacy ? 'object-contain' : 'object-cover'}"
			/>
		{:else}
			<div class="flex h-full flex-col justify-between p-3" style:background={colours.bg} style:color={colours.fg}>
				<span class="text-[0.7rem] font-bold tracking-wider uppercase opacity-90">{deal.merchant.name}</span>
				<span class="font-display text-lg leading-tight font-bold">{deal.title}</span>
			</div>
		{/if}

		<div class="pointer-events-none absolute inset-x-2 top-2 flex justify-between gap-1">
			{#if isToday}
				<span class="badge bg-leaf text-white"><span class="dot"></span>{t('pub.today')}</span>
			{:else}
				<span></span>
			{/if}
			{#if daysLeft !== null}
				<span class="badge bg-sun text-ink">
					<Icon name="flame" size={11} stroke={2.4} />
					{daysLeft === 0 ? t('pub.ends_today') : t('pub.ends_in_days', { days: daysLeft })}
				</span>
			{/if}
		</div>

		<div class="absolute bottom-2.5 left-0">
			<RooTag {deal} />
		</div>
	</div>

	<div class="px-0.5 pt-2.5 pb-1">
		<div class="flex items-center gap-1.5 text-[0.72rem] font-semibold text-ink-2">
			{#if deal.merchant.logoKey}
				<img src={imageUrl(supabaseUrl, deal.merchant.logoKey, 320)} alt="" width="16" height="16" loading="lazy" class="size-4 rounded-full object-cover ring-1 ring-line" />
			{/if}
			<span class="truncate">{deal.merchant.name}</span>
		</div>
		<h3 class="mt-0.5 line-clamp-2 text-[0.88rem] leading-snug font-semibold text-ink">{deal.title}</h3>
		<div class="mt-1.5 flex items-center justify-between gap-2">
			<BankChips providers={deal.providers} />
			<WeekStrip days={deal.validDays} {today} />
		</div>
	</div>
</a>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.15rem 0.45rem;
		border-radius: 999px;
		font-size: 0.66rem;
		font-weight: 800;
		letter-spacing: 0.02em;
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.18);
	}
	.dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 50%;
		background: currentColor;
		animation: pulse 1.8s ease-in-out infinite;
	}
	@keyframes pulse {
		50% {
			opacity: 0.35;
		}
	}
	.card:hover .poster {
		box-shadow: 0 2px 4px rgb(26 20 16 / 0.08), 0 18px 40px -12px rgb(26 20 16 / 0.35);
	}
	.poster {
		transition: box-shadow 400ms var(--ease-out-expo);
	}
</style>
