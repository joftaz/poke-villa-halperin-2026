-- ============================================================
-- Poke Villa — run this once in Supabase SQL Editor
-- ============================================================

-- 1. Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT        NOT NULL,
  base        TEXT        NOT NULL,
  toppings    TEXT[]      DEFAULT '{}' NOT NULL,
  protein     TEXT[]      DEFAULT '{}' NOT NULL,
  sauce       TEXT[]      DEFAULT '{}' NOT NULL,
  status      TEXT        DEFAULT 'received' NOT NULL
                          CHECK (status IN ('received', 'preparing', 'ready')),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Kitchen users table (stores the UUID of the kitchen Supabase account)
CREATE TABLE IF NOT EXISTS public.kitchen_users (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY
);

-- 3. Enable Realtime on orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 4. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row Level Security
ALTER TABLE public.orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_users ENABLE ROW LEVEL SECURITY;

-- kitchen_users is readable by all authenticated users (needed for RLS checks)
CREATE POLICY "anyone_can_check_kitchen" ON public.kitchen_users
  FOR SELECT USING (true);

-- Customers: insert their own order
CREATE POLICY "customers_insert" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Customers: read their own order
CREATE POLICY "customers_select" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Customers: edit their own order ONLY while status = received
CREATE POLICY "customers_update" ON public.orders
  FOR UPDATE
  USING  (auth.uid() = user_id AND status = 'received')
  WITH CHECK (auth.uid() = user_id AND status = 'received');

-- Kitchen: read ALL orders
CREATE POLICY "kitchen_select" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.kitchen_users WHERE user_id = auth.uid())
  );

-- Kitchen: update status on ANY order
CREATE POLICY "kitchen_update" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.kitchen_users WHERE user_id = auth.uid())
  );

-- Customers: cancel (delete) their own order only while status = received
CREATE POLICY "customers_delete" ON public.orders
  FOR DELETE USING (auth.uid() = user_id AND status = 'received');

-- Kitchen: delete any order
CREATE POLICY "kitchen_delete" ON public.orders
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.kitchen_users WHERE user_id = auth.uid())
  );
