import { BASES, TOPPINGS, PROTEINS, SAUCES } from '../data/menu.js'
import styles from './BowlIllustration.module.css'

const TOPPING_POSITIONS = [
  { cx: 50, cy: 36 }, { cx: 68, cy: 44 }, { cx: 62, cy: 60 },
  { cx: 46, cy: 66 }, { cx: 30, cy: 58 }, { cx: 24, cy: 43 },
  { cx: 36, cy: 30 }, { cx: 63, cy: 32 }, { cx: 76, cy: 54 },
  { cx: 55, cy: 72 }, { cx: 37, cy: 72 }, { cx: 22, cy: 56 },
]

function ToppingBlob({ topping, pos, index }) {
  const size = 9 + (index % 3) * 2
  return (
    <g className={styles.toppingBlob} style={{ '--delay': `${index * 60}ms` }}>
      <circle cx={pos.cx} cy={pos.cy} r={size} fill={topping.color} opacity="0.88" />
      <text
        x={pos.cx}
        y={pos.cy + 4}
        textAnchor="middle"
        fontSize="10"
        style={{ userSelect: 'none' }}
      >
        {topping.emoji}
      </text>
    </g>
  )
}

export default function BowlIllustration({ order }) {
  const base = BASES.find(b => b.id === order.base)
  const protein = PROTEINS.find(p => p.id === order.protein)
  const sauce = SAUCES.find(s => s.id === order.sauce)
  const selectedToppings = TOPPINGS.filter(t => order.toppings.includes(t.id))

  const baseColor = base?.color ?? '#f5e6c8'
  const sauceTint = sauce?.tint ?? 'rgba(0,0,0,0)'
  const proteinColor = protein?.color ?? 'transparent'

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
        aria-label="איור קערת פוקה"
      >
        {/* Bowl shadow */}
        <ellipse cx="50" cy="94" rx="38" ry="6" fill="rgba(0,0,0,0.10)" />

        {/* Bowl body */}
        <ellipse cx="50" cy="52" rx="42" ry="44" fill="#e8ddd0" />
        <ellipse cx="50" cy="50" rx="39" ry="41" fill="#f2ece4" />

        {/* Base fill */}
        <ellipse cx="50" cy="50" rx="34" ry="36" fill={baseColor} className={styles.baseLayer} />

        {/* Sauce tint overlay */}
        {sauce && (
          <ellipse
            cx="50" cy="50" rx="34" ry="36"
            fill={sauceTint}
            className={styles.sauceLayer}
          />
        )}

        {/* Toppings */}
        {selectedToppings.map((topping, i) => (
          <ToppingBlob
            key={topping.id}
            topping={topping}
            pos={TOPPING_POSITIONS[i % TOPPING_POSITIONS.length]}
            index={i}
          />
        ))}

        {/* Protein strip */}
        {protein && protein.id !== 'none' && (
          <g className={styles.proteinLayer}>
            <rect
              x="28" y="44" width="44" height="12" rx="6"
              fill={proteinColor}
              opacity="0.95"
            />
            <rect
              x="32" y="47" width="36" height="6" rx="3"
              fill="rgba(255,255,255,0.25)"
            />
          </g>
        )}

        {/* Bowl rim highlight */}
        <ellipse cx="50" cy="50" rx="39" ry="41" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />

        {/* Empty bowl prompt */}
        {!order.base && !selectedToppings.length && (
          <text
            x="50" y="54" textAnchor="middle"
            fontSize="9" fill="#aaa"
            style={{ userSelect: 'none' }}
          >
            בניית הקערה...
          </text>
        )}
      </svg>
    </div>
  )
}
