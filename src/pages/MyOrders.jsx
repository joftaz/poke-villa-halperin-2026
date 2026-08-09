import { useState, useEffect } from 'react'
import { STATUSES } from '../data/menu.js'
import { useMenu } from '../lib/MenuContext.jsx'
import { supabase } from '../lib/supabase.js'
import styles from './MyOrders.module.css'

const STATUS_COLORS = {
  received: { bg: '#fff8e1', text: '#b86a00', border: '#f5c842' },
  preparing: { bg: '#e8f0fe', text: '#1a56db', border: '#93c5fd' },
  ready:     { bg: '#e8f5ee', text: '#166534', border: '#6ee7b7' },
}

function OrderCard({ order: initialOrder, onEdit, onCancel, onOrderUpdate }) {
  const { bases, proteins, sauces } = useMenu()
  const [order, setOrder] = useState(initialOrder)
  const status = order.status ?? 'received'
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.received
  const base = bases.find(b => b.id === order.base)
  const protein = proteins.find(p => p.id === order.protein)
  const sauce = sauces.find(s => s.id === order.sauce)

  useEffect(() => {
    const channel = supabase
      .channel('myorders-' + order.id)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${order.id}`,
      }, payload => {
        setOrder(payload.new)
        onOrderUpdate(payload.new)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [order.id])

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.name}>{order.name}</span>
        <span
          className={styles.statusBadge}
          style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}
        >
          {STATUSES[status]}
        </span>
      </div>

      <div className={styles.summary}>
        {base?.label}
        {protein && protein.id !== 'none' && ` · ${protein.label}`}
        {sauce && ` · ${sauce.label}`}
      </div>

      {status === 'received' && (
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={() => onEdit(order)}>✏️ ערוך</button>
          <button className={styles.cancelBtn} onClick={() => onCancel(order.id)}>ביטול</button>
        </div>
      )}
      {status === 'preparing' && (
        <p className={styles.hint}>בהכנה במטבח...</p>
      )}
      {status === 'ready' && (
        <div className={styles.readyBanner}>✅ מוכנה לאיסוף!</div>
      )}
    </div>
  )
}

export default function MyOrders({ orders, onEdit, onCancel, onNewOrder, onOrderUpdate }) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>ההזמנות שלי</h1>
      <div className={styles.list}>
        {orders.map(o => (
          <OrderCard
            key={o.id}
            order={o}
            onEdit={onEdit}
            onCancel={onCancel}
            onOrderUpdate={onOrderUpdate}
          />
        ))}
      </div>
      <button className={styles.newOrderBtn} onClick={onNewOrder}>+ הזמנה חדשה</button>
    </div>
  )
}
