<!--
	Category shortcuts on Home: a scrolling row of round icons with names (all on one row on wide
	screens), ending with "All". One tap from opening the app to a category's deals.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import type { PublicCategory } from '@saveroo/shared';
	import Icon, { categoryIcon } from './Icon.svelte';

	let { categories }: { categories: PublicCategory[] } = $props();
</script>

<nav class="rail cats mx-auto max-w-7xl py-1" aria-label={t('pub.nav.categories')}>
	{#each categories as c (c.slug)}
		<a href={resolve('/(site)/categories/[slug]', { slug: c.slug })} class="item press group">
			<span class="disc"><Icon name={categoryIcon(c.icon)} size={24} stroke={1.9} /></span>
			<span class="name line-clamp-2">{c.name}</span>
		</a>
	{/each}
	<a href={resolve('/(site)/categories')} class="item press group">
		<span class="disc"><Icon name="grid" size={22} stroke={1.9} /></span>
		<span class="name line-clamp-2">{t('pub.all')}</span>
	</a>
</nav>

<style>
	.cats {
		gap: 0.4rem;
	}
	.item {
		display: flex;
		width: 4.6rem;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		text-align: center;
	}
	.disc {
		display: grid;
		place-items: center;
		width: 3.25rem;
		height: 3.25rem;
		border-radius: 50%;
		background: var(--surface-2);
		color: var(--ink);
		transition:
			background 200ms,
			color 200ms,
			transform 300ms var(--ease-spring);
	}
	.item:hover .disc {
		background: var(--roo-soft);
		color: var(--roo-ink);
		transform: translateY(-2px);
	}
	.name {
		font-size: 0.72rem;
		font-weight: 600;
		line-height: 1.2;
	}
</style>
