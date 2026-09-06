import { storage, generateId } from '../utils/storage.js'

const KEY = 'kasly_debts'

export function getDebts() {
  return storage.get(KEY, []).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
}

export function addDebt(data) {
  const debts = storage.get(KEY, [])
  const newDebt = { id: generateId(), ...data, status: 'unpaid', createdAt: new Date().toISOString() }
  debts.push(newDebt)
  storage.set(KEY, debts)
  return newDebt
}

export function updateDebt(id, data) {
  const debts = storage.get(KEY, [])
  const idx = debts.findIndex(d => d.id === id)
  if (idx === -1) return null
  debts[idx] = { ...debts[idx], ...data }
  storage.set(KEY, debts)
  return debts[idx]
}

export function markAsPaid(id) {
  return updateDebt(id, { status: 'paid', paidAt: new Date().toISOString() })
}

export function deleteDebt(id) {
  storage.set(KEY, getDebts().filter(d => d.id !== id))
}

export function getOverdueDebts() {
  const now = new Date()
  return getDebts().filter(d => d.status === 'unpaid' && new Date(d.dueDate) < now)
}

export function getUpcomingDebts(days = 7) {
  const now = new Date()
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return getDebts().filter(d => d.status === 'unpaid' && new Date(d.dueDate) >= now && new Date(d.dueDate) <= future)
}
