<!--
	Horizontal row of cards that scrolls sideways (swipe on phones). On wider screens it adds round
	back/forward buttons, since a mouse cannot swipe. Used for Home and deal page card rows.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { t } from '@saveroo/shared/i18n';
	import Icon from './Icon.svelte';

	let { children }: { children: Snippet } = $props();
	let el = $state<HTMLElement>();
	let atStart = $state(true);
	let atEnd = $state(true);

	function update() {
		if (!el) return;
		atStart = el.scrollLeft < 8;
		atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
	}
	function go(direction: 1 | -1) {
		el?.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
	}
	onMount(update);
</script>

<div class="relative mx-auto max-w-7xl">
	<div bind:this={el} class="rail pb-2" onscroll={update}>
		{@render children()}
	</div>
	{#if !atStart}
		<button class="arrow press left-1" onclick={() => go(-1)} aria-label={t('pub.rail.back')}><Icon name="back" size={20} stroke={2.4} /></button>
	{/if}
	{#if !atEnd}
		<button class="arrow press right-1" onclick={() => go(1)} aria-label={t('pub.rail.forward')}><Icon name="chevron" size={22} stroke={2.4} /></button>
	{/if}
</div>

<style>
	.arrow {
		position: absolute;
		/* Middle of a 15rem-wide card's 4:3 image. */
		top: 5.6rem;
		translate: 0 -50%;
		display: none;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		background: var(--surface);
		color: var(--ink);
		border: 1px solid var(--line);
		box-shadow: var(--shadow);
	}
	@media (min-width: 768px) {
		.arrow {
			display: grid;
		}
	}
</style>
