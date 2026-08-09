# Poke Villa — Order & Kitchen App

A Hebrew-language poke bowl ordering web app with a real-time kitchen display. Customers build and submit their bowls on their phones; the kitchen staff sees all orders live and advances each one through a status workflow.

---

## What it does

**Customer flow** — a 6-step wizard at the root URL (`/`):

| Step | What the customer picks |
|------|------------------------|
| 1. Name | Their name |
| 2. Base | Rice / Noodles / Mixed |
| 3. Toppings | Up to 12 options (nori, avocado, edamame, etc.) |
| 4. Protein | Strip / Egg strip / Tofu / None |
| 5. Sauce | Sriracha / Soy / Teriyaki / Spicy mayo |
| 6. Review | Preview bowl illustration + confirm & submit |

After submission the customer sees **My Order** — a live status card (received → preparing → ready) that updates in real time without refreshing the page. The order ID is saved in `localStorage` so the same device reconnects to the same order on revisit.

**Kitchen display** — `/kitchen`

- PIN-protected (code `1234`) + Supabase email/password auth for the kitchen account.
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
│   └── menu.js              # All menu options (BASES, TOPPINGS, PROTEINS, SAUCES, STATUSES)
├── lib/
│   ├── supabase.js          # Supabase client (reads env vars)
│   ├── orders.js            # CRUD helpers: createOrder, getOrder, updateOrderStatus, getAllOrders
│   └── localOrders.js       # (legacy local-storage fallback, no longer used in main flow)
├── components/
│   ├── BowlIllustration.jsx # Animated SVG bowl that renders as the customer builds their order
│   └── StepBar.jsx          # Progress indicator across the 6 wizard steps
└── pages/
    ├── NameStep.jsx
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
| `protein` | text | protein id |
| `sauce` | text | sauce id |
| `status` | text | `received` / `preparing` / `ready` |

Row-level security should allow:
- Anonymous users to insert and read their own rows (`user_id = auth.uid()`).
- The kitchen service account to read and update all rows.

Realtime must be enabled on the `orders` table.

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
npm run dev
```

- Customer ordering: `http://localhost:5173/`
- Kitchen display: `http://localhost:5173/kitchen`

---

## Deployment

The project is linked to Vercel (`prj_NmIxdG77aFYrPPw4maiS7fWG1VfJ`). Set the four env vars above in the Vercel project settings, then:

```bash
npm run build
vercel --prod
```

---

## Language

All UI text is in Hebrew (RTL). The Supabase error message fallback in `App.jsx` is also in Hebrew (`שגיאה בשליחת ההזמנה`).
