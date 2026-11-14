# Design system

How Saveroo looks and moves. Public pages (M5) follow this; the Android app (M11) should feel the same. Tokens and shared classes live in `apps/web/src/routes/layout.css`; components in `apps/web/src/lib/components/public/`.

## Source: the owner's reference design
The public pages follow a reference page the owner made (2026-11-14; kept outside git): a deal marketplace layout with a warm tan brand, a purple promo strip, a white header with category tabs, a black "stage" holding a neon-lettered banner, and the page content in a white rounded panel. We copy it exactly (sizes, colours, type, spacing; owner's instruction 2026-11-14), filled only with real data. Left out by the owner's choice because the data or feature does not exist yet: star ratings and review counts, save hearts (M7), cart, notification bell, "App" and "Sell on Saveroo" links, the quick-view pop-up (deal pages are real pages, for sharing and search engines), the decorative floating tab and the dots on card images. Deliberate differences: on phones the search box stays usable (the reference shrinks it to a button) and the banner text wraps instead of overflowing; tan text and filled buttons use a slightly darker tan where white or small text needs AA contrast; posters are shown whole on a blurred copy instead of cropped.

History: M5 first had a "poster wall" (masonry, warm paper, orange), then a "shop window" (Groupon-like, white, orange). The owner replaced both with this reference design.

## Page frame (`routes/(site)/+layout.svelte`)
- **Promo strip** (`PromoStrip.svelte`, Home only): purple-to-blue gradient; "Last chance: <deal> at <shop>", a live countdown to its end, a "Use code X" / "See deal" button; can be closed for the visit. Uses the next deal to end; hidden when none ends within a week.
- **Header** (`TopBar.svelte`, every page, sticky): tan **SAVEROO** wordmark (`Logo.svelte`), tan-bordered 44 px search pill (opens the search page), grey account pill with user icon and chevron (log in / Me); below, 13.5 px category tabs with icons that scroll sideways, with a round arrow button. Categories come from the (site) layout loader.
- **Stage**: black band behind the content. On Home it holds the **banner** (`HeroCarousel.svelte`, 126/132 px tall): slides with glowing Montserrat "neon" words, a divider, a tag, one line of copy, "USE CODE:" and a tan pill button, a glass info box on wide screens and a small line at the bottom left, a deal poster fading in on the right (loaded after the page is up: decoration must not delay the first paint). Slides are built from real data: what works today, what ends soon, a deal with a coupon code. Auto-advances every 7 s (paused on hover, off with reduced motion); arrows from 640 px, dots always.
- **Content panel**: white, rounded 18 px, max 1280 px wide, on the stage.
- **Footer**: a white "Top deals by category" band with a "More categories" drawer, then a grey footer with the wordmark, tagline and links. No bottom bar on phones (the header carries search, categories and the account link).

## Home sections
1. **Works today** (the reference's "Trending Deals"): title with a day pill; a sideways row (`Rail.svelte`) of 274 px deal cards.
2. **Ending soon** (no heading, as in the reference): 274x265 story cards (`StoryCard.svelte`): poster filling the card, dark fade, title, underlined "→ Ends tomorrow · 50% off".
3. **Featured deals** (grey panel, megaphone icon): 278 px white cards (`FeaturedCard.svelte`) with a "Featured" pill and the shop's logo box. When no deal is featured it shows **New this week** instead.
4. **Brands Featured** (grey panel, "View all" opens search, `BrandCircles.svelte`): 140 px and 68 px round shop badges, one large then a 2x2 block; logo or the name on the shop's colour; each opens the shop page.
5. **Grid** (no heading, `DealGrid.svelte`): 1 column on phones, 2 from 640 px, 3 from 1024 px; "See more" pill and loading on scroll.

## Deal card (`DealCard.svelte`)
Two sizes as in the reference: row cards (274 px wide, 172 px image, 15 px title) and grid cards (236 px image with a thin border, 16 px title). Image (posters that do not fit are shown whole on a blurred copy of themselves, never cropped); one white badge top left with a coloured icon ("Ends tomorrow" amber flame, "Works today" green check, "Popular" pink sparkle); shop in grey; bold two-line title (turns tan on hover); place ("Colombo · 3 locations" or "Online") with the **week strip** on the right; "Pay with HNB" (or green "Any card"); the tan price line (`cardValue`: "40% off" + "up to Rs 5,000", or crossed-out old price, new price and a "-40%" pill; 17 px when it stands alone); and for coupon deals the purple line "<value> with code PEAK50" (17/18.5 px).

## Deal page
Poster in a rounded panel over a blurred copy of itself (tap for full screen) with the **Roo tag** sticker (tan); shop, title, place; a **price box** like the reference's quick view (tan value, conditions, purple code line, and the main action button on wider screens); when (week strip), pay with, coupon ticket, where (branches with directions), how to use it, terms, trust line. Phones: a bottom bar with the main action (Copy code / Get directions / Visit website, or WhatsApp when there is none), WhatsApp and share. Wider screens: WhatsApp and share buttons under the price box.

## Tokens
| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` / `surface` | #ffffff | #17181b | content panel, cards |
| `surface-2` | #f2f4f7 | #24262b | pills, chips |
| `page` | #edeff3 | #0d0e10 | footer |
| `stage` | #000000 | #000000 | band behind the content |
| `ink` / `ink-2` | #191c1f / #595d62 | #eef0f3 / #a3a8b0 | text / secondary text |
| `roo` | #a67b5b | #c89d7c | brand tan: wordmark, borders, icons, large text |
| `roo-ink` | #8c6244 | #e5c194 | tan text (prices, links) |
| `roo-btn` | #8c6244 | #8c6244 | filled buttons with white text (AA 5.3:1) |
| `roo-soft` / `roo-line` | #f5ebe1 / #e2cdb8 | #33271d / #5a4433 | price box, pills |
| `promo` | #5c2d91 | #c9a6f5 | coupon code lines |
| `leaf` (+ `on-leaf`) | #0b7a53 | #3ccf95 | "Any card", "works today" |
| `sun` | #f5a300 | #ffc633 | "ending soon" |
Promo strip gradient: #592b79 → #3d2d7a → #1f3475 → #0c356a. Dark mode follows the device. Text must pass WCAG AA (Lighthouse accessibility 100 on Home).

## Type
- **Inter** (self-hosted, latin, variable 400-900, preloaded, metric-matched fallback) for all text; `font-display` maps to it.
- **Montserrat** (self-hosted, latin, variable 300-800) only for the banner's neon words (`--font-neon`).
- Licences in `static/fonts/OFL.txt`. Sinhala and Tamil (R3): add Noto Sans Sinhala / Tamil as fallbacks, subset per script.

## Motion
- Page changes use the View Transitions API (`onNavigate` in the root layout): the tapped card image glides into the deal page poster (`view-transition-name: deal-<id>`) and back.
- Cards rise in once (staggered) and lift 2 px on hover with a slight image zoom; banner slides slide; press feedback (`.press`).
- Everything respects `prefers-reduced-motion`. No endless animations; the banner's timer pauses on hover and in hidden tabs.

## Performance rules
- Posters: `srcset` 320/640/1280 WebP; first cards `fetchpriority="high"`, the rest lazy. Deal page: one 640 file for both the sharp poster and its blurred backdrop, preloaded in the head. Banner backgrounds: the 320 file, loaded after the page is up.
- Off-screen cards use `content-visibility: auto`. One cheap shadow per element.
- Lighthouse mobile on the staging preview (2026-11-14, exact-copy version, median of 3): Home 95 (accessibility 100), Deal 95; CLS 0.

## Share previews
Deal links show a 1200x630 JPEG made in the admin's browser at upload (whole poster on a blurred backdrop, small tan "SAVEROO" label). Pages without one use `static/og-default.jpg` (black stage, neon "SAVE BEFORE YOU PAY", 70 KB).
