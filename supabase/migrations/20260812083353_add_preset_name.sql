alter table public.orders
  add column if not exists preset_name text;

comment on column public.orders.preset_name is
  'Snapshot of the House Bowl name when ordered; null for custom orders.';
