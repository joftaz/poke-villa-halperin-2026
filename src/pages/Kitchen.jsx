import { useState, useEffect, useCallback } from 'react'
import { STATUSES } from '../data/menu.js'
import { useMenu } from '../lib/MenuContext.jsx'
import { supabase } from '../lib/supabase.js'
import { getAllOrders, updateOrderStatus, deleteOrder } from '../lib/orders.js'
import KitchenLogin from './KitchenLogin.jsx'
import styles from './Kitchen.module.css'

const STATUS_META = {
  received: { label: STATUSES.received, color: '#b86a00', bg: '#fff8e1', border: '#f5c842', next: 'preparing', nextLabel: 'התחל הכנה →' },
  preparing: { label: STATUSES.preparing, color: '#1a56db', bg: '#e8f0fe', border: '#93c5fd', next: 'ready',    nextLabel: 'סמן מוכנה ✓' },
  ready:     { label: STATUSES.ready,    color: '#166534', bg: '#e8f5ee', border: '#6ee7b7', next: null,        nextLabel: null },
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `לפני ${diff} שניות`
  if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דקות`
  return `לפני ${Math.floor(diff / 3600)} שעות`
}

function OrderCard({ order, onAdvance, onDelete }) {
  const { bases, toppings, proteins, sauces } = useMenu()
  const meta = STATUS_META[order.status]
  const base = bases.find(b => b.id === order.base)
  const proteinIds = Array.isArray(order.protein) ? order.protein : (order.protein ? [order.protein] : [])
  const sauceIds   = Array.isArray(order.sauce)   ? order.sauce   : (order.sauce   ? [order.sauce]   : [])
  const selectedProteins = proteins.filter(p => proteinIds.includes(p.id))
  const selectedSauces   = sauces.filter(s => sauceIds.includes(s.id))
  const selectedToppings = toppings.filter(t => order.toppings?.includes(t.id))
  const [, setTick] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={[styles.card, styles[order.status]].join(' ')}>
      <div className={styles.cardHeader}>
        <div className={styles.nameRow}>
          <span className={styles.customerName}>{order.name}</span>
          <span className={styles.timeAgo}>{timeAgo(order.created_at)}</span>
        </div>
        <div className={styles.cardHeaderRight}>
          <span className={styles.statusBadge} style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}>
            {meta.label}
          </span>
          <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)} title="מחק הזמנה">🗑</button>
        </div>
      </div>

      <div className={styles.orderDetails}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>בסיס</span>
          <span className={styles.detailValue}>{base?.label ?? '—'}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>תוספות</span>
          <span className={styles.detailValue}>
            {selectedToppings.length > 0
              ? selectedToppings.map(t => `${t.emoji} ${t.label}`).join('  ·  ')
              : <span className={styles.none}>ללא</span>}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>חלבון</span>
          <span className={styles.detailValue}>
            {selectedProteins.length > 0 ? selectedProteins.map(p => p.label).join('  ·  ') : <span className={styles.none}>ללא</span>}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>רוטב</span>
          <span className={styles.detailValue}>
            {selectedSauces.length > 0 ? selectedSauces.map(s => s.label).join('  ·  ') : <span className={styles.none}>ללא</span>}
          </span>
        </div>
      </div>

      {confirmDelete ? (
        <div className={styles.deleteConfirm}>
          <span>למחוק את ההזמנה של {order.name}?</span>
          <div className={styles.deleteConfirmBtns}>
            <button className={styles.confirmYes} onClick={() => onDelete(order.id)}>כן, מחק</button>
            <button className={styles.confirmNo} onClick={() => setConfirmDelete(false)}>ביטול</button>
          </div>
        </div>
      ) : (
        <>
          {meta.next && (
            <button
              className={[styles.advanceBtn, order.status === 'preparing' ? styles.advanceBtnReady : ''].join(' ')}
              onClick={() => onAdvance(order.id, meta.next)}
            >
              {meta.nextLabel}
            </button>
          )}
          {order.status === 'ready' && (
            <div className={styles.readyBanner}>✅ מוכנה לאיסוף!</div>
          )}
        </>
      )}
    </div>
  )
}

export default function Kitchen() {
  const [authed, setAuthed] = useState(false)
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    try {
      const data = await getAllOrders()
      setOrders(data)
    } catch (e) {
      setError('שגיאה בטעינת הזמנות')
    }
  }, [])

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    reload().finally(() => setLoading(false))

    // Realtime: refresh whenever any order changes
    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        reload()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [authed, reload])

  async function advance(id, nextStatus) {
    try {
      await updateOrderStatus(id, nextStatus)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o))
    } catch (e) {
      setError('שגיאה בעדכון סטטוס')
    }
  }

  async function remove(id) {
    try {
      await deleteOrder(id)
      setOrders(prev => prev.filter(o => o.id !== id))
    } catch (e) {
      setError('שגיאה במחיקת הזמנה')
    }
  }

  function signOut() {
    supabase.auth.signOut()
    setAuthed(false)
    setOrders([])
  }

  if (!authed) return <KitchenLogin onSuccess={() => setAuthed(true)} />

  const displayed = filter === 'all' ? orders
    : filter === 'active' ? orders.filter(o => o.status !== 'ready')
    : orders.filter(o => o.status === 'ready')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>👨‍🍳 מטבח פוקה וילה</h1>
          <button className={styles.signOutBtn} onClick={signOut}>יציאה</button>
        </div>
        <div className={styles.counts}>
          <span className={styles.countBadge} style={{ background: '#fff8e1', color: '#b86a00' }}>
            {orders.filter(o => o.status === 'received').length} ממתינות
          </span>
          <span className={styles.countBadge} style={{ background: '#e8f0fe', color: '#1a56db' }}>
            {orders.filter(o => o.status === 'preparing').length} בהכנה
          </span>
          <span className={styles.countBadge} style={{ background: '#e8f5ee', color: '#166534' }}>
            {orders.filter(o => o.status === 'ready').length} מוכנות
          </span>
        </div>
        <div className={styles.filterRow}>
          {[['all','הכל'],['active','פעילות'],['ready','מוכנות']].map(([val, label]) => (
            <button key={val}
              className={[styles.filterBtn, filter === val ? styles.filterActive : ''].join(' ')}
              onClick={() => setFilter(val)}
            >{label}</button>
          ))}
        </div>
      </header>

      <main className={styles.grid}>
        {error && <div className={styles.errorMsg}>{error}</div>}
        {loading && <div className={styles.empty}><p>טוען הזמנות...</p></div>}
        {!loading && displayed.length === 0 && (
          <div className={styles.empty}><p>אין הזמנות כרגע</p></div>
        )}
        {displayed.map(order => (
          <OrderCard key={order.id} order={order} onAdvance={advance} onDelete={remove} />
        ))}
      </main>
    </div>
  )
}
