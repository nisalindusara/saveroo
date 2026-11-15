<!--
	Purple strip above the header on Home (owner's reference design): a line of text, a live countdown
	to its end and a button ("Use Code X" or "See deal"). Filled by the (site) layout from the strip
	promotion, or from the next deal to end when there is none. Can be closed for the visit.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '@saveroo/shared/i18n';
	import Icon from './Icon.svelte';

	let {
		id,
		text,
		endsAt,
		code,
		href
	}: { id: string; text: string; endsAt: string | null; code: string | null; href: string } = $props();
	let closed = $state(false);
	let now = $state(Date.now());

	const left = $derived(Math.max(0, new Date(endsAt ?? 0).getTime() - now));
	const countdown = $derived.by(() => {
		const s = Math.floor(left / 1000);
		const hours = Math.floor(s / 3600);
		if (hours >= 100) return t('pub.promo.days', { days: Math.floor(hours / 24) });
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${pad(hours)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
	});

	onMount(() => {
		try {
			closed = sessionStorage.getItem('promo-closed') === id;
		} catch {
			// Storage blocked: the strip just shows again.
		}
		const timer = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(timer);
	});

	function close() {
		closed = true;
		try {
			sessionStorage.setItem('promo-closed', id);
		} catch {
			// Storage blocked: closed for this page view only.
		}
	}
</script>

{#if !closed}
	<div class="strip relative flex min-h-[54px] items-center justify-center px-4 py-2 text-white">
		<div class="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-x-6 gap-y-1.5 pr-9 sm:pr-0">
			<span class="text-center text-[0.86rem] font-bold tracking-[-0.01em] sm:text-[0.94rem]">
				{text}
			</span>
			<div class="flex items-center gap-4">
				{#if endsAt}
					<div class="flex flex-col leading-[1.15]">
						<span class="text-[0.72rem] text-white/95">{t('pub.promo.ends_in')}</span>
						<span class="text-[0.82rem] font-extrabold tracking-tight tabular-nums">{countdown}</span>
					</div>
				{/if}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- the layout passes a resolved path -->
				<a {href}
					class="press rounded-full bg-[#eff1f4] px-4 py-1.5 text-[0.82rem] font-semibold whitespace-nowrap text-[#111827] hover:bg-white"
				>
					{code ? t('pub.promo.use_code', { code }) : t('pub.promo.see_deal')}
				</a>
			</div>
		</div>
		<button
			class="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 sm:right-[7.5%]"
			onclick={close}
			aria-label={t('pub.close')}
		>
			<Icon name="x" size={14} stroke={1.9} />
		</button>
	</div>
{/if}

<style>
	.strip {
		background: linear-gradient(90deg, #592b79 0%, #3d2d7a 36%, #1f3475 68%, #0c356a 100%);
	}
</style>
