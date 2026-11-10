# Screens and flows

Release 1 screens exist on web (responsive from 360 px) and Android. Later screens are listed so the navigation leaves room for them.

## Navigation
Bottom bar (mobile) or top bar (web): **Home, Search, Wallet, Saved, Profile**. Share-to-Saveroo and notifications are reachable from Home.

## Onboarding (R1)
1. Welcome: one sentence on what Saveroo does.
2. Pick your cards, banks, telco and loyalty programs (skippable, editable later in Wallet).
3. Pick interests (categories) and district.
4. Explain notifications and ask permission with the reason ("so we can tell you the day your card offer is valid").
5. Land on Home with a personalized feed.
Language choice is added to this flow in R3.

## Core screens (R1)
- **Home:** search bar, "Ending soon", "Valid today for your cards", "New", categories, nearby (by district).
- **Search:** typed query, filters (category, card, discount, online/in-store, expiry), recent searches.
- **Category list**
- **Deal detail:** title, merchant, saving in LKR, eligible cards (green tick if yours), valid days with next valid date, terms, how to redeem, source link, last checked, coupon code if any, Save, Remind me, Share, Report.
- **Merchant page:** logo, branches and hours, all active offers, Follow.
- **Wallet:** cards and programs, "Best card for..." merchant lookup, savings from offers I can use.
- **Saved:** saved deals with expiry and valid-day reminders.
- **Follows:** merchants, brands, categories, keywords.
- **Notifications inbox**
- **Share-to-Saveroo landing:** receives a shared link, shows the matching merchant's best offers for the user's wallet; unknown store shows search plus "Request this store".
- **Account:** sign in (email link or Google), profile, notification preferences (quiet hours, daily cap, digest), privacy and data export or deletion, how Saveroo earns money.
- **Public web pages:** merchant, deal and category pages open to everyone without login, with SEO tags and share preview images.

## Admin screens (R1, web only, role admin)
- Dashboard: live deals, expiring soon, needs recheck, drafts.
- Merchants and branches: create, edit, logo upload.
- Deal form: all deal fields, eligibility picker, valid-day editor, coupon codes, images, preview, publish, pause.
- Bulk import (CSV) with error report.
- Duplicate warnings and recheck queue.
- Audit log.

## Later screens
- **R2:** map, Shopping Mode (start/stop, nearby), product lookup and barcode scan, price history, wishlist, community post form, votes and comments, savings tracker, premium plan page and Card Optimizer, extension popup.
- **R3:** referral, language settings, badges.
- **R4:** merchant portal, campaign builder, QR verification page.

## Key flows
1. **Find the best card:** open a merchant -> see best offer for my cards and the next valid date -> tap Remind me -> reminder fires the morning of the valid day.
2. **New deal alert:** follow a merchant or keyword -> admin publishes a matching deal -> matching job creates a notification within 5 minutes, respecting quiet hours and daily cap.
3. **Share-to-Saveroo:** share a store or product link from any app -> Saveroo opens with that merchant's best offers for my cards.
4. **Admin posts a deal:** open deal form -> fill fields and eligibility and valid days -> preview -> publish -> deal appears on feed and triggers matching.
