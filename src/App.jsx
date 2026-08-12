import { useState, useEffect, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import StepBar from './components/StepBar.jsx'
import NameStep from './pages/NameStep.jsx'
import OrderModeStep from './pages/OrderModeStep.jsx'
import PresetBowlsStep from './pages/PresetBowlsStep.jsx'
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

const EMPTY_ORDER = { name: '', base: null, toppings: [], proteins: [], sauces: [], presetName: null }
const STEP_NAME = 0, STEP_MODE = 1, STEP_PRESETS = 2, STEP_BASE = 3, STEP_TOPPINGS = 4, STEP_PROTEIN = 5, STEP_SAUCE = 6, STEP_REVIEW = 7
const STEP_PROGRESS = [0, 18, 35, 35, 52, 68, 84, 100]

const IDS_KEY = 'poke_order_ids'

function getStoredIds() {
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
  const [appState, setAppState] = useState('loading')
  const [step, setStep] = useState(STEP_NAME)
  const [order, setOrder] = useState(EMPTY_ORDER)
  const [editingId, setEditingId] = useState(null)
  const [myOrders, setMyOrders] = useState([])
  const [editingPresetIngredients, setEditingPresetIngredients] = useState(false)

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
          preset_name: order.presetName,
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
          preset_name: order.presetName,
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
      setEditingPresetIngredients(false)
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
      presetName: o.preset_name ?? null,
    })
    setEditingId(o.id)
    setStep(STEP_NAME)
    setEditingPresetIngredients(false)
    setAppState('ordering')
  }

  function startNewOrder() {
    setOrder(EMPTY_ORDER)
    setEditingId(null)
    setStep(STEP_NAME)
    setEditingPresetIngredients(false)
    setAppState('ordering')
  }

  function backToList() {
    setOrder(EMPTY_ORDER)
    setEditingId(null)
    setStep(STEP_NAME)
    setEditingPresetIngredients(false)
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

  const onOrderUpdate = useCallback(function onOrderUpdate(updated) {
    setMyOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
  }, [])

  function chooseCustom() {
    setOrder(prev => ({ ...prev, base: null, toppings: [], proteins: [], sauces: [], presetName: null }))
    setEditingPresetIngredients(false)
    setStep(STEP_BASE)
  }

  function choosePreset({ name: presetName, ...recipe }) {
    setOrder(prev => ({ ...prev, ...recipe, presetName }))
    setEditingPresetIngredients(false)
    setStep(STEP_REVIEW)
  }

  function editPresetIngredients() {
    setEditingPresetIngredients(true)
    setStep(STEP_BASE)
  }

  function reviewBack() {
    if (!order.presetName) return setStep(STEP_SAUCE)
    setStep(editingPresetIngredients ? STEP_SAUCE : STEP_PRESETS)
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
      <StepBar progress={STEP_PROGRESS[step]} />
      <span className={styles.brandMark}>פוקה וילה</span>
      <div className={styles.stepWrap} key={step}>
        {step === STEP_NAME     && <NameStep     order={order} onNext={p => update(p)} onBack={myOrders.length > 0 ? backToList : null} />}
        {step === STEP_MODE     && <OrderModeStep onHouseBowls={() => setStep(STEP_PRESETS)} onCustom={chooseCustom} onBack={() => setStep(STEP_NAME)} />}
        {step === STEP_PRESETS  && <PresetBowlsStep onSelect={choosePreset} onBack={() => setStep(STEP_MODE)} />}
        {step === STEP_BASE     && <BaseStep     order={order} onNext={p => update(p)}              onBack={() => setStep(order.presetName ? STEP_PRESETS : STEP_MODE)} />}
        {step === STEP_TOPPINGS && <ToppingsStep order={order} onNext={(p, adv) => update(p, adv)} onBack={() => setStep(s => s - 1)} />}
        {step === STEP_PROTEIN  && <ProteinStep  order={order} onNext={(p, adv) => update(p, adv)} onBack={() => setStep(s => s - 1)} />}
        {step === STEP_SAUCE    && <SauceStep    order={order} onNext={(p, adv) => update(p, adv)} onBack={() => setStep(s => s - 1)} />}
        {step === STEP_REVIEW   && <ReviewStep   order={order} onSubmit={submit} onBack={reviewBack} onEditIngredients={order.presetName ? editPresetIngredients : null} />}
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
