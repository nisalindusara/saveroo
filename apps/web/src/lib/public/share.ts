// Sharing a deal: the phone's share sheet when available, otherwise WhatsApp (the most used in Sri Lanka).
// Used by the deal page buttons.

/** WhatsApp link with the text and address filled in. */
export function whatsappUrl(text: string, url: string): string {
	return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

/** Opens the share sheet; returns false when the browser has none (or the person cancelled). */
export async function nativeShare(title: string, text: string, url: string): Promise<boolean> {
	if (!navigator.share) return false;
	try {
		await navigator.share({ title, text, url });
		return true;
	} catch {
		return false;
	}
}
