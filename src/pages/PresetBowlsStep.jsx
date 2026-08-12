import BowlIllustration from '../components/BowlIllustration.jsx'
import { getPresetImage } from '../data/presetImages.js'
import { useMenu } from '../lib/MenuContext.jsx'
import styles from './Steps.module.css'

function ingredientLabels(preset, menu) {
  const ids = [preset.base, ...preset.toppings, ...preset.proteins, ...preset.sauces]
  const ingredients = [...menu.bases, ...menu.toppings, ...menu.proteins, ...menu.sauces]
  return ids.map(id => ingredients.find(item => item.id === id)?.label).filter(Boolean)
}

export default function PresetBowlsStep({ onSelect, onBack }) {
  const menu = useMenu()

  return (
    <div className={[styles.screen, styles.presetScreen].join(' ')}>
      <h2 className={styles.question}>קערות הבית</h2>
      <p className={styles.hint}>בחר קערה ותוכל לערוך אותה לפני השליחה</p>

      {menu.presetsLoading && <p className={styles.presetState}>טוען את קערות הבית...</p>}

      {!menu.presetsLoading && menu.presets.length === 0 && (
        <div className={styles.presetState} role="status">
          <p>קערות הבית אינן זמינות כרגע.</p>
          <button className={styles.continueBtn} onClick={onBack}>חזרה לבחירה →</button>
        </div>
      )}

      <div className={styles.presetList}>
        {menu.presets.map(preset => {
          const image = getPresetImage(preset.name)
          const labels = ingredientLabels(preset, menu)
          return (
            <button key={preset.name} className={styles.presetCard} onClick={() => onSelect(preset)}>
              <span className={styles.presetImageWrap}>
                {image
                  ? <img className={styles.presetImage} src={image} alt={`קערת ${preset.name}`} />
                  : <BowlIllustration order={preset} />}
              </span>
              <span className={styles.presetContent}>
                <span className={styles.presetName}>{preset.name}</span>
                <span className={styles.presetIngredients}>{labels.join(' · ')}</span>
              </span>
              <span className={styles.presetArrow} aria-hidden="true">←</span>
            </button>
          )
        })}
      </div>

      {menu.presets.length > 0 && (
        <div className={styles.navRow}>
          <span />
          <button className={styles.backBtn} onClick={onBack}>חזור →</button>
        </div>
      )}
    </div>
  )
}
