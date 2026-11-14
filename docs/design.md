# Design system

How Saveroo looks and moves. Public pages (M5) follow this; the Android app (M11) should feel the same. Tokens and shared classes live in `apps/web/src/routes/layout.css`; components in `apps/web/src/lib/components/public/`.

## Source: the owner's reference design
The public pages follow a reference page the owner made (2026-11-14; kept outside git): a deal marketplace layout with a warm tan brand, a purple promo strip, a white header with category tabs, a black "stage" holding a neon-lettered banner, and the page content in a white rounded panel. We use its layout, colours, type and components, filled only with real data. Parts of the reference that need data or features we do not have yet are left out: star ratings and review counts, save hearts (M7), cart, notifications, "Sell on Saveroo", the quick-view pop-up (deal pages are real pages, for sharing and search engines).

History: M5 first had a "poster wall" (masonry, warm paper, orange), then a "shop window" (Groupon-like, white, orange). The owner replaced both with this reference design.

## Page frame (`routes/(site)/+layout.svelte`)
- **Promo strip** (`PromoStrip.svelte`, Home only): purple-to-blue gradient; "Last chance: <deal> at <shop>", a live countdown to its end, a "Use code X" / "See deal" button; can be closed for the visit. Uses the next deal to end; hidden when none ends within a week.
- **Header** (`TopBar.svelte`, every page, sticky): tan **SAVEROO** wordmark (`Logo.svelte`), tan-bordered search pill (opens the search page), account pill (log in / Me); below, category tabs with icons that scroll sideways, with an arrow button. Categories come from the (site) layout loader.
- **Stage**: black band behind the content. On Home it holds the **banner** (`HeroCarousel.svelte`): slides with glowing Montserrat "neon" words, a tag, one line of copy and a tan pill button, a deal poster fading in on the right (loaded after the page is up: decoration must not delay the first paint). Slides are built from real data: what works today, what ends soon, a deal with a coupon code. Auto-advances every 7 s (paused on hover, off with reduced motion); arrows from 640 px, dots always.
- **Content panel**: white, rounded 18 px, max 1280 px wide, on the stage.
- **Footer**: a white "Top deals by category" band with a "More categories" drawer, then a grey footer with the wordmark, tagline and links. No bottom bar on phones (the header carries search, categories and the account link).

## Home sections
1. **Works today**: title with a day pill; a sideways row (`Rail.svelte`) of 17rem deal cards.
2. **Ending soon**: tall story cards (`StoryCard.svelte`): poster filling the card, dark fade, title, underlined "→ Ends tomorrow · 50% off".
3. **Featured deals** (grey panel): white cards (`FeaturedCard.svelte`) with a "Featured" pill and the shop's logo box. When no deal is featured it shows **New this week** instead.
4. **Shops with offers** (grey panel, `BrandCircles.svelte`): round shop badges, one large then a 2x2 block of small ones; logo or the name on the shop's colour; each opens the shop page.
5. **All offers**: grid (`DealGrid.svelte`), 1 column on phones, 2 from 640 px, 3 from 1024 px; "See more" pill and loading on scroll.

## Deal card (`DealCard.svelte`)
Image in a 16:10 frame with a thin border (posters that do not fit are shown whole on a blurred copy of themselves, never cropped); one white badge top left with a coloured icon ("Ends tomorrow" amber flame, "Works today" green check, "Popular" pink sparkle); shop in grey; bold two-line title (turns tan on hover); place ("Colombo · 3 locations" or "Online") with the **week strip** on the right; "Pay with HNB" (or green "Any card"); the **value line** in tan (`cardValue`: "40% off" + "up to Rs 5,000", or crossed-out old price, new price and a "-40%" pill); and a purple **"Use code PEAK50"** line when there is a coupon.

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
- Lighthouse mobile on the staging preview (2026-11-14, median of 3): Home 94 (accessibility 100), Deal 93-95; CLS 0.

## Share previews
Deal links show a 1200x630 JPEG made in the admin's browser at upload (whole poster on a blurred backdrop, small tan "SAVEROO" label). Pages without one use `static/og-default.jpg` (black stage, neon "SAVE BEFORE YOU PAY", 70 KB).
