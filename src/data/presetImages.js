import greenVilla from '../assets/bowls/green-villa.webp'
import sweetPotatoCrunch from '../assets/bowls/sweet-potato-crunch.webp'
import spicyRed from '../assets/bowls/spicy-red.webp'

const PRESET_IMAGES = {
  'הירוקה של הווילה': greenVilla,
  'קראנץ׳ בטטה': sweetPotatoCrunch,
  'האדומה החריפה': spicyRed,
}

export function getPresetImage(name) {
  return PRESET_IMAGES[name] ?? null
}
