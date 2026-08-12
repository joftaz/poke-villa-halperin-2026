import styles from './Steps.module.css'

export default function OrderModeStep({ onHouseBowls, onCustom, onBack }) {
  return (
    <div className={styles.screen}>
      <h2 className={styles.question}>איך בא לך את הפוקה?</h2>
      <p className={styles.hint}>אפשר לבחור קערה מוכנה או להרכיב לבד</p>

      <div className={styles.modeOptions}>
        <button className={styles.modeOption} onClick={onHouseBowls}>
          <span className={styles.modeLabel}>קערות הבית</span>
          <span className={styles.modeDescription}>שלוש קערות שבנינו ואהבנו</span>
          <span className={styles.modeArrow}>←</span>
        </button>
        <button className={styles.modeOption} onClick={onCustom}>
          <span className={styles.modeLabel}>הרכבה אישית</span>
          <span className={styles.modeDescription}>בוחרים בסיס, תוספות, חלבון ורוטב</span>
          <span className={styles.modeArrow}>←</span>
        </button>
      </div>

      <div className={styles.navRow}>
        <span />
        <button className={styles.backBtn} onClick={onBack}>חזור →</button>
      </div>
    </div>
  )
}
