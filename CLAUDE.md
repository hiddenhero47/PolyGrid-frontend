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

**Phase 1 in progress.** Built: the React + Vite setup, store, API
client, multi-theme color system, public layout (`layouts/index-layout`:
navbar, footer, first-visit intro), Home (`pages/home`), the shared
component kit (form controls, table, pagination, status badge, modals —
all on `/lab`, dev only; token preview on `/theme-preview`), and auth
(`pages/auth`: register, login with 2FA step, forgot / reset password,
in `layouts/auth-layout`). Next: the shared "unavailable" state, then
the public browse + profile pages. Remaining form controls
(search-select, chips, file upload) wait until a page needs them. The backend is fully built: all four pillars, account suspension, review
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
(`.prettierrc` copied from HM). `npm run dev` serves on **:5009** (:5173 is
used by another app).
polygrid-backend's CORS allow-list doesn't include :5009, so in
development the API client uses relative `/api/...` URLs and Vite's dev
proxy (`vite.config.js`) forwards them to `VITE_API_URL` — same origin,
no CORS. If `VITE_API_URL` is an **ngrok** tunnel, the proxy sends
`ngrok-skip-browser-warning` — without it ngrok answers browser requests
with an HTML warning page (curl works, the browser doesn't). Production
builds call `VITE_API_URL` directly. Copy
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

**How token groups are organized (the rule):** first by design purpose
(`button`, `chip`, `logo`, form, loader, …), then by the component or
feature that uses them (`navbar`, `card`, `footer`, `intro`, modals,
toolbars, sidebars, …), then by page area only if needed (`hero`).
That's deliberately different from HM, which grouped by page area.

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

Coral primary buttons: dark label in dark theme, white label in light
theme (per the design — note white on #FF5B3D is 3.1:1, AA for large/
bold text only). In the light design most accents are slate `#456882`
(`text.highlight`, `chip.accent*`, default `icon` tone, `tab`) for
supporting details; coral is kept for brand moments and actions —
primary buttons, arrow links, section eyebrows, the hero's accent word,
number badges, and accent-tone icons.

### Tailwind vs. styled-components class names

Plain `className`s are Tailwind. A class that's styled inside a
styled-components block gets an **`sc_` prefix** (`.sc_title`,
`.sc_link`, `.sc_icon`) so the two are never confused. Don't override a
styled component with Tailwind `!important` utilities — add a `$prop`
to the styled component instead. And put Tailwind show/hide utilities
(`hidden`, `lg:hidden`, `sm:inline-flex`) on a wrapper element, not on
a styled component: if its styles set `display`, they win.

### Form components — `src/components/form-components/`

Import from the barrel (`components/form-components`). HM's names and
Formik-friendly props (`value`, `onChange`, `onBlur`, `handleChange` →
`handleChange(name)(value)`, `setFieldValue`, `isError`,
`errormessage`, `name`, `id`, `disabled`, `paddingX/Y`), plus `label`,
`hint`, `required` and `variant` (`'filled'` default | `'outline'`).
Every control renders through `field/` (`FormField`: label, then the
hint — or the error in its place — wired with `aria-invalid` /
`aria-describedby` from `helpers.js`). Colors: the `form` token group.

- `CustomInput` / `CustomPassword` / `CustomTextarea` — native elements
  inside a shared shell (`fieldShell` in `field/index.style.js`, the
  five §3 states; `:focus-within` gives the coral Active ring).
- `CustomSelect` — **Popover API, no `useEffect`, no `<dialog>`**: the
  menu is a `popover="auto"` element opened by `popoverTarget`, so the
  browser handles click-outside, Escape, top layer and focus return
  (works in Safari 17+). Open state is read from its `toggle` event.
  Positioned with CSS anchor positioning; browsers without it get
  top/left set in `beforetoggle` (event-driven, still no effect).
  Keyboard: ↓/↑, Home/End, Enter/Space, type-ahead. `onBlur` fires on
  close with `{ target: { name } }` so Formik's `handleBlur` marks it
  touched. Options: `{ value, label, image? }`; `clearable` adds "None".
- `CustomCheckbox`, `CustomCheckboxGroup` (array value, `max`, `meta`),
  `CustomRadioGroup` (`variant="rows"` = Stitch filter rows),
  `CustomToggle` (`role="switch"`) — native inputs with
  `appearance: none`, so keyboard behavior is the browser's.
- `CustomDate` — two pickers, one value ('YYYY-MM-DD'): mouse/trackpad
  gets PolyGrid's own calendar (`date/date-picker.jsx` — a popover like
  the select, dayjs for date math, WAI-ARIA grid keyboard: arrows,
  PageUp/Down ±month (+Shift ±year), Home/End, Enter; Today/Clear);
  touch screens (`(pointer: coarse)`) get the native picker. `native`
  prop forces either. `min`/`max` block days outside the range
  (completedAt ≥ startedAt). onChange gets an event-like
  `{ target: { name, value } }`, so Formik's `handleChange` works.
  `toDateValue()` in `helpers.js` trims backend ISO strings.
- Shared popover pieces: `SUPPORTS_ANCHOR`, `anchorName()`,
  `placePopover()` (fallback placement) in `helpers.js`;
  `popoverSurface` css in `select/index.style.js`.
- Build select/radio options from backend enums with
  `enumToOptions(ENUM, labelOverrides)` (`utilities/basic-functions`).

**`/dev-console` (dev only, TEMPORARY — delete `pages/dev-console` and
its route in `App.jsx` before launch):** runs the backend's
`POST /api/deployment/setup` and shows each task's result, plus a tiny
request builder (method, path, JSON body, optional Bearer token,
history) using plain `fetch` through the dev proxy. The setup route is
gated by `timeWindowGuard(start, hours)` in
`polygrid-backend/src/routes/deploymentRoutes.ts`; outside that window
it answers 403. All dev pages (`/lab`, `/theme-preview`,
`/dev-console`) are lazy-loaded under `import.meta.env.DEV`, so they're
not in production builds.

`/lab` (dev only, `pages/lab`) shows every control in every state plus a
live Formik + yup form, the table and the modals — build and test
shared components there first. Still to come: search-select /
combobox, chips, file upload.

- `CustomPhone` — value is the backend's `{ number, country }`
  (`number` normalized to E.164 once valid). Countries from
  `GET /api/reference/countries`, dial codes + validity from
  `libphonenumber-js`; searchable country popover. Typed digits live in
  local state, re-derived during render if the value is replaced from
  outside (no effect). Validate with `phoneField()` /
  `isValidPhone()` (`features/validations/common.js`).
- `CustomOtp` — ONE native input drawn as boxes, so paste, SMS /
  password-manager autofill (`autocomplete="one-time-code"`) and
  backspace are native; `onComplete` fires on the last digit.

### Auth — `pages/auth`, `features/services/custom-hooks/auth.js`

Register (`POST /api/users`), login (`POST /api/users/login`; if the
account has 2FA the first try fails with code `2FA_REQUIRED` — no
toast, `error.twoFactorCode` — and the page asks for the 6-digit code,
`2FA_INVALID` = wrong code), forgot (`/request-reset`, always the same
generic answer) and reset (`/reset-password`; the emailed link is
`/reset-password/:token`). Success stores the session with
`setSession` (user + token). **The backend's user id field is `id`,
not `_id`.** `AuthServices.logout()` also clears the query cache.
`layouts/auth-layout` sends signed-in users away from these pages
(except reset). Yup rules in `features/validations/auth-validation.js`
mirror `polygrid-backend/src/validators/user/userValidator.ts`.

Known backend-side gap (not a frontend bug): the local backend has no
`MAILGUN_API_KEY` yet, so `POST /api/users/request-reset` returns 500
"MAILGUN_API_KEY is not set" — forgot-password shows that toast and
keeps the form. Reset emails work once the key is added to the
backend's `.env`.

### Modals — `src/components/modal/`

HM's API, unchanged for callers: `const ref = useRef(null)`,
`<Modal.Center refName={ref} width="520px" onOpen onClose>…`,
`ref.current.open()` / `.close()`. Also `Modal.Left`, `Modal.Bottom`
and new `Modal.Right`; HM's sizing props (`width`, `height`,
`maxWidth`, `minWidth`, `queryWidth`, `mediaQuery`, `marginOffset`,
`borderPaddingY`, `animation`) still work. Built on
`dialog.showModal()` (not HM's `<dialog open>`): top layer, inert page,
focus trapped and returned to the opener, Escape closes. Backdrop click
closes (only if the press started on the backdrop). `dismissible={false}`
blocks both. Page scroll lock is one CSS rule in `global.style.js`
(`html:has(dialog[open])`). Open and close animate with CSS
(`@starting-style` + `allow-discrete`) — no `useEffect` anywhere.
Wrap content in `<Modal.Card eyebrow title subtitle footer>` for the
standard header/body/footer; it gets `close()` and the title id from
context (`useModal()`), so it labels the dialog automatically. Colors:
`modal` token group.

### Tables — `src/components/table/custom-table.jsx`

HM's `CustomTable` API: `fields={[{ Header, accessor, Cell, align?,
width? }]}`, `dataSource`, `isLoading`, `onCallRow`, `onDoubleCallRow`,
`emptyIcon/Text/SbText`, `refetch`, `addData`, HM's padding/strip
props. Added: skeleton loading rows, `isError` state (Retry via
`refetch`), keyboard-reachable clickable rows, sticky header, `nos`
counting across pages, and `pagination={data.pagination}` (the
backend's `{ total, page, limit, totalPages }`) with `changePage`.
`components/pagination` is the one pagination control (frontend-plan
§2) — usable on its own. `components/status-badge` is the one status
badge: `<StatusBadge status={x} map={{ value: { label, tone } }} />`,
tones from the `status` tokens. Colors: `table` token group.

### Typography

Fonts come from the Stitch design, self-hosted via `@fontsource`
(imported in `main.jsx`): Tailwind `font-display` = Oswald (uppercase
headings), `font-sans` = Hanken Grotesk (default body), `font-label` =
Space Grotesk (small uppercase labels). Defined in `index.css`'s
`@theme`.

### Brand

`src/assets/brand/logo-mark.svg` is concept A
(`docs/assets/brand/logo-concept-a.svg`) with its fills swapped for the
`logo.base` / `logo.accent` tokens; use it through
`components/logo`. Home images in `src/assets/images/home/` came from
the Stitch project.

## Stitch (Google's AI UI design tool)

Already connected for this project specifically — `claude mcp add` was
run from inside this folder, so the MCP config is scoped here (Claude
Code's local-scope MCP servers are stored per project path). If a
session here doesn't see Stitch's tools, run `/mcp` to check/approve
it, or reload the window.

Treat Stitch output as a general idea, not a spec: it doesn't
reproduce its own designs reliably (its light-theme Home changed
components, not just colors). The **dark** Home ("PolyGrid — Platform
Gateway") is the accurate reference, alongside
`docs/assets/inspiration/home-page-style-reference-exery.webp`.

The *backend* repo tried to add the same connection and hit Claude
Code's own credential-leakage safety classifier (it blocks file writes
that look like they're persisting an API credential, even behind a
`${VAR}` placeholder) — that's specific to that session/attempt, not a
property of the Stitch connection itself, and doesn't affect this repo.
