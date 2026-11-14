<!--
	A titled section of a page (owner's reference design: bold 24 px title, optional item on the right,
	such as a pill or a "View all" link); the content goes in the slot. Used on Home.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		id,
		right,
		children
	}: {
		title: string;
		/** Anchor for in-page links ("#today"). */
		id?: string;
		right?: Snippet;
		children: Snippet;
	} = $props();
</script>

<section {id} class="mb-9 scroll-mt-32">
	<div class="mb-4 flex items-center justify-between gap-3 px-4 sm:px-7">
		<h2 class="text-[1.375rem] font-extrabold tracking-[-0.02em] sm:text-2xl">{title}</h2>
		{#if right}{@render right()}{/if}
	</div>
	{@render children()}
</section>
