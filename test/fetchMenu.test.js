import test from 'node:test'
import assert from 'node:assert/strict'
import { parseLine, parseMenuCsv } from '../src/lib/fetchMenu.js'

const CSV = `category,id,label,color,emoji,active,Green Bowl,Red Bowl,No Base,Two Bases
base,rice,Rice,#fff,,TRUE,TRUE,FALSE,FALSE,TRUE
base,noodles,Noodles,#eee,,TRUE,FALSE,TRUE,FALSE,TRUE
topping,avocado,Avocado,#0a0,🥑,TRUE,TRUE,TRUE,TRUE,FALSE
topping,hidden,Hidden,#000,,FALSE,TRUE,TRUE,FALSE,FALSE
protein,tofu,Tofu,#ddd,,TRUE,TRUE,TRUE,FALSE,FALSE
sauce,soy,Soy,#4a2800,,TRUE,TRUE,FALSE,FALSE,FALSE`

test('parseLine supports quoted commas and escaped quotes', () => {
  assert.deepEqual(parseLine('a,"b,c","d""e"'), ['a', 'b,c', 'd"e'])
})

test('parses ingredients and valid House Bowl columns', () => {
  const warnings = []
  const menu = parseMenuCsv(CSV, message => warnings.push(message))

  assert.deepEqual(menu.bases.map(item => item.id), ['rice', 'noodles'])
  assert.deepEqual(menu.toppings.map(item => item.id), ['avocado'])
  assert.deepEqual(menu.presets, [
    { name: 'Green Bowl', base: 'rice', toppings: ['avocado'], proteins: ['tofu'], sauces: ['soy'] },
    { name: 'Red Bowl', base: 'noodles', toppings: ['avocado'], proteins: ['tofu'], sauces: [] },
  ])
  assert.equal(warnings.length, 2)
  assert.match(warnings[0], /No Base/)
  assert.match(warnings[1], /Two Bases/)
})

test('requires the active column', () => {
  assert.throws(() => parseMenuCsv('category,id\nbase,rice'), /active column/)
})
