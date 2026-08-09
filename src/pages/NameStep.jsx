import { useState } from 'react'
import styles from './Steps.module.css'

export default function NameStep({ order, onNext, onBack }) {
  const [name, setName] = useState(order.name ?? '')

  return (
    <div className={styles.screen}>
      <h1 className={styles.question}>מה שמך?</h1>
      <p className={styles.hint}>ברוכים הבאים לפוקה וילה</p>

      <input
        className={styles.nameField}
        type="text"
        placeholder="הקלד את שמך"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && name.trim() && onNext({ name: name.trim() })}
        autoFocus
        maxLength={40}
        dir="rtl"
      />

      <div className={styles.navRow}>
        {onBack
          ? <button className={styles.backBtn} onClick={onBack}>← חזור</button>
          : <span />}
        <button
          className={styles.continueBtn}
          disabled={!name.trim()}
          onClick={() => onNext({ name: name.trim() })}
        >
          המשך →
        </button>
      </div>
    </div>
  )
}
