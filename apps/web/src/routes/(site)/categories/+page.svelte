<!--
	All categories as big colour tiles, each with its sub-categories.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import Icon from '#lib/components/public/Icon.svelte';
	import Seo from '#lib/components/public/Seo.svelte';
	import { posterColours } from '#lib/public/cards.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title={t('pub.categories.title')} description={t('pub.categories.description')} />

<div class="mx-auto max-w-7xl px-4 pt-6 md:pt-10">
	<h1 class="font-display text-[2.2rem] leading-none font-extrabold tracking-[-0.04em] md:text-5xl">{t('pub.categories.title')}</h1>
	<p class="mt-2 text-ink-2">{t('pub.categories.intro')}</p>

	<ul class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
		{#each data.categories as c, i (c.slug)}
			{@const colours = posterColours(c.slug)}
			<li class="rise" style:--i={i}>
				<a
					href={resolve('/(site)/categories/[slug]', { slug: c.slug })}
					class="tile press group relative flex h-32 flex-col justify-between overflow-hidden rounded-[1.4rem] p-4 md:h-40"
					style:background={colours.bg}
					style:color={colours.fg}
				>
					<span class="font-display text-lg leading-tight font-extrabold md:text-xl">{c.name}</span>
					<span class="flex items-end justify-between text-xs font-semibold opacity-85">
						<span class="line-clamp-2 pr-2">{c.children.map((x) => x.name).join(' · ')}</span>
						<span class="grid size-8 shrink-0 place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
							<Icon name="chevron" size={17} stroke={2.6} />
						</span>
					</span>
					<span class="blob" aria-hidden="true"></span>
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	.blob {
		position: absolute;
		right: -2.2rem;
		top: -2.2rem;
		width: 6rem;
		height: 6rem;
		border-radius: 50%;
		background: currentColor;
		opacity: 0.12;
		transition: transform 600ms var(--ease-spring);
	}
	.tile:hover .blob {
		transform: scale(1.35);
	}
</style>
