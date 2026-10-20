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

### 2. (Question) A password change signs the current device out too

**Where:** `updateUserProfile` in `userController.ts` (`PUT /api/users/profile`
with `password`).

**What happens:** it rotates `sessionId`, so every token stops working,
including the one that made the request, and the response has no new
token. The frontend handles this: it ends the session and sends the user
to sign in with the new password. If you'd rather keep this device signed
in, return a fresh token alongside `user` and the frontend will store it.

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

Also resolved: free ($0) plans now activate through `POST /api/payments/intent`
(`requiresPayment: false`), and unused days carry over (commit `0bd63cc`). The
Subscription page uses it. The admin profile-review route (`e86fab4`) is used
by the Verifications queue's "View profile" drawer. The dev database's NGN data (the Pro
plan and Charles Okonkwo's services) was converted to USD through the API.
