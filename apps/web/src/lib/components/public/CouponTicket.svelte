<!--
	Coupon code as a perforated ticket: tap to copy, with a "Copied" confirmation and a short vibration.
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import Icon from './Icon.svelte';

	let { code }: { code: string } = $props();
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			navigator.vibrate?.(12);
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 2200);
		} catch {
			// Clipboard blocked: the code stays selectable on screen.
		}
	}
</script>

<button type="button" class="ticket press" onclick={copy} aria-label={t('pub.deal.copy_code', { code })}>
	<span class="flex flex-col items-start">
		<span class="text-[0.68rem] font-bold tracking-[0.14em] text-ink-2 uppercase">{t('pub.deal.coupon')}</span>
		<span class="font-mono text-xl font-bold tracking-wider select-all">{code}</span>
	</span>
	<span class="action {copied ? 'done' : ''}" aria-live="polite">
		<Icon name={copied ? 'check' : 'copy'} size={18} stroke={2.4} />
		{copied ? t('pub.deal.copied') : t('pub.deal.copy')}
	</span>
</button>

<style>
	.ticket {
		position: relative;
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.9rem 1.1rem 0.9rem 1.3rem;
		border-radius: 1rem;
		background: var(--roo-soft);
		border: 2px dashed color-mix(in srgb, var(--roo) 55%, transparent);
		color: var(--ink);
		text-align: left;
	}
	/* Punched holes on both sides. */
	.ticket::before,
	.ticket::after {
		content: '';
		position: absolute;
		top: 50%;
		width: 1rem;
		height: 1rem;
		margin-top: -0.5rem;
		border-radius: 50%;
		background: var(--surface);
	}
	.ticket::before {
		left: -0.6rem;
	}
	.ticket::after {
		right: -0.6rem;
	}
	.action {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.5rem 0.8rem;
		border-radius: 0.7rem;
		background: var(--roo);
		color: #fff;
		font-weight: 700;
		font-size: 0.85rem;
		transition: background 250ms;
	}
	.action.done {
		background: var(--leaf);
	}
</style>
