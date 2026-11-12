<!--
	"Me": signed-in email, log out and (for admins) the admin link; visitors get the sign-in invitation.
	Wallet, saved deals and settings arrive here from M6.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '@saveroo/shared/i18n';
	import Icon from '#lib/components/public/Icon.svelte';
	import Logo from '#lib/components/public/Logo.svelte';
	import Seo from '#lib/components/public/Seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title={t('pub.nav.me')} description={t('pub.me.description')} noindex />

<div class="mx-auto max-w-md px-4 pt-8">
	{#if data.user}
		<div class="rounded-[1.75rem] bg-ink p-6 text-bg">
			<span class="grid size-14 place-items-center rounded-2xl bg-roo text-2xl font-extrabold text-white">{(data.user.email ?? '?')[0]?.toUpperCase()}</span>
			<p class="mt-4 text-sm opacity-70">{t('pub.me.signed_in')}</p>
			<p class="font-display text-xl font-bold break-all">{data.user.email}</p>
		</div>
		<p class="mt-6 rounded-2xl border border-dashed border-line p-4 text-sm text-ink-2">{t('pub.me.coming')}</p>
		{#if data.isAdmin}
			<a href={resolve('/admin')} class="press mt-4 flex items-center justify-between rounded-2xl border border-line bg-surface p-4 font-semibold">
				{t('pub.me.admin')}<Icon name="chevron" size={18} stroke={2.4} />
			</a>
		{/if}
		<form method="POST" action="/logout" class="mt-3">
			<button class="press w-full rounded-2xl bg-surface-2 p-4 font-semibold">{t('auth.logout')}</button>
		</form>
	{:else}
		<div class="text-center">
			<Logo size="lg" />
			<h1 class="font-display mt-6 text-3xl leading-tight font-extrabold tracking-tight">{t('pub.me.title')}</h1>
			<p class="mt-3 text-ink-2">{t('pub.me.pitch')}</p>
			<a href={resolve('/(site)/login')} class="press mt-6 inline-flex items-center gap-2 rounded-2xl bg-roo px-6 py-3.5 font-bold text-white shadow-card">
				{t('auth.login_title')}<Icon name="chevron" size={18} stroke={2.6} />
			</a>
		</div>
	{/if}
</div>
