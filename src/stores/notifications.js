import { storage, generateId } from '../utils/storage.js'

const KEY = 'kasly_notifications'

export function getNotifications() {
  return storage.get(KEY, []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function addNotification(data) {
  const notifs = storage.get(KEY, [])
  const newNotif = { id: generateId(), ...data, read: false, createdAt: new Date().toISOString() }
  notifs.push(newNotif)
  storage.set(KEY, notifs)
  return newNotif
}

export function markAsRead(id) {
  const notifs = storage.get(KEY, [])
  const idx = notifs.findIndex(n => n.id === id)
  if (idx !== -1) {
    notifs[idx].read = true
    storage.set(KEY, notifs)
  }
}

export function markAllAsRead() {
  const notifs = storage.get(KEY, []).map(n => ({ ...n, read: true }))
  storage.set(KEY, notifs)
}

export function deleteNotification(id) {
  storage.set(KEY, getNotifications().filter(n => n.id !== id))
}

export function getUnreadCount() {
  return getNotifications().filter(n => !n.read).length
}

export function generateDebtNotifications(debts) {
  const notifs = storage.get(KEY, [])
  const now = new Date()

  debts.forEach(debt => {
    if (debt.status === 'paid') return
    const daysLeft = Math.ceil((new Date(debt.dueDate) - now) / (1000 * 60 * 60 * 24))
    const existingKey = `debt_${debt.id}_reminded`
    if (storage.get(existingKey)) return

    if (daysLeft <= 0) {
      addNotification({
        type: 'danger',
        title: 'Jatuh Tempo Terlewat!',
        message: `${debt.type === 'receivable' ? 'Piutang' : 'Hutang'} dari ${debt.name} sudah melewati jatuh tempo.`,
        debtId: debt.id
      })
      storage.set(existingKey, true)
    } else if (daysLeft <= 3) {
      addNotification({
        type: 'warning',
        title: 'Reminder: Jatuh Tempo Mendekat',
        message: `${debt.type === 'receivable' ? 'Piutang' : 'Hutang'} dari ${debt.name} jatuh tempo dalam ${daysLeft} hari.`,
        debtId: debt.id
      })
      storage.set(existingKey, true)
    }
  })
}
