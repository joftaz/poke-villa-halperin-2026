import { useState, useEffect } from 'react'
import styles from './MyOrder.module.css'
import BowlIllustration from '../components/BowlIllustration.jsx'
import { STATUSES } from '../data/menu.js'
import { useMenu } from '../lib/MenuContext.jsx'
import { supabase } from '../lib/supabase.js'

const STATUS_COLORS = {
  received: { bg: '#fff8e1', text: '#b86a00', border: '#f5c842' },
  preparing: { bg: '#e8f0fe', text: '#1a56db', border: '#93c5fd' },
  ready:     { bg: '#e8f5ee', text: '#166534', border: '#6ee7b7' },
}

export default function MyOrder({ order: initialOrder, savedId, onEdit, onCancel, onNewOrder }) {
  const [order, setOrder] = useState(initialOrder)

  // Realtime subscription — updates when kitchen changes status
  useEffect(() => {
    if (!savedId) return
    const channel = supabase
      .channel('order-' + savedId)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${savedId}`,
      }, payload => {
        setOrder(payload.new)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [savedId])

  const { bases, toppings, proteins, sauces } = useMenu()
  const base = bases.find(b => b.id === order.base)
  const proteinIds = Array.isArray(order.protein) ? order.protein : (order.protein ? [order.protein] : [])
  const sauceIds   = Array.isArray(order.sauce)   ? order.sauce   : (order.sauce   ? [order.sauce]   : [])
  const selectedProteins = proteins.filter(p => proteinIds.includes(p.id))
  const selectedSauces   = sauces.filter(s => sauceIds.includes(s.id))
  const selectedToppings = toppings.filter(t => order.toppings?.includes(t.id))
  const status = order.status ?? 'received'
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.received

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>ההזמנה של {order.name} 🌊</h1>
      </div>

      <div className={styles.statusBanner} style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}>
        <span className={styles.statusLabel}>סטטוס:</span>
        <span className={styles.statusValue}>{STATUSES[status]}</span>
        {status === 'received'  && <span className={styles.statusHint}>• ניתן לערוך</span>}
        {status === 'preparing' && <span className={styles.statusHint}>• בהכנה במטבח</span>}
        {status === 'ready'     && <span className={styles.statusHint}>• מוכנה לאיסוף! 🎉</span>}
      </div>

      <BowlIllustration order={order} />

      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>בסיס</span>
          <span className={styles.value}>{base?.label ?? '—'}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>תוספות</span>
          <span className={styles.value}>
            {selectedToppings.length > 0 ? selectedToppings.map(t => t.label).join(', ') : 'ללא תוספות'}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>חלבון</span>
          <span className={styles.value}>
            {selectedProteins.length > 0 ? selectedProteins.map(p => p.label).join(', ') : 'ללא חלבון'}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>רוטב</span>
          <span className={styles.value}>
            {selectedSauces.length > 0 ? selectedSauces.map(s => s.label).join(', ') : 'ללא רוטב'}
          </span>
        </div>
      </div>

      {status === 'received' && (
        <button className={styles.editBtn} onClick={onEdit}>✏️ ערוך הזמנה</button>
      )}
      <button className={styles.newOrderBtn} onClick={onNewOrder}>+ הזמנה חדשה</button>
      {status === 'received' && (
        <button className={styles.cancelBtn} onClick={onCancel}>ביטול הזמנה</button>
      )}
    </div>
  )
}
