
# يلا نجهّز — Real Application Plan

Turn the current single-file mockup into a real, multi-route Arabic mobile web app with authentication, database-backed content, and proper user flows.

## Routes (separate pages)

Public:
- `/` — Splash / landing → routes to `/auth` or onboarding
- `/auth` — Sign in & Sign up (Email + Google), forgot password
- `/auth/callback` — OAuth landing, then redirects
- `/reset-password` — set new password after email recovery
- `/onboarding` — style preferences (saved to profile)

Authenticated (`/_authenticated/*`):
- `/home` — search, hero, quick categories, "الأكثر طلباً"
- `/categories` — full grid of all categories
- `/categories/$slug` — vendor list for a category, with filters
- `/vendors/$id` — vendor details + book button
- `/favorites` — saved vendors
- `/bookings` — my bookings (list + status)
- `/bookings/$id` — booking details + payment status
- `/plan` — countdown, budget, task checklist
- `/notifications` — alerts & messages
- `/account` — profile card + settings menu
- `/account/profile` — edit profile (name, city, wedding date, budget)

## Database (new tables)

- `categories` — slug, name_ar, icon, sort_order (public read)
- `vendors` — name, city, category_id, image_url, price_from, rating, reviews_count, description, capacity, area_m2, parking (public read)
- `vendor_images` — vendor_id, url, sort (public read)
- `vendor_packages` — vendor_id, name, price, includes (public read)
- `favorites` — user_id, vendor_id (RLS per user)
- `bookings` — user_id, vendor_id, event_date, total, status (pending/confirmed/cancelled), payment_status, package_id (RLS per user)
- `wedding_tasks` — user_id, title, status (todo/progress/done), sort (RLS per user)
- `notifications` — user_id, title, body, kind, read_at (RLS per user)

`profiles` already exists — reuse it, extend with `style_preferences text[]`.

Seed `categories`, `vendors`, `vendor_images`, `vendor_packages` with realistic Arabic content via the migration. On signup, a trigger creates `profiles` + a default set of `wedding_tasks` for the new user.

All reads via TanStack Query + `createServerFn` (`requireSupabaseAuth` for user-scoped, server publishable client for public catalog).

## Auth

- Email/password sign up + sign in (zod-validated forms, toast errors)
- Google sign-in via `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth/callback" })`
- Forgot password → `/reset-password`
- `_authenticated` gate is the integration-managed layout (already in place)
- Onboarding gate: if `profiles.onboarding_completed = false`, redirect from `/home` to `/onboarding`

## User stories supported

1. New user signs up → completes onboarding (style + wedding date + budget) → lands on Home.
2. Browses categories → opens a vendor → adds to favorites (heart toggles, persisted).
3. Books a vendor on a date → booking appears in `/bookings` with status "قيد التأكيد".
4. Views `/plan`: live countdown to wedding date, budget vs spent (sum of confirmed bookings), task checklist they can tick off.
5. Receives notifications when a booking status changes (DB trigger inserts a notification row).
6. Edits profile → updates name, phone, city, wedding date, budget.
7. Signs out → redirected to `/auth`.

## Design system

Keep existing tokens (#F47BA5 / #F9AFC2 / #D4AF37 / #0D2340, Cairo/Tajawal, RTL). Extract phone-frame shell, top bar, bottom tab bar, primary/outline buttons, input field, vendor card into `src/components/app/*` so all routes share them.

## Technical details

- `src/lib/catalog.functions.ts` — `listCategories`, `listVendorsByCategory`, `getVendor` (server publishable client, public read).
- `src/lib/user.functions.ts` — `getMyProfile`, `updateMyProfile`, `completeOnboarding`, `toggleFavorite`, `listFavorites`, `createBooking`, `listBookings`, `listTasks`, `toggleTask`, `listNotifications`, `markNotificationsRead` (all `requireSupabaseAuth`).
- Root route registers single `onAuthStateChange` for SIGNED_IN/OUT/USER_UPDATED → `router.invalidate()` + query invalidation.
- `BottomTabBar` component used on every authenticated page; `<Link>` for navigation with `activeProps`.
- Forms: zod schemas + react-hook-form (already installed) + sonner toasts.
- Booking confirmation: optimistic update via TanStack Query mutation.
- Public catalog tables get `GRANT SELECT … TO anon` + a public `SELECT TRUE` policy; user tables stay `auth.uid()` scoped, `authenticated` only.

## Build order

1. Migration: new tables + grants + RLS + seed data + trigger for default tasks.
2. Shared UI components in `src/components/app/`.
3. Server functions (catalog + user).
4. Public routes: `/`, `/auth`, `/auth/callback`, `/reset-password`, `/onboarding`.
5. Authenticated routes (home, categories, category detail, vendor detail, favorites, bookings, bookings detail, plan, notifications, account, account/profile).
6. Delete the giant `src/routes/index.tsx` prototype; replace with a thin splash.
7. Wire `onAuthStateChange` once in `__root.tsx`; configure Google provider.

Approve to proceed.
