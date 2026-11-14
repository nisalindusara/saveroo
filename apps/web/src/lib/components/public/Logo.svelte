<!--
	Saveroo wordmark: "SAVEROO" in heavy tan letters (owner's reference design). Used in the top bar,
	footer, sign-in, Me, error and admin pages.
-->
<script lang="ts">
	let { size = 'md' }: { size?: 'md' | 'lg' } = $props();
</script>

<span class="wordmark {size === 'lg' ? 'text-[2.1rem]' : 'text-[1.6rem] sm:text-[1.75rem]'}">SAVEROO</span>

<style>
	.wordmark {
		display: inline-block;
		color: var(--roo);
		font-family: var(--font-display);
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 1;
		user-select: none;
	}
</style>
