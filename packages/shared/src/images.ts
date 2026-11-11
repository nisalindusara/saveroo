// Image sizes and public addresses for images in the Supabase Storage "media" bucket.
// An image key like "deals/2026-11/a1b2c3d4e5f6a7b8" has three files: -320, -640 and -1280 .webp.
export const IMAGE_WIDTHS = [320, 640, 1280] as const;
export type ImageWidth = (typeof IMAGE_WIDTHS)[number];
/** Performance budget: thumbnails (320 px) must stay at or under 60 KB. */
export const THUMBNAIL_MAX_BYTES = 60 * 1024;
export const IMAGE_MAX_BYTES = 1024 * 1024;

/** Public URL of one size of an uploaded image. */
export function imageUrl(supabaseUrl: string, key: string, width: ImageWidth): string {
	return `${supabaseUrl}/storage/v1/object/public/media/${key}-${width}.webp`;
}
