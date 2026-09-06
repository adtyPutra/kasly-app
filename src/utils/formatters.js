// Currency & Date formatters

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr, options = {}) {
  const date = new Date(dateStr)
  const defaults = { day: '2-digit', month: 'long', year: 'numeric' }
  return date.toLocaleDateString('id-ID', { ...defaults, ...options })
}

export function formatShortDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatMonthYear(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function formatMonth(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { month: 'short' })
}

export function isOverdue(dateStr) {
  return new Date(dateStr) < new Date()
}

export function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getMonthRange(year, month) {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59)
  return { start, end }
}

export function isSameMonth(dateStr, year, month) {
  const d = new Date(dateStr)
  return d.getFullYear() === year && d.getMonth() === month
}

export function isSameDay(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1)
  const d2 = new Date(dateStr2)
  return d1.toDateString() === d2.toDateString()
}

export function getLast6Months() {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: formatMonth(d) })
  }
  return months
}
