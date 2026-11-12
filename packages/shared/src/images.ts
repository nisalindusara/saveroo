// Image sizes and public addresses for images in the Supabase Storage "media" bucket.
// An image key like "deals/2026-11/a1b2c3d4e5f6a7b8" has -320, -640 and -1280 .webp files, and
// (deal images uploaded from M5) a -share.jpg for WhatsApp and Facebook link previews.
export const IMAGE_WIDTHS = [320, 640, 1280] as const;
export type ImageWidth = (typeof IMAGE_WIDTHS)[number];
/** Performance budget: thumbnails (320 px) must stay at or under 60 KB. */
export const THUMBNAIL_MAX_BYTES = 60 * 1024;
export const IMAGE_MAX_BYTES = 1024 * 1024;
/** Share preview: 1200 x 630 JPEG, under 300 KB so WhatsApp shows it. */
export const SHARE_WIDTH = 1200;
export const SHARE_HEIGHT = 630;
export const SHARE_MAX_BYTES = 300 * 1024;

/** Public URL of one size of an uploaded image. */
export function imageUrl(supabaseUrl: string, key: string, width: ImageWidth): string {
	return `${supabaseUrl}/storage/v1/object/public/media/${key}-${width}.webp`;
}

/** Public URL of the share preview JPEG of an uploaded deal image. */
export function shareImageUrl(supabaseUrl: string, key: string): string {
	return `${supabaseUrl}/storage/v1/object/public/media/${key}-share.jpg`;
}

/** `srcset` value listing the WebP sizes, for responsive <img> tags. */
export function imageSrcset(supabaseUrl: string, key: string): string {
	return IMAGE_WIDTHS.map((w) => `${imageUrl(supabaseUrl, key, w)} ${w}w`).join(', ');
}
