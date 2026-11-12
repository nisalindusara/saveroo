<!--
	Which weekdays a deal works on, with today ringed. Small = 7 dots for cards; large = labelled days
	for the deal page. Days are 1 = Mon .. 7 = Sun (Colombo); no days means every day.
-->
<script lang="ts">
	import { daysText } from '@saveroo/shared/deal-text';
	import { t } from '@saveroo/shared/i18n';

	let { days, today, size = 'sm' }: { days: number[]; today: number; size?: 'sm' | 'lg' } = $props();
	const WEEK = [1, 2, 3, 4, 5, 6, 7] as const;
	const on = (d: number) => days.length === 0 || days.includes(d);
</script>

<span class="strip {size}" role="img" aria-label={t('pub.valid_on', { days: daysText(days) })}>
	{#each WEEK as d (d)}
		<span class="day" class:on={on(d)} class:today={d === today}>
			{#if size === 'lg'}<span class="name">{t(`day.letter.${d}`)}</span>{/if}
		</span>
	{/each}
</span>

<style>
	.strip {
		display: inline-flex;
		align-items: center;
	}
	.sm {
		gap: 3px;
	}
	.sm .day {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--line);
	}
	.sm .day.on {
		background: var(--roo);
	}
	.sm .day.today {
		box-shadow: 0 0 0 1.5px var(--bg), 0 0 0 3px var(--ink);
	}
	.lg {
		gap: 6px;
	}
	.lg .day {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.8rem;
		background: var(--surface-2);
		color: var(--ink-2);
		font-weight: 700;
		font-size: 0.8rem;
		transition: transform 300ms var(--ease-spring);
	}
	.lg .day.on {
		background: var(--roo);
		color: #fff;
	}
	.lg .day.today {
		box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--ink);
		transform: translateY(-2px);
	}
	@media (max-width: 360px) {
		.lg .day {
			width: 2rem;
			height: 2rem;
		}
	}
</style>
