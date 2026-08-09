import { createContext, useContext, useState, useEffect } from 'react'
import { BASES, TOPPINGS, PROTEINS, SAUCES } from '../data/menu.js'
import { fetchMenu } from './fetchMenu.js'

const DEFAULT = { bases: BASES, toppings: TOPPINGS, proteins: PROTEINS, sauces: SAUCES }

const MenuContext = createContext(DEFAULT)

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState(DEFAULT)

  useEffect(() => {
    fetchMenu()
      .then(setMenu)
      .catch(err => console.warn('Using default menu:', err.message))
  }, [])

  return <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
}

export function useMenu() {
  return useContext(MenuContext)
}
