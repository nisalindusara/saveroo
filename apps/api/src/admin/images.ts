// POST /admin/images: stores an image the admin's browser already resized to WebP in 3 widths, plus
// an optional 1200x630 JPEG share preview. Files go to the public "media" bucket with a long cache time;
// the reply is the image key.
import { Hono } from 'hono';
import { z } from 'zod';
import { IMAGE_MAX_BYTES, IMAGE_WIDTHS, SHARE_MAX_BYTES, THUMBNAIL_MAX_BYTES, type ApiResponse } from '@saveroo/shared';
import type { AuthEnv } from '../auth';
import { errorResponse } from '../errors';

const kindSchema = z.enum(['deals', 'merchants']);

/** WebP files start with "RIFF", 4 size bytes, then "WEBP". */
function isWebp(bytes: Uint8Array) {
	const tag = (from: number) => String.fromCharCode(...bytes.slice(from, from + 4));
	return bytes.length > 12 && tag(0) === 'RIFF' && tag(8) === 'WEBP';
}

/** JPEG files start with FF D8 FF. */
const isJpeg = (bytes: Uint8Array) => bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

function randomHex(bytes: number) {
	return [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const images = new Hono<AuthEnv>().post('/', async (c) => {
	let form: FormData;
	try {
		form = await c.req.formData();
	} catch {
		return errorResponse(c, 400, 'invalid_input', 'Send the image as a form upload.');
	}
	const kind = kindSchema.safeParse(form.get('kind'));
	if (!kind.success) return errorResponse(c, 400, 'invalid_input', 'Unknown image kind.');

	const files: { name: string; bytes: Uint8Array; contentType: string }[] = [];
	for (const width of IMAGE_WIDTHS) {
		const file = form.get(`w${width}`);
		if (!(file instanceof File)) {
			return errorResponse(c, 400, 'invalid_input', `The ${width} px image is missing.`);
		}
		const limit = width === 320 ? THUMBNAIL_MAX_BYTES : IMAGE_MAX_BYTES;
		if (file.size > limit) {
			return errorResponse(c, 413, 'image_too_large', `The ${width} px image is too large (max ${Math.round(limit / 1024)} KB).`);
		}
		const bytes = new Uint8Array(await file.arrayBuffer());
		if (!isWebp(bytes)) return errorResponse(c, 400, 'invalid_input', 'Images must be WebP.');
		files.push({ name: `${width}.webp`, bytes, contentType: 'image/webp' });
	}

	const share = form.get('share');
	if (share instanceof File) {
		if (share.size > SHARE_MAX_BYTES) {
			return errorResponse(c, 413, 'image_too_large', `The share image is too large (max ${SHARE_MAX_BYTES / 1024} KB).`);
		}
		const bytes = new Uint8Array(await share.arrayBuffer());
		if (!isJpeg(bytes)) return errorResponse(c, 400, 'invalid_input', 'The share image must be JPEG.');
		files.push({ name: 'share.jpg', bytes, contentType: 'image/jpeg' });
	}

	const month = new Date().toISOString().slice(0, 7);
	const key = `${kind.data}/${month}/${randomHex(8)}`;
	const bucket = c.get('db').storage.from('media');
	for (const { name, bytes, contentType } of files) {
		const { error } = await bucket.upload(`${key}-${name}`, bytes, {
			contentType,
			cacheControl: '31536000',
			upsert: false
		});
		if (error) {
			console.error('Image upload failed', error.message);
			return errorResponse(c, 502, 'upload_failed', 'Could not store the image. Please try again.');
		}
	}
	const body: ApiResponse<{ key: string }> = { data: { key }, error: null };
	return c.json(body, 201);
});
