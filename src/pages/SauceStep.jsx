import styles from './Steps.module.css'
import BowlIllustration from '../components/BowlIllustration.jsx'
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
    <div className={styles.page}>
      <BowlIllustration order={order} />

      <div className={styles.card}>
        <h2 className={styles.title}>בחר רוטב</h2>
        <p className={styles.subtitle}>אפשר לבחור יותר מאחד</p>

        <div className={styles.optionList}>
          {sauces.map(s => (
            <button
              key={s.id}
              className={[styles.optionBtn, selected.includes(s.id) ? styles.selected : ''].join(' ')}
              onClick={() => toggle(s.id)}
            >
              <span
                className={styles.colorDot}
                style={{ background: s.color }}
              />
              {s.label}
              {selected.includes(s.id) && <span className={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>

        <div className={styles.navRow}>
          <button className={styles.backBtn} onClick={onBack}>← חזור</button>
          <button className={styles.primaryBtn} onClick={advance}>
            {selected.length === 0 ? 'דלג על רוטב' : `המשך (${selected.length} נבחרו)`}
          </button>
        </div>
      </div>
    </div>
  )
}
