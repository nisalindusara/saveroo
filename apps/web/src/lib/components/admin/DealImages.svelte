<!--
	Deal photos in the admin deal form: up to 10, picked several at a time, resized and uploaded in the
	browser (each with a share preview, so any photo can become the cover). The first photo is the cover
	(cards and WhatsApp previews); photos can be moved left/right or removed. `images` is bindable.
-->
<script lang="ts">
	import { MAX_DEAL_IMAGES } from '@saveroo/shared';
	import { t } from '@saveroo/shared/i18n';
	import { imageUrl } from '@saveroo/shared/images';
	import { ResizeError } from '#lib/admin/resize-image.js';
	import { uploadImage } from '#lib/admin/upload-image.js';

	let {
		supabaseUrl,
		images = $bindable([]),
		error
	}: {
		supabaseUrl: string;
		images: { key: string; ratio: number | null }[];
		error?: string;
	} = $props();

	let busy = $state(0);
	let message = $state<string | null>(null);
	const room = $derived(MAX_DEAL_IMAGES - images.length - busy);

	async function pick(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = [...(input.files ?? [])];
		input.value = '';
		message = files.length > room ? t('admin.images.too_many', { max: MAX_DEAL_IMAGES }) : null;
		for (const file of files.slice(0, Math.max(0, room))) {
			busy++;
			try {
				images.push(await uploadImage(file, 'deals', true));
			} catch (e) {
				message = e instanceof ResizeError || e instanceof Error ? e.message : t('admin.image.failed');
			} finally {
				busy--;
			}
		}
	}

	function move(i: number, by: -1 | 1) {
		const j = i + by;
		if (j < 0 || j >= images.length) return;
		[images[i], images[j]] = [images[j]!, images[i]!];
	}
</script>

<div>
	<span class="block text-sm font-medium">{t('admin.images.label', { max: MAX_DEAL_IMAGES })}</span>
	<p class="text-xs text-gray-600">{t('admin.images.help')}</p>
	<ul class="mt-2 flex flex-wrap gap-3">
		{#each images as image, i (image.key)}
			<li class="w-28 rounded-lg border p-1.5 text-xs">
				<div class="relative">
					<img src={imageUrl(supabaseUrl, image.key, 320)} alt="" class="h-20 w-full rounded object-cover" />
					{#if i === 0}<span class="absolute top-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">{t('admin.images.cover')}</span>{/if}
				</div>
				<div class="mt-1 flex items-center justify-between">
					<button type="button" class="px-1 disabled:opacity-30" onclick={() => move(i, -1)} disabled={i === 0} aria-label={t('admin.images.left')}>←</button>
					<button type="button" class="underline" onclick={() => images.splice(i, 1)}>{t('admin.remove')}</button>
					<button type="button" class="px-1 disabled:opacity-30" onclick={() => move(i, 1)} disabled={i === images.length - 1} aria-label={t('admin.images.right')}>→</button>
				</div>
			</li>
		{/each}
		{#each { length: busy }, i (i)}
			<li class="grid h-[7.25rem] w-28 place-items-center rounded-lg border border-dashed text-xs text-gray-600">{t('admin.image.uploading')}</li>
		{/each}
		{#if room > 0}
			<li>
				<label class="grid h-[7.25rem] w-28 cursor-pointer place-items-center rounded-lg border border-dashed text-center text-sm">
					{t('admin.images.add')}
					<input type="file" accept="image/*" multiple class="sr-only" onchange={pick} />
				</label>
			</li>
		{/if}
	</ul>
	{#if message || error}<p class="mt-1 text-sm text-red-700">{message ?? error}</p>{/if}
</div>
