# Repository guide

## Product

Poke Villa is a Hebrew, RTL poke-ordering app. Customers order at `/`; the kitchen manages orders at `/kitchen`. Preserve the quiet, dark, editorial visual language: near-black surfaces, warm sand accents, Frank Ruhl Libre headings, Heebo body text, thin dividers, and square corners.

## Architecture

- React 19 + React Router 7 + Vite 8.
- Supabase provides anonymous customer auth, kitchen auth, Postgres CRUD, RLS, and Realtime.
- The public Google Sheet is the runtime menu source. `src/lib/fetchMenu.js` fetches it once when the app loads; `src/lib/MenuContext.jsx` provides it to the UI and falls back to `src/data/menu.js` if the request fails.
- Order IDs are retained in `localStorage` under `poke_order_ids`.
- Vercel deploys the repository. Pull requests receive preview deployments through the existing Git integration.

## Menu contract

The Sheet tab is `menu-template` (`gid=65408799`). Its first six columns are fixed:

`category,id,label,color,emoji,active`

Every non-empty column after `active` is a House Bowl recipe:

- The header cell is the customer-facing bowl name and the only preset identifier.
- Ingredient cells use native Google Sheets checkboxes; `TRUE` includes the row in the bowl.
- A valid bowl must select exactly one active `base` row. Invalid bowls are omitted and logged in the browser console.
- Ingredient IDs must remain stable because stored orders contain the final ID arrays.
- Bowl images are optional and mapped by exact header name in `src/data/presetImages.js`; unknown names use the generated bowl illustration.

Update `menu-template.csv` whenever the Sheet schema/example data changes.

## Order data contract

`orders.preset_name` is a nullable text snapshot. It is `null` for custom bowls and retains the original House Bowl name when a customer edits ingredients. Kitchen and customer views always show the stored bowl name plus the final ingredient list; they do not compute a recipe diff.

Protein and sauce columns are Postgres `text[]`, despite the singular database column names `protein` and `sauce`.

## Change workflow

1. Work on an `agent/*` feature branch.
2. Add a forward-only SQL migration under `supabase/migrations` for schema changes and update `supabase-setup.sql` for clean installations.
3. Run `npm test`, `npm run lint`, and `npm run build`.
4. Exercise both House Bowl and custom flows in a browser at mobile and desktop widths. Also inspect `/kitchen` when order display changes.
5. Push the branch, open a draft PR, and verify the Vercel preview before asking for merge approval.

Never commit `.env.local`, Supabase keys, kitchen credentials, or generated build output.
