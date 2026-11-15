<!--
	Deal photos on the deal page. One photo: shown whole at its own shape (never full width; the page puts
	the gallery in its left column). Several: a main photo with arrows and a row of thumbnails; on phones
	the photos swipe sideways with a "2 / 5" counter. Tapping a photo opens a full-screen viewer with
	previous/next (arrow keys too). Posters are never cropped: each sits on a blurred copy of itself.
	The first photo continues the card's view transition from the feed.
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import { imageSrcset, imageUrl } from '@saveroo/shared/images';
	import Icon from './Icon.svelte';

	let {
		images,
		title,
		dealId,
		supabaseUrl,
		onshare
	}: {
		images: { key: string; ratio: number | null }[];
		title: string;
		dealId: string;
		supabaseUrl: string;
		onshare: () => void;
	} = $props();

	let current = $state(0);
	let viewer = $state<HTMLDialogElement>();
	let strip = $state<HTMLElement>();
	const many = $derived(images.length > 1);
	const main = $derived(images[current]!);

	function go(i: number) {
		current = (i + images.length) % images.length;
		// Phones: keep the swipe strip in step with the arrows and thumbnails.
		strip?.children[current]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
	}
	function onStripScroll() {
		if (!strip) return;
		current = Math.round(strip.scrollLeft / strip.clientWidth);
	}
	function open(i: number) {
		current = i;
		viewer?.showModal();
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') go(current + 1);
		if (e.key === 'ArrowLeft') go(current - 1);
	}
</script>

<div class="relative">
	<!-- Phones: swipe strip -->
	<div bind:this={strip} onscroll={onStripScroll} class="strip flex snap-x snap-mandatory overflow-x-auto rounded-xl md:hidden">
		{#each images as image, i (image.key)}
			<button type="button" class="frame relative w-full shrink-0 snap-center" onclick={() => open(i)} aria-label={t('pub.deal.zoom')} style:view-transition-name={i === 0 ? `deal-${dealId}` : undefined}>
				<img src={imageUrl(supabaseUrl, image.key, 320)} alt="" aria-hidden="true" class="backdrop" loading={i === 0 ? 'eager' : 'lazy'} />
				<img src={imageUrl(supabaseUrl, image.key, 640)} srcset={imageSrcset(supabaseUrl, image.key)} sizes="94vw" alt={i === 0 ? title : ''} class="relative h-full w-full object-contain" loading={i === 0 ? 'eager' : 'lazy'} fetchpriority={i === 0 ? 'high' : 'auto'} />
			</button>
		{/each}
	</div>

	<!-- Wider screens: main photo -->
	<button
		type="button"
		class="frame relative hidden w-full overflow-hidden rounded-xl md:block"
		style:aspect-ratio={!many && main.ratio ? Math.min(Math.max(main.ratio, 0.75), 1.9) : undefined}
		onclick={() => open(current)}
		aria-label={t('pub.deal.zoom')}
		style:view-transition-name="deal-{dealId}"
	>
		<img src={imageUrl(supabaseUrl, main.key, 320)} alt="" aria-hidden="true" class="backdrop" />
		<img src={imageUrl(supabaseUrl, main.key, 1280)} srcset={imageSrcset(supabaseUrl, main.key)} sizes="(min-width: 1180px) 620px, 55vw" alt={title} class="relative h-full w-full object-contain" />
	</button>

	<!-- Controls over the photo -->
	<button class="round absolute top-3 right-3 z-10" onclick={onshare} aria-label={t('pub.deal.share')}><Icon name="share" size={18} stroke={2.2} /></button>
	{#if many}
		<button class="round absolute top-1/2 left-3 z-10 hidden -translate-y-1/2 md:grid" onclick={() => go(current - 1)} aria-label={t('pub.gallery.prev')}><Icon name="back" size={18} stroke={2.2} /></button>
		<button class="round absolute top-1/2 right-3 z-10 hidden -translate-y-1/2 md:grid" onclick={() => go(current + 1)} aria-label={t('pub.gallery.next')}><Icon name="chevron" size={20} stroke={2.2} /></button>
		<span class="count absolute bottom-3 left-3 z-10 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white">{current + 1} / {images.length}</span>
	{/if}
	<button class="count absolute right-3 bottom-3 z-10 hidden rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white md:block" onclick={() => open(current)}>
		{many ? t('pub.gallery.see_all', { count: images.length }) : t('pub.deal.see_poster')}
	</button>
</div>

{#if many}
	<div class="mt-2.5 hidden gap-2 overflow-x-auto pb-1 md:flex" role="tablist" aria-label={t('pub.gallery.label')}>
		{#each images as image, i (image.key)}
			<button type="button" role="tab" aria-selected={i === current} class="thumb shrink-0 overflow-hidden rounded-lg {i === current ? 'on' : ''}" onclick={() => go(i)} aria-label={t('pub.gallery.photo', { n: i + 1 })}>
				<img src={imageUrl(supabaseUrl, image.key, 320)} alt="" loading="lazy" class="h-full w-full object-cover" />
			</button>
		{/each}
	</div>
{/if}

<dialog bind:this={viewer} class="viewer" onkeydown={onKey} aria-label={title}>
	<button class="absolute inset-0 cursor-zoom-out" onclick={() => viewer?.close()} aria-label={t('pub.close')}></button>
	<img src={imageUrl(supabaseUrl, main.key, 1280)} alt={title} class="relative max-h-[100dvh] max-w-full object-contain" />
	<button class="round absolute top-4 right-4" onclick={() => viewer?.close()} aria-label={t('pub.close')}><Icon name="x" size={20} stroke={2.4} /></button>
	{#if many}
		<button class="round absolute top-1/2 left-4 -translate-y-1/2" onclick={() => go(current - 1)} aria-label={t('pub.gallery.prev')}><Icon name="back" size={20} stroke={2.2} /></button>
		<button class="round absolute top-1/2 right-4 -translate-y-1/2" onclick={() => go(current + 1)} aria-label={t('pub.gallery.next')}><Icon name="chevron" size={22} stroke={2.2} /></button>
		<span class="count absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-sm font-semibold text-white">{current + 1} / {images.length}</span>
	{/if}
</dialog>

<style>
	.frame {
		height: clamp(16rem, 80vw, 26rem);
		background: var(--surface-2);
		overflow: hidden;
		cursor: zoom-in;
	}
	@media (min-width: 768px) {
		.frame {
			height: auto;
			max-height: 34rem;
			min-height: 18rem;
		}
	}
	.strip {
		scrollbar-width: none;
	}
	.strip::-webkit-scrollbar {
		display: none;
	}
	.backdrop {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: blur(30px) saturate(1.3);
		transform: scale(1.25);
		opacity: 0.7;
	}
	.round {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.92);
		color: #191c1f;
		box-shadow: 0 2px 10px rgb(0 0 0 / 0.18);
	}
	.count {
		background: rgb(0 0 0 / 0.65);
	}
	.thumb {
		width: 5.5rem;
		height: 3.6rem;
		border: 2px solid transparent;
		opacity: 0.75;
		transition: opacity 150ms, border-color 150ms;
	}
	.thumb.on,
	.thumb:hover {
		opacity: 1;
		border-color: var(--roo);
	}
	.viewer {
		width: 100vw;
		height: 100dvh;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: rgb(10 8 6 / 0.94);
	}
	.viewer[open] {
		display: grid;
		place-items: center;
	}
	.viewer::backdrop {
		background: transparent;
	}
</style>
