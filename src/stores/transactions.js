import { storage, generateId } from '../utils/storage.js'

const KEY = 'kasly_transactions'

export function getTransactions() {
  return storage.get(KEY, []).sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function saveTransactions(txns) {
  storage.set(KEY, txns)
}

export function addTransaction(data) {
  const txns = storage.get(KEY, [])
  const newTxn = {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString()
  }
  txns.push(newTxn)
  storage.set(KEY, txns)

  // Update account balance
  updateAccountBalance(data.accountId, data.type, data.amount)
  return newTxn
}

export function updateTransaction(id, data) {
  const txns = storage.get(KEY, [])
  const idx = txns.findIndex(t => t.id === id)
  if (idx === -1) return null
  const old = txns[idx]
  // Revert old balance change
  revertAccountBalance(old.accountId, old.type, old.amount)
  // Apply new
  txns[idx] = { ...old, ...data, updatedAt: new Date().toISOString() }
  storage.set(KEY, txns)
  updateAccountBalance(data.accountId, data.type, data.amount)
  return txns[idx]
}

export function deleteTransaction(id) {
  const txns = storage.get(KEY, [])
  const txn = txns.find(t => t.id === id)
  if (txn) {
    revertAccountBalance(txn.accountId, txn.type, txn.amount)
  }
  storage.set(KEY, txns.filter(t => t.id !== id))
}

function updateAccountBalance(accountId, type, amount) {
  const { storage: s } = { storage }
  const accounts = storage.get('kasly_accounts', [])
  const idx = accounts.findIndex(a => a.id === accountId)
  if (idx === -1) return
  if (type === 'income') accounts[idx].balance += amount
  else accounts[idx].balance -= amount
  storage.set('kasly_accounts', accounts)
}

function revertAccountBalance(accountId, type, amount) {
  const accounts = storage.get('kasly_accounts', [])
  const idx = accounts.findIndex(a => a.id === accountId)
  if (idx === -1) return
  if (type === 'income') accounts[idx].balance -= amount
  else accounts[idx].balance += amount
  storage.set('kasly_accounts', accounts)
}

export function transferBetweenAccounts(fromId, toId, amount, description, createdBy) {
  const txns = storage.get(KEY, [])
  const now = new Date().toISOString()
  const outTxn = { id: generateId(), accountId: fromId, categoryId: 'transfer', type: 'expense', amount, description: `[Transfer] ${description}`, date: now, createdBy, createdAt: now }
  const inTxn = { id: generateId(), accountId: toId, categoryId: 'transfer', type: 'income', amount, description: `[Transfer] ${description}`, date: now, createdBy, createdAt: now }
  txns.push(outTxn, inTxn)
  storage.set(KEY, txns)
  updateAccountBalance(fromId, 'expense', amount)
  updateAccountBalance(toId, 'income', amount)
}
