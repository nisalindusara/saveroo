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
		animate = true,
		width
	}: {
		deal: PublicDealCard;
		today: number;
		supabaseUrl: string;
		index?: number;
		/** Load the image right away (first cards on screen). */
		priority?: boolean;
		/** Play the rise-in animation (off when cards are only being re-arranged). */
		animate?: boolean;
		/** Fixed width in rails (e.g. "10.5rem"); fills its column when not set. */
		width?: string;
	} = $props();

	// Rails use one 4:5 frame so cards line up; feeds use each poster's own shape.
	const RAIL_RATIO = 0.8;
	const ratio = $derived(width ? RAIL_RATIO : posterRatio(deal));
	const isToday = $derived(validOn(deal, today));
	const daysLeft = $derived(endsWithin(deal, 7));
	const colours = $derived(posterColours(deal.merchant.name));
	// Show the whole image (on a blurred copy of itself) when it does not fit the frame well.
	const fitWhole = $derived(
		deal.imageKey !== null &&
			(deal.imageRatio === null || (width !== undefined && (deal.imageRatio < 0.65 || deal.imageRatio > 1.05)))
	);
</script>

<a
	href={resolve('/(site)/deals/[slug]', { slug: deal.slug })}
	class="card press group block"
	class:rise={animate}
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
			{#if fitWhole}
				<span class="backdrop" style:background-image="url({imageUrl(supabaseUrl, deal.imageKey, 320)})" aria-hidden="true"></span>
			{/if}
			<img
				src={imageUrl(supabaseUrl, deal.imageKey, 640)}
				srcset={imageSrcset(supabaseUrl, deal.imageKey)}
				sizes={width ? '11rem' : CARD_SIZES}
				alt={deal.title}
				loading={priority ? 'eager' : 'lazy'}
				fetchpriority={priority ? 'high' : 'auto'}
				decoding="async"
				class="relative h-full w-full transition-transform duration-500 group-hover:scale-[1.03] {fitWhole ? 'object-contain' : 'object-cover'}"
			/>
		{:else}
			<div class="colour-poster flex h-full flex-col p-3 pt-9" style:background={colours.bg} style:color={colours.fg}>
				<span class="font-display leading-[0.95] font-extrabold tracking-tight" style:font-size={deal.merchant.name.length > 14 ? '1.05rem' : deal.merchant.name.length > 9 ? '1.25rem' : '1.5rem'}>{deal.merchant.name}</span>
				<span class="ring" aria-hidden="true"></span>
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

	</div>

	<!-- The Roo tag straddles the poster's bottom edge, so it covers little of the poster itself. -->
	<div class="relative z-10 -mt-[1.15rem] h-[2.3rem] pl-1">
		<RooTag {deal} />
	</div>

	<div class="px-0.5 pt-1 pb-1">
		<div class="flex items-center gap-1.5 text-[0.72rem] font-semibold text-ink-2">
			{#if deal.merchant.logoKey}
				<img src={imageUrl(supabaseUrl, deal.merchant.logoKey, 320)} alt="" width="16" height="16" loading="lazy" class="size-4 rounded-full object-cover ring-1 ring-line" />
			{/if}
			<span class="truncate">{deal.merchant.name}</span>
		</div>
		<h3 class="mt-0.5 line-clamp-2 text-[0.88rem] leading-snug font-semibold text-ink">{deal.title}</h3>
		<div class="mt-1.5 flex items-center justify-between gap-2">
			<BankChips providers={deal.providers} max={1} />
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
	.backdrop {
		position: absolute;
		inset: -10%;
		background-size: cover;
		background-position: center;
		filter: blur(18px) saturate(1.3);
		opacity: 0.8;
	}
	.colour-poster {
		position: relative;
		overflow: hidden;
	}
	.ring {
		position: absolute;
		right: -2.5rem;
		bottom: -2.5rem;
		width: 7rem;
		height: 7rem;
		border-radius: 50%;
		border: 1.1rem solid currentColor;
		opacity: 0.16;
	}
</style>
