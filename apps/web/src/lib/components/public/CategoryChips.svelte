<!--
	Scrollable category pills with a colour dot each; the active one is filled. Used on Home and category pages.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import { posterColours } from '#lib/public/cards.js';

	let {
		categories,
		active,
		allHref
	}: {
		categories: { slug: string; name: string }[];
		active?: string;
		/** Adds a first "All" pill linking here. */
		allHref?: string;
	} = $props();
</script>

<div class="rail pb-1">
	{#if allHref}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- callers pass resolved paths -->
		<a href={allHref} class="pill press {active ? '' : 'on'}">{t('pub.all')}</a>
	{/if}
	{#each categories as c (c.slug)}
		<a href={resolve('/(site)/categories/[slug]', { slug: c.slug })} class="pill press {active === c.slug ? 'on' : ''}">
			<span class="dot" style:background={posterColours(c.slug).bg}></span>
			{c.name}
		</a>
	{/each}
</div>

<style>
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.5rem 0.9rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--surface);
		font-size: 0.85rem;
		font-weight: 600;
		white-space: nowrap;
		transition:
			background 200ms,
			color 200ms;
	}
	.pill.on {
		background: var(--ink);
		color: var(--bg);
		border-color: var(--ink);
	}
	.dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 50%;
	}
</style>
