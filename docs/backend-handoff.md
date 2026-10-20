# Notes for polygrid-backend — from the frontend

Things the frontend found while building against the API. The frontend
treats the backend as read-only, so none of these are fixed. Each item
gives where the problem is, what it does, and what the frontend needs.
Ordered by priority.

_Last updated: 2026-10-19 — after the email-verification pages and the
first slice of the Admin Dashboard (Overview, Verifications, Plans,
Subscriptions)._

---

## Bugs

### 1. Profile search results have no `id`

**Where:** the list handlers in `consultancyProfileController.ts`
(~L345–352), `contractorProfileController.ts` (~L302–309),
`laborProfileController.ts` (~L315–322) and `storeProfileController.ts`
(~L337–345).

**What happens:** these handlers use `Model.aggregate()`. That returns
plain objects with no `.id` virtual, so `toPublic*Profile()` sends
`id: undefined` for every result. The single-profile GET is fine.
`digitalProductController` and `jobOpeningController` already handle
this by adding `id: doc._id` after the mapper.

**Fix:** do the same thing in those four handlers: spread the mapper,
then set `id: doc._id.toString()`.

**Frontend workaround for now:** browse cards use `slug` (falling back
to `userId`) as their key and link.

### 2. Granting a subscription leaves the old one "active"

**Where:** `grantSubscription` in `subscriptionController.ts`.

**What happens:** it creates a new subscription and moves
`user.currentSubscription` to it, but the previous one keeps
`status: "active"` until it expires. A user can end up with two active
subscriptions at once. `GET /api/stats/overview` then counts both in
`activeSubscriptions`, and the user's history shows two "Active" rows.

**Fix:** when granting, end the user's existing active subscriptions
first (`canceled`, or a new `superseded` status). Alternatively, if the
tier is the same, extend `expiresAt`. The admin grant form tells the
admin the new plan "replaces their current plan", so ending the old one
matches what the UI says. The Stripe/webhook path may need the same
check.

### 3. Overview adds up money in different currencies

**Where:** `getPlatformOverview` in `statsController.ts`.

**What happens:** `completedJobsGrossAmount` is a single `$sum` of
`totalAmount` across all completed jobs, whatever their currency, so
NGN and USD get added together.

**Fix:** group by currency and return something like
`completedJobsGross: [{ currency, total }]`. Item 6 below would change
this anyway.

**Frontend workaround for now:** the number is shown with a
"mixed currencies" label.

---

## Gaps the admin dashboard runs into

### 4. Admins can't find a user by email or name

**Where:** `GET /api/users`.

**What happens:** it only filters by `systemRole` and `userId`, and
only a super_admin can call it.
- Granting a subscription by hand means paging through every user to
  find the right one.
- A plain admin can grant subscriptions (`POST /api/subscriptions`) but
  can't look anyone up. The frontend asks them to paste a user ID, or
  to use "Grant a plan" on an approved verification.

**Request:** add `?q=` (case-insensitive match on email / fullName) to
`GET /api/users`. Also either let admins read it, or add a narrow
admin-readable lookup (e.g. `GET /api/users/lookup?email=`).

### 5. Verification records don't include the template's field labels

**Where:** `GET /api/verifications`.

**What happens:** each record's `form` is just keys and values
(`fullName: "…"`) and its `documents[].type` is a key
(`identity_document`). The readable labels ("Full legal name",
"Government-issued ID") live on the `VerificationTemplate`, which the
response doesn't include. The review card currently turns the keys
into labels itself ("Full Name", "Identity Document").

**Request:** populate `templateId` with `fields` and `documents`, or
add the labels to each record.

**Related question:** customer_care can see the verification queue,
but `GET /api/files/private/:ownerId/:fileName/link` only allows the
owner or admins, so customer_care can't open the documents. If that's
intended, the frontend already shows the documents as locked for them.
If not, add customer_care to that check (read-only).

---

## Product decisions for the backend to plan

### 6. Store money in USD, convert on the frontend

The product owner would like every amount stored in **USD**, with the
frontend converting it to the viewer's currency for display. Right
now, services, plans, products and jobs each store their own
`currency`. Doing this would need:
- amounts saved in USD (or at least a USD-normalised field next to the
  original);
- an exchange-rates endpoint the frontend can cache, e.g.
  `GET /api/reference/exchange-rates` → `{ base: "USD", rates: { NGN, … }, updatedAt }`;
- a decision on what users type into price fields (USD, or their own
  currency converted on save).

This isn't decided yet. It's listed here so it's planned before
payments go live.

### 7. `mentorship.ratePerSession` has no currency

**Where:** the consultancy profile model.

**What happens:** `mentorship.ratePerSession` has no currency of its
own. The profile page currently borrows the first service's currency.
Either add `mentorship.currency`, or fold this into item 6.

### 8. Current plan pricing (for when the DB is reset)

Pro is meant to be **5,000 NGN per month, free for now**. The dev
database currently has: Pro, "PolyGrid Pro", price `0`, `NGN`, 30 days,
active. There are no Free or Enterprise plans yet. If deployment setup
seeds plans, seed this one.
