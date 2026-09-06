import { storage, generateId } from '../utils/storage.js'

const KEY = 'kasly_activities_v2'

export const ACTIVITY_STATUSES = [
  { value: 'direncanakan', label: 'Direncanakan' },
  { value: 'berlangsung', label: 'Berlangsung' },
  { value: 'selesai', label: 'Selesai' },
]

export function getActivities() {
  return storage.get(KEY, [])
}

export function getActivity(id) {
  return getActivities().find(a => a.id === id)
}

export function addActivity(data) {
  const activities = getActivities()
  const newActivity = {
    id: generateId(),
    name: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    budget: 0,
    status: 'direncanakan',
    ...data,
    createdAt: new Date().toISOString()
  }
  activities.push(newActivity)
  storage.set(KEY, activities)
  return newActivity
}

export function updateActivity(id, data) {
  const activities = getActivities()
  const idx = activities.findIndex(a => a.id === id)
  if (idx !== -1) {
    activities[idx] = { ...activities[idx], ...data }
    storage.set(KEY, activities)
    return activities[idx]
  }
  return null
}

export function deleteActivity(id) {
  const activities = getActivities().filter(a => a.id !== id)
  storage.set(KEY, activities)
}

export function getStatusLabel(status) {
  return ACTIVITY_STATUSES.find(s => s.value === status)?.label || status
}
