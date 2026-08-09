import { supabase } from './supabase.js'

export async function createOrder(data) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No active session')
  const { data: order, error } = await supabase
    .from('orders')
    .insert({ ...data, user_id: session.user.id })
    .select()
    .single()
  if (error) throw error
  return order
}

export async function getOrder(id) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function updateOrder(id, patch) {
  const { data, error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateOrderStatus(id, status) {
  return updateOrder(id, { status })
}

export async function deleteOrder(id) {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
