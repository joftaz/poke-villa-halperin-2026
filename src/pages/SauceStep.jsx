import styles from './Steps.module.css'
import { useMenu } from '../lib/MenuContext.jsx'

export default function SauceStep({ order, onNext, onBack }) {
  const { sauces } = useMenu()
  const selected = order.sauces ?? []

  function toggle(id) {
    const next = selected.includes(id)
      ? selected.filter(s => s !== id)
      : [...selected, id]
    onNext({ sauces: next }, false)
  }

  function advance() {
    onNext({ sauces: selected }, true)
  }

  return (
    <div className={styles.screen}>
      <h2 className={styles.question}>בחר רוטב</h2>
      <p className={styles.hint}>אפשר לבחור יותר מאחד</p>

      <div className={styles.options}>
        {sauces.map(s => (
          <button
            key={s.id}
            className={[styles.option, selected.includes(s.id) ? styles.selected : ''].join(' ')}
            onClick={() => toggle(s.id)}
          >
            {s.label}
            <span className={styles.indicator}>✓</span>
          </button>
        ))}
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
