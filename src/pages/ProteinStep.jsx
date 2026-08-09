import styles from './Steps.module.css'
import { useMenu } from '../lib/MenuContext.jsx'

export default function ProteinStep({ order, onNext, onBack }) {
  const { proteins } = useMenu()
  const selected = order.proteins ?? []

  function toggle(id) {
    const next = selected.includes(id)
      ? selected.filter(p => p !== id)
      : [...selected, id]
    onNext({ proteins: next }, false)
  }

  function advance() {
    onNext({ proteins: selected }, true)
  }

  return (
    <div className={styles.screen}>
      <h2 className={styles.question}>בחר חלבון</h2>
      <p className={styles.hint}>אפשר לבחור יותר מאחד</p>

      <div className={styles.options}>
        {proteins.map(p => (
          <button
            key={p.id}
            className={[styles.option, selected.includes(p.id) ? styles.selected : ''].join(' ')}
            onClick={() => toggle(p.id)}
          >
            {p.label}
            <span className={styles.indicator}>✓</span>
          </button>
        ))}
      </div>

      <div className={styles.navRow}>
        <button className={styles.continueBtn} onClick={advance}>
          {selected.length === 0 ? '← דלג' : `← המשך (${selected.length})`}
        </button>
        <button className={styles.backBtn} onClick={onBack}>חזור →</button>
      </div>
    </div>
  )
}
