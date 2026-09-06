// localStorage wrapper utility

export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  remove(key) {
    localStorage.removeItem(key)
  },

  clear() {
    localStorage.clear()
  }
}

// Generate unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Seed default data if not exists
export function seedDefaultData() {
  // Users
  if (!storage.get('kasly_users')) {
    storage.set('kasly_users', [
      { id: 'u1', username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin', avatar: 'AD' },
      { id: 'u2', username: 'bendahara1', password: 'pass123', name: 'Bendahara 1', role: 'bendahara', avatar: 'B1' },
      { id: 'u3', username: 'bendahara2', password: 'pass123', name: 'Bendahara 2', role: 'bendahara', avatar: 'B2' },
    ])
  }

  // Accounts
  if (!storage.get('kasly_accounts')) {
    storage.set('kasly_accounts', [
      { id: 'a1', name: 'Kas Umum Kelas', description: 'Kas utama kelas', color: '#10b981', icon: 'Landmark', balance: 1500000, createdAt: new Date().toISOString() },
      { id: 'a2', name: 'Kas Ekskul', description: 'Kas kegiatan ekstrakulikuler', color: '#3b82f6', icon: 'Activity', balance: 350000, createdAt: new Date().toISOString() },
    ])
  }

  // Categories
  if (!storage.get('kasly_categories')) {
    storage.set('kasly_categories', [
      // Pemasukan
      { id: 'c1', name: 'Iuran Kelas', type: 'income', color: '#10B981', icon: 'Banknote' },
      { id: 'c2', name: 'SPP', type: 'income', color: '#4F46E5', icon: 'GraduationCap' },
      { id: 'c3', name: 'Sumbangan', type: 'income', color: '#06B6D4', icon: 'Gift' },
      { id: 'c4', name: 'Lain-lain (Masuk)', type: 'income', color: '#8B5CF6', icon: 'PlusCircle' },
      // Pengeluaran
      { id: 'c5', name: 'ATK', type: 'expense', color: '#F59E0B', icon: 'PenTool' },
      { id: 'c6', name: 'Konsumsi', type: 'expense', color: '#EF4444', icon: 'Coffee' },
      { id: 'c7', name: 'Kebersihan', type: 'expense', color: '#EC4899', icon: 'Trash' },
      { id: 'c8', name: 'Sosial', type: 'expense', color: '#F97316', icon: 'Users' },
      { id: 'c9', name: 'Lain-lain (Keluar)', type: 'expense', color: '#6B7280', icon: 'MinusCircle' },
    ])
  }

  // Sample Transactions
  if (!storage.get('kasly_transactions')) {
    const now = new Date()
    const txns = []
    // Generate some sample data for last 6 months
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 10)
      txns.push({
        id: generateId(), accountId: 'a1', categoryId: 'c1', type: 'income',
        amount: 200000 + Math.floor(Math.random() * 100000),
        description: 'Iuran kelas bulan ' + d.toLocaleString('id', { month: 'long' }),
        date: d.toISOString(), createdBy: 'u2', createdAt: d.toISOString()
      })
      txns.push({
        id: generateId(), accountId: 'a1', categoryId: 'c5', type: 'expense',
        amount: 50000 + Math.floor(Math.random() * 50000),
        description: 'Pembelian ATK kelas',
        date: new Date(d.getFullYear(), d.getMonth(), 15).toISOString(), createdBy: 'u2', createdAt: new Date(d.getFullYear(), d.getMonth(), 15).toISOString()
      })
      txns.push({
        id: generateId(), accountId: 'a1', categoryId: 'c6', type: 'expense',
        amount: 80000 + Math.floor(Math.random() * 40000),
        description: 'Konsumsi rapat kelas',
        date: new Date(d.getFullYear(), d.getMonth(), 20).toISOString(), createdBy: 'u3', createdAt: new Date(d.getFullYear(), d.getMonth(), 20).toISOString()
      })
    }
    storage.set('kasly_transactions', txns)

    // Recalculate account balances
    const accounts = storage.get('kasly_accounts')
    const updatedAccounts = accounts.map(acc => {
      const accTxns = txns.filter(t => t.accountId === acc.id)
      const income = accTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = accTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return { ...acc, balance: income - expense }
    })
    storage.set('kasly_accounts', updatedAccounts)
  }

  // Debts
  if (!storage.get('kasly_debts')) {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)
    storage.set('kasly_debts', [
      { id: 'd1', name: 'Budi Santoso', type: 'receivable', amount: 50000, description: 'Iuran bulan lalu belum bayar', dueDate: dueDate.toISOString(), status: 'unpaid', createdAt: new Date().toISOString() },
      { id: 'd2', name: 'Toko ATK Maju', type: 'payable', amount: 75000, description: 'Hutang pembelian spidol', dueDate: new Date(dueDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'unpaid', createdAt: new Date().toISOString() },
    ])
  }

  // Notifications
  if (!storage.get('kasly_notifications')) {
    storage.set('kasly_notifications', [])
  }
}
