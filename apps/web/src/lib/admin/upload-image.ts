// Resizes an image in the browser and uploads it through the admin API; returns its key and shape.
// Used by the admin ImageField (one image) and DealImages (deal photos).
import { t } from '@saveroo/shared/i18n';
import { prepareImage } from './resize-image.js';

export async function uploadImage(
	file: File,
	kind: 'deals' | 'merchants',
	share: boolean
): Promise<{ key: string; ratio: number }> {
	const prepared = await prepareImage(file, { share });
	const form = new FormData();
	form.set('kind', kind);
	for (const [width, blob] of Object.entries(prepared.sizes)) form.set(`w${width}`, blob, `w${width}.webp`);
	if (prepared.share) form.set('share', prepared.share, 'share.jpg');
	const res = await fetch('/admin/images', { method: 'POST', body: form });
	const body = (await res.json()) as { data: { key: string } | null; error: { message: string } | null };
	if (!body.data) throw new Error(body.error?.message ?? t('admin.image.failed'));
	return { key: body.data.key, ratio: prepared.ratio };
}
