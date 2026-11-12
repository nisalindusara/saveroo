<!--
	Deal card for grids and rails, built so the saving is clear without opening it: the poster in a fixed
	4:3 frame (shown whole on a blurred copy when it does not fit), one badge (last days / works today /
	popular), shop, title, where it works, the value line ("40% off · up to Rs 5,000", or a crossed-out
	price), and which cards or code to use with the week strip. The image shares a view-transition name
	with the deal page poster, so it glides into place when opened.
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
		/** Fixed width in rails (e.g. "15rem"); fills its grid cell when not set. */
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
	class="card press rise group flex flex-col"
	style:--i={Math.min(index, 10)}
	style:width
	data-sveltekit-preload-data="hover"
>
	<div class="frame relative overflow-hidden rounded-2xl bg-surface-2" style:aspect-ratio={CARD_FRAME} style:view-transition-name="deal-{deal.id}">
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
				<span class="text-[0.7rem] font-bold tracking-[0.14em] uppercase opacity-80">{deal.merchant.name}</span>
				<span class="font-display text-[1.7rem] leading-none font-extrabold tracking-tight">{value.main}</span>
				<span class="ring" aria-hidden="true"></span>
			</div>
		{/if}

		{#if badge}
			<span
				class="badge absolute top-2.5 left-2.5 {badge.kind === 'ending' ? 'bg-sun text-ink' : badge.kind === 'today' ? 'bg-leaf text-on-leaf' : 'bg-roo text-white'}"
			>
				{#if badge.kind === 'ending'}
					<Icon name="flame" size={12} stroke={2.4} />{badge.days === 0 ? t('pub.card.last_day') : badge.days === 1 ? t('pub.card.ends_tomorrow') : t('pub.card.ends_in', { days: badge.days })}
				{:else if badge.kind === 'today'}
					<Icon name="check" size={12} stroke={3} />{t('pub.card.works_today')}
				{:else}
					<Icon name="sparkle" size={12} stroke={2.4} />{t('pub.card.popular')}
				{/if}
			</span>
		{/if}
	</div>

	<div class="flex flex-1 flex-col px-0.5 pt-2.5">
		<p class="flex items-center gap-1.5 text-[0.78rem] text-ink-2">
			{#if deal.merchant.logoKey}
				<img src={imageUrl(supabaseUrl, deal.merchant.logoKey, 320)} alt="" width="16" height="16" loading="lazy" class="size-4 rounded-full object-cover ring-1 ring-line" />
			{/if}
			<span class="truncate">{deal.merchant.name}</span>
		</p>
		<h3 class="mt-0.5 line-clamp-2 text-[0.95rem] leading-snug font-bold text-ink">{deal.title}</h3>
		<p class="mt-1 flex items-center gap-1 text-[0.78rem] text-ink-2">
			{#if deal.place}
				<Icon name="pin" size={13} stroke={2.2} />
				<span class="truncate">{deal.place.city}{deal.place.count > 1 ? ` · ${t('pub.card.locations', { count: deal.place.count })}` : ''}</span>
			{:else}
				<Icon name="globe" size={13} stroke={2.2} /><span>{t('pub.card.online')}</span>
			{/if}
		</p>

		<p class="value mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-2">
			{#if value.was}<s class="text-[0.82rem] text-ink-2">{value.was}</s>{/if}
			<span class="font-display text-[1.2rem] leading-tight font-extrabold tracking-tight text-roo-ink">{value.main}</span>
			{#if value.pill}<span class="pill">{value.pill}</span>{/if}
			{#if value.note}<span class="text-[0.78rem] text-ink-2">{value.note}</span>{/if}
		</p>

		<div class="mt-1 flex items-center justify-between gap-2 text-[0.78rem]">
			<span class="min-w-0 truncate">
				{#if deal.providers.length}
					<span class="text-ink-2">{t('pub.card.pay_with')}</span> <span class="font-semibold text-ink">{banks}</span>
				{:else}
					<span class="font-semibold text-leaf">{t('pub.any_card')}</span>
				{/if}
				{#if deal.couponCode}
					<span class="text-ink-2"> · {t('pub.card.code')}</span> <span class="code">{deal.couponCode}</span>
				{/if}
			</span>
			<WeekStrip days={deal.validDays} {today} />
		</div>
	</div>
</a>

<style>
	/* Cards far below the screen are not laid out or painted until the person scrolls near them. */
	.card {
		content-visibility: auto;
		contain-intrinsic-size: auto 24rem;
	}
	.frame {
		box-shadow: 0 0 0 1px var(--line);
		transition: box-shadow 300ms var(--ease-out-expo);
	}
	.card:hover .frame {
		box-shadow: 0 0 0 1px var(--line), 0 14px 30px -14px rgb(26 20 16 / 0.35);
	}
	.poster {
		transition: transform 500ms var(--ease-out-expo);
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
		gap: 0.25rem;
		padding: 0.2rem 0.5rem;
		border-radius: 0.5rem;
		font-size: 0.7rem;
		font-weight: 800;
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.2);
	}
	.pill {
		align-self: center;
		padding: 0.05rem 0.35rem;
		border-radius: 0.35rem;
		background: var(--leaf-soft);
		color: var(--leaf);
		font-size: 0.72rem;
		font-weight: 800;
	}
	.code {
		padding: 0 0.3rem;
		border: 1px dashed currentColor;
		border-radius: 0.3rem;
		color: var(--roo-ink);
		font-family: ui-monospace, monospace;
		font-weight: 700;
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
