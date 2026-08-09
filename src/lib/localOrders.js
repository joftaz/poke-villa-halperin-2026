const KEY = 'poke_villa_orders'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(orders) {
  localStorage.setItem(KEY, JSON.stringify(orders))
}

export function getOrders() {
  return load()
}

export function getOrder(id) {
  return load().find(o => o.id === id) ?? null
}

export function createOrder(data) {
  const order = {
    ...data,
    id: crypto.randomUUID(),
    status: 'received',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const orders = load()
  orders.push(order)
  save(orders)
  return order
}

export function updateOrderStatus(id, status) {
  const orders = load().map(o =>
    o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o
  )
  save(orders)
  // Notify other tabs
  window.dispatchEvent(new StorageEvent('storage', { key: KEY }))
  return orders.find(o => o.id === id)
}

export function updateOrder(id, patch) {
  const orders = load().map(o =>
    o.id === id ? { ...o, ...patch, updated_at: new Date().toISOString() } : o
  )
  save(orders)
  return orders.find(o => o.id === id)
}
