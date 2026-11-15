<!--
	When a deal works, on the deal page: a summary line (valid days, end date, and today or the next
	valid day) and the next 7 real dates as small day tiles ("Sun 15"), each marked valid or not, with
	today outlined. A day is valid when its weekday is allowed, it is inside the deal's dates and it is
	not a blackout date. `compact` shows only the summary line.
-->
<script lang="ts">
	import { daysShort } from '@saveroo/shared/deal-text';
	import { t } from '@saveroo/shared/i18n';
	import { colomboDate, colomboUpcomingDays, formatColomboDate } from '@saveroo/shared/time';
	import Icon from './Icon.svelte';

	let {
		validDays,
		startsAt,
		endsAt,
		blackout = [],
		compact = false
	}: {
		validDays: number[];
		startsAt: string;
		endsAt: string | null;
		/** "YYYY-MM-DD" dates the deal does not work. */
		blackout?: string[];
		compact?: boolean;
	} = $props();

	const first = $derived(colomboDate(startsAt));
	const last = $derived(endsAt ? colomboDate(endsAt) : null);
	const ok = (d: { date: string; dow: number }) =>
		(validDays.length === 0 || validDays.includes(d.dow)) && d.date >= first && (last === null || d.date <= last) && !blackout.includes(d.date);

	const week = $derived(colomboUpcomingDays(7).map((d) => ({ ...d, valid: ok(d) })));
	const worksToday = $derived(week[0]!.valid);
	// Next valid day within the next 4 weeks (none when the deal ends first).
	const next = $derived(worksToday ? null : (colomboUpcomingDays(28).find(ok) ?? null));
	const name = (dow: number) => t(`day.short.${dow as 1}`);
</script>

<div>
	<p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px]">
		<span class="flex items-center gap-1.5 font-semibold text-ink"><Icon name="calendar" size={16} stroke={2} />{daysShort(validDays)}</span>
		<span class="text-ink-2">· {last ? t('pub.dates.until', { date: formatColomboDate(endsAt!) }) : t('pub.dates.no_end')}</span>
		{#if worksToday}
			<span class="flex items-center gap-1 rounded-full bg-leaf-soft px-2 py-0.5 text-[12.5px] font-semibold text-leaf"><Icon name="check" size={13} stroke={2.8} />{t('pub.deal.works_today')}</span>
		{:else if next}
			<span class="rounded-full bg-surface-2 px-2 py-0.5 text-[12.5px] font-semibold text-ink-2">{t('pub.dates.next', { day: `${name(next.dow)} ${next.day} ${next.month}` })}</span>
		{/if}
	</p>

	{#if !compact}
		<ol class="mt-3 grid grid-cols-7 gap-1.5" aria-label={t('pub.dates.next_week')}>
			{#each week as d, i (d.date)}
				<li class="tile {d.valid ? 'valid' : ''} {i === 0 ? 'today' : ''}" aria-label="{name(d.dow)} {d.day} {d.month}: {d.valid ? t('pub.dates.valid') : t('pub.dates.not_valid')}">
					<span class="text-[11px] font-semibold uppercase">{i === 0 ? t('pub.dates.today') : name(d.dow)}</span>
					<span class="text-[17px] leading-tight font-extrabold">{d.day}</span>
					<span class="mark" aria-hidden="true">
						{#if d.valid}<Icon name="check" size={12} stroke={3} />{:else}–{/if}
					</span>
				</li>
			{/each}
		</ol>
	{/if}
</div>

<style>
	.tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		padding: 0.45rem 0 0.4rem;
		border-radius: 0.6rem;
		border: 1px solid var(--line);
		background: var(--surface-2);
		color: var(--ink-3);
	}
	.tile.valid {
		background: var(--roo-soft);
		border-color: var(--roo-line);
		color: var(--roo-ink);
	}
	.tile.today {
		outline: 2px solid var(--ink);
		outline-offset: 1px;
	}
	.mark {
		display: grid;
		place-items: center;
		height: 0.9rem;
		font-size: 12px;
		font-weight: 700;
	}
</style>
