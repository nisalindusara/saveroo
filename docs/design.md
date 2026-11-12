# Design system

How Saveroo looks and moves. Public pages (M5) follow this; the Android app (M11) should feel the same. Tokens and shared classes live in `apps/web/src/routes/layout.css`; components in `apps/web/src/lib/components/public/`.

## Concept: the poster wall
Most offers arrive as images (bank and merchant posters). Posters are the star: shown at their real shape, never cropped on the deal page, on a warm paper background so mixed artwork reads like a curated gallery. Saveroo adds three things no poster has: which **day** it works (week strip), which **card** it needs (bank chips), and the **saving** at a glance (Roo tag).

## Signature elements
- **Roo tag** (`RooTag.svelte`): tilted orange price tag with a punched hole ("50% / OFF"). On cards it straddles the poster's bottom edge like a sticker so it covers little of the poster.
- **Week strip** (`WeekStrip.svelte`): M T W T F S S; valid days filled orange, today ringed. Small dots on cards, labelled pills on the deal page.
- **Bank chips** (`BankChips.svelte`): short names (`HNB`, `ComBank`) from `providerShortName`; green "Any card" when open to all.
- **Colour poster**: deals without an image get a bold colour block with the merchant name (colour stable per merchant).
- **Coupon ticket** (`CouponTicket.svelte`): perforated ticket, tap to copy, short vibration.

## Tokens
| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | #fbf7f1 | #12100e | page (warm paper) |
| `surface` / `surface-2` | #fff / #f3ece2 | #1c1916 / #27221e | cards, chips |
| `ink` / `ink-2` | #1a1410 / #6b6056 | #f6efe6 / #a99e92 | text / secondary text |
| `roo` | #ff5a1f | #ff6a33 | brand, savings, primary actions |
| `leaf` (+ `on-leaf`) | #0b7a53 | #3ccf95 | "works today", positive |
| `sun` | #f5a300 | #ffc633 | "ending soon" |
Dark mode follows the device. Text on coloured badges must pass WCAG AA (use `on-leaf` on `leaf`).

## Type
- Display: **Bricolage Grotesque** (self-hosted, latin, weights 500-800, `font-display: swap`, metric-matched fallback) for headlines, savings and names. Licence in `static/fonts/OFL.txt`.
- Body: the device's system font (zero download).
- Sinhala and Tamil (R3): add Noto Sans Sinhala / Tamil as fallbacks, subset per script.

## Layout
- Phone first (works from 360 px). Masonry: 2 columns on phones, 3 from 720 px, 4 from 1100 px, 5 from 1400 px, cards placed in the shortest column using each poster's stored shape (`image_ratio`), so nothing jumps while images load and new pages only append.
- Rails (Works today, Ending soon, More from merchant): fixed 4:5 frames; posters that do not fit are shown whole on a blurred copy of themselves.
- Phones: floating bottom bar (Home, Search, Categories, Me), hidden on deal pages, which have their own share bar and back button. Wider screens: top bar with links and search.

## Motion
- Page changes use the View Transitions API (`onNavigate` in the root layout): the tapped poster glides into the deal page hero (`view-transition-name: deal-<id>`) and back.
- Cards rise in once when they first appear (staggered); re-arranging columns never replays it.
- Press feedback (`.press`), springy tag tilt on hover, a hand-drawn underline on the home headline, a "today" pulse that stops after three beats.
- Everything respects `prefers-reduced-motion`. No endless animations (they cost battery and main-thread time).

## Performance rules
- Posters: `srcset` 320/640/1280 WebP; first cards `fetchpriority="high"`, the rest lazy. Deal hero: one 640 file for both the sharp poster and its blurred backdrop, preloaded in the head.
- Off-screen cards use `content-visibility: auto`.
- One cheap shadow per element; avoid stacked filters.
- Lighthouse mobile on staging (2026-11-12, median of 3): Home 97, Deal 95; CLS 0.

## Share previews
Deal links show a 1200x630 JPEG made in the admin's browser at upload (whole poster on a blurred backdrop, small "saveroo" label). Pages without one use `static/og-default.png`.
