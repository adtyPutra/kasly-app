import { storage, generateId } from '../utils/storage.js'

const KEY = 'kasly_categories'

export function getCategories() {
  return storage.get(KEY, [])
}

export function addCategory(data) {
  const categories = getCategories()
  const newCat = { id: generateId(), ...data, createdAt: new Date().toISOString() }
  categories.push(newCat)
  storage.set(KEY, categories)
  return newCat
}

export function updateCategory(id, data) {
  const categories = getCategories()
  const idx = categories.findIndex(c => c.id === id)
  if (idx === -1) return null
  categories[idx] = { ...categories[idx], ...data }
  storage.set(KEY, categories)
  return categories[idx]
}

export function deleteCategory(id) {
  storage.set(KEY, getCategories().filter(c => c.id !== id))
}
