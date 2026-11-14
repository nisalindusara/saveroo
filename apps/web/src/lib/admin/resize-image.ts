// Browser-only: prepares an uploaded photo. Resizes to WebP at 320, 640 and 1280 px wide (the 320 px
// thumbnail squeezed under the 60 KB budget), measures its shape, and for deal images draws the
// 1200x630 JPEG share preview used by WhatsApp and Facebook. Used by the admin ImageField.
import {
	IMAGE_MAX_BYTES,
	IMAGE_WIDTHS,
	SHARE_HEIGHT,
	SHARE_MAX_BYTES,
	SHARE_WIDTH,
	THUMBNAIL_MAX_BYTES,
	type ImageWidth
} from '@saveroo/shared/images';

const QUALITIES = [0.82, 0.72, 0.62, 0.52, 0.42];

export class ResizeError extends Error {}

function canvas2d(width: number, height: number) {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new ResizeError('This browser cannot resize images.');
	ctx.imageSmoothingQuality = 'high';
	return { canvas, ctx };
}

/** Encodes the canvas, lowering quality until it fits `maxBytes`. */
async function fit(canvas: HTMLCanvasElement, type: 'image/webp' | 'image/jpeg', maxBytes: number): Promise<Blob> {
	for (const quality of QUALITIES) {
		const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, type, quality));
		// Browsers that cannot make WebP (older Safari) fall back to PNG.
		if (!blob || blob.type !== type) {
			throw new ResizeError('This browser cannot make WebP images. Please use Chrome or Edge.');
		}
		if (blob.size <= maxBytes) return blob;
	}
	throw new ResizeError('The image is too detailed to fit the size limit. Try a simpler or smaller photo.');
}

async function encode(bitmap: ImageBitmap, width: number, maxBytes: number): Promise<Blob> {
	const scale = Math.min(1, width / bitmap.width);
	const { canvas, ctx } = canvas2d(
		Math.max(1, Math.round(bitmap.width * scale)),
		Math.max(1, Math.round(bitmap.height * scale))
	);
	ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	return fit(canvas, 'image/webp', maxBytes);
}

/**
 * Share preview: the whole poster (never cropped) centred on a blurred, darkened copy of itself,
 * with a small "Saveroo" label. Link previews show this next to the deal title.
 */
async function sharePreview(bitmap: ImageBitmap): Promise<Blob> {
	const { canvas, ctx } = canvas2d(SHARE_WIDTH, SHARE_HEIGHT);
	const cover = Math.max(SHARE_WIDTH / bitmap.width, SHARE_HEIGHT / bitmap.height);
	ctx.fillStyle = '#1c1714';
	ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);
	ctx.filter = 'blur(28px) saturate(1.3)';
	ctx.drawImage(
		bitmap,
		(SHARE_WIDTH - bitmap.width * cover) / 2,
		(SHARE_HEIGHT - bitmap.height * cover) / 2,
		bitmap.width * cover,
		bitmap.height * cover
	);
	ctx.filter = 'none';
	ctx.fillStyle = 'rgba(20, 16, 12, 0.35)';
	ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);

	const pad = 36;
	const contain = Math.min((SHARE_WIDTH - pad * 2) / bitmap.width, (SHARE_HEIGHT - pad * 2) / bitmap.height);
	const w = bitmap.width * contain;
	const h = bitmap.height * contain;
	const x = (SHARE_WIDTH - w) / 2;
	const y = (SHARE_HEIGHT - h) / 2;
	ctx.save();
	ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
	ctx.shadowBlur = 40;
	ctx.shadowOffsetY = 12;
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, 18);
	ctx.fillStyle = '#000';
	ctx.fill();
	ctx.restore();
	ctx.save();
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, 18);
	ctx.clip();
	ctx.drawImage(bitmap, x, y, w, h);
	ctx.restore();

	// "SAVEROO" label, bottom right.
	ctx.font = '900 26px system-ui, -apple-system, "Segoe UI", sans-serif';
	const label = 'SAVEROO';
	const labelWidth = ctx.measureText(label).width + 36;
	ctx.fillStyle = '#a67b5b';
	ctx.beginPath();
	ctx.roundRect(SHARE_WIDTH - labelWidth - 24, SHARE_HEIGHT - 70, labelWidth, 46, 23);
	ctx.fill();
	ctx.fillStyle = '#fff';
	ctx.fillText(label, SHARE_WIDTH - labelWidth - 6, SHARE_HEIGHT - 38);

	return fit(canvas, 'image/jpeg', SHARE_MAX_BYTES);
}

export type PreparedImage = { sizes: Record<ImageWidth, Blob>; ratio: number; share: Blob | null };

/** Prepares `file` for upload: three WebP sizes (never upscaled), its width/height ratio, and the share preview. */
export async function prepareImage(file: File, options: { share: boolean }): Promise<PreparedImage> {
	if (!file.type.startsWith('image/')) throw new ResizeError('Please choose an image file.');
	const bitmap = await createImageBitmap(file).catch(() => {
		throw new ResizeError('This image could not be read. Try a JPEG or PNG.');
	});
	try {
		const sizes = {} as Record<ImageWidth, Blob>;
		for (const width of IMAGE_WIDTHS) {
			sizes[width] = await encode(bitmap, width, width === 320 ? THUMBNAIL_MAX_BYTES : IMAGE_MAX_BYTES);
		}
		const ratio = Math.min(5, Math.max(0.2, Math.round((bitmap.width / bitmap.height) * 1000) / 1000));
		return { sizes, ratio, share: options.share ? await sharePreview(bitmap) : null };
	} finally {
		bitmap.close();
	}
}
