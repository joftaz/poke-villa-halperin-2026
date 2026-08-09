-- Customers: cancel (delete) their own order only while status = received
CREATE POLICY "customers_delete" ON public.orders
  FOR DELETE USING (auth.uid() = user_id AND status = 'received');

-- Kitchen: delete any order
CREATE POLICY "kitchen_delete" ON public.orders
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.kitchen_users WHERE user_id = auth.uid())
  );
