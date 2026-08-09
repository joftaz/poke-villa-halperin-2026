import styles from './Steps.module.css'
import { useMenu } from '../lib/MenuContext.jsx'

export default function ToppingsStep({ order, onNext, onBack }) {
  const { toppings } = useMenu()
  const selected = order.toppings ?? []

  function toggle(id) {
    const next = selected.includes(id)
      ? selected.filter(t => t !== id)
      : [...selected, id]
    onNext({ toppings: next }, false)
  }

  function advance() {
    onNext({ toppings: selected }, true)
  }

  return (
    <div className={styles.screen}>
      <h2 className={styles.question}>בחר תוספות</h2>
      <p className={styles.hint}>בחר כמה שרוצים</p>

      <div className={styles.options}>
        {toppings.map(t => {
          const isSelected = selected.includes(t.id)
          return (
            <button
              key={t.id}
              className={[styles.option, isSelected ? styles.selected : ''].join(' ')}
              onClick={() => toggle(t.id)}
            >
              {t.label}
              <span className={styles.indicator}>✓</span>
            </button>
          )
        })}
      </div>

      <div className={styles.navRow}>
        <button className={styles.backBtn} onClick={onBack}>← חזור</button>
        <button className={styles.continueBtn} onClick={advance}>
          {selected.length === 0 ? 'דלג →' : `המשך (${selected.length}) →`}
        </button>
      </div>
    </div>
  )
}
