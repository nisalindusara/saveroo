<!--
	Shell for every page: global styles, icons and smooth page changes (View Transitions where the
	browser supports them, skipped when the user prefers less motion). Public pages add their own
	header and bottom bar in (site)/+layout.svelte; the admin area has its own.
-->
<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { onNavigate } from '$app/navigation';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		// Same page with a new query (search typing, filters): no transition.
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<meta name="theme-color" content="#fbf7f1" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#12100e" media="(prefers-color-scheme: dark)" />
</svelte:head>

{@render children()}
