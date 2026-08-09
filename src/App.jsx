import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import StepBar from './components/StepBar.jsx'
import NameStep from './pages/NameStep.jsx'
import BaseStep from './pages/BaseStep.jsx'
import ToppingsStep from './pages/ToppingsStep.jsx'
import ProteinStep from './pages/ProteinStep.jsx'
import SauceStep from './pages/SauceStep.jsx'
import ReviewStep from './pages/ReviewStep.jsx'
import MyOrders from './pages/MyOrders.jsx'
import Kitchen from './pages/Kitchen.jsx'
import { supabase } from './lib/supabase.js'
import { createOrder, getOrder, updateOrder, deleteOrder } from './lib/orders.js'
import styles from './App.module.css'

const EMPTY_ORDER = { name: '', base: null, toppings: [], proteins: [], sauces: [] }
const STEP_NAME = 0, STEP_BASE = 1, STEP_TOPPINGS = 2, STEP_PROTEIN = 3, STEP_SAUCE = 4, STEP_REVIEW = 5

const IDS_KEY = 'poke_order_ids'

function getStoredIds() {
  // Migrate old single-id key
  const old = localStorage.getItem('poke_order_id')
  if (old) {
    const existing = JSON.parse(localStorage.getItem(IDS_KEY) || '[]')
    if (!existing.includes(old)) existing.push(old)
    localStorage.setItem(IDS_KEY, JSON.stringify(existing))
    localStorage.removeItem('poke_order_id')
  }
  return JSON.parse(localStorage.getItem(IDS_KEY) || '[]')
}

function saveIds(orders) {
  localStorage.setItem(IDS_KEY, JSON.stringify(orders.map(o => o.id)))
}

function OrderFlow() {
  const [appState, setAppState] = useState('loading') // loading | ordering | my_orders | auth_error
  const [step, setStep] = useState(STEP_NAME)
  const [order, setOrder] = useState(EMPTY_ORDER)   // wizard state
  const [editingId, setEditingId] = useState(null)  // null = new, string = editing existing
  const [myOrders, setMyOrders] = useState([])

  useEffect(() => {
    async function init() {
      let { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error || !data.session) {
          setAppState('auth_error')
          return
        }
        session = data.session
      }

      const ids = getStoredIds()
      if (ids.length > 0 && session) {
        const fetched = await Promise.all(ids.map(id => getOrder(id)))
        const valid = fetched.filter(o => o && o.user_id === session.user.id)
        saveIds(valid)
        if (valid.length > 0) {
          setMyOrders(valid)
          setAppState('my_orders')
          return
        }
      }

      setAppState('ordering')
    }
    init()
  }, [])

  function update(patch, advance = true) {
    setOrder(prev => ({ ...prev, ...patch }))
    if (advance) setStep(s => s + 1)
  }

  async function submit() {
    try {
      let saved
      if (editingId) {
        saved = await updateOrder(editingId, {
          name: order.name,
          base: order.base,
          toppings: order.toppings,
          protein: order.proteins,
          sauce: order.sauces,
        })
        setMyOrders(prev => {
          const next = prev.map(o => o.id === editingId ? saved : o)
          saveIds(next)
          return next
        })
      } else {
        saved = await createOrder({
          name: order.name,
          base: order.base,
          toppings: order.toppings,
          protein: order.proteins,
          sauce: order.sauces,
        })
        setMyOrders(prev => {
          const next = [...prev, saved]
          saveIds(next)
          return next
        })
      }
      setEditingId(null)
      setOrder(EMPTY_ORDER)
      setStep(STEP_NAME)
      setAppState('my_orders')
    } catch (err) {
      console.error('Failed to submit order:', err)
      alert('שגיאה בשליחת ההזמנה. נסה שוב.')
    }
  }

  function startEdit(o) {
    setOrder({
      name: o.name,
      base: o.base,
      toppings: o.toppings ?? [],
      proteins: Array.isArray(o.protein) ? o.protein : (o.protein ? [o.protein] : []),
      sauces:   Array.isArray(o.sauce)   ? o.sauce   : (o.sauce   ? [o.sauce]   : []),
    })
    setEditingId(o.id)
    setStep(STEP_NAME)
    setAppState('ordering')
  }

  function startNewOrder() {
    setOrder(EMPTY_ORDER)
    setEditingId(null)
    setStep(STEP_NAME)
    setAppState('ordering')
  }

  function backToList() {
    setOrder(EMPTY_ORDER)
    setEditingId(null)
    setStep(STEP_NAME)
    setAppState('my_orders')
  }

  async function cancelOrder(id) {
    try {
      await deleteOrder(id)
    } catch (err) {
      console.error('Failed to delete order:', err)
    }
    setMyOrders(prev => {
      const next = prev.filter(o => o.id !== id)
      saveIds(next)
      if (next.length === 0) setAppState('ordering')
      return next
    })
  }

  function onOrderUpdate(updated) {
    setMyOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
  }

  if (appState === 'loading') {
    return (
      <div className={styles.app}>
        <div className={styles.topBar}><span className={styles.logo}>פוקה וילה</span></div>
        <div className={styles.loading}>טוען...</div>
      </div>
    )
  }

  if (appState === 'auth_error') {
    return (
      <div className={styles.app}>
        <div className={styles.topBar}><span className={styles.logo}>פוקה וילה</span></div>
        <div className={styles.authError}>
          <p>לא ניתן להתחבר לשרת.</p>
          <p className={styles.authErrorHint}>אנא וודא שההרשמה האנונימית מופעלת ב-Supabase (Authentication → Providers → Anonymous).</p>
          <button className={styles.retryBtn} onClick={() => setAppState('loading')}>נסה שוב</button>
        </div>
      </div>
    )
  }

  if (appState === 'my_orders') {
    return (
      <div className={styles.app}>
        <div className={styles.topBar}><span className={styles.logo}>פוקה וילה</span></div>
        <MyOrders
          orders={myOrders}
          onEdit={startEdit}
          onCancel={cancelOrder}
          onNewOrder={startNewOrder}
          onOrderUpdate={onOrderUpdate}
        />
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <div className={styles.topBar}><span className={styles.logo}>פוקה וילה</span></div>
      <StepBar currentStep={step} />
      <div className={styles.content}>
        {step === STEP_NAME     && <NameStep     order={order} onNext={p => update(p)} onBack={myOrders.length > 0 ? backToList : null} />}
        {step === STEP_BASE     && <BaseStep     order={order} onNext={p => update(p)}              onBack={() => setStep(s => s - 1)} />}
        {step === STEP_TOPPINGS && <ToppingsStep order={order} onNext={(p, adv) => update(p, adv)} onBack={() => setStep(s => s - 1)} />}
        {step === STEP_PROTEIN  && <ProteinStep  order={order} onNext={(p, adv) => update(p, adv)} onBack={() => setStep(s => s - 1)} />}
        {step === STEP_SAUCE    && <SauceStep    order={order} onNext={(p, adv) => update(p, adv)} onBack={() => setStep(s => s - 1)} />}
        {step === STEP_REVIEW   && <ReviewStep   order={order} onSubmit={submit}                    onBack={() => setStep(s => s - 1)} />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/kitchen" element={<Kitchen />} />
      <Route path="/*" element={<OrderFlow />} />
    </Routes>
  )
}
