-- Convert protein and sauce from single TEXT to TEXT[] for multi-select
ALTER TABLE public.orders
  ALTER COLUMN protein TYPE TEXT[] USING ARRAY[protein],
  ALTER COLUMN sauce   TYPE TEXT[] USING ARRAY[sauce];

ALTER TABLE public.orders
  ALTER COLUMN protein SET DEFAULT '{}',
  ALTER COLUMN sauce   SET DEFAULT '{}';
