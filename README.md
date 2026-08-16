# Poke Villa — Order & Kitchen App

A Hebrew-language poke bowl ordering web app with a real-time kitchen display. Customers build and submit their bowls on their phones; the kitchen staff sees all orders live and advances each one through a status workflow.

---

## What it does

**Customer flow** — an adaptive wizard at the root URL (`/`):

| Step | What the customer picks |
|------|------------------------|
| 1. Name | Their name |
| 2. Order mode | House Bowls (`קערות הבית`) or custom build |
| 3a. House Bowls | Pick a Sheet-driven recipe, review it, and optionally edit its ingredients |
| 3b. Custom build | Pick base, toppings, proteins, and sauces |
| 4. Review | See the final ingredient list and confirm |

After submission the customer sees **My Order** — a live status card (received → preparing → ready) that updates in real time without refreshing the page. The order ID is saved in `localStorage` so the same device reconnects to the same order on revisit.

**Kitchen display** — `/kitchen`

- PIN-protected + Supabase email/password auth for the kitchen account. Do not document access codes in the repository.
- Shows all orders as cards grouped by status (received / preparing / ready).
- One-click buttons advance each order through the workflow.
- Live updates via Supabase Realtime so the display refreshes automatically when any order changes.
- Filter tabs: All / Active / Ready.
- Status counters in the header.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| UI framework | React 19 + React Router 7 |
| Build tool | Vite 8 |
| Backend / DB | Supabase (Postgres + Realtime + Auth) |
| Styling | CSS Modules |
| Linter | Oxlint |
| Deployment | Vercel (project `poke-villa-halperin-2026`) |

---

## Project structure

```
src/
├── App.jsx                  # Root router — OrderFlow vs. Kitchen
├── data/
│   ├── menu.js              # Offline ingredient fallback + statuses
│   └── presetImages.js      # Exact-name image mapping for known House Bowls
├── lib/
│   ├── supabase.js          # Supabase client (reads env vars)
│   ├── fetchMenu.js         # Public Sheet CSV parser, including House Bowl columns
│   ├── MenuContext.jsx      # Runtime Sheet menu with local ingredient fallback
│   ├── orders.js            # Supabase CRUD helpers
│   └── localOrders.js       # (legacy local-storage fallback, no longer used in main flow)
├── components/
│   ├── BowlIllustration.jsx # Animated SVG bowl that renders as the customer builds their order
│   └── StepBar.jsx          # Route-aware wizard progress indicator
└── pages/
    ├── NameStep.jsx
    ├── OrderModeStep.jsx
    ├── PresetBowlsStep.jsx
    ├── BaseStep.jsx
    ├── ToppingsStep.jsx
    ├── ProteinStep.jsx
    ├── SauceStep.jsx
    ├── ReviewStep.jsx        # Final summary + submit
    ├── MyOrder.jsx           # Post-submit status view with realtime updates
    ├── Kitchen.jsx           # Kitchen dashboard with order cards + status advancement
    └── KitchenLogin.jsx      # PIN pad UI + Supabase auth for kitchen access
```

---

## Supabase setup

The app expects an `orders` table with these columns:

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | auto-generated |
| `created_at` | timestamptz | auto |
| `user_id` | uuid | set to the anonymous auth user |
| `name` | text | customer name |
| `base` | text | base id from menu |
| `toppings` | text[] | array of topping ids |
| `protein` | text[] | final protein ids |
| `sauce` | text[] | final sauce ids |
| `preset_name` | text nullable | House Bowl name snapshot; null for custom orders |
| `status` | text | `received` / `preparing` / `ready` |

Row-level security should allow:
- Anonymous users to insert and read their own rows (`user_id = auth.uid()`).
- The kitchen service account to read and update all rows.

Realtime must be enabled on the `orders` table.

Apply the ordered SQL files under `supabase/migrations` to an existing project. `supabase-setup.sql` describes a clean installation.

---

## Dynamic menu and House Bowls

The app loads the public `menu-template` Google Sheet once on each page refresh. The first six columns are fixed (`category,id,label,color,emoji,active`). Every non-empty column after `active` defines a House Bowl: the header is its name and checked rows are its ingredients. A valid bowl has exactly one active base.

See `docs/preset-bowls.md` for the complete operating contract and `docs/bowl-image-prompts.md` for the committed image prompts.

---

## Environment variables

Create `.env.local` with:

```
VITE_SUPABASE_URL=<your supabase project url>
VITE_SUPABASE_ANON_KEY=<your supabase anon key>
VITE_KITCHEN_EMAIL=<kitchen account email>
VITE_KITCHEN_PASSWORD=<kitchen account password>
```

---

## Running locally

```bash
npm install
npm test
npm run lint
npm run build
npm run dev
```

- Customer ordering: `http://localhost:5173/`
- Kitchen display: `http://localhost:5173/kitchen`

---

## Deployment

The project is linked to Vercel (`prj_NmIxdG77aFYrPPw4maiS7fWG1VfJ`). Pull requests automatically receive preview deployments through the Git integration. Set the four env vars above in the Vercel project settings for production and preview environments.

```bash
npm run build
```

---

## Language

All UI text is in Hebrew (RTL). The Supabase error message fallback in `App.jsx` is also in Hebrew (`שגיאה בשליחת ההזמנה`).
