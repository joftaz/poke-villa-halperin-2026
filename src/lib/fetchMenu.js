const SHEET_ID = '1dvZtAaRk08UMJ0pOeOHC7Z0BFa_KYgf-5vgrWeMjXyk'
const SHEET_GID = '65408799'
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`

function hexToRgba(hex, alpha) {
  if (!hex || hex === 'transparent') return 'rgba(0,0,0,0)'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function parseLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"' && inQuotes && line[i + 1] === '"') {
      current += '"'
      i += 1
    } else if (ch === '"') inQuotes = !inQuotes
    else if (ch === ',' && !inQuotes) { result.push(current); current = '' }
    else current += ch
  }
  result.push(current)
  return result
}

function isChecked(value) {
  return ['TRUE', '1', 'YES'].includes(String(value ?? '').trim().toUpperCase())
}

function menuItem(row, category) {
  const item = { id: row.id, label: row.label, color: row.color }
  if (category === 'topping') item.emoji = row.emoji
  if (category === 'sauce') item.tint = hexToRgba(row.color, 0.18)
  return item
}

export function parseMenuCsv(text, warn = console.warn) {
  const normalized = text.trim().replace(/\r/g, '')
  if (!normalized) throw new Error('Menu sheet is empty')

  const [headerLine, ...dataLines] = normalized.split('\n')
  const headers = parseLine(headerLine).map(h => h.trim())
  const activeColumn = headers.indexOf('active')
  if (activeColumn === -1) throw new Error('Menu sheet is missing the active column')

  const presetNames = headers.slice(activeColumn + 1).filter(Boolean)

  const rows = dataLines
    .map(line => {
      const values = parseLine(line)
      return Object.fromEntries(headers.map((header, i) => [header, (values[i] ?? '').trim()]))
    })
    .filter(row => row.category && row.id)

  const activeRows = rows.filter(row => row.active?.toUpperCase() !== 'FALSE')
  const byCategory = category => activeRows
    .filter(row => row.category === category)
    .map(row => menuItem(row, category))

  const presets = presetNames.flatMap(name => {
    const selected = activeRows.filter(row => isChecked(row[name]))
    const bases = selected.filter(row => row.category === 'base').map(row => row.id)

    if (bases.length !== 1) {
      warn(`Ignoring invalid House Bowl "${name}": expected exactly one active base, found ${bases.length}`)
      return []
    }

    return [{
      name,
      base: bases[0],
      toppings: selected.filter(row => row.category === 'topping').map(row => row.id),
      proteins: selected.filter(row => row.category === 'protein').map(row => row.id),
      sauces: selected.filter(row => row.category === 'sauce').map(row => row.id),
    }]
  })

  return {
    bases: byCategory('base'),
    toppings: byCategory('topping'),
    proteins: byCategory('protein'),
    sauces: byCategory('sauce'),
    presets,
  }
}

export async function fetchMenu() {
  const resp = await fetch(CSV_URL)
  if (!resp.ok) throw new Error(`Failed to fetch menu: ${resp.status}`)
  return parseMenuCsv(await resp.text())
}
