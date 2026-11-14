<!--
	Home banner on the black stage (owner's reference design): short slides with glowing "neon" words,
	one line of copy, a pill button and a deal poster fading in on the right. Slides come from real data:
	what works today, what ends soon, and a deal with a coupon code. Moves on every 7 seconds (paused on
	hover, off when the device asks for less motion); arrows and dots to switch.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { cardValue } from '@saveroo/shared/deal-text';
	import { t } from '@saveroo/shared/i18n';
	import { imageUrl } from '@saveroo/shared/images';
	import type { PublicHome } from '@saveroo/shared';
	import Icon from './Icon.svelte';

	let { home, dayName, supabaseUrl }: { home: PublicHome; dayName: string; supabaseUrl: string } = $props();

	type Slide = { top: string; bottom: string; tag: string; copy: string; strong: string; button: string; href: string; image: string | null };

	const slides = $derived.by(() => {
		const list: Slide[] = [];
		const best = Math.max(0, ...home.today.map((d) => (d.dealType === 'cashback' ? 0 : (d.discountPercent ?? 0))));
		if (home.today.length) {
			list.push({
				top: t('pub.hero.today_top'),
				bottom: dayName.toUpperCase(),
				tag: t('pub.hero.today_tag'),
				copy: t('pub.hero.today_copy', { count: home.counts.today }),
				strong: best ? t('pub.hero.up_to', { percent: best }) : '',
				button: t('pub.hero.see_them'),
				href: '#today',
				image: home.today.find((d) => d.imageKey)?.imageKey ?? null
			});
		}
		if (home.ending.length) {
			list.push({
				top: t('pub.hero.ending_top'),
				bottom: t('pub.hero.ending_bottom'),
				tag: t('pub.hero.ending_tag'),
				copy: t('pub.hero.ending_copy', { count: home.ending.length }),
				strong: '',
				button: t('pub.hero.see_them'),
				href: '#ending',
				image: home.ending.find((d) => d.imageKey)?.imageKey ?? null
			});
		}
		const coded = [...home.today, ...home.ending, ...home.latest].find((d) => d.couponCode);
		if (coded) {
			list.push({
				top: t('pub.hero.code_top'),
				bottom: coded.couponCode!,
				tag: coded.merchant.name,
				copy: coded.title,
				strong: cardValue(coded).main,
				button: coded.couponCode!,
				href: resolve('/(site)/deals/[slug]', { slug: coded.slug }),
				image: coded.imageKey
			});
		}
		return list;
	});

	let index = $state(0);
	// The poster behind each slide is decoration: load it after the page is up, so it never delays
	// the first paint of the deals.
	let showImages = $state(false);
	let paused = $state(false);
	const go = (i: number) => (index = (i + slides.length) % slides.length);

	onMount(() => {
		showImages = true;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const timer = setInterval(() => !paused && !document.hidden && slides.length > 1 && go(index + 1), 7000);
		return () => clearInterval(timer);
	});
</script>

{#if slides.length}
	<div class="mx-auto max-w-[1280px] px-3 pt-2.5 pb-3 sm:px-4 xl:px-0">
		<section
			class="hero group relative overflow-hidden rounded-[14px] border border-white/15 bg-black select-none"
			onmouseenter={() => (paused = true)}
			onmouseleave={() => (paused = false)}
			aria-roledescription="carousel"
			aria-label={t('pub.hero.label')}
		>
			<div class="track flex" style:transform="translateX(-{index * 100}%)">
				{#each slides as s, i (i)}
					<div class="relative flex min-h-[132px] w-full shrink-0 items-center overflow-hidden" aria-hidden={i !== index} inert={i !== index}>
						{#if s.image && showImages}
							<div class="absolute inset-y-0 right-0 w-full overflow-hidden md:w-[58%]">
								<img src={imageUrl(supabaseUrl, s.image, 320)} alt="" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" class="bg-img h-full w-full object-cover" />
								<div class="fade absolute inset-0"></div>
							</div>
						{/if}
						<div class="relative z-10 flex w-full flex-wrap items-center gap-x-9 gap-y-2 px-5 pt-4 pb-7 sm:flex-nowrap sm:py-4 sm:pr-12 sm:pl-16">
							<div class="shrink-0 leading-none">
								<div class="neon-top text-[1.35rem] sm:text-[1.7rem] lg:text-[1.9rem]">{s.top}</div>
								<div class="neon-bottom mt-0.5 text-[1.35rem] sm:text-[1.7rem] lg:text-[1.9rem]">{s.bottom}</div>
							</div>
							<div class="divider hidden h-12 w-px shrink-0 sm:block"></div>
							<div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-6">
								<div class="min-w-0">
									<span class="tag mb-1 inline-block rounded-full px-2 py-0.5 text-[0.62rem] font-bold tracking-[0.15em] uppercase">{s.tag}</span>
									<p class="line-clamp-2 text-[0.88rem] leading-tight font-semibold text-white sm:text-base">
										{s.copy}{#if s.strong} — <span class="font-extrabold text-[#ebd5b3]">{s.strong}</span>{/if}
									</p>
								</div>
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- in-page anchors or resolved deal paths -->
								<a href={s.href} class="pill press self-start rounded-full px-4 py-1.5 text-[0.82rem] font-extrabold whitespace-nowrap text-white sm:self-auto">{s.button}</a>
							</div>
						</div>
					</div>
				{/each}
			</div>

			{#if slides.length > 1}
				<button class="arrow left-2.5" onclick={() => go(index - 1)} aria-label={t('pub.hero.prev')}><Icon name="back" size={15} stroke={2.4} /></button>
				<button class="arrow right-2.5" onclick={() => go(index + 1)} aria-label={t('pub.hero.next')}><Icon name="chevron" size={16} stroke={2.4} /></button>
				<div class="absolute bottom-0.5 left-1/2 z-30 flex -translate-x-1/2 items-center rounded-full border border-white/15 bg-black/55 px-1">
					{#each slides, i}
						<button class="hit" onclick={() => go(i)} aria-label={t('pub.hero.slide', { n: i + 1 })} aria-current={i === index}><span class="dot {i === index ? 'on' : ''}"></span></button>
					{/each}
				</div>
			{/if}
		</section>
	</div>
{/if}

<style>
	.hero {
		box-shadow: 0 10px 30px rgb(0 0 0 / 0.85);
	}
	.track {
		transition: transform 500ms var(--ease-out-expo);
	}
	.bg-img {
		opacity: 0;
		animation: show 600ms ease forwards;
	}
	@keyframes show {
		to {
			opacity: 0.5;
		}
	}
	@media (min-width: 768px) {
		@keyframes show {
			to {
				opacity: 0.8;
			}
		}
	}
	.fade {
		background: linear-gradient(to right, #000 0%, rgb(0 0 0 / 0.75) 45%, rgb(0 0 0 / 0.2) 100%);
	}
	@media (max-width: 767px) {
		.bg-img {
		opacity: 0;
		animation: show 600ms ease forwards;
	}
	@keyframes show {
		to {
			opacity: 0.5;
		}
	}
	@media (min-width: 768px) {
		@keyframes show {
			to {
				opacity: 0.8;
			}
		}
	}
	.fade {
			background: linear-gradient(to right, rgb(0 0 0 / 0.92) 0%, rgb(0 0 0 / 0.7) 60%, rgb(0 0 0 / 0.4) 100%);
		}
	}
	/* Warm tan "neon tube" lettering. */
	.neon-top,
	.neon-bottom {
		font-family: var(--font-neon);
		line-height: 1.02;
		white-space: nowrap;
	}
	.neon-top {
		font-weight: 500;
		letter-spacing: 0.06em;
		color: #fff6e9;
		text-shadow:
			0 0 6px rgb(229 193 148 / 0.95),
			0 0 16px rgb(198 151 105 / 0.85),
			0 0 34px rgb(166 123 91 / 0.75);
	}
	.neon-bottom {
		font-weight: 300;
		letter-spacing: 0.08em;
		color: #f3dec3;
		text-shadow:
			0 0 6px rgb(229 193 148 / 0.9),
			0 0 18px rgb(198 151 105 / 0.75),
			0 0 32px rgb(166 123 91 / 0.6);
	}
	.divider {
		background: linear-gradient(to bottom, transparent, rgb(200 157 124 / 0.5), transparent);
	}
	.tag {
		color: #e5c194;
		background: rgb(166 123 91 / 0.25);
		border: 1px solid rgb(200 157 124 / 0.3);
	}
	.pill {
		background: #8c6244;
		border: 1px solid rgb(229 193 148 / 0.4);
		box-shadow: 0 0 18px rgb(166 123 91 / 0.7);
	}
	.pill:hover {
		background: #7d5a3c;
	}
	.arrow {
		position: absolute;
		top: 50%;
		z-index: 30;
		display: none;
		place-items: center;
		width: 2rem;
		height: 2rem;
		translate: 0 -50%;
		border-radius: 50%;
		background: rgb(0 0 0 / 0.65);
		color: #fff;
		border: 1px solid rgb(255 255 255 / 0.25);
		transition:
			background 150ms,
			color 150ms;
	}
	@media (min-width: 640px) {
		.arrow {
			display: grid;
		}
	}
	.arrow:hover {
		background: #fff;
		color: #111;
	}
	.hit {
		display: grid;
		place-items: center;
		min-width: 1.5rem;
		height: 1.5rem;
		padding-inline: 0.15rem;
	}
	.dot {
		display: block;
		width: 0.5rem;
		height: 0.375rem;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.4);
		transition: width 300ms;
	}
	.dot.on {
		width: 1.5rem;
		background: #c89d7c;
	}
</style>
