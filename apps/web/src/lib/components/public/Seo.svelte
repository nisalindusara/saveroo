<!--
	Page title, description, canonical address and share-preview tags (WhatsApp, Facebook, X), plus
	optional structured data for Google. Every public page renders one.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { t } from '@saveroo/shared/i18n';

	let {
		title,
		description,
		image,
		imageAlt,
		type = 'website',
		jsonLd,
		noindex = false
	}: {
		title: string;
		description: string;
		/** Absolute JPEG/PNG address, about 1200x630. Defaults to the Saveroo share image. */
		image?: string;
		imageAlt?: string;
		type?: 'website' | 'article';
		jsonLd?: Record<string, unknown>;
		noindex?: boolean;
	} = $props();

	const fullTitle = $derived(title === t('app.name') ? `${title} · ${t('pub.seo.tagline')}` : `${title} · ${t('app.name')}`);
	const canonical = $derived(`${page.url.origin}${page.url.pathname}`);
	const shareImage = $derived(image ?? `${page.url.origin}/og-default.jpg`);
	const ld = $derived(jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</` + 'script>' : '');
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}<meta name="robots" content="noindex" />{/if}
	<meta property="og:site_name" content={t('app.name')} />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={shareImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	{#if imageAlt}<meta property="og:image:alt" content={imageAlt} />{/if}
	<meta property="og:locale" content="en_LK" />
	<meta name="twitter:card" content="summary_large_image" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD built from our own data, "<" escaped -->
	{@html ld}
</svelte:head>
