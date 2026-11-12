<!--
	The "Roo tag": Saveroo's tilted orange price tag showing the saving ("50% / OFF").
	Used on deal cards (small) and the deal page (large).
-->
<script lang="ts">
	import { savingTag } from '@saveroo/shared/deal-text';
	import type { PublicDealCard } from '@saveroo/shared';

	let { deal, size = 'sm' }: { deal: PublicDealCard; size?: 'sm' | 'lg' } = $props();
	const tag = $derived(savingTag(deal));
</script>

<span class="tag {size}" aria-hidden="true">
	<span class="hole"></span>
	<span class="big">{tag.big}</span>
	<span class="small">{tag.small}</span>
</span>

<style>
	.tag {
		--notch: 0.7em;
		position: relative;
		display: inline-flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		padding: 0.35em 0.7em 0.35em calc(var(--notch) + 0.55em);
		background: var(--roo);
		color: #fff;
		font-family: var(--font-display);
		line-height: 0.92;
		transform: rotate(-4deg);
		transform-origin: left center;
		clip-path: polygon(var(--notch) 0, 100% 0, 100% 100%, var(--notch) 100%, 0 50%);
		border-radius: 0.3em;
		filter: drop-shadow(0 4px 10px rgb(194 65 12 / 0.35));
		transition: transform 380ms var(--ease-spring);
	}
	.hole {
		position: absolute;
		left: calc(var(--notch) * 0.75);
		top: 50%;
		width: 0.32em;
		height: 0.32em;
		margin-top: -0.16em;
		border-radius: 50%;
		background: var(--bg);
	}
	.big {
		font-weight: 800;
		letter-spacing: -0.02em;
		font-size: 1.15em;
	}
	.small {
		font-weight: 700;
		font-size: 0.58em;
		letter-spacing: 0.12em;
		margin-top: 0.12em;
		opacity: 0.92;
	}
	.sm {
		font-size: 0.95rem;
	}
	.lg {
		font-size: 1.9rem;
		transform: rotate(-3deg);
	}
	:global(.card:hover) .tag {
		transform: rotate(-7deg) scale(1.06);
	}
</style>
