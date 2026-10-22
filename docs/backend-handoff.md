# Notes for polygrid-backend — from the frontend

Things the frontend finds while building against the API. The frontend
treats the backend as read-only, so items here wait for a backend
session. Each item gives where the problem is, what it does, and what
the frontend needs. Add new items at the top and remove them once
they're fixed.

_Last updated: 2026-10-22._

## Open

### 1. (Blocking) A store owner / digital creator can't list their own products

**Where:** `storeProfileRoutes.ts` and `digitalCreatorProfileRoutes.ts`.

**What happens:** there are routes to create, update and delete
products (and their images / files) under `/me/products/:id`, but
nothing that *lists* the owner's products:
- `GET /api/store-profiles/me` and `GET /api/digital-creator-profiles/me`
  return the profile only, with no products;
- the public store page (`GET /api/store-profiles/:idOrSlug`) does list
  products, but answers `{ available: false }` until the store is
  verified and subscribed, which is exactly when an owner is setting up;
- the digital feed only shows admin-verified products, so a creator
  can't see their own pending or inactive ones.

So a new store owner can add products and then never see them again.
The product managers in the dashboard are waiting on this.

**Request:** owner-only list routes, any state (pending verification,
inactive, out of stock), newest first, paginated like everything else:
- `GET /api/store-profiles/me/products?page=&limit=` →
  `{ data: [toPublicProduct], pagination }`
- `GET /api/digital-creator-profiles/me/products?page=&limit=` →
  `{ data: [digital product incl. isVerified, isActive, previewImages,
  files (names/sizes, no signed links)], pagination }`


### 2. A portfolio item can't be edited after it's created

**Where:** the portfolio routes on consultancy, contractor and labor
profiles (`/me/portfolio…`).

**What happens:** there are routes to add an item, add or remove its
images, and delete it, but none to change its `title`, `description`,
`tags`, `startedAt` or `completedAt`. Fixing a typo means deleting the
project and uploading all its images again.

**Request:** `PATCH <base>/me/portfolio/:itemId` taking those fields (the
same rules as `addPortfolioItemSchema`, all optional).

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

The frontend now uses all of these.

Decided (no change needed): a password change ends every session, the
requesting device included, with no new token. That's intended; the frontend
signs the user out and sends them to sign in again.

Also resolved: free ($0) plans now activate through `POST /api/payments/intent`
(`requiresPayment: false`), and unused days carry over (commit `0bd63cc`). The
Subscription page uses it. The admin profile-review route (`e86fab4`) is used
by the Verifications queue's "View profile" drawer. The dev database's NGN data (the Pro
plan and Charles Okonkwo's services) was converted to USD through the API.
