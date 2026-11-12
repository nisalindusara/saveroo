# Design system

How Saveroo looks and moves. Public pages (M5) follow this; the Android app (M11) should feel the same. Tokens and shared classes live in `apps/web/src/routes/layout.css`; components in `apps/web/src/lib/components/public/`.

## Concept: the shop window
No friction between opening the app and saving money (owner's reference: Groupon's deal grid). Every card answers, without opening it: **what** (title), **where** (city and number of locations, or Online), **how much** (a big value line: "40% off · up to Rs 5,000", or a crossed-out price), **with what** (the bank, or the coupon code) and **when** (week strip and a badge). Posters (most offers arrive as images) sit in one 4:3 frame so rows line up; posters that do not fit are shown whole on a blurred copy of themselves, never cropped, so their text stays readable. Clean white page; Saveroo's orange, Roo tag and week strip keep it ours.

History: the first M5 design was a "poster wall" (masonry at each poster's own shape on a warm paper background). The owner found it not exciting enough and chose the shop-window direction (2026-11-12).

## Signature elements
- **Value line** (`cardValue` in `packages/shared/src/deal-text.ts`): the saving in big orange type, the cap or minimum spend in small grey, or old price crossed out, new price and a green "-40%" pill. Same on cards (small) and the deal page (large, in a soft orange box).
- **Card badge** (`cardBadge` in `cards.ts`): one per card, on the image: "Last day" / "Ends tomorrow" / "Ends in N days" (sun) first, then "Works today" (leaf), then "Popular" (featured).
- **Roo tag** (`RooTag.svelte`): tilted orange price tag with a punched hole ("50% / OFF"), stuck on the deal page poster's corner like a sticker.
- **Week strip** (`WeekStrip.svelte`): M T W T F S S; valid days filled orange, today ringed. Small dots on cards, labelled pills on the deal page.
- **Pay with** line on cards: short bank names (`HNB`, `ComBank`) from `providerShortName`, green "Any card" when open to all, and "code PEAK50" in a dashed box when there is a coupon.
- **Category icons** (`CategoryNav.svelte`): round icons with names under the top bar on Home; icon names come from `categories.icon`.
- **Colour poster**: deals without an image get a bold colour block with the merchant name (colour stable per merchant) and the big value line.
- **Coupon ticket** (`CouponTicket.svelte`): perforated ticket, tap to copy, short vibration.

## Tokens
| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | #ffffff | #12100e | page |
| `surface` / `surface-2` | #fff / #f4f2ef | #1c1916 / #27221e | cards, chips, icon discs |
| `ink` / `ink-2` | #17120e / #675d54 | #f6efe6 / #a99e92 | text / secondary text |
| `roo` | #ff5a1f | #ff6a33 | brand, savings, primary actions |
| `leaf` (+ `on-leaf`) | #0b7a53 | #3ccf95 | "works today", positive |
| `sun` | #f5a300 | #ffc633 | "ending soon" |
Dark mode follows the device. Text on coloured badges must pass WCAG AA (use `on-leaf` on `leaf`).

## Type
- Display: **Bricolage Grotesque** (self-hosted, latin, weights 500-800, `font-display: swap`, metric-matched fallback) for headlines, savings and names. Licence in `static/fonts/OFL.txt`.
- Body: the device's system font (zero download).
- Sinhala and Tamil (R3): add Noto Sans Sinhala / Tamil as fallbacks, subset per script.

## Layout
- Phone first (works from 360 px). Top bar on every page: logo and search box (phones too), plus Categories and log in on wider screens.
- Home: category icons, a dark "today" banner ("8 offers work today", best saving, button to the Works today row), Works today and Ending soon rows, then all offers in a grid.
- Grid (`DealGrid.svelte`): even rows, 1 column on phones, 2 from 560 px, 3 from 900 px, 4 from 1200 px. Infinite loading with a "Load more" button.
- Rows (`Rail.svelte`): 15rem cards that scroll sideways; round back/forward buttons from 768 px (a mouse cannot swipe).
- Deal page: poster with the Roo tag sticker, then shop, title, where, value box, when, pay with, coupon, branches, how to use it, terms. Bottom action bar: the main action (Copy code / Get directions / Visit website) plus WhatsApp and share; WhatsApp becomes the main button when there is no other action.
- Phones: floating bottom bar (Home, Search, Categories, Me), hidden on deal pages.

## Motion
- Page changes use the View Transitions API (`onNavigate` in the root layout): the tapped poster glides into the deal page hero (`view-transition-name: deal-<id>`) and back.
- Cards rise in once when they first appear (staggered).
- Press feedback (`.press`), springy tag tilt on hover, a hand-drawn underline on the home headline, a "today" pulse that stops after three beats.
- Everything respects `prefers-reduced-motion`. No endless animations (they cost battery and main-thread time).

## Performance rules
- Posters: `srcset` 320/640/1280 WebP; first cards `fetchpriority="high"`, the rest lazy. Deal hero: one 640 file for both the sharp poster and its blurred backdrop, preloaded in the head.
- Off-screen cards use `content-visibility: auto`.
- One cheap shadow per element; avoid stacked filters.
- Lighthouse mobile on staging (2026-11-12, median of 3): poster wall Home 97, Deal 95; CLS 0. Shop window measured side by side with the poster wall on a busy machine: same range (Home 95-96 vs 86-97, Deal 88-95 vs 81-92 in the better runs); recheck medians on a quiet machine before going live.

## Share previews
Deal links show a 1200x630 JPEG made in the admin's browser at upload (whole poster on a blurred backdrop, small "saveroo" label). Pages without one use `static/og-default.png`.
