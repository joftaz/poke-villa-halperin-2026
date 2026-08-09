import styles from './StepBar.module.css'

const TOTAL_STEPS = 6

export default function StepBar({ currentStep }) {
  const pct = (currentStep / (TOTAL_STEPS - 1)) * 100
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={currentStep} aria-valuemax={TOTAL_STEPS - 1}>
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  )
}
