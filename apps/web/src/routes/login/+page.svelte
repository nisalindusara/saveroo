<!--
	Login and sign-up page (same flow): email sign-in link or Google. Works without JavaScript.
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{t('auth.login_title')} · {t('app.name')}</title>
</svelte:head>

<main class="mx-auto max-w-sm px-4 py-12">
	<h1 class="text-2xl font-bold">{t('auth.login_title')}</h1>
	<p class="mt-2 text-gray-600">{t('auth.login_intro')}</p>

	{#if form?.sent}
		<p class="mt-8 rounded-lg bg-green-50 p-4 text-green-800" role="status">
			{t('auth.check_email', { email: form.email })}
		</p>
	{:else}
		{#if data.callbackFailed}
			<p class="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
				{t('auth.callback_failed')}
			</p>
		{/if}
		{#if form?.error}
			<p class="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
				{t(`auth.${form.error}`)}
			</p>
		{/if}

		<form method="POST" action="?/email" class="mt-8 space-y-3">
			<input type="hidden" name="next" value={data.next} />
			<label class="block text-sm font-medium" for="email">{t('auth.email_label')}</label>
			<input
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				required
				value={form?.error ? form.email : ''}
				class="w-full rounded-lg border border-gray-300 px-3 py-2"
			/>
			<button type="submit" class="w-full rounded-lg bg-black px-4 py-2 font-medium text-white">
				{t('auth.email_submit')}
			</button>
		</form>

		<p class="my-6 text-center text-sm text-gray-500">{t('auth.or')}</p>

		<form method="POST" action="?/google">
			<input type="hidden" name="next" value={data.next} />
			<button type="submit" class="w-full rounded-lg border border-gray-300 px-4 py-2 font-medium">
				{t('auth.google')}
			</button>
		</form>
	{/if}
</main>
