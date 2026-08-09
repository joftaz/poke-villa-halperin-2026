import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import StepBar from './components/StepBar.jsx'
import NameStep from './pages/NameStep.jsx'
import BaseStep from './pages/BaseStep.jsx'
import ToppingsStep from './pages/ToppingsStep.jsx'
import ProteinStep from './pages/ProteinStep.jsx'
import SauceStep from './pages/SauceStep.jsx'
import ReviewStep from './pages/ReviewStep.jsx'
import MyOrder from './pages/MyOrder.jsx'
import Kitchen from './pages/Kitchen.jsx'
import { supabase } from './lib/supabase.js'
import { createOrder, getOrder } from './lib/orders.js'
import styles from './App.module.css'

const EMPTY_ORDER = { name: '', base: null, toppings: [], protein: null, sauce: null }
const STEP_NAME = 0, STEP_BASE = 1, STEP_TOPPINGS = 2, STEP_PROTEIN = 3, STEP_SAUCE = 4, STEP_REVIEW = 5

function OrderFlow() {
  const [appState, setAppState] = useState('loading') // loading | ordering | submitted
  const [step, setStep] = useState(STEP_NAME)
  const [order, setOrder] = useState(EMPTY_ORDER)
  const [savedId, setSavedId] = useState(null)

  useEffect(() => {
    async function init() {
      // Ensure we have an anonymous session
      let { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        const { data } = await supabase.auth.signInAnonymously()
        session = data.session
      }

      // Check if this browser already has a submitted order
      const existingId = localStorage.getItem('poke_order_id')
      if (existingId && session) {
        const existing = await getOrder(existingId)
        if (existing && existing.user_id === session.user.id) {
          setOrder(existing)
          setSavedId(existingId)
          setAppState('submitted')
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
      const saved = await createOrder({
        name: order.name,
        base: order.base,
        toppings: order.toppings,
        protein: order.protein,
        sauce: order.sauce,
      })
      localStorage.setItem('poke_order_id', saved.id)
      setSavedId(saved.id)
      setOrder(saved)
      setAppState('submitted')
    } catch (err) {
      console.error('Failed to submit order:', err)
      alert('שגיאה בשליחת ההזמנה. נסה שוב.')
    }
  }

  function editOrder() {
    setStep(STEP_NAME)
    setAppState('ordering')
  }

  function newOrder() {
    localStorage.removeItem('poke_order_id')
    setSavedId(null)
    setOrder(EMPTY_ORDER)
    setStep(STEP_NAME)
    setAppState('ordering')
  }

  if (appState === 'loading') {
    return (
      <div className={styles.app}>
        <div className={styles.topBar}><span className={styles.logo}>🌊 פוקה וילה</span></div>
        <div className={styles.loading}>טוען...</div>
      </div>
    )
  }

  if (appState === 'submitted') {
    return (
      <div className={styles.app}>
        <div className={styles.topBar}><span className={styles.logo}>🌊 פוקה וילה</span></div>
        <MyOrder order={order} savedId={savedId} onEdit={editOrder} onNewOrder={newOrder} />
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <div className={styles.topBar}><span className={styles.logo}>🌊 פוקה וילה</span></div>
      <StepBar currentStep={step} />
      <div className={styles.content}>
        {step === STEP_NAME     && <NameStep     order={order} onNext={p => update(p)} />}
        {step === STEP_BASE     && <BaseStep     order={order} onNext={p => update(p)}              onBack={() => setStep(s => s - 1)} />}
        {step === STEP_TOPPINGS && <ToppingsStep order={order} onNext={(p, adv) => update(p, adv)} onBack={() => setStep(s => s - 1)} />}
        {step === STEP_PROTEIN  && <ProteinStep  order={order} onNext={p => update(p)}              onBack={() => setStep(s => s - 1)} />}
        {step === STEP_SAUCE    && <SauceStep    order={order} onNext={p => update(p)}              onBack={() => setStep(s => s - 1)} />}
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
