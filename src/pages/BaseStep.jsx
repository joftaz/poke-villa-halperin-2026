import styles from './Steps.module.css'
import { useMenu } from '../lib/MenuContext.jsx'

export default function BaseStep({ order, onNext, onBack }) {
  const { bases } = useMenu()
  return (
    <div className={styles.screen}>
      <h2 className={styles.question}>בחר את הבסיס שלך</h2>
      <p className={styles.hint}>בחר אחד מהאפשרויות</p>

      <div className={styles.options}>
        {bases.map(base => (
          <button
            key={base.id}
            className={[styles.option, order.base === base.id ? styles.selected : ''].join(' ')}
            onClick={() => onNext({ base: base.id })}
          >
            {base.label}
            <span className={styles.indicator}>✓</span>
          </button>
        ))}
      </div>

      <div className={styles.navRow}>
        <span />
        <button className={styles.backBtn} onClick={onBack}>חזור →</button>
      </div>
    </div>
  )
}
