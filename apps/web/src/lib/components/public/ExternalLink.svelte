<!--
	Link that leaves Saveroo (maps, shop websites, deal sources, WhatsApp, phone). Opens in a new tab by
	default and never passes our page to the other site. Internal links use resolve() instead.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		href,
		newTab = true,
		nofollow = false,
		class: className = '',
		label,
		children
	}: { href: string; newTab?: boolean; nofollow?: boolean; class?: string; label?: string; children: Snippet } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external addresses, not app routes -->
<a {href} class={className} aria-label={label} target={newTab ? '_blank' : undefined} rel={newTab ? `noopener noreferrer${nofollow ? ' nofollow' : ''}` : undefined}>
	{@render children()}
</a>
