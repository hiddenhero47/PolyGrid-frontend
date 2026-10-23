# Notes for polygrid-backend — from the frontend

Things the frontend finds while building against the API. The frontend
treats the backend as read-only, so items here wait for a backend
session. Each item gives where the problem is, what it does, and what
the frontend needs. Add new items at the top and remove them once
they're fixed.

_Last updated: 2026-10-23._

## Open

### Contacts list: names and avatars

(Sent 2026-10-23; a backend change adding `fullName` was in progress.)
`GET /api/contacts` rows were `{ user, email, connectedAt }` only. The
Contacts page and the "New message" picker show `fullName` / `avatar` when
present, else the email.

### An abandoned digital checkout blocks buying that file again

(Sent 2026-10-23.) `handleDigitalPurchasePaymentIntent` creates the pending
purchase + payment before Stripe takes the card; if the buyer closes the
form, every later intent for that product is a 400 ("You already have a
pending purchase"). Needed: resume the pending one — return a usable
`clientSecret` for it — so the frontend can reopen the card form. A
`paymentId` per row on `GET /api/digital-purchases/mine` would also save the
Purchases page searching `/payments/me` for "Check payment status".

### Free digital files go through Stripe

A digital product can be priced 0, but buying one still creates a Stripe
PaymentIntent for 0, which Stripe refuses. The Buy button already treats an
answer with no `clientSecret` as "it's yours", so a free purchase can just
succeed straight away (like free plans' `requiresPayment: false`).

### Store order lists: store name and job status

(Sent 2026-10-23.) `/api/store-orders/mine` rows carry `store` as an id only,
and neither list has the job's status — each row fetches the store and the
job separately. Populating store `{ storeName, slug, logo }` and adding the
job's `{ status, amountPaid }` would make that one request.

### Tender / SiteForce responses: own bid / application, list titles, job id

(Sent to the backend session on 2026-10-23.) The frontend works around all
four today, at the cost of extra requests:
1. `GET /api/tender-projects/:id` for a contractor has no `myBid` — the page
   loads `/bids/mine?limit=100` and finds it there.
2. `GET /api/tender-projects/bids/mine` rows carry only the `project` id —
   the "My bids" list fetches each project for its title.
3. The same for SiteForce: no `myApplication` on `GET /api/job-openings/:id`,
   and `/applications/mine` rows carry only the `posting` id.
4. `toPublicApplication` drops `application.job`, so an accepted worker
   can't link straight to the Job it created (the page links to Jobs).

### Verifying a stage releases money that was never funded

`verifyStage` (jobController.ts) adds the stage's share to
`amountDisbursed` whether or not the client has paid anything in. Seen on
the dev data: a $1,200 job with $0 funded, stage 1 (40%) verified →
`amountDisbursed` $456, `amountPaid` $0. `payoutAvailableAmount` caps it at
`amountPaid`, so no money leaves PolyGrid, but the job's own numbers say
$456 was released when nothing was there. The job page shows "Released"
straight from `amountDisbursed`.

Needed: one of
- refuse to verify a stage unless what's been funded covers it (a 400
  saying "fund this stage first"; the page would then show the Fund
  button next to it), or
- release only what's actually in escrow and keep the rest owed until
  funding arrives.

The first is simpler and what the job page expects.

## Resolved

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
