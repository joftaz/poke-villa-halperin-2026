import styles from './Steps.module.css'
import BowlIllustration from '../components/BowlIllustration.jsx'
import { useMenu } from '../lib/MenuContext.jsx'

export default function ProteinStep({ order, onNext, onBack }) {
  const { proteins } = useMenu()
  return (
    <div className={styles.page}>
      <BowlIllustration order={order} />

      <div className={styles.card}>
        <h2 className={styles.title}>בחר חלבון / רצועה</h2>
        <p className={styles.subtitle}>בחר אחד מהאפשרויות:</p>

        <div className={styles.optionList}>
          {proteins.map(p => (
            <button
              key={p.id}
              className={[styles.optionBtn, order.protein === p.id ? styles.selected : ''].join(' ')}
              onClick={() => onNext({ protein: p.id })}
            >
              {p.id !== 'none' && (
                <span
                  className={styles.colorDot}
                  style={{ background: p.color, border: '2px solid rgba(0,0,0,0.1)' }}
                />
              )}
              {p.id === 'none' && <span className={styles.colorDot} style={{ background: '#e5e7eb' }}>—</span>}
              {p.label}
              {order.protein === p.id && <span className={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>

        <div className={styles.navRow}>
          <button className={styles.backBtn} onClick={onBack}>← חזור</button>
        </div>
      </div>
    </div>
  )
}
