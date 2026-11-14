<!--
	Frame for public pages (owner's reference design): on Home a purple promo strip and the banner;
	the white header with category tabs; a black stage holding the page in a white rounded panel; a
	"deals by category" band and a grey footer.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '@saveroo/shared/i18n';
	import type { PublicHome } from '@saveroo/shared';
	import HeroCarousel from '#lib/components/public/HeroCarousel.svelte';
	import Icon from '#lib/components/public/Icon.svelte';
	import PromoStrip from '#lib/components/public/PromoStrip.svelte';
	import TopBar from '#lib/components/public/TopBar.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	// Home's data (only on Home) feeds the promo strip and the banner.
	const home = $derived(page.route.id === '/(site)' ? (page.data.home as PublicHome | undefined) : undefined);
	const dayName = $derived(t(`day.long.${data.today as 1}`));
</script>

{#if home?.ending[0]}
	<PromoStrip deal={home.ending[0]} />
{/if}

<TopBar signedIn={data.user !== null} categories={data.navCategories} />

<div class="stage pb-10 {home ? '' : 'pt-3'}">
	{#if home}
		<HeroCarousel {home} {dayName} supabaseUrl={data.supabaseUrl} />
	{/if}
	<main class="mx-auto min-h-[60vh] max-w-[1280px] rounded-[18px] bg-bg pt-5 pb-9 shadow-2xl">
		{@render children()}
	</main>
</div>

<section class="border-y border-line bg-bg px-4 py-6">
	<details class="group mx-auto max-w-[1280px]">
		<summary class="flex cursor-pointer list-none flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
			<span>
				<span class="block text-[16px] font-extrabold">{t('pub.footer.by_category')}</span>
				<span class="mt-0.5 block text-[12px] text-ink-3">{t('pub.footer.by_category_sub')}</span>
			</span>
			<span class="flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink-2 hover:bg-surface-2">
				{t('pub.footer.more_categories')}<Icon name="chevronDown" size={14} stroke={2} class="text-ink-3 transition-transform group-open:rotate-180" />
			</span>
		</summary>
		<div class="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-xs text-ink-2 sm:grid-cols-4">
			{#each data.navCategories as c (c.slug)}
				<a href={resolve('/(site)/categories/[slug]', { slug: c.slug })} class="hover:text-roo-ink">{c.name}</a>
			{/each}
		</div>
	</details>
</section>

<footer class="min-h-[260px] bg-page px-4 py-10 text-xs text-ink-3">
	<div class="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 opacity-80 sm:grid-cols-4">
		<div>
			<div class="mb-2 font-bold text-ink-2">{t('app.name')}</div>
			<p class="text-[11px] leading-relaxed">{t('pub.footer.tagline')}</p>
		</div>
		<nav aria-label={t('pub.footer.label')}>
			<div class="mb-2 font-bold text-ink-2">{t('pub.footer.browse')}</div>
			<ul class="text-[11px]">
				<li><a href={resolve('/(site)')} class="inline-block py-1.5 hover:underline">{t('pub.nav.home')}</a></li>
				<li><a href={resolve('/(site)/categories')} class="inline-block py-1.5 hover:underline">{t('pub.nav.categories')}</a></li>
				<li><a href={resolve('/(site)/search')} class="inline-block py-1.5 hover:underline">{t('pub.nav.search')}</a></li>
			</ul>
		</nav>
		<div>
			<div class="mb-2 font-bold text-ink-2">{t('pub.footer.account')}</div>
			<ul class="text-[11px]">
				<li><a href={data.user ? resolve('/(site)/me') : resolve('/(site)/login')} class="inline-block py-1.5 hover:underline">{data.user ? t('pub.nav.me') : t('auth.login')}</a></li>
			</ul>
		</div>
		<div>
			<div class="mb-2 font-bold text-ink-2">{t('pub.footer.legal')}</div>
			<p class="text-[11px] leading-relaxed">{t('pub.footer.free', { year: new Date().getFullYear() })}</p>
		</div>
	</div>
</footer>

<style>
	.stage {
		background: var(--stage);
	}
</style>
