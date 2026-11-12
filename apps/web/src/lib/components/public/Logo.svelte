<!--
	Saveroo wordmark: the tilted Roo tag mark plus "saveroo" in the display face.
-->
<script lang="ts">
	let { size = 'md' }: { size?: 'md' | 'lg' } = $props();
</script>

<span class="inline-flex items-center gap-1.5 {size === 'lg' ? 'text-3xl' : 'text-[1.35rem]'}">
	<svg viewBox="0 0 64 64" class="mark" aria-hidden="true">
		<g transform="rotate(-8 32 32)">
			<path fill="var(--roo)" d="M18 8h34a6 6 0 0 1 6 6v36a6 6 0 0 1-6 6H18L6 32z" />
			<circle cx="17" cy="32" r="4" fill="var(--bg)" />
		</g>
	</svg>
	<span class="font-display font-extrabold tracking-[-0.04em] text-ink">saveroo</span>
</span>

<style>
	.mark {
		width: 1.05em;
		height: 1.05em;
		transition: transform 500ms var(--ease-spring);
	}
	:global(a:hover) > span > .mark {
		transform: rotate(-14deg) scale(1.08);
	}
</style>
