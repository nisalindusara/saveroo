<!--
	Image picker for admin forms: resizes in the browser, uploads, shows a preview and keeps the image key
	in `value` and its width/height in `ratio` (both bindable). With `share`, also uploads the WhatsApp/Facebook
	preview. Used for merchant logo and cover, and deal image and proof.
-->
<script lang="ts">
	import { t } from '@saveroo/shared/i18n';
	import { imageUrl } from '@saveroo/shared/images';
	import { ResizeError, prepareImage } from '#lib/admin/resize-image.js';

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
			const prepared = await prepareImage(file, { share });
			const form = new FormData();
			form.set('kind', kind);
			for (const [width, blob] of Object.entries(prepared.sizes)) form.set(`w${width}`, blob, `w${width}.webp`);
			if (prepared.share) form.set('share', prepared.share, 'share.jpg');
			const res = await fetch('/admin/images', { method: 'POST', body: form });
			const body = (await res.json()) as { data: { key: string } | null; error: { message: string } | null };
			if (!body.data) throw new Error(body.error?.message ?? t('admin.image.failed'));
			value = body.data.key;
			ratio = prepared.ratio;
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
