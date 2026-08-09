import styles from './Steps.module.css'
import BowlIllustration from '../components/BowlIllustration.jsx'
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
    <div className={styles.page}>
      <BowlIllustration order={order} />

      <div className={styles.card}>
        <h2 className={styles.title}>בחר חלבון / רצועה</h2>
        <p className={styles.subtitle}>אפשר לבחור יותר מאחד</p>

        <div className={styles.optionList}>
          {proteins.map(p => (
            <button
              key={p.id}
              className={[styles.optionBtn, selected.includes(p.id) ? styles.selected : ''].join(' ')}
              onClick={() => toggle(p.id)}
            >
              {p.id !== 'none' && (
                <span
                  className={styles.colorDot}
                  style={{ background: p.color, border: '2px solid rgba(0,0,0,0.1)' }}
                />
              )}
              {p.id === 'none' && <span className={styles.colorDot} style={{ background: '#e5e7eb' }}>—</span>}
              {p.label}
              {selected.includes(p.id) && <span className={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>

        <div className={styles.navRow}>
          <button className={styles.backBtn} onClick={onBack}>← חזור</button>
          <button className={styles.primaryBtn} onClick={advance}>
            {selected.length === 0 ? 'דלג על חלבון' : `המשך (${selected.length} נבחרו)`}
          </button>
        </div>
      </div>
    </div>
  )
}
