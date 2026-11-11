// Browser-only: resizes a photo to WebP at 320, 640 and 1280 px wide before upload.
// Used by the admin ImageField; the 320 px thumbnail is squeezed under the 60 KB budget.
import { IMAGE_MAX_BYTES, IMAGE_WIDTHS, THUMBNAIL_MAX_BYTES, type ImageWidth } from '@saveroo/shared/images';

const QUALITIES = [0.82, 0.72, 0.62, 0.52, 0.42];

export class ResizeError extends Error {}

async function encode(bitmap: ImageBitmap, width: number, maxBytes: number): Promise<Blob> {
	const scale = Math.min(1, width / bitmap.width);
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(bitmap.width * scale));
	canvas.height = Math.max(1, Math.round(bitmap.height * scale));
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new ResizeError('This browser cannot resize images.');
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

	for (const quality of QUALITIES) {
		const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/webp', quality));
		// Browsers that cannot make WebP (older Safari) fall back to PNG.
		if (!blob || blob.type !== 'image/webp') {
			throw new ResizeError('This browser cannot make WebP images. Please use Chrome or Edge.');
		}
		if (blob.size <= maxBytes) return blob;
	}
	throw new ResizeError('The image is too detailed to fit the size limit. Try a simpler or smaller photo.');
}

/** Resizes `file` into the three upload sizes (never upscales). */
export async function resizeToWebp(file: File): Promise<Record<ImageWidth, Blob>> {
	if (!file.type.startsWith('image/')) throw new ResizeError('Please choose an image file.');
	const bitmap = await createImageBitmap(file).catch(() => {
		throw new ResizeError('This image could not be read. Try a JPEG or PNG.');
	});
	try {
		const out = {} as Record<ImageWidth, Blob>;
		for (const width of IMAGE_WIDTHS) {
			out[width] = await encode(bitmap, width, width === 320 ? THUMBNAIL_MAX_BYTES : IMAGE_MAX_BYTES);
		}
		return out;
	} finally {
		bitmap.close();
	}
}
