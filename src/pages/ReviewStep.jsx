import styles from './Steps.module.css'
import BowlIllustration from '../components/BowlIllustration.jsx'
import { useMenu } from '../lib/MenuContext.jsx'
import { getPresetImage } from '../data/presetImages.js'

export default function ReviewStep({ order, onSubmit, onBack, onEditIngredients }) {
  const { bases, toppings, proteins, sauces } = useMenu()
  const base = bases.find(b => b.id === order.base)
  const selectedProteins = proteins.filter(p => (order.proteins ?? []).includes(p.id))
  const selectedSauces = sauces.filter(s => (order.sauces ?? []).includes(s.id))
  const selectedToppings = toppings.filter(t => order.toppings?.includes(t.id))

  return (
    <div className={styles.screen}>
      <h2 className={styles.question}>{order.presetName ?? 'ככה נראית הקערה שלך'}</h2>
      <p className={styles.hint}>{order.presetName ? `קערת הבית של ${order.name}` : order.name}</p>

      {order.presetName && getPresetImage(order.presetName)
        ? <img className={styles.reviewPresetImage} src={getPresetImage(order.presetName)} alt={`קערת ${order.presetName}`} />
        : <BowlIllustration order={order} />}

      <div className={styles.summaryGrid}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>בסיס</span>
          <span className={styles.summaryValue}>{base?.label ?? '—'}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>תוספות</span>
          <span className={styles.summaryValue}>
            {selectedToppings.length > 0
              ? selectedToppings.map(t => t.label).join(', ')
              : 'ללא תוספות'}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>חלבון</span>
          <span className={styles.summaryValue}>
            {selectedProteins.length > 0 ? selectedProteins.map(p => p.label).join(', ') : 'ללא חלבון'}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>רוטב</span>
          <span className={styles.summaryValue}>
            {selectedSauces.length > 0 ? selectedSauces.map(s => s.label).join(', ') : 'ללא רוטב'}
          </span>
        </div>
      </div>

      {onEditIngredients && (
        <button className={styles.editIngredientsBtn} onClick={onEditIngredients}>עריכת מרכיבים</button>
      )}

      <div className={styles.navRow}>
        <button className={styles.continueBtn} onClick={onSubmit}>← שלח הזמנה</button>
        <button className={styles.backBtn} onClick={onBack}>חזור לשנות →</button>
      </div>
    </div>
  )
}
