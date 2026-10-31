# Notes for polygrid-backend — from the frontend

Things the frontend finds while building against the API. The frontend
treats the backend as read-only, so items here wait for a backend
session. Each item gives where the problem is, what it does, and what
the frontend needs. Add new items at the top and remove them once
they're fixed.

_Last updated: 2026-10-23._

## Open

Nothing open right now.

## Resolved

2026-10-31: `GET /api/stats/overview` gained `money`, `jobsByStatus`,
`queues` and `last30Days { series, totals }` — the admin Overview uses them.


Backend changes of 2026-10-31 for the moderation pages (in its working tree
when the frontend switched to them): `GET /api/admin/profiles?profileType=&q=&status=`,
a platform-wide `GET /api/reviews/moderation` (`isHidden`, `minRating` /
`maxRating`, `profileName`), message reports with `?status=`, the sender,
`resolvedBy` and `context { before, after }` (+ `note` on resolve), and
bans with a reason, `bannedBy` / `bannedAt` and the owner notified
(`profile_status_changed`).


Commit `8216d90` (2026-10-31): `/api/system-payouts` (list, mark paid with a reference, mark
failed with a reason — the "To pay" tab), `GET /api/jobs?q=&status=&userId=`
(the admin Jobs page), read-only `GET /api/jobs/:id` for every review role,
and contract files keep their name.


Commit `aa4a617`: conversations are unique per pair (`pairKey`), not per
person — the old `participants_1` index, which let each user into only one
conversation ever, is dropped on the dev database by a setup task.


Commit `f1d6552` (2026-10-23), all used by the frontend:
- verifying a stage needs escrow to cover it (400 otherwise) — the job page
  offers "Fund this stage to release it" instead of Verify;
- jobs carry party names (`client.user` / `provider.user`), and summaries
  carry `amountPaid` and a stages tally;
- tender detail has `myBid`, `/bids/mine` rows carry a project summary;
  opening detail has `myApplication`, `/applications/mine` rows carry a
  posting summary, and applications carry `job`;
- a pending digital purchase resumes (`resumed: true` + a client secret),
  free files complete without Stripe (`requiresPayment: false`), and
  `/digital-purchases/mine` rows carry `paymentId`;
- store order rows carry the store `{ storeName, slug, logo }` and job
  `{ id, status, amountPaid }`;
- contacts carry `fullName` / `avatar`, and `GET /api/contacts?q=` searches.


Commit `27d0358`: the digital-product review queue
(`GET /api/digital-products/review`, used by `/admin/digital-products`),
reviewers can open deliverables (`GET /api/digital-products/:id/download`),
duplicate deliverable names are refused (400), the creator page lists
approved files only, store list preview products carry `id`, and
deliverables also accept XLSX, CSV, DWG, DXF and ZIP.


Commit `cd7e035` resolved the second list:
- sellers list their own products: `GET /me/products` on store and
  digital-creator profiles (the dashboard's product managers use them);
- payments recover without a webhook: `POST /api/payments/:id/refresh`
  plus a 15-minute sweep (the Subscription page's "Check payment
  status" uses it; Ada's stuck $49 payment recovered this way);
- portfolio items can be edited: `PATCH …/me/portfolio/:itemId`;
- `GET /api/users/me/profiles` (the profile hub uses it).


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
