# Notes for polygrid-backend — from the frontend

Things the frontend finds while building against the API. The frontend
treats the backend as read-only, so items here wait for a backend
session. Each item gives where the problem is, what it does, and what
the frontend needs. Add new items at the top and remove them once
they're fixed.

_Last updated: 2026-10-22._

## Open

### 1. Deliverable files can share a name, but are removed by name

**Where:** the digital storage providers (`internalStorageProvider.ts`,
`s3StorageProvider.ts`) save `fileName: file.originalname`, and
`DELETE /api/digital-creator-profiles/me/products/:id/files/:fileName`
finds the file by that name.

**What happens:** uploading two files called `plan.pdf` (in one go or
later) gives the product two entries with `fileName: "plan.pdf"`. A
delete by that name can't tell them apart, and anything keyed on the
name (downloads, purchase manifests) is ambiguous. Reproduced on Ada's
"4-bedroom duplex — architectural set": it now has two `plan.pdf`.

**Frontend workaround:** the dashboard refuses a deliverable whose name
is already on the product (or duplicated in the same pick).

**Request:** reject a duplicate name on create / add-files with a clear
400, or give each file a stable id (the storage `key`) and delete by
that instead.


## Resolved

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
