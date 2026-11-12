<!--
	Deal page: the full poster (never cropped) over a blurred copy of itself, opening full screen on tap;
	a ticket sheet with the saving, valid days (today highlighted), eligible cards, coupon, branches,
	how to use it, terms and when it was last checked; and a share bar. The poster continues the card's
	view transition from the feed.
-->
<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { daysText, savingText } from '@saveroo/shared/deal-text';
	import { t } from '@saveroo/shared/i18n';
	import { imageSrcset, imageUrl, shareImageUrl } from '@saveroo/shared/images';
	import { providerShortName } from '@saveroo/shared/providers';
	import { colomboDaysUntil, formatColomboDate } from '@saveroo/shared/time';
	import CouponTicket from '#lib/components/public/CouponTicket.svelte';
	import DealCard from '#lib/components/public/DealCard.svelte';
	import ExternalLink from '#lib/components/public/ExternalLink.svelte';
	import Icon from '#lib/components/public/Icon.svelte';
	import RooTag from '#lib/components/public/RooTag.svelte';
	import Seo from '#lib/components/public/Seo.svelte';
	import WeekStrip from '#lib/components/public/WeekStrip.svelte';
	import { endsWithin, posterColours, posterRatio, validOn } from '#lib/public/cards.js';
	import { nativeShare, whatsappUrl } from '#lib/public/share.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const deal = $derived(data.deal);
	const ratio = $derived(posterRatio(deal));
	const today = $derived(validOn(deal, data.today));
	const daysLeft = $derived(endsWithin(deal, 7));
	const saving = $derived(savingText(deal));
	// The tag already shows the headline number; repeat the text only when it adds a cap or minimum spend.
	const savingDetail = $derived(deal.maxSavingLkr !== null || deal.minSpendLkr !== null || deal.dealPriceLkr !== null ? saving : null);
	const colours = $derived(posterColours(deal.merchant.name));
	const checkedDays = $derived(deal.lastCheckedAt ? Math.max(0, -colomboDaysUntil(deal.lastCheckedAt)) : null);
	const shareText = $derived(`${deal.title} · ${deal.merchant.name} (${saving})`);
	const shareImage = $derived(deal.imageKey && deal.imageRatio ? shareImageUrl(data.supabaseUrl, deal.imageKey) : undefined);
	const times = $derived(deal.schedules.find((s) => s.startTime));
	const blackout = $derived(deal.schedules.flatMap((s) => s.blackoutDates));
	const description = $derived(
		[
			`${saving} ${t('pub.deal.at')} ${deal.merchant.name}.`,
			deal.validDays.length ? t('pub.valid_on', { days: daysText(deal.validDays) }) + '.' : '',
			deal.providers.length ? t('pub.deal.with_cards', { banks: deal.providers.map(providerShortName).join(', ') }) + '.' : ''
		]
			.filter(Boolean)
			.join(' ')
			.slice(0, 160)
	);

	let showAllBranches = $state(false);
	let lightbox = $state<HTMLDialogElement>();
	let cameFromSite = $state(false);
	afterNavigate(({ from }) => (cameFromSite = from !== null));

	function back() {
		if (cameFromSite) history.back();
		else goto(resolve('/(site)'));
	}

	async function share() {
		const url = page.url.href;
		if (!(await nativeShare(deal.title, shareText, url))) window.open(whatsappUrl(shareText, url), '_blank', 'noopener');
	}

	const mapsUrl = (b: { name: string; city: string | null; lat: number | null; lng: number | null }) =>
		b.lat !== null && b.lng !== null
			? `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`
			: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${deal.merchant.name} ${b.name} ${b.city ?? ''}`)}`;
</script>

<Seo
	title={`${deal.title} · ${deal.merchant.name}`}
	{description}
	image={shareImage}
	imageAlt={deal.title}
	type="article"
	jsonLd={{
		'@context': 'https://schema.org',
		'@type': 'Offer',
		name: deal.title,
		description,
		url: `${page.url.origin}${page.url.pathname}`,
		image: shareImage,
		validFrom: deal.startsAt,
		...(deal.endsAt && { priceValidUntil: deal.endsAt.slice(0, 10) }),
		seller: { '@type': 'Organization', name: deal.merchant.name }
	}}
/>

<div class="mx-auto max-w-6xl md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10 md:px-4 md:pt-8">
	<!-- Poster -->
	<div class="relative md:sticky md:top-20 md:self-start">
		<div class="hero relative overflow-hidden md:rounded-[2rem]">
			{#if deal.imageKey}
				<img src={imageUrl(data.supabaseUrl, deal.imageKey, 320)} alt="" aria-hidden="true" class="backdrop" />
			{:else}
				<div class="absolute inset-0" style:background={colours.bg}></div>
			{/if}

			<div class="absolute inset-x-3 top-3 z-10 flex justify-between md:hidden">
				<button class="round press" onclick={back} aria-label={t('pub.back')}><Icon name="back" size={20} stroke={2.3} /></button>
				<button class="round press" onclick={share} aria-label={t('pub.deal.share')}><Icon name="share" size={19} stroke={2.3} /></button>
			</div>

			<div class="relative flex justify-center px-6 pt-14 pb-11 md:px-10 md:py-10">
				{#if deal.imageKey}
					<button
						type="button"
						class="poster press"
						style:aspect-ratio={ratio}
						style:--r={ratio}
						style:view-transition-name="deal-{deal.id}"
						onclick={() => lightbox?.showModal()}
						aria-label={t('pub.deal.zoom')}
					>
						<img
							src={imageUrl(data.supabaseUrl, deal.imageKey, 640)}
							srcset={imageSrcset(data.supabaseUrl, deal.imageKey)}
							sizes="(min-width: 768px) 520px, 88vw"
							alt={deal.title}
							fetchpriority="high"
							class="h-full w-full {deal.imageRatio ? 'object-cover' : 'object-contain'}"
						/>
					</button>
				{:else}
					<div
						class="poster flex flex-col justify-between p-6"
						style:aspect-ratio="0.8"
						style:--r="0.8"
						style:background={colours.bg}
						style:color={colours.fg}
						style:view-transition-name="deal-{deal.id}"
					>
						<span class="text-sm font-bold tracking-wider uppercase">{deal.merchant.name}</span>
						<span class="font-display text-3xl leading-tight font-extrabold">{deal.title}</span>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Ticket sheet -->
	<article class="sheet relative -mt-7 rounded-t-[1.9rem] bg-surface px-5 pt-6 pb-32 md:mt-0 md:rounded-[2rem] md:p-8 md:shadow-card">
		<a href={resolve('/(site)/merchants/[slug]', { slug: deal.merchant.slug })} class="press inline-flex items-center gap-2 text-sm font-semibold text-ink-2">
			{#if deal.merchant.logoKey}
				<img src={imageUrl(data.supabaseUrl, deal.merchant.logoKey, 320)} alt="" width="28" height="28" class="size-7 rounded-full object-cover ring-1 ring-line" />
			{:else}
				<span class="grid size-7 place-items-center rounded-full text-xs font-bold text-white" style:background={colours.bg}>{deal.merchant.name[0]}</span>
			{/if}
			{deal.merchant.name}
			<Icon name="chevron" size={15} stroke={2.4} />
		</a>

		<h1 class="font-display mt-3 text-[1.85rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance md:text-4xl">{deal.title}</h1>

		<div class="mt-5 flex items-center gap-4">
			<RooTag {deal} size="lg" />
			{#if savingDetail}<p class="text-[0.92rem] leading-snug font-medium text-ink-2">{savingDetail}</p>{/if}
		</div>

		<!-- When -->
		<section class="block-card mt-6">
			<div class="flex items-center justify-between gap-2">
				<h2 class="label">{t('pub.deal.when')}</h2>
				{#if today}
					<span class="status bg-leaf-soft text-leaf"><Icon name="check" size={14} stroke={3} />{t('pub.deal.works_today')}</span>
				{:else}
					<span class="status bg-surface-2 text-ink-2">{t('pub.deal.not_today')}</span>
				{/if}
			</div>
			<div class="mt-3"><WeekStrip days={deal.validDays} today={data.today} size="lg" /></div>
			<ul class="mt-3 space-y-1.5 text-[0.9rem]">
				<li class="flex items-center gap-2"><Icon name="calendar" size={16} class="text-ink-2" />{deal.validDays.length ? t('pub.valid_on', { days: daysText(deal.validDays) }) : t('pub.deal.every_day')}</li>
				{#if times}
					<li class="flex items-center gap-2"><Icon name="clock" size={16} class="text-ink-2" />{t('pub.deal.hours', { from: times.startTime ?? '', to: times.endTime ?? '' })}</li>
				{/if}
				<li class="flex items-center gap-2">
					<Icon name="flame" size={16} class={daysLeft !== null ? 'text-sun' : 'text-ink-2'} />
					{#if deal.endsAt}
						{daysLeft === 0 ? t('pub.ends_today') : daysLeft !== null ? t('pub.deal.ends_in', { days: daysLeft, date: formatColomboDate(deal.endsAt) }) : t('pub.deal.until', { date: formatColomboDate(deal.endsAt) })}
					{:else}
						{t('pub.deal.no_end')}
					{/if}
				</li>
				{#if blackout.length}
					<li class="text-ink-2">{t('pub.deal.blackout', { dates: blackout.map((d) => formatColomboDate(`${d}T06:00:00Z`)).join(', ') })}</li>
				{/if}
			</ul>
		</section>

		<!-- Cards -->
		<section class="block-card mt-4">
			<h2 class="label">{t('pub.deal.cards')}</h2>
			{#if deal.eligibility.length === 0}
				<p class="mt-2 flex items-center gap-2 text-[0.92rem] font-medium text-leaf"><Icon name="check" size={16} stroke={2.6} />{t('pub.deal.open_to_all')}</p>
			{:else}
				<ul class="mt-3 space-y-2">
					{#each deal.eligibility as e, i (i)}
						<li class="flex items-center gap-3">
							<span class="bank">{providerShortName(e.provider)}</span>
							<span class="min-w-0 text-[0.9rem]">
								<span class="font-semibold">{e.provider.name}</span>
								<span class="block text-ink-2">
									{e.card ? e.card.name : e.cardType ? t(`pub.card_type.${e.cardType as 'credit'}`) : t('pub.deal.any_card_of')}{e.note ? ` · ${e.note}` : ''}
								</span>
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		{#if deal.coupons.length}
			<section class="mt-5 space-y-3">
				{#each deal.coupons as c (c.code)}<CouponTicket code={c.code} />{/each}
			</section>
		{/if}

		<!-- Where -->
		<section class="block-card mt-4">
			<div class="flex items-center justify-between">
				<h2 class="label">{t('pub.deal.where')}</h2>
				<span class="status bg-surface-2 text-ink">
					<Icon name={deal.channel === 'online' ? 'globe' : 'store'} size={14} stroke={2.3} />{t(`pub.channel.${deal.channel}`)}
				</span>
			</div>
			{#if deal.branches.length}
				<p class="mt-2 text-[0.85rem] text-ink-2">{deal.allBranches ? t('pub.deal.all_branches') : t('pub.deal.these_branches')}</p>
				<ul class="mt-2 divide-y divide-line">
					{#each showAllBranches ? deal.branches : deal.branches.slice(0, 4) as b (b.name)}
						<li class="flex items-center justify-between gap-3 py-2.5">
							<span class="min-w-0 text-[0.9rem]"><span class="font-semibold">{b.name}</span>{#if b.city}<span class="text-ink-2"> · {b.city}</span>{/if}</span>
							<ExternalLink href={mapsUrl(b)} class="press flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold">
								<Icon name="pin" size={14} stroke={2.3} />{t('pub.deal.directions')}
							</ExternalLink>
						</li>
					{/each}
				</ul>
				{#if deal.branches.length > 4 && !showAllBranches}
					<button class="mt-1 text-sm font-semibold text-roo-ink" onclick={() => (showAllBranches = true)}>{t('pub.deal.all_n_branches', { count: deal.branches.length })}</button>
				{/if}
			{/if}
			{#if deal.merchant.websiteUrl && deal.channel !== 'in_store'}
				<ExternalLink href={deal.merchant.websiteUrl} class="press mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-roo-ink">
					{t('pub.deal.visit_site')}<Icon name="external" size={15} stroke={2.3} />
				</ExternalLink>
			{/if}
		</section>

		{#if deal.howToRedeem}
			<section class="mt-6">
				<h2 class="label">{t('pub.deal.how')}</h2>
				<p class="mt-2 text-[0.95rem] leading-relaxed whitespace-pre-line">{deal.howToRedeem}</p>
			</section>
		{/if}
		{#if deal.description}
			<p class="mt-5 text-[0.95rem] leading-relaxed whitespace-pre-line text-ink-2">{deal.description}</p>
		{/if}
		{#if deal.terms}
			<details class="terms mt-5">
				<summary class="flex cursor-pointer items-center justify-between py-2 font-semibold">{t('pub.deal.terms')}<Icon name="chevron" size={16} stroke={2.4} class="chev" /></summary>
				<p class="pt-1 pb-2 text-[0.88rem] leading-relaxed whitespace-pre-line text-ink-2">{deal.terms}</p>
			</details>
		{/if}

		<!-- Trust -->
		<p class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-4 text-[0.8rem] text-ink-2">
			<span class="flex items-center gap-1.5 font-semibold {deal.verification === 'verified' ? 'text-leaf' : ''}">
				<Icon name="shield" size={15} stroke={2.2} />{t(`pub.verification.${deal.verification}`)}
			</span>
			{#if checkedDays !== null}<span>{checkedDays === 0 ? t('pub.deal.checked_today') : t('pub.deal.checked_days', { days: checkedDays })}</span>{/if}
			{#if deal.sourceUrl}
				<ExternalLink href={deal.sourceUrl} nofollow class="flex items-center gap-1 font-semibold underline">{t('pub.deal.source')}<Icon name="external" size={13} /></ExternalLink>
			{/if}
		</p>
	</article>
</div>

{#if data.more.length}
	<section class="mx-auto mt-2 max-w-6xl md:mt-10">
		<h2 class="font-display px-4 text-[1.35rem] font-extrabold tracking-tight">{t('pub.deal.more_from', { merchant: deal.merchant.name })}</h2>
		<div class="rail mt-3 pb-2">
			{#each data.more as d, i (d.id)}<DealCard deal={d} today={data.today} supabaseUrl={data.supabaseUrl} index={i} width="10.5rem" />{/each}
		</div>
	</section>
{/if}

<!-- Share bar -->
<div class="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:bottom-6 md:pb-0" style:view-transition-name="share-bar">
	<div class="mx-auto flex max-w-md gap-2">
		<ExternalLink href={whatsappUrl(shareText, page.url.href)} class="press flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1fa855] py-3.5 font-bold text-white shadow-card">
			<Icon name="whatsapp" size={20} stroke={2} />{t('pub.deal.share_whatsapp')}
		</ExternalLink>
		<button class="press grid w-14 place-items-center rounded-2xl border border-line bg-surface shadow-card" onclick={share} aria-label={t('pub.deal.share')}>
			<Icon name="share" size={20} stroke={2.2} />
		</button>
	</div>
</div>

{#if deal.imageKey}
	<dialog bind:this={lightbox} class="lightbox" onclick={() => lightbox?.close()} aria-label={deal.title}>
		<img src={imageUrl(data.supabaseUrl, deal.imageKey, 1280)} alt={deal.title} />
		<button class="round absolute top-4 right-4" aria-label={t('pub.close')}><Icon name="x" size={20} stroke={2.4} /></button>
	</dialog>
{/if}

<style>
	.hero {
		min-height: 22rem;
	}
	.backdrop {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: blur(36px) saturate(1.35);
		transform: scale(1.3);
		opacity: 0.75;
	}
	.hero::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, transparent 60%, rgb(0 0 0 / 0.12));
		pointer-events: none;
	}
	.poster {
		position: relative;
		z-index: 1;
		display: block;
		/* Leave room for the merchant, title and tag to peek up on the first screen. */
		width: min(100%, calc(48svh * var(--r, 1)));
		max-width: 26rem;
		max-height: 48svh;
		overflow: hidden;
		border-radius: 1.25rem;
		box-shadow: 0 30px 60px -20px rgb(0 0 0 / 0.55), 0 0 0 1px rgb(255 255 255 / 0.08);
		cursor: zoom-in;
	}
	.round {
		display: grid;
		place-items: center;
		width: 2.6rem;
		height: 2.6rem;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.82);
		color: #1a1410;
		backdrop-filter: blur(12px);
		box-shadow: 0 4px 14px rgb(0 0 0 / 0.18);
	}
	.sheet {
		z-index: 2;
	}
	.block-card {
		padding: 1rem;
		border-radius: 1.2rem;
		background: var(--bg);
		border: 1px solid var(--line);
	}
	.label {
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-2);
	}
	.status {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 800;
	}
	.bank {
		display: grid;
		place-items: center;
		min-width: 3.4rem;
		height: 2.4rem;
		padding: 0 0.5rem;
		border-radius: 0.7rem;
		background: var(--ink);
		color: var(--bg);
		font-size: 0.75rem;
		font-weight: 800;
	}
	.terms {
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
	}
	.terms[open] :global(.chev) {
		transform: rotate(90deg);
	}
	.terms :global(.chev) {
		transition: transform 250ms var(--ease-out-expo);
	}
	.lightbox {
		width: 100vw;
		height: 100dvh;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: rgb(10 8 6 / 0.94);
	}
	.lightbox[open] {
		display: grid;
		place-items: center;
		animation: fade 220ms var(--ease-out-expo);
	}
	.lightbox img {
		max-width: 100%;
		max-height: 100dvh;
		object-fit: contain;
		animation: zoom 320ms var(--ease-spring);
	}
	.lightbox::backdrop {
		background: transparent;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@keyframes zoom {
		from {
			transform: scale(0.92);
		}
	}
</style>
