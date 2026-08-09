import styles from './Steps.module.css'
import reviewStyles from './ReviewStep.module.css'
import BowlIllustration from '../components/BowlIllustration.jsx'
import { useMenu } from '../lib/MenuContext.jsx'

export default function ReviewStep({ order, onSubmit, onBack }) {
  const { bases, toppings, proteins, sauces } = useMenu()
  const base = bases.find(b => b.id === order.base)
  const protein = proteins.find(p => p.id === order.protein)
  const sauce = sauces.find(s => s.id === order.sauce)
  const selectedToppings = toppings.filter(t => order.toppings?.includes(t.id))

  return (
    <div className={styles.page}>
      <BowlIllustration order={order} />

      <div className={styles.card}>
        <h2 className={styles.title}>סיכום ההזמנה</h2>
        <p className={styles.subtitle}>היי {order.name}, ככה נראית הקערה שלך:</p>

        <div className={reviewStyles.summaryGrid}>
          <div className={reviewStyles.row}>
            <span className={reviewStyles.rowLabel}>בסיס</span>
            <span className={reviewStyles.rowValue}>{base?.label ?? '—'}</span>
          </div>
          <div className={reviewStyles.row}>
            <span className={reviewStyles.rowLabel}>תוספות</span>
            <span className={reviewStyles.rowValue}>
              {selectedToppings.length > 0
                ? selectedToppings.map(t => t.label).join(', ')
                : 'ללא תוספות'}
            </span>
          </div>
          <div className={reviewStyles.row}>
            <span className={reviewStyles.rowLabel}>חלבון</span>
            <span className={reviewStyles.rowValue}>{protein?.label ?? '—'}</span>
          </div>
          <div className={reviewStyles.row}>
            <span className={reviewStyles.rowLabel}>רוטב</span>
            <span className={reviewStyles.rowValue}>{sauce?.label ?? '—'}</span>
          </div>
        </div>

        <button className={styles.primaryBtn} onClick={onSubmit}>
          שלח הזמנה! 🌊
        </button>

        <div className={styles.navRow}>
          <button className={styles.backBtn} onClick={onBack}>← חזור לשנות</button>
        </div>
      </div>
    </div>
  )
}
