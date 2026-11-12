<!--
	Error page for every route: a friendly message and a way back home. 404s say the deal or page is gone.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '@saveroo/shared/i18n';
	import Logo from '#lib/components/public/Logo.svelte';
</script>

<svelte:head><title>{page.status} · {t('app.name')}</title><meta name="robots" content="noindex" /></svelte:head>

<div class="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 text-center">
	<a href={resolve('/(site)')} aria-label={t('pub.home_label')}><Logo /></a>
	<p class="font-display mt-10 text-[5.5rem] leading-none font-extrabold tracking-[-0.06em] text-roo">{page.status}</p>
	<h1 class="font-display mt-2 text-2xl font-bold">{page.status === 404 ? t('pub.error.not_found') : t('pub.error.title')}</h1>
	<p class="mt-2 text-ink-2">{page.error?.message}</p>
	<a href={resolve('/(site)')} class="press mt-8 rounded-full bg-ink px-6 py-3 font-semibold text-bg">{t('pub.back_home')}</a>
</div>
