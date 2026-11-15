<!--
	Deal page (layout after the owner's deal-page screenshot): breadcrumbs; photos on the left (DealGallery:
	one photo at its own shape, or several with thumbnails, swipe and a full-screen viewer) and on the right
	shop, title, place, last check, the dates summary, price lines, main action and sharing; "This offer" card (valid days, cards,
	coupon, price, end date, main action); about, how to use it, "Need to know" and "About the shop"
	sections; a right column with where to use it and sharing; then more from the shop, similar deals and
	category chips. Phones get a bottom bar with the main action, WhatsApp and share.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { cardValue, daysText, formatRs, savingText } from '@saveroo/shared/deal-text';
	import { t } from '@saveroo/shared/i18n';
	import { imageUrl, shareImageUrl } from '@saveroo/shared/images';
	import { providerShortName } from '@saveroo/shared/providers';
	import { colomboDaysUntil, formatColomboDate } from '@saveroo/shared/time';
	import CouponTicket from '#lib/components/public/CouponTicket.svelte';
	import DealDates from '#lib/components/public/DealDates.svelte';
	import DealGallery from '#lib/components/public/DealGallery.svelte';
	import DealCard from '#lib/components/public/DealCard.svelte';
	import ExternalLink from '#lib/components/public/ExternalLink.svelte';
	import Icon from '#lib/components/public/Icon.svelte';
	import Rail from '#lib/components/public/Rail.svelte';
	import Seo from '#lib/components/public/Seo.svelte';
	import { endsWithin, posterColours, validOn } from '#lib/public/cards.js';
	import { nativeShare, whatsappUrl } from '#lib/public/share.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const deal = $derived(data.deal);
	const today = $derived(validOn(deal, data.today));
	const daysLeft = $derived(endsWithin(deal, 7));
	const saving = $derived(savingText(deal));
	const value = $derived(cardValue(deal));
	const conditions = $derived(
		[
			deal.maxSavingLkr !== null ? t('deal.up_to', { amount: formatRs(deal.maxSavingLkr) }) : '',
			deal.minSpendLkr !== null ? t('deal.min_spend', { amount: formatRs(deal.minSpendLkr) }) : ''
		].filter(Boolean)
	);
	const colours = $derived(posterColours(deal.merchant.name));
	const checkedDays = $derived(deal.lastCheckedAt ? Math.max(0, -colomboDaysUntil(deal.lastCheckedAt)) : null);
	const shareText = $derived(`${deal.title} · ${deal.merchant.name} (${saving})`);
	const shareImage = $derived(deal.imageKey && deal.imageRatio ? shareImageUrl(data.supabaseUrl, deal.imageKey) : undefined);
	const times = $derived(deal.schedules.find((s) => s.startTime));
	const blackout = $derived(deal.schedules.flatMap((s) => s.blackoutDates.map((d) => d.slice(0, 10))));
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
	let copied = $state(false);

	const mapsUrl = (b: { name: string; city: string | null; lat: number | null; lng: number | null }) =>
		b.lat !== null && b.lng !== null
			? `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`
			: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${deal.merchant.name} ${b.name} ${b.city ?? ''}`)}`;

	// The bottom bar's main action: copy the code, get directions, or open the shop's website.
	const action = $derived(
		deal.couponCode
			? ({ kind: 'copy', code: deal.couponCode } as const)
			: deal.branches.length && deal.channel !== 'online'
				? ({ kind: 'link', href: mapsUrl(deal.branches[0]!), label: t('pub.deal.get_directions'), icon: 'pin' } as const)
				: deal.merchant.websiteUrl
					? ({ kind: 'link', href: deal.merchant.websiteUrl, label: t('pub.deal.visit_site_short'), icon: 'external' } as const)
					: null
	);

	async function copyCode(code: string) {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			navigator.vibrate?.(12);
			setTimeout(() => (copied = false), 2200);
		} catch {
			// Clipboard blocked: the code is also shown on the page to copy by hand.
		}
	}

	async function share() {
		const url = page.url.href;
		if (!(await nativeShare(deal.title, shareText, url))) window.open(whatsappUrl(shareText, url), '_blank', 'noopener');
	}

</script>

<svelte:head>
	<!-- The poster is the largest thing on screen: start downloading it before anything else. -->
	{#if deal.imageKey}<link rel="preload" as="image" href={imageUrl(data.supabaseUrl, deal.imageKey, 640)} fetchpriority="high" />{/if}
</svelte:head>

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

<div class="mx-auto max-w-[1180px] px-4 pb-28 sm:px-7 md:pb-6">
	<!-- Breadcrumbs -->
	<nav class="crumbs flex flex-wrap items-center gap-1 text-[13px] text-ink-2" aria-label={t('pub.deal.breadcrumbs')}>
		<a href={resolve('/(site)')} class="hover:underline">{t('pub.nav.home')}</a>
		{#if deal.category}
			<span aria-hidden="true">›</span>
			<a href={resolve('/(site)/categories/[slug]', { slug: deal.category.slug })} class="hover:underline">{deal.category.name}</a>
		{/if}
		<span aria-hidden="true">›</span>
		<a href={resolve('/(site)/merchants/[slug]', { slug: deal.merchant.slug })} class="hover:underline">{deal.merchant.name}</a>
	</nav>

	<!-- Top: photos on the left (never full width), summary on the right -->
	<div class="mt-3 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-9">
		<div class="min-w-0">
			{#if deal.images.length}
				<DealGallery images={deal.images} title={deal.title} dealId={deal.id} supabaseUrl={data.supabaseUrl} onshare={share} />
			{:else}
				<div class="flex aspect-[4/3] flex-col justify-end rounded-xl p-6" style:background={colours.bg} style:color={colours.fg} style:view-transition-name="deal-{deal.id}">
					<span class="text-sm font-bold tracking-wider uppercase">{deal.merchant.name}</span>
					<span class="text-4xl leading-tight font-black">{value.main}</span>
				</div>
			{/if}
		</div>

		<div class="min-w-0">
			<a href={resolve('/(site)/merchants/[slug]', { slug: deal.merchant.slug })} class="text-[14px] text-ink-2 hover:underline">{deal.merchant.name}</a>
			<h1 class="mt-0.5 text-[1.6rem] leading-[1.2] font-extrabold tracking-[-0.02em] text-ink md:text-[1.9rem]">{deal.title}</h1>
			<p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-ink-2">
				{#if deal.place}
					<a href="#where" class="flex items-center gap-1 underline underline-offset-2"><Icon name="pin" size={15} stroke={2} />{deal.place.city}{deal.place.count > 1 ? ` · ${t('pub.card.locations', { count: deal.place.count })}` : ''}</a>
				{:else}
					<span class="flex items-center gap-1"><Icon name="globe" size={15} stroke={2} />{t('pub.card.online')}</span>
				{/if}
				{#if checkedDays !== null}<span class="flex items-center gap-1 {deal.verification === 'verified' ? 'text-leaf' : ''}"><Icon name="shield" size={15} stroke={2} />{checkedDays === 0 ? t('pub.deal.checked_today') : t('pub.deal.checked_days', { days: checkedDays })}</span>{/if}
			</p>

			<div class="mt-4 border-t border-line pt-4">
				<DealDates validDays={deal.validDays} startsAt={deal.startsAt} endsAt={deal.endsAt} {blackout} compact />
			</div>

			<div class="mt-4 rounded-xl border border-roo-line bg-[color-mix(in_srgb,var(--roo-soft)_45%,var(--bg))] p-4">
				{@render priceLines('md')}
				{#if conditions.length}<p class="mt-1 text-[13px] text-ink-2">{conditions.join(' · ')}</p>{/if}
				<div class="mt-3 hidden md:flex">{@render mainAction()}</div>
			</div>
			<div class="mt-3 hidden gap-2 md:flex">
				<ExternalLink href={whatsappUrl(shareText, page.url.href)} class="press flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-surface-2">
					<Icon name="whatsapp" size={17} stroke={2} class="text-[#0f7f43]" />{t('pub.deal.share_whatsapp')}
				</ExternalLink>
				<button class="press flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-surface-2" onclick={share}>
					<Icon name="share" size={16} stroke={2.2} />{t('pub.deal.share')}
				</button>
			</div>
		</div>
	</div>

	<!-- Two columns: the offer and its details; where to use it -->
	<div class="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
		<div class="min-w-0">
			<h2 class="text-[17px] font-extrabold">{t('pub.deal.this_offer')}</h2>
			<div class="option mt-3 rounded-xl border-2 border-roo p-4">
				{#if today}<span class="mb-2 inline-block rounded border border-roo px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-roo-ink uppercase">{t('pub.deal.works_today')}</span>{/if}
				<p class="text-[16px] font-bold">{deal.title}</p>

				<div class="mt-3">
					<DealDates validDays={deal.validDays} startsAt={deal.startsAt} endsAt={deal.endsAt} {blackout} />
					{#if times}<p class="mt-2 flex items-center gap-1.5 text-[13px] text-ink-2"><Icon name="clock" size={14} stroke={2} />{t('pub.deal.hours', { from: times.startTime ?? '', to: times.endTime ?? '' })}</p>{/if}
				</div>

				<p class="mt-4 text-[14px] font-bold">{t('pub.deal.cards')}</p>
				{#if deal.eligibility.length === 0}
					<p class="mt-1.5 flex items-center gap-2 text-[14px] text-leaf"><Icon name="check" size={16} stroke={2.6} />{t('pub.deal.open_to_all')}</p>
				{:else}
					<ul class="mt-1.5 space-y-1.5">
						{#each deal.eligibility as e, i (i)}
							<li class="flex items-center gap-2 text-[14px]">
								<Icon name="check" size={16} stroke={2.6} class="text-leaf" />
								<span><span class="font-semibold">{e.provider.name}</span> · {e.card ? e.card.name : e.cardType ? t(`pub.card_type.${e.cardType as 'credit'}`) : t('pub.deal.any_card_of')}{e.note ? ` · ${e.note}` : ''}</span>
							</li>
						{/each}
					</ul>
				{/if}

				{#if deal.coupons.length}
					<div class="mt-4 space-y-3">{#each deal.coupons as c (c.code)}<CouponTicket code={c.code} />{/each}</div>
				{/if}

				<div class="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
					<div>
						{@render priceLines('md')}
						{#if conditions.length}<p class="mt-1 text-[13px] text-ink-2">{conditions.join(' · ')}</p>{/if}
						<p class="mt-1 flex items-center gap-1 text-[13px] {daysLeft !== null ? 'font-semibold text-[#b45309]' : 'text-ink-2'}">
							<Icon name="flame" size={14} stroke={2.2} />
							{#if deal.endsAt}
								{daysLeft === 0 ? t('pub.ends_today') : daysLeft !== null ? t('pub.deal.ends_in', { days: daysLeft, date: formatColomboDate(deal.endsAt) }) : t('pub.deal.until', { date: formatColomboDate(deal.endsAt) })}
							{:else}
								{t('pub.deal.no_end')}
							{/if}
						</p>
					</div>
					<div class="hidden md:block">{@render mainAction()}</div>
				</div>
			</div>

			{#if deal.description}
				<h2 class="mt-8 text-[17px] font-extrabold">{t('pub.deal.about_offer')}</h2>
				<p class="mt-2 text-[14.5px] leading-relaxed whitespace-pre-line text-ink">{deal.description}</p>
			{/if}
			{#if deal.howToRedeem}
				<h2 class="mt-8 text-[17px] font-extrabold">{t('pub.deal.how')}</h2>
				<p class="mt-2 text-[14.5px] leading-relaxed whitespace-pre-line text-ink">{deal.howToRedeem}</p>
			{/if}

			<div class="mt-8 border-t border-line">
				<details class="acc border-b border-line">
					<summary class="flex cursor-pointer items-center justify-between py-4 text-[16px] font-bold">{t('pub.deal.need_to_know')}<Icon name="chevronDown" size={18} stroke={2.2} class="chev" /></summary>
					<div class="space-y-2 pb-4 text-[14px] leading-relaxed text-ink-2">
						{#if deal.endsAt}<p>{t('pub.deal.until', { date: formatColomboDate(deal.endsAt) })}.</p>{/if}
						{#if blackout.length}<p>{t('pub.deal.blackout', { dates: blackout.map((d) => formatColomboDate(`${d}T06:00:00Z`)).join(', ') })}</p>{/if}
						{#if deal.terms}<p class="whitespace-pre-line">{deal.terms}</p>{/if}
						<p class="flex flex-wrap items-center gap-x-3">
							<span class="{deal.verification === 'verified' ? 'font-semibold text-leaf' : ''}">{t(`pub.verification.${deal.verification}`)}</span>
							{#if deal.sourceUrl}<ExternalLink href={deal.sourceUrl} nofollow class="inline-flex items-center gap-1 font-semibold underline">{t('pub.deal.source')}<Icon name="external" size={13} /></ExternalLink>{/if}
						</p>
					</div>
				</details>
				<details class="acc border-b border-line">
					<summary class="flex cursor-pointer items-center justify-between py-4 text-[16px] font-bold">{t('pub.deal.about_merchant', { merchant: deal.merchant.name })}<Icon name="chevronDown" size={18} stroke={2.2} class="chev" /></summary>
					<div class="flex items-center gap-3 pb-4">
						{#if deal.merchant.logoKey}
							<img src={imageUrl(data.supabaseUrl, deal.merchant.logoKey, 320)} alt="" width="48" height="48" class="size-12 rounded-lg object-contain ring-1 ring-line" />
						{:else}
							<span class="grid size-12 place-items-center rounded-lg text-lg font-black text-white" style:background={colours.bg}>{deal.merchant.name[0]}</span>
						{/if}
						<div class="text-[14px]">
							<a href={resolve('/(site)/merchants/[slug]', { slug: deal.merchant.slug })} class="font-semibold text-roo-ink hover:underline">{t('pub.deal.all_from', { merchant: deal.merchant.name })}</a>
							{#if deal.merchant.websiteUrl}
								<ExternalLink href={deal.merchant.websiteUrl} class="mt-0.5 flex items-center gap-1 text-ink-2 hover:underline">{t('pub.deal.visit_site')}<Icon name="external" size={13} /></ExternalLink>
							{/if}
						</div>
					</div>
				</details>
			</div>
		</div>

		<!-- Right column -->
		<aside class="space-y-4 lg:sticky lg:top-40 lg:self-start">
			<section id="where" class="scroll-mt-40 rounded-xl border border-line p-4">
				<h2 class="flex items-center justify-between text-[16px] font-bold">
					{t('pub.deal.where_use')}
					<span class="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-semibold text-ink-2">
						<Icon name={deal.channel === 'online' ? 'globe' : 'store'} size={13} stroke={2.2} />{t(`pub.channel.${deal.channel}`)}
					</span>
				</h2>
				{#if deal.branches.length}
					<p class="mt-2 text-[13px] text-ink-2">{deal.allBranches ? t('pub.deal.all_branches') : t('pub.deal.these_branches')}</p>
					<ul class="mt-1 divide-y divide-line">
						{#each showAllBranches ? deal.branches : deal.branches.slice(0, 4) as b (b.name)}
							<li class="flex items-center justify-between gap-3 py-2.5">
								<span class="min-w-0 text-[14px]"><span class="font-semibold">{b.name}</span>{#if b.city && b.city !== b.name}<span class="block text-[13px] text-ink-2">{b.city}</span>{/if}</span>
								<ExternalLink href={mapsUrl(b)} class="press flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold">
									<Icon name="pin" size={14} stroke={2.3} />{t('pub.deal.directions')}
								</ExternalLink>
							</li>
						{/each}
					</ul>
					{#if deal.branches.length > 4 && !showAllBranches}
						<button class="mt-1 text-sm font-semibold text-roo-ink" onclick={() => (showAllBranches = true)}>{t('pub.deal.all_n_branches', { count: deal.branches.length })}</button>
					{/if}
				{:else if deal.channel !== 'online'}
					<p class="mt-2 text-[13px] text-ink-2">{t('pub.deal.all_branches')}</p>
				{/if}
				{#if deal.merchant.websiteUrl && deal.channel !== 'in_store'}
					<ExternalLink href={deal.merchant.websiteUrl} class="press mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-roo-ink">
						{t('pub.deal.visit_site')}<Icon name="external" size={15} stroke={2.3} />
					</ExternalLink>
				{/if}
			</section>

			<section class="rounded-xl border border-line p-4">
				<h2 class="text-[16px] font-bold">{t('pub.deal.share_title')}</h2>
				<p class="mt-1 text-[13px] text-ink-2">{t('pub.deal.share_sub')}</p>
				<div class="mt-3 flex gap-2">
					<ExternalLink href={whatsappUrl(shareText, page.url.href)} class="press flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0f7f43] px-4 py-2.5 text-sm font-bold text-white">
						<Icon name="whatsapp" size={17} stroke={2} />{t('pub.deal.share_whatsapp')}
					</ExternalLink>
					<button class="press grid w-11 shrink-0 place-items-center rounded-full border border-line" onclick={share} aria-label={t('pub.deal.share')}><Icon name="share" size={17} stroke={2.2} /></button>
				</div>
			</section>
		</aside>
	</div>
</div>

{#await data.more then more}
	{#if more.length}
		<section class="mx-auto mt-6 max-w-[1180px]">
			<h2 class="px-4 text-[20px] font-extrabold tracking-[-0.01em] sm:px-7">{t('pub.deal.more_from', { merchant: deal.merchant.name })}</h2>
			<div class="mt-3"><Rail arrowTop="86px">{#each more as d, i (d.id)}<DealCard deal={d} today={data.today} supabaseUrl={data.supabaseUrl} index={i} width="274px" />{/each}</Rail></div>
		</section>
	{/if}
{/await}
{#await data.similar then similar}
	{#if similar.length}
		<section class="mx-auto mt-8 max-w-[1180px]">
			<h2 class="px-4 text-[20px] font-extrabold tracking-[-0.01em] sm:px-7">{t('pub.deal.similar')}</h2>
			<div class="mt-3"><Rail arrowTop="86px">{#each similar as d, i (d.id)}<DealCard deal={d} today={data.today} supabaseUrl={data.supabaseUrl} index={i} width="274px" />{/each}</Rail></div>
		</section>
	{/if}
{/await}
{#if data.navCategories.length}
	<section class="mx-auto mt-8 mb-4 max-w-[1180px] px-4 sm:px-7">
		<h2 class="text-[20px] font-extrabold tracking-[-0.01em]">{t('pub.deal.explore')}</h2>
		<div class="mt-3 flex flex-wrap gap-2">
			{#each data.navCategories as c (c.slug)}
				<a href={resolve('/(site)/categories/[slug]', { slug: c.slug })} class="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium hover:border-roo hover:bg-roo-soft">{c.name}</a>
			{/each}
		</div>
	</section>
{/if}

{#snippet priceLines(size: 'md' | 'lg')}
	<p class="flex flex-wrap items-baseline gap-x-1.5 {size === 'lg' ? 'justify-end' : ''}">
		{#if value.was}<s class="text-[15px] text-[#888d93]">{value.was}</s>{/if}
		{#if !deal.couponCode || deal.couponPrice !== null}<span class="text-[17px] font-extrabold text-roo-ink">{value.main}</span>{/if}
		{#if value.pill}<span class="rounded bg-roo-soft px-1.5 py-0.5 text-[12px] font-extrabold text-[#8c6244]">{value.pill}</span>{/if}
	</p>
	{#if deal.couponCode}
		<p class="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-promo {size === 'lg' ? 'justify-end' : ''}">
			<span class="{size === 'lg' ? 'text-[24px]' : 'text-[20px]'} font-extrabold">{deal.couponPrice !== null ? formatRs(deal.couponPrice) : value.main}</span>
			<span class="text-[13px] font-semibold">{t('pub.card.with_code', { code: deal.couponCode })}</span>
		</p>
	{/if}
{/snippet}

{#snippet mainAction()}
	{#if action?.kind === 'copy'}
		<button class="press flex flex-1 items-center justify-center gap-2 rounded-full bg-roo-btn px-5 py-3 text-sm font-bold whitespace-nowrap text-white hover:bg-roo-btn-hover" onclick={() => copyCode(action.code)} aria-live="polite">
			<Icon name={copied ? 'check' : 'copy'} size={17} stroke={2.4} />{copied ? t('pub.deal.copied') : t('pub.deal.copy_code_short', { code: action.code })}
		</button>
	{:else if action}
		<ExternalLink href={action.href} class="press flex flex-1 items-center justify-center gap-2 rounded-full bg-roo-btn px-5 py-3 text-sm font-bold whitespace-nowrap text-white hover:bg-roo-btn-hover">
			<Icon name={action.icon} size={17} stroke={2.4} />{action.label}
		</ExternalLink>
	{:else}
		<ExternalLink href={whatsappUrl(shareText, page.url.href)} class="press flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0f7f43] px-5 py-3 text-sm font-bold whitespace-nowrap text-white">
			<Icon name="whatsapp" size={18} stroke={2} />{t('pub.deal.share_whatsapp')}
		</ExternalLink>
	{/if}
{/snippet}

<!-- Action bar on phones: the main action plus WhatsApp and share (wider screens have them on the page). -->
<div class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden" style:view-transition-name="share-bar">
	<div class="mx-auto flex max-w-md gap-2">
		{@render mainAction()}
		{#if action}
			<ExternalLink href={whatsappUrl(shareText, page.url.href)} class="press grid w-12 shrink-0 place-items-center rounded-full bg-[#0f7f43] text-white" label={t('pub.deal.share_whatsapp')}>
				<Icon name="whatsapp" size={20} stroke={2} />
			</ExternalLink>
		{/if}
		<button class="press grid w-12 shrink-0 place-items-center rounded-full border border-line bg-surface" onclick={share} aria-label={t('pub.deal.share')}>
			<Icon name="share" size={19} stroke={2.2} />
		</button>
	</div>
</div>



<style>
	.acc[open] :global(.chev) {
		transform: rotate(180deg);
	}
	.acc :global(.chev) {
		transition: transform 250ms var(--ease-out-expo);
	}
</style>
