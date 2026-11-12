<!--
	Login and sign-up page (same flow): email sign-in link or Google. Works without JavaScript.
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import Icon from '#lib/components/public/Icon.svelte';
	import Logo from '#lib/components/public/Logo.svelte';
	import Seo from '#lib/components/public/Seo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const field = 'w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-[1rem] outline-none focus:border-roo focus:ring-4 focus:ring-roo-soft';
</script>

<Seo title={t('auth.login_title')} description={t('auth.login_intro')} noindex />

<main class="mx-auto max-w-sm px-4 pt-10">
	<Logo size="lg" />
	<h1 class="font-display mt-6 text-[2rem] leading-tight font-extrabold tracking-tight">{t('auth.login_title')}</h1>
	<p class="mt-2 text-ink-2">{t('auth.login_intro')}</p>

	{#if form?.sent}
		<div class="rise mt-8 rounded-[1.5rem] bg-leaf-soft p-5 text-leaf" role="status">
			<Icon name="check" size={26} stroke={2.6} />
			<p class="mt-2 font-semibold">{t('auth.check_email', { email: form.email })}</p>
		</div>
	{:else}
		{#if data.callbackFailed}
			<p class="mt-6 rounded-2xl bg-roo-soft p-3.5 text-sm text-roo-ink" role="alert">{t('auth.callback_failed')}</p>
		{/if}
		{#if form?.error}
			<p class="mt-6 rounded-2xl bg-roo-soft p-3.5 text-sm text-roo-ink" role="alert">{t(`auth.${form.error}`)}</p>
		{/if}

		<form method="POST" action="?/google" class="mt-8">
			<input type="hidden" name="next" value={data.next} />
			<button type="submit" class="press flex w-full items-center justify-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 font-semibold shadow-card">
				<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
				{t('auth.google')}
			</button>
		</form>

		<div class="my-6 flex items-center gap-3 text-sm text-ink-2"><span class="h-px flex-1 bg-line"></span>{t('auth.or')}<span class="h-px flex-1 bg-line"></span></div>

		<form method="POST" action="?/email" class="space-y-3">
			<input type="hidden" name="next" value={data.next} />
			<label class="block text-sm font-semibold" for="email">{t('auth.email_label')}</label>
			<input id="email" name="email" type="email" autocomplete="email" required value={form?.error ? form.email : ''} class={field} />
			<button type="submit" class="press w-full rounded-2xl bg-ink px-4 py-3.5 font-bold text-bg">{t('auth.email_submit')}</button>
		</form>
	{/if}
</main>
