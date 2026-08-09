import styles from './Steps.module.css'
import BowlIllustration from '../components/BowlIllustration.jsx'
import { useMenu } from '../lib/MenuContext.jsx'

export default function ToppingsStep({ order, onNext, onBack }) {
  const { toppings: TOPPINGS } = useMenu()
  const selected = order.toppings ?? []

  function toggle(id) {
    const next = selected.includes(id)
      ? selected.filter(t => t !== id)
      : [...selected, id]
    onNext({ toppings: next }, false) // false = don't advance step
  }

  function advance() {
    onNext({ toppings: selected }, true)
  }

  return (
    <div className={styles.page}>
      <BowlIllustration order={order} />

      <div className={styles.card}>
        <h2 className={styles.title}>בחר תוספות</h2>
        <p className={styles.subtitle}>אפשר לבחור כמה שרוצים</p>

        <div className={styles.toppingGrid}>
          {TOPPINGS.map(t => {
            const isSelected = selected.includes(t.id)
            return (
              <button
                key={t.id}
                className={[styles.toppingChip, isSelected ? styles.selected : ''].join(' ')}
                onClick={() => toggle(t.id)}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
                {isSelected && <span className={styles.chipCheck}>✓</span>}
              </button>
            )
          })}
        </div>

        <div className={styles.navRow}>
          <button className={styles.backBtn} onClick={onBack}>← חזור</button>
          <button className={styles.primaryBtn} onClick={advance}>
            {selected.length === 0 ? 'דלג על תוספות' : `המשך (${selected.length} נבחרו)`}
          </button>
        </div>
      </div>
    </div>
  )
}
