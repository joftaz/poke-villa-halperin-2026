import styles from './StepBar.module.css'

export default function StepBar({ progress }) {
  const pct = Math.max(0, Math.min(100, progress))
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  )
}
