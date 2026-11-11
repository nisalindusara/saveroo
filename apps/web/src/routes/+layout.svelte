<!--
	Shell for every page: global styles, favicon and a minimal header with log in / log out.
	The full navigation (Home, Search, Wallet, Saved, Profile) arrives with the public pages in M5.
-->
<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="mx-auto flex max-w-md items-center justify-between gap-4 px-4 py-3 text-sm">
	<a href={resolve('/')} class="font-bold">{t('app.name')}</a>
	{#if data.user}
		<form method="POST" action="/logout" class="flex items-center gap-3">
			<span class="truncate text-gray-600">{t('auth.signed_in_as', { email: data.user.email ?? '' })}</span>
			<button type="submit" class="shrink-0 underline">{t('auth.logout')}</button>
		</form>
	{:else}
		<a href={resolve('/login')} class="underline">{t('auth.login')}</a>
	{/if}
</header>

{@render children()}
