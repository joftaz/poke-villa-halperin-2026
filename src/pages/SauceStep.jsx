import styles from './Steps.module.css'
import BowlIllustration from '../components/BowlIllustration.jsx'
import { SAUCES } from '../data/menu.js'

export default function SauceStep({ order, onNext, onBack }) {
  return (
    <div className={styles.page}>
      <BowlIllustration order={order} />

      <div className={styles.card}>
        <h2 className={styles.title}>בחר רוטב</h2>
        <p className={styles.subtitle}>בחר אחד מהאפשרויות:</p>

        <div className={styles.optionList}>
          {SAUCES.map(s => (
            <button
              key={s.id}
              className={[styles.optionBtn, order.sauce === s.id ? styles.selected : ''].join(' ')}
              onClick={() => onNext({ sauce: s.id })}
            >
              <span
                className={styles.colorDot}
                style={{ background: s.color }}
              />
              {s.label}
              {order.sauce === s.id && <span className={styles.checkmark}>✓</span>}
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
