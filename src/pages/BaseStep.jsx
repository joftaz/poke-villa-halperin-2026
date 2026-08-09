import styles from './Steps.module.css'
import BowlIllustration from '../components/BowlIllustration.jsx'
import { BASES } from '../data/menu.js'

export default function BaseStep({ order, onNext, onBack }) {
  return (
    <div className={styles.page}>
      <BowlIllustration order={order} />

      <div className={styles.card}>
        <h2 className={styles.title}>בחר בסיס</h2>
        <p className={styles.subtitle}>בחר אחד מהאפשרויות:</p>

        <div className={styles.optionList}>
          {BASES.map(base => (
            <button
              key={base.id}
              className={[styles.optionBtn, order.base === base.id ? styles.selected : ''].join(' ')}
              onClick={() => onNext({ base: base.id })}
            >
              <span
                className={styles.colorDot}
                style={{ background: base.color, border: '2px solid rgba(0,0,0,0.1)' }}
              />
              {base.label}
              {order.base === base.id && <span className={styles.checkmark}>✓</span>}
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
