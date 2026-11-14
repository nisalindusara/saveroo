<!--
	Deal card, as in the owner's reference design. Two sizes: rows (fixed width, 172 px image) and the
	grid (fills its cell, 236 px image). Image with one white badge (posters that do not fit are shown
	whole on a blurred copy, never cropped); shop; bold title; place with the week strip; which cards;
	then the price lines: tan value (crossed-out old price and a % pill when there is one) and, for
	coupon deals, the purple "<value> with code X" line. The image shares a view-transition name with the
	deal page poster, so it glides into place when opened.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { cardValue } from '@saveroo/shared/deal-text';
	import { t } from '@saveroo/shared/i18n';
	import { imageSrcset, imageUrl } from '@saveroo/shared/images';
	import { providerShortName } from '@saveroo/shared/providers';
	import type { PublicDealCard } from '@saveroo/shared';
	import { CARD_SIZES, cardBadge, fillsFrame, posterColours } from '#lib/public/cards.js';
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
		/** Fixed width in rows (e.g. "17.125rem"); fills its grid cell when not set. */
		width?: string;
	} = $props();

	const row = $derived(width !== undefined);
	const value = $derived(cardValue(deal));
	const badge = $derived(cardBadge(deal, today));
	const fill = $derived(fillsFrame(deal));
	const colours = $derived(posterColours(deal.merchant.name));
	const banks = $derived(deal.providers.slice(0, 2).map(providerShortName).join(', ') + (deal.providers.length > 2 ? ` +${deal.providers.length - 2}` : ''));
	// Without a coupon the value is the tan price line; with one, the purple line carries it.
	const tanLine = $derived(!deal.couponCode || value.was || value.pill || value.note);
</script>

<a
	href={resolve('/(site)/deals/[slug]', { slug: deal.slug })}
	class="card rise group flex shrink-0 flex-col {row ? 'row' : 'grid-card'}"
	style:--i={Math.min(index, 10)}
	style:width
	data-sveltekit-preload-data="hover"
>
	<div class="frame relative overflow-hidden" style:view-transition-name="deal-{deal.id}" style:background={deal.imageKey ? undefined : colours.bg}>
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
				class="deal-img relative h-full w-full {fill ? 'object-cover' : 'object-contain'}"
			/>
			{#if row}<div class="shade absolute inset-0"></div>{/if}
		{:else}
			<div class="flex h-full flex-col justify-end gap-1 p-4" style:color={colours.fg}>
				<span class="text-[0.7rem] font-bold tracking-[0.14em] uppercase">{deal.merchant.name}</span>
				<span class="text-[1.7rem] leading-none font-black tracking-tight">{value.main}</span>
				<span class="ring" aria-hidden="true"></span>
			</div>
		{/if}

		{#if badge}
			<span class="badge absolute z-20 {row ? 'top-2.5 left-2.5' : 'top-3 left-3'}">
				{#if badge.kind === 'ending'}
					<Icon name="flame" size={14} stroke={2.3} class="text-[#d97706]" />{badge.days === 0 ? t('pub.card.last_day') : badge.days === 1 ? t('pub.card.ends_tomorrow') : t('pub.card.ends_in', { days: badge.days })}
				{:else if badge.kind === 'today'}
					<Icon name="check" size={14} stroke={2.8} class="text-[#a67b5b]" />{t('pub.card.works_today')}
				{:else}
					<Icon name="sparkle" size={14} stroke={2.3} class="text-[#d91b81]" />{t('pub.card.popular')}
				{/if}
			</span>
		{/if}
	</div>

	<div class="merchant truncate">{deal.merchant.name}</div>
	<h3 class="title line-clamp-2">{deal.title}</h3>

	<div class="meta mt-1 flex items-center justify-between gap-2">
		<span class="min-w-0 truncate">
			{#if deal.place}
				{deal.place.city}{deal.place.count > 1 ? ` · ${t('pub.card.locations', { count: deal.place.count })}` : ''}
			{:else}
				{t('pub.card.online')}
			{/if}
		</span>
		<WeekStrip days={deal.validDays} {today} />
	</div>

	<div class="meta mt-1 flex items-center gap-1.5">
		<Icon name="card" size={15} stroke={1.9} />
		{#if deal.providers.length}
			<span class="truncate">{t('pub.card.pay_with')} <span class="font-semibold text-ink">{banks}</span></span>
		{:else}
			<span class="font-semibold text-leaf">{t('pub.any_card')}</span>
		{/if}
	</div>

	{#if tanLine}
		<div class="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
			{#if value.was}<span class="was line-through">{value.was}</span>{/if}
			{#if !deal.couponCode}<span class="tan {value.was ? '' : 'solo'}">{value.main}</span>{/if}
			{#if value.pill}<span class="pill">{value.pill}</span>{/if}
			{#if value.note}<span class="note">{value.note}</span>{/if}
		</div>
	{/if}
	{#if deal.couponCode}
		<div class="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-promo">
			<span class="code-price">{value.main}</span>
			<span class="code-text">{t('pub.card.with_code', { code: deal.couponCode })}</span>
		</div>
	{/if}
</a>

<style>
	/* Cards far below the screen are not laid out or painted until the person scrolls near them. */
	.card {
		content-visibility: auto;
		contain-intrinsic-size: auto 22rem;
		transition: transform 0.18s ease;
	}
	.card:hover {
		transform: translateY(-2px);
	}
	.deal-img {
		transition: transform 0.3s ease;
	}
	.card:hover .deal-img {
		transform: scale(1.03);
	}

	/* Row cards (274 px wide in the reference). */
	.row .frame {
		height: 172px;
		margin-bottom: 0.625rem;
		border-radius: 10px;
		background-color: #3d291a;
	}
	.row .merchant {
		font-size: 13px;
		color: var(--ink-3);
	}
	.row .title {
		margin-top: 0.125rem;
		font-size: 15px;
		font-weight: 700;
		line-height: 1.32;
		color: var(--ink);
	}
	.row .meta {
		font-size: 13px;
		color: var(--ink-3);
	}
	.row .was {
		font-size: 13.5px;
		color: #9ca3af;
	}
	.row .tan {
		font-size: 15.5px;
	}
	.row .pill {
		font-size: 11.5px;
	}
	.row .code-price {
		font-size: 17px;
	}
	.row .code-text {
		font-size: 12px;
	}

	/* Grid cards (236 px image in the reference). */
	.grid-card .frame {
		height: 236px;
		margin-bottom: 0.75rem;
		border-radius: 12px;
		border: 1px solid rgb(229 231 235 / 0.8);
		background-color: #f3f4f6;
	}
	.grid-card .merchant {
		margin-bottom: 0.125rem;
		font-size: 13.5px;
		color: var(--ink-2);
	}
	.grid-card .title {
		font-size: 16px;
		font-weight: 700;
		line-height: 1.34;
		color: var(--ink-strong);
		transition: color 150ms;
	}
	.grid-card:hover .title {
		color: var(--roo-ink);
	}
	.grid-card .meta {
		font-size: 13.5px;
		color: var(--ink-2);
	}
	.grid-card .was {
		font-size: 14px;
		color: #888d93;
	}
	.grid-card .tan {
		font-size: 15.5px;
	}
	.grid-card .pill {
		font-size: 12px;
	}
	.grid-card .code-price {
		font-size: 18.5px;
	}
	.grid-card .code-text {
		font-size: 12.5px;
	}

	.tan {
		font-weight: 800;
		color: var(--roo-ink);
	}
	.tan.solo {
		font-size: 17px !important;
	}
	.pill {
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		background: var(--roo-soft);
		color: #8c6244;
		font-weight: 800;
	}
	.note {
		font-size: 12.5px;
		color: var(--ink-2);
	}
	.code-price {
		font-weight: 800;
	}
	.code-text {
		font-weight: 600;
	}
	.shade {
		background: linear-gradient(to top, rgb(0 0 0 / 0.5), transparent 50%, rgb(0 0 0 / 0.2));
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
		color: #191c1f;
		font-size: 11.5px;
		font-weight: 700;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.1);
	}
	.grid-card .badge {
		font-size: 12px;
		color: #23262a;
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
