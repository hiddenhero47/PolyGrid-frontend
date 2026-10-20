# Notes for polygrid-backend — from the frontend

Things the frontend finds while building against the API. The frontend
treats the backend as read-only, so items here wait for a backend
session. Each item gives where the problem is, what it does, and what
the frontend needs. Add new items at the top and remove them once
they're fixed.

_Last updated: 2026-10-20._

## Open

### 1. A portfolio item can't be edited after it's created

**Where:** the portfolio routes on consultancy, contractor and labor
profiles (`/me/portfolio…`).

**What happens:** there are routes to add an item, add or remove its
images, and delete it, but none to change its `title`, `description`,
`tags`, `startedAt` or `completedAt`. Fixing a typo means deleting the
project and uploading all its images again.

**Request:** `PATCH <base>/me/portfolio/:itemId` taking those fields (the
same rules as `addPortfolioItemSchema`, all optional).

### 2. There's no way to subscribe to a free ($0) plan

**Where:** `POST /api/payments/intent` with `targetType: "Subscription"`.

**What happens:** subscribing goes through a Stripe PaymentIntent, and
Stripe can't charge $0. Pro is currently free (the product owner wants
5,000 NGN-equivalent later), so today only an admin can put someone on
it, using `POST /api/subscriptions`.

**Request:** either a self-serve route that activates a plan when its
price is 0 (e.g. `POST /api/subscriptions/free { planTier }`, refused
when the plan's price > 0), or have the intent route activate a $0 plan
directly and return no `clientSecret`. Until one exists, the frontend
Subscription page shows "Online checkout soon".

### 3. (Nice to have) One route for "all my business profiles"

The workspace hub calls six `GET <base>/me` routes in parallel and treats
404 as "not created". It works fine. A single `GET /api/users/me/profiles`
returning `{ [profileType]: summary | null }` would save five round
trips on the dashboard's busiest pages.

## Resolved

The backend fixed every item from the first list in commit `be7859f`:
- search results now include `id`;
- granting a subscription ends the previous one;
- the overview's money total is split by currency;
- `GET /api/users` has `?q=` search and admins can read it;
- verification listings include the template's labels;
- customer_care can open verification documents;
- the whole platform is locked to USD (`PLATFORM_CURRENCY`).

The frontend now uses all of these. The dev database's NGN data (the Pro
plan and Charles Okonkwo's services) was converted to USD through the API.
