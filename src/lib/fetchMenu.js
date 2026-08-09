const SHEET_ID = '1dvZtAaRk08UMJ0pOeOHC7Z0BFa_KYgf-5vgrWeMjXyk'
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`

function hexToRgba(hex, alpha) {
  if (!hex || hex === 'transparent') return 'rgba(0,0,0,0)'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function parseLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') inQuotes = !inQuotes
    else if (ch === ',' && !inQuotes) { result.push(current); current = '' }
    else current += ch
  }
  result.push(current)
  return result
}

export async function fetchMenu() {
  const resp = await fetch(CSV_URL)
  if (!resp.ok) throw new Error(`Failed to fetch menu: ${resp.status}`)
  const text = await resp.text()

  const [headerLine, ...dataLines] = text.trim().split('\n')
  const headers = parseLine(headerLine).map(h => h.trim())

  const rows = dataLines
    .map(line => Object.fromEntries(headers.map((h, i) => [h, (parseLine(line)[i] ?? '').trim()])))
    .filter(r => r.active?.toUpperCase() !== 'FALSE')

  return {
    bases:    rows.filter(r => r.category === 'base')
                  .map(r => ({ id: r.id, label: r.label, color: r.color })),
    toppings: rows.filter(r => r.category === 'topping')
                  .map(r => ({ id: r.id, label: r.label, color: r.color, emoji: r.emoji })),
    proteins: rows.filter(r => r.category === 'protein')
                  .map(r => ({ id: r.id, label: r.label, color: r.color })),
    sauces:   rows.filter(r => r.category === 'sauce')
                  .map(r => ({ id: r.id, label: r.label, color: r.color, tint: hexToRgba(r.color, 0.18) })),
  }
}
