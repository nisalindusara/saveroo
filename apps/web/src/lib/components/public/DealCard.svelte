<!--
	Deal card for grids and rows (owner's reference design): the image in a 16:10 frame (posters that do
	not fit are shown whole on a blurred copy, never cropped) with one white badge; shop; bold title;
	where it works with the week strip; which cards; the tan value line (crossed-out price and a % pill
	when there is one); and a purple "Use code" line when the deal has a coupon. The image shares a
	view-transition name with the deal page poster, so it glides into place when opened.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { cardValue } from '@saveroo/shared/deal-text';
	import { t } from '@saveroo/shared/i18n';
	import { imageSrcset, imageUrl } from '@saveroo/shared/images';
	import { providerShortName } from '@saveroo/shared/providers';
	import type { PublicDealCard } from '@saveroo/shared';
	import { CARD_FRAME, CARD_SIZES, cardBadge, fillsFrame, posterColours } from '#lib/public/cards.js';
	import Icon from './Icon.svelte';
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
		/** Fixed width in rows (e.g. "17rem"); fills its grid cell when not set. */
		width?: string;
	} = $props();

	const value = $derived(cardValue(deal));
	const badge = $derived(cardBadge(deal, today));
	const fill = $derived(fillsFrame(deal));
	const colours = $derived(posterColours(deal.merchant.name));
	const banks = $derived(deal.providers.slice(0, 2).map(providerShortName).join(', ') + (deal.providers.length > 2 ? ` +${deal.providers.length - 2}` : ''));
</script>

<a
	href={resolve('/(site)/deals/[slug]', { slug: deal.slug })}
	class="card rise group flex flex-col"
	style:--i={Math.min(index, 10)}
	style:width
	data-sveltekit-preload-data="hover"
>
	<div class="frame relative mb-3 overflow-hidden rounded-xl border border-line bg-surface-2" style:aspect-ratio={CARD_FRAME} style:view-transition-name="deal-{deal.id}">
		{#if deal.imageKey}
			{#if !fill}
				<img src={imageUrl(supabaseUrl, deal.imageKey, 320)} alt="" aria-hidden="true" loading={priority ? 'eager' : 'lazy'} decoding="async" class="backdrop" />
			{/if}
			<img
				src={imageUrl(supabaseUrl, deal.imageKey, 640)}
				srcset={imageSrcset(supabaseUrl, deal.imageKey)}
				sizes={width ?? CARD_SIZES}
				alt={deal.title}
				loading={priority ? 'eager' : 'lazy'}
				fetchpriority={priority ? 'high' : 'auto'}
				decoding="async"
				class="poster relative h-full w-full {fill ? 'object-cover' : 'object-contain'}"
			/>
		{:else}
			<div class="flex h-full flex-col justify-end gap-1 p-4" style:background={colours.bg} style:color={colours.fg}>
				<span class="text-[0.7rem] font-bold tracking-[0.14em] uppercase">{deal.merchant.name}</span>
				<span class="text-[1.7rem] leading-none font-black tracking-tight">{value.main}</span>
				<span class="ring" aria-hidden="true"></span>
			</div>
		{/if}

		{#if badge}
			<span class="badge absolute top-3 left-3 z-10">
				{#if badge.kind === 'ending'}
					<Icon name="flame" size={14} stroke={2.3} class="text-[#d97706]" />{badge.days === 0 ? t('pub.card.last_day') : badge.days === 1 ? t('pub.card.ends_tomorrow') : t('pub.card.ends_in', { days: badge.days })}
				{:else if badge.kind === 'today'}
					<Icon name="check" size={14} stroke={2.8} class="text-[#0b7a53]" />{t('pub.card.works_today')}
				{:else}
					<Icon name="sparkle" size={14} stroke={2.3} class="text-[#d91b81]" />{t('pub.card.popular')}
				{/if}
			</span>
		{/if}
	</div>

	<p class="truncate text-[0.84rem] text-ink-2">{deal.merchant.name}</p>
	<h3 class="mt-0.5 line-clamp-2 text-base leading-[1.34] font-bold text-ink transition-colors group-hover:text-roo-ink">{deal.title}</h3>

	<div class="mt-1 flex items-center justify-between gap-2 text-[0.84rem] text-ink-2">
		<span class="min-w-0 truncate">
			{#if deal.place}
				{deal.place.city}{deal.place.count > 1 ? ` · ${t('pub.card.locations', { count: deal.place.count })}` : ''}
			{:else}
				{t('pub.card.online')}
			{/if}
		</span>
		<WeekStrip days={deal.validDays} {today} />
	</div>

	<p class="mt-1 flex items-center gap-1.5 text-[0.84rem]">
		<Icon name="card" size={15} stroke={1.9} class="text-ink-2" />
		{#if deal.providers.length}
			<span class="truncate"><span class="text-ink-2">{t('pub.card.pay_with')}</span> <span class="font-semibold">{banks}</span></span>
		{:else}
			<span class="font-semibold text-leaf">{t('pub.any_card')}</span>
		{/if}
	</p>

	<p class="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
		{#if value.was}<s class="text-[0.875rem] text-[#888d93]">{value.was}</s>{/if}
		<span class="text-[1.02rem] font-extrabold text-roo-ink">{value.main}</span>
		{#if value.pill}<span class="rounded bg-roo-soft px-1.5 py-0.5 text-[0.75rem] font-extrabold text-roo-ink">{value.pill}</span>{/if}
		{#if value.note}<span class="text-[0.8rem] text-ink-2">{value.note}</span>{/if}
	</p>
	{#if deal.couponCode}
		<p class="mt-0.5 flex items-baseline gap-1.5 text-promo">
			<span class="text-[0.8rem] font-semibold">{t('pub.card.use_code')}</span>
			<span class="text-[1.15rem] font-extrabold tracking-tight">{deal.couponCode}</span>
		</p>
	{/if}
</a>

<style>
	/* Cards far below the screen are not laid out or painted until the person scrolls near them. */
	.card {
		content-visibility: auto;
		contain-intrinsic-size: auto 22rem;
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
	.backdrop {
		position: absolute;
		inset: -10%;
		width: 120%;
		height: 120%;
		object-fit: cover;
		filter: blur(18px) saturate(1.3);
		opacity: 0.85;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		border-radius: 0.375rem;
		background: #fff;
		color: #23262a;
		font-size: 0.75rem;
		font-weight: 700;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
	}
	.ring {
		position: absolute;
		right: -2.5rem;
		top: -2.5rem;
		width: 8rem;
		height: 8rem;
		border-radius: 50%;
		border: 1.2rem solid currentColor;
		opacity: 0.14;
	}
</style>
