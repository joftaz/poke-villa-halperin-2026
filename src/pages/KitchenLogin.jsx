import { useState } from 'react'
import styles from './KitchenLogin.module.css'
import { supabase } from '../lib/supabase.js'

const KITCHEN_PIN = '1234'

export default function KitchenLogin({ onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  async function handlePinComplete(code) {
    if (code !== KITCHEN_PIN) {
      setTimeout(() => { setPin(''); setError(true) }, 400)
      return
    }
    setSigningIn(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: import.meta.env.VITE_KITCHEN_EMAIL,
      password: import.meta.env.VITE_KITCHEN_PASSWORD,
    })
    setSigningIn(false)
    if (authError) {
      setPin('')
      setError(true)
    } else {
      onSuccess()
    }
  }

  function handleDigit(d) {
    if (pin.length >= 4 || signingIn) return
    const next = pin + d
    setPin(next)
    setError(false)
    if (next.length === 4) handlePinComplete(next)
  }

  function handleDelete() {
    if (signingIn) return
    setPin(p => p.slice(0, -1))
    setError(false)
  }

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>👨‍🍳</div>
        <h1 className={styles.title}>מסך מטבח</h1>
        <p className={styles.subtitle}>{signingIn ? 'מתחבר...' : 'הכנס קוד גישה'}</p>

        <div className={[styles.dots, error ? styles.shake : ''].join(' ')}>
          {[0,1,2,3].map(i => (
            <div key={i} className={[styles.dot, pin.length > i ? styles.filled : ''].join(' ')} />
          ))}
        </div>

        {error && <p className={styles.error}>קוד שגוי, נסה שוב</p>}

        <div className={styles.pad}>
          {digits.map((d, i) => (
            <button
              key={i}
              className={[styles.key, d === '' ? styles.empty : '', d === '⌫' ? styles.del : ''].join(' ')}
              onClick={() => d === '⌫' ? handleDelete() : d !== '' ? handleDigit(d) : null}
              disabled={d === '' || signingIn}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
