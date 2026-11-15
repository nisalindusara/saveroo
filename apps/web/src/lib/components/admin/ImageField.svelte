<!--
	Image picker for admin forms: resizes in the browser, uploads, shows a preview and keeps the image key
	in `value` and its width/height in `ratio` (both bindable). With `share`, also uploads the WhatsApp/Facebook
	preview. Used for merchant logo and cover, and the deal proof image (deal photos use DealImages).
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import { imageUrl } from '@saveroo/shared/images';
	import { ResizeError } from '#lib/admin/resize-image.js';
	import { uploadImage } from '#lib/admin/upload-image.js';

	let {
		label,
		kind,
		supabaseUrl,
		value = $bindable(null),
		ratio = $bindable(null),
		share = false,
		error
	}: {
		label: string;
		kind: 'deals' | 'merchants';
		supabaseUrl: string;
		value: string | null;
		ratio?: number | null;
		share?: boolean;
		error?: string;
	} = $props();

	let busy = $state(false);
	let message = $state<string | null>(null);

	async function pick(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		busy = true;
		message = null;
		try {
			const uploaded = await uploadImage(file, kind, share);
			value = uploaded.key;
			ratio = uploaded.ratio;
		} catch (e) {
			message = e instanceof ResizeError || e instanceof Error ? e.message : t('admin.image.failed');
		} finally {
			busy = false;
		}
	}
</script>

<div>
	<span class="block text-sm font-medium">{label}</span>
	<div class="mt-1 flex items-center gap-3">
		{#if value}
			<img src={imageUrl(supabaseUrl, value, 320)} alt="" class="h-16 w-24 rounded border object-cover" />
		{/if}
		<label class="cursor-pointer rounded-lg border px-3 py-1.5 text-sm {busy ? 'opacity-50' : ''}">
			{busy ? t('admin.image.uploading') : value ? t('admin.image.replace') : t('admin.image.choose')}
			<input type="file" accept="image/*" class="sr-only" disabled={busy} onchange={pick} />
		</label>
		{#if value && !busy}
			<button type="button" class="text-sm underline" onclick={() => ((value = null), (ratio = null))}>{t('admin.remove')}</button>
		{/if}
	</div>
	{#if message || error}<p class="mt-1 text-sm text-red-700">{message ?? error}</p>{/if}
</div>
