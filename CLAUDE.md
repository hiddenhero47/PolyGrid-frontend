# PolyGrid — Frontend

## What this is

PolyGrid is a construction/engineering marketplace with four pillars
under one account:
1. **PolyGrid Engineering** — consultant marketplace + mentorship.
2. **PolyGrid Tenders** — sealed project-bidding board + direct-hire of
   contractors.
3. **PolyGrid Store** — a digital storefront (downloadable files) and a
   separate physical materials marketplace.
4. **PolyGrid SiteForce** — a location-based job board + direct-hire of
   tradespeople.

This repo is the frontend. The backend is a sibling project at
`/Users/mac/Desktop/web-projects/polygrid-backend` — a fully built and
tested Express/MongoDB API (578 tests passing as of the last backend
session).

## Reading the backend

`docs/frontend-plan.md`'s `→ METHOD /path` notes are the first thing to
check for a route, but they're a summary, not the full contract — when
a form needs exact field names, validation rules, enum values, or error
shapes, go read the real source directly rather than guessing:

- `src/routes/*.ts` — every route, its middleware (auth/role guards),
  and which validator/controller it calls.
- `src/validators/**/*Validator.ts` — the yup schema for a route's
  request body (exact field names, required/optional, enum values).
- `src/controllers/*.ts` — the actual business logic and response
  shape; the `toPublic*` helper near the top of most controller files
  is what a GET actually returns.
- `src/models/*.ts` — the Mongoose schema and any exported `const
  X_ENUM = {...}` object a select input should be built from.

Treat that repo as read-only from here — it's a separate, independently
tested project; don't edit it to make a frontend feature work.

## Naming note: "HM"

If "HM" or "house-maduekwe" ever comes up (in conversation, or in a
polygrid-backend code comment like "mirrors house-maduekwe-backend's
shape"), it refers to **House Maduekwe** — the same developer's
previous project, a men's fashion e-commerce site. Two sibling repos:
`/Users/mac/Desktop/web-projects/house-maduekwe-frontend` (React +
Vite + Redux Toolkit + Tailwind + Stripe) and
`/Users/mac/Desktop/web-projects/house-maduekwe-backend` (Express +
MongoDB + JWT, plain JS not TypeScript). PolyGrid's *backend*
deliberately reuses a number of HM-backend's proven patterns (file
upload handling, cron job structure, deployment/admin-seeding scripts,
auth conventions, email sending) — that's what those code comments are
citing. There's no reuse relationship assumed on the frontend side yet;
HM-frontend is just the sibling project this note is disambiguating
from.

## Start here

**`docs/frontend-plan.md`** is the full frontend specification — read
it before doing any page work. It covers, in order:
- Product context, roles, subscription/verification rules (§0)
- Shared UI patterns used across every page (§2)
- Form component states — Normal/Filled/Active/Error/Disabled (§3)
- A build roadmap — phases, priority, and which phases suit an AI
  design tool (Stitch) vs. hand-building (§4)
- Theming — Light/Dark palettes, sourced from real reference images
  (§5), with the images themselves in `docs/assets/`
- The full page-by-page spec: Public/Basic View (§A), User Dashboard
  (§B), Admin Dashboard (§C) — each page's purpose, layout, and the
  exact backend route(s) it calls

`docs/assets/brand/` has two concept logo marks (unfinalized — no
chosen palette yet). `docs/assets/inspiration/` has the four reference
images §5's theme palette and the Home page's hero-first structure were
drawn from.

## Current status

**Project scaffolded; no feature pages yet.** The React + Vite setup,
store, API client and multi-theme color system exist (see "Stack &
conventions" below). `/` is a temporary token-preview page, not the
real Home. Form-component colors and typography/spacing tokens are
deliberately not started yet. The backend is fully built: all four pillars, account suspension, review
moderation, message-report resolution, per-profile avatars, a real
notification system, SiteForce geo search, public board teasers, and a
stats route. `docs/frontend-plan.md`'s §1 used to track backend gaps
against the frontend plan; all of those are now closed, with routes
noted inline throughout.

Per §4's roadmap, build order is: design tokens + form states (Phase
0) → Public/Basic View (Phase 1) → Account & Business Profile core
(Phase 2) → the transactional dashboard — jobs, tenders, SiteForce,
store, messages, notifications (Phase 3) → Admin Dashboard (Phase 4).

## Stack & conventions

Same stack and folder layout as HM-frontend (React 19 + Vite + Redux
Toolkit + redux-persist + TanStack Query + axios + styled-components +
Tailwind v4 + Stripe + Formik/yup + react-toastify), plain JS/JSX, tabs
(`.prettierrc` copied from HM). `npm run dev` serves on **:5173** —
fixed, because polygrid-backend's CORS allow-list includes it. Copy
`.env.example` to `.env`; `VITE_API_URL` points at the backend (:4000).

- `src/pages/<page>/index.jsx` + `elements/index.style.js`,
  `src/layouts/`, `src/components/`, `src/features/services/`
  (`index-client.js` = axios; per-resource TanStack Query hooks go in
  `custom-hooks/`, HM-style), `src/features/validations/` (yup),
  `src/utilities/app-const.js` (enums copied from backend models).
- Import `toast` from `layouts/toast/toast-handler`, never from
  react-toastify directly.
- Stripe: `getStripe()` from `features/services/stripe.js`; wrap only
  payment pages in `<Elements>`, not the app.
- Store (`store/index.js`) mirrors HM: `blacklist` of slices not to
  persist, and `createWebStorage('local')` with a no-op fallback when
  there's no `window`. Import `createWebStorage` from
  `redux-persist/es/storage/createWebStorage` — HM's `lib/` path breaks
  under Vite 8's CJS interop.

### Colors / themes — `src/theme/`

Multiple themes (light, dark, later seasonal ones) share one token
shape. Files:
- `themes/schema.js` — `THEME_SCHEMA`: the list of every allowed group
  and token name (no colors). An array is a group
  (`surface: ['card', …]` → `surface.card` → `--pg-surface-card`);
  anything else is a single, un-nested color (`brand: ''` → `brand` →
  `--pg-brand`). **New token = register it here first**, then give it
  a value in every theme.
- `themes/light.js`, `themes/dark.js` — each theme's colors, hex written
  inline, grouped by role (`surface`, `text`, `border`, `accent`,
  `status`, `state`, `skeleton`) or as single top-level colors. Never
  deeper than group → token.
- `themes/validation.js` — the yup schemas + `validateTheme`, which
    **throws** if a theme is empty, nests deeper than group → token, is
    missing a registered token, has one that isn't registered, or gives
    a group where the schema has a single color (or vice versa).
    `index.js` runs it on every theme under `import.meta.env.DEV`.
- `index.js` — everything else:
  - `extendTheme(base, overrides)` — build a theme by stating only what
    changes; typo'd keys are kept so validation catches them.
  - `THEMES` registry (`{ label, mode, tokens }`) — a new theme is a
    file (or an `extendTheme` call) + one line here.
  - CSS variable generation: every token → `--pg-<group>-<token>`,
    output per theme under `[data-theme='…']` (`themeCss`, injected by
    `global.style.js`) and as `var()` refs for styled-components
    (`themeVars`).

Use tokens, never hex, in components:
- Tailwind: `bg-(--pg-surface-card) text-(--pg-text-secondary)`
- styled-components: `${({ theme }) => theme.surface.card}` — the
  ThemeProvider gets `var(--pg-…)` refs, so switching themes only swaps
  CSS variables, no re-render.
- Raw hex (chart.js, Stripe `appearance`): `THEMES[name].tokens`.

Switch with `setTheme(name)` / `toggleTheme()` from
`store/slice/app-theme.js` — same reducers as HM, plus a check that the
theme is registered. The slice saves the choice under its own
localStorage key (`THEME_STORAGE_KEY`, used only there — the `themes`
slice is kept out of redux-persist) and sets `<body data-theme>`;
`layouts/theme-root.jsx` sets it on render too, HM-style.

Known open item: white text on `accent.default` (#FF5B3D) is 3.1:1 —
passes WCAG AA only for large/bold text. Decide (darker accent fill,
or dark label) when buttons are designed.

## Stitch (Google's AI UI design tool)

Already connected for this project specifically — `claude mcp add` was
run from inside this folder, so the MCP config is scoped here (Claude
Code's local-scope MCP servers are stored per project path). If a
session here doesn't see Stitch's tools, run `/mcp` to check/approve
it, or reload the window.

The *backend* repo tried to add the same connection and hit Claude
Code's own credential-leakage safety classifier (it blocks file writes
that look like they're persisting an API credential, even behind a
`${VAR}` placeholder) — that's specific to that session/attempt, not a
property of the Stitch connection itself, and doesn't affect this repo.
