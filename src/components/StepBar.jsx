import styles from './StepBar.module.css'

const STEPS = ['שם', 'בסיס', 'תוספות', 'חלבון', 'רוטב', 'סיכום']

export default function StepBar({ currentStep }) {
  return (
    <div className={styles.bar} role="progressbar" aria-valuenow={currentStep} aria-valuemax={STEPS.length - 1}>
      {STEPS.map((label, i) => (
        <div
          key={i}
          className={[
            styles.step,
            i < currentStep ? styles.done : '',
            i === currentStep ? styles.active : '',
          ].join(' ')}
        >
          <div className={styles.dot}>{i < currentStep ? '✓' : i + 1}</div>
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  )
}
