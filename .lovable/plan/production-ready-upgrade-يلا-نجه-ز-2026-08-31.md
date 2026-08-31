# Production-Ready Upgrade — يلا نجهّز

Goal: take every customer and admin screen from "working" to premium SaaS quality, and close the functional gaps that block real usage.

## 1. Foundation polish (applies to every page)
- Loading skeletons for every data view (no blank flashes), consistent empty states with an illustration + action, and error states with retry.
- Standardized page transitions, button press/hover feedback, and reduced-motion support.
- Full RTL/a11y pass: focus rings, aria labels on icon buttons, keyboard-navigable tabs/dialogs, contrast fixes.
- Replace all `confirm()`/raw alerts with proper dialogs; consistent toast language.
- Route-level `head()` metadata (title/description/OG) on every page.
- Pagination or infinite scroll on all long lists (vendors, search, admin tables, notifications).

## 2. Customer app gaps to build
- **Messaging**: in-app conversation between a bride and a vendor, with unread badges and notifications.
- **Availability**: vendor busy dates; booking date picker blocks unavailable days and prevents double-booking.
- **Booking lifecycle**: reschedule request, cancel with reason, status timeline, downloadable booking summary.
- **Budget tracker**: per-category planned vs actual spend on the plan page, editable, wired to bookings.
- **Checklist upgrade**: add/edit/delete/reorder tasks, due dates, progress ring, reminders as notifications.
- **Guest list**: add guests, RSVP status, counts feeding the venue capacity filter.
- **Offers/promos**: vendor discounts surfaced on home and vendor cards, expiry handling.
- **Compare vendors**: pick up to 3 and compare price/rating/capacity side by side.
- **Reviews**: photo attachments, helpful votes, report abuse, verified-booking badge.
- **Account**: notification preferences, change password, delete account, saved searches, language/appearance.
- **Support**: FAQ, contact/support ticket form, terms and privacy pages.
- **Onboarding**: resumable steps, skip, and re-entry from account.

## 3. Admin app gaps to build
- **Dashboard**: real charts (bookings over time, revenue, top categories, conversion), date-range filter, KPI deltas.
- **Vendors**: bulk actions, status workflow (draft/pending/active/suspended), availability calendar editor, offers, ordering.
- **Bookings**: filters + search, status change with note, refunds/payment status, export CSV, detail drawer.
- **Users**: detail view (bookings, favorites, reviews), suspend, role management, export.
- **Reviews moderation**: approve/hide/delete queue with reported items.
- **Messaging inbox**: admin can view/respond to vendor and customer threads and support tickets.
- **Content (CMS)**: extend beyond home — categories artwork, promo banners, FAQ, legal pages, app settings (currency, cities list, support contacts).
- **Notifications**: targeted broadcasts (by city/segment), scheduled sends, history.
- **Audit log**: who changed what, visible to admins.
- **Media library**: browse/reuse uploaded files instead of one-off uploads.

## 4. Backend work
New tables (all with RLS + grants): `conversations`, `messages`, `vendor_availability`, `offers`, `guests`, `budget_items`, `support_tickets`, `saved_searches`, `audit_log`, `app_settings`, `faq`, `legal_pages`, plus columns for vendor status, review moderation, and booking cancellation reason.
Server functions for each feature, admin-guarded where relevant; realtime for messages and notifications.

## 5. Sequence
1. Backend schema + server functions
2. Foundation polish layer (skeletons/empty/error/a11y/pagination)
3. Customer features (messaging, availability, budget, checklist, guests, compare, offers, account/support)
4. Admin features (charts, moderation, inbox, CMS, audit, media library)
5. Full pass over every page for visual and interaction polish, then end-to-end verification of each workflow

This is large; I will ship it in the order above so the app stays usable throughout.
