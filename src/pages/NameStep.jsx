import { useState } from 'react'
import styles from './Steps.module.css'
import BowlIllustration from '../components/BowlIllustration.jsx'

export default function NameStep({ order, onNext, onBack }) {
  const [name, setName] = useState(order.name ?? '')

  return (
    <div className={styles.page}>
      <BowlIllustration order={order} />

      <div className={styles.card}>
        <h1 className={styles.title}>ברוכים הבאים לפוקה וילה</h1>
        <p className={styles.subtitle}>מה שמך?</p>

        <input
          className={styles.nameInput}
          type="text"
          placeholder="הכנס את שמך..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onNext({ name: name.trim() })}
          autoFocus
          maxLength={40}
          dir="rtl"
        />

        <button
          className={styles.primaryBtn}
          disabled={!name.trim()}
          onClick={() => onNext({ name: name.trim() })}
        >
          המשך לבנות את הקערה →
        </button>

        {onBack && (
          <div className={styles.navRow}>
            <button className={styles.backBtn} onClick={onBack}>← חזור להזמנות</button>
          </div>
        )}
      </div>
    </div>
  )
}
