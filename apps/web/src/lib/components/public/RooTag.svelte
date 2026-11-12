<!--
	The "Roo tag": Saveroo's tilted orange price tag showing the saving ("50% / OFF").
	Used on deal cards (small, straddling the poster edge) and the deal page (large).
	The outer span carries tilt and shadow; the inner span is cut to the tag shape (a shadow on the
	cut element itself would be clipped away).
-->
<script lang="ts">
	import { savingTag } from '@saveroo/shared/deal-text';
	import type { PublicDealCard } from '@saveroo/shared';

	let { deal, size = 'sm' }: { deal: PublicDealCard; size?: 'sm' | 'lg' } = $props();
	const tag = $derived(savingTag(deal));
</script>

<span class="wrap {size}" aria-hidden="true">
	<span class="tag">
		<span class="hole"></span>
		<span class="big">{tag.big}</span>
		<span class="small">{tag.small}</span>
	</span>
</span>

<style>
	.wrap {
		display: inline-block;
		transform: rotate(-4deg);
		transform-origin: left center;
		filter: drop-shadow(0 5px 9px rgb(194 65 12 / 0.4));
		transition: transform 380ms var(--ease-spring);
	}
	.tag {
		--notch: 0.7em;
		position: relative;
		display: inline-flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		padding: 0.35em 0.7em 0.35em calc(var(--notch) + 0.55em);
		background: linear-gradient(160deg, color-mix(in srgb, var(--roo) 88%, #fff), var(--roo) 55%);
		color: #fff;
		font-family: var(--font-display);
		line-height: 0.92;
		clip-path: polygon(var(--notch) 0, 100% 0, 100% 100%, var(--notch) 100%, 0 50%);
		border-radius: 0.3em;
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
	:global(.card:hover) .wrap {
		transform: rotate(-7deg) scale(1.06);
	}
</style>
