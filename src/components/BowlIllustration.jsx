import { useMenu } from '../lib/MenuContext.jsx'
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
    <circle
      cx={pos.cx}
      cy={pos.cy}
      r={size}
      fill={topping.color}
      opacity="0.88"
    />
  )
}

export default function BowlIllustration({ order }) {
  const { bases, toppings, proteins, sauces } = useMenu()
  const base = bases.find(b => b.id === order.base)
  const selectedProteins = proteins.filter(p => (order.proteins ?? []).includes(p.id)).filter(p => p.id !== 'none')
  const selectedSauces = sauces.filter(s => (order.sauces ?? []).includes(s.id))
  const selectedToppings = toppings.filter(t => (order.toppings ?? []).includes(t.id))

  const baseColor = base?.color ?? '#f5e6c8'
  const sauceTint = selectedSauces[0]?.tint ?? 'rgba(0,0,0,0)'
  const proteinColor = selectedProteins[0]?.color ?? 'transparent'

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
        aria-label="איור קערת פוקה"
      >
        <ellipse cx="50" cy="94" rx="38" ry="6" fill="rgba(0,0,0,0.10)" />
        <ellipse cx="50" cy="52" rx="42" ry="44" fill="#e8ddd0" />
        <ellipse cx="50" cy="50" rx="39" ry="41" fill="#f2ece4" />
        <ellipse cx="50" cy="50" rx="34" ry="36" fill={baseColor} />

        {selectedSauces.length > 0 && (
          <ellipse
            cx="50" cy="50" rx="34" ry="36"
            fill={sauceTint}
          />
        )}

        {selectedToppings.map((topping, i) => (
          <ToppingBlob
            key={topping.id}
            topping={topping}
            pos={TOPPING_POSITIONS[i % TOPPING_POSITIONS.length]}
            index={i}
          />
        ))}

        {selectedProteins.length > 0 && (
          <g>
            <rect x="28" y="44" width="44" height="12" rx="6" fill={proteinColor} opacity="0.95" />
            <rect x="32" y="47" width="36" height="6" rx="3" fill="rgba(255,255,255,0.25)" />
          </g>
        )}

        <ellipse cx="50" cy="50" rx="39" ry="41" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />

        {!order.base && !selectedToppings.length && (
          <text x="50" y="54" textAnchor="middle" fontSize="9" fill="#aaa" style={{ userSelect: 'none' }}>
            בניית הקערה...
          </text>
        )}
      </svg>
    </div>
  )
}
