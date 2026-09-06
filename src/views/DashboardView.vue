<template>
  <div class="slide-up">
    <!-- 4 Stat Cards -->
    <div class="stats-grid">
      <div class="hero-stat-card stat-blue">
        <div class="hsc-inner">
          <div class="hsc-icon-box"><Wallet class="icon-md" /></div>
          <div>
            <div class="hsc-label">Saldo Kas</div>
            <div class="hsc-value">{{ formatCurrency(totalBalance) }}</div>
            <div class="hsc-sub">Total semua rekening</div>
          </div>
        </div>
      </div>
      <div class="hero-stat-card stat-green">
        <div class="hsc-inner">
          <div class="hsc-icon-box"><TrendingUp class="icon-md" /></div>
          <div>
            <div class="hsc-label">Pemasukan Bulan Ini</div>
            <div class="hsc-value">+{{ formatCurrency(monthlyIncome) }}</div>
            <div class="hsc-sub">{{ incomeCount }} transaksi</div>
          </div>
        </div>
      </div>
      <div class="hero-stat-card stat-amber">
        <div class="hsc-inner">
          <div class="hsc-icon-box"><TrendingDown class="icon-md" /></div>
          <div>
            <div class="hsc-label">Pengeluaran Bulan Ini</div>
            <div class="hsc-value">-{{ formatCurrency(monthlyExpense) }}</div>
            <div class="hsc-sub">{{ expenseCount }} transaksi</div>
          </div>
        </div>
      </div>
      <div class="hero-stat-card stat-purple">
        <div class="hsc-inner">
          <div class="hsc-icon-box"><Users class="icon-md" /></div>
          <div>
            <div class="hsc-label">Jumlah Anggota</div>
            <div class="hsc-value">{{ activeMembers }}</div>
            <div class="hsc-sub">Anggota aktif</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Middle Row -->
    <div class="dashboard-row">
      <!-- Tren Keuangan Chart -->
      <div class="card flex-2" style="display: flex; flex-direction: column;">
        <div class="card-header">
          <div>
            <div class="card-title">Tren Keuangan</div>
            <div class="card-subtitle">Pemasukan vs pengeluaran 6 bulan terakhir</div>
          </div>
          <div class="chart-legend">
            <span class="legend-dot" style="background: var(--color-success);"></span> Pemasukan
            <span class="legend-dot" style="background: var(--color-danger); margin-left: 12px;"></span> Pengeluaran
          </div>
        </div>
        <div class="chart-container" style="flex: 1; min-height: 220px;">
          <canvas ref="lineChartRef"></canvas>
        </div>
      </div>

      <!-- Transaksi Terbaru -->
      <div class="card flex-1">
        <div class="card-header">
          <div class="card-title">Transaksi Terbaru</div>
          <RouterLink to="/keuangan" class="link-btn">
            Lihat Semua <ChevronRight :size="14" />
          </RouterLink>
        </div>
        <div v-if="recentTxns.length === 0" class="empty-simple">Belum ada transaksi.</div>
        <div v-else class="txn-list">
          <div v-for="txn in recentTxns" :key="txn.id" class="txn-item">
            <div class="txn-info">
              <div class="txn-desc">{{ txn.description }}</div>
              <div class="txn-date text-muted">{{ formatShortDate(txn.date) }}</div>
            </div>
            <div class="txn-amount" :class="txn.type === 'income' ? 'amount-in' : 'amount-out'">
              {{ txn.type === 'income' ? '+' : '-' }}{{ formatCurrency(txn.amount) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Belum Bayar Kas -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Belum Bayar Kas</div>
          <div class="card-subtitle">{{ latestPeriodName }} · {{ unpaidMembers.length }} anggota belum membayar</div>
        </div>
        <RouterLink to="/kas" class="link-btn">
          Lihat Semua <ChevronRight :size="14" />
        </RouterLink>
      </div>
      <div v-if="unpaidMembers.length === 0" class="empty-simple">
        Semua anggota sudah membayar kas periode ini. 🎉
      </div>
      <div v-else class="table-responsive">
        <table class="simple-table">
          <thead>
            <tr>
            <th>Nama</th>
            <th>Periode</th>
            <th>Nominal</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in unpaidMembers.slice(0, 5)" :key="m.id">
            <td class="fw-medium">{{ m.nama }}</td>
            <td class="text-muted">{{ latestPeriodName }}</td>
            <td>{{ formatCurrency(latestPeriodNominal) }}</td>
            <td><span class="badge-status belum">Belum Bayar</span></td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronRight, Wallet, TrendingUp, TrendingDown, Users } from 'lucide-vue-next'
import { Chart, registerables } from 'chart.js'
import { saldoKasComputed } from '../stores/saldo.js'
import { anggotaList } from '../stores/anggota.js'
import { periodeList } from '../stores/periodeKas.js'
import { pembayaranList } from '../stores/pembayaranKas.js'
import { pengeluaranList } from '../stores/pengeluaranKelas.js'
import { penarikanList } from '../stores/penarikanDana.js'
import { formatCurrency, formatShortDate, getLast6Months, isSameMonth } from '../utils/formatters.js'

Chart.register(...registerables)

const lineChartRef = ref(null)
let lineChart = null

const now = new Date()
const totalBalance = computed(() => saldoKasComputed.value)

const activeMembers = computed(() => anggotaList.value.filter(m => m.status === 'aktif').length)

const latestPeriod = computed(() => {
  return periodeList.value.length > 0 ? periodeList.value[0] : null // already sorted by newest
})
const latestPeriodName = computed(() => latestPeriod.value?.nama_periode || '-')
const latestPeriodNominal = computed(() => latestPeriod.value?.nominal || 0)

const unpaidMembers = computed(() => {
  if (!latestPeriod.value) return []
  // Get all active members who haven't paid for this period
  const paidMemberIds = pembayaranList.value
    .filter(p => p.periode_kas_id === latestPeriod.value.id && p.status !== 'belum_bayar')
    .map(p => p.anggota_id)
  return anggotaList.value.filter(m => m.status === 'aktif' && !paidMemberIds.includes(m.id))
})

// Build a unified transaction list for recent txns & chart
const allTransactions = computed(() => {
  const arr = []
  // Pembayaran Kas
  pembayaranList.value.filter(p => p.status !== 'belum_bayar').forEach(p => {
    arr.push({ id: `pembayaran_${p.id}`, type: 'income', amount: Number(p.nominal), date: p.tanggal_bayar, description: `Pembayaran Kas: ${p.anggota?.nama || p.anggota_id}`, createdAt: p.created_at })
  })
  // Penarikan Dana
  penarikanList.value.filter(p => p.status === 'aktif').forEach(p => {
    arr.push({ id: `penarikan_${p.id}`, type: 'expense', amount: Number(p.nominal), date: p.tanggal, description: `Penarikan: ${p.anggota?.nama || p.anggota_id}`, createdAt: p.created_at })
  })
  // Pengeluaran Kelas
  pengeluaranList.value.filter(p => p.status === 'aktif').forEach(p => {
    arr.push({ id: `pengeluaran_${p.id}`, type: 'expense', amount: Number(p.nominal), date: p.tanggal, description: `Pengeluaran: ${p.keterangan || 'Tanpa keterangan'}`, createdAt: p.created_at })
  })
  return arr.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const monthlyTxns = computed(() => allTransactions.value.filter(t => isSameMonth(t.date, now.getFullYear(), now.getMonth())))
const monthlyIncome = computed(() => monthlyTxns.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))
const monthlyExpense = computed(() => monthlyTxns.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
const incomeCount = computed(() => monthlyTxns.value.filter(t => t.type === 'income').length)
const expenseCount = computed(() => monthlyTxns.value.filter(t => t.type === 'expense').length)
const recentTxns = computed(() => allTransactions.value.slice(0, 6))

function renderChart() {
  if (!lineChartRef.value) return
  if (lineChart) lineChart.destroy()
  const months = getLast6Months()
  const incomes = months.map(m => allTransactions.value.filter(t => isSameMonth(t.date, m.year, m.month) && t.type === 'income').reduce((s, t) => s + t.amount, 0))
  const expenses = months.map(m => allTransactions.value.filter(t => isSameMonth(t.date, m.year, m.month) && t.type === 'expense').reduce((s, t) => s + t.amount, 0))

  lineChart = new Chart(lineChartRef.value, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        { label: 'Pemasukan', data: incomes, borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.06)', tension: 0.4, fill: true, pointBackgroundColor: '#059669', pointRadius: 4 },
        { label: 'Pengeluaran', data: expenses, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)', tension: 0.4, fill: true, pointBackgroundColor: '#ef4444', pointRadius: 4 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#fff', borderColor: '#e5e7eb', borderWidth: 1, titleColor: '#1f2937', bodyColor: '#6b7280' } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#9ca3af', font: { size: 11 }, callback: v => 'Rp' + (v >= 1000 ? (v / 1000) + 'K' : v) } }
      }
    }
  })
}

onMounted(async () => {
  await nextTick()
  renderChart()
})

watch(allTransactions, () => {
  renderChart()
}, { deep: true })
</script>

<style scoped>
/* Hero Stat Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.hero-stat-card {
  border-radius: 12px;
  padding: 16px 14px;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.hero-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.stat-blue   { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
.stat-green  { background: linear-gradient(135deg, #059669, #10b981); }
.stat-amber  { background: linear-gradient(135deg, #dc2626, #ef4444); }
.stat-purple { background: linear-gradient(135deg, #7c3aed, #a78bfa); }

.hsc-inner {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hsc-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hsc-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hsc-value {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hsc-sub {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
}

.icon-md {
  width: 20px;
  height: 20px;
}

/* Layout */
.dashboard-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.flex-2 { flex: 2; }
.flex-1 { flex: 1; }

/* Card */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 8px;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.card-subtitle {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.link-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.75rem;
  color: var(--color-primary);
  background: #ecfdf5;
  padding: 5px 12px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.link-btn:hover { 
  background: #d1fae5;
  color: var(--color-primary-dark);
}

/* Table */
.simple-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.simple-table th {
  text-align: left;
  padding: 8px 12px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-dim);
  border-bottom: 1px solid var(--color-border);
}

.simple-table td {
  padding: 11px 12px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.simple-table tr:last-child td { border-bottom: none; }

.fw-medium { font-weight: 500; }
.text-muted { color: var(--color-text-muted); }

.badge-status {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
}

.badge-status.belum {
  background: var(--color-warning-bg);
  color: #b45309;
}

/* Transactions */
.txn-list { display: flex; flex-direction: column; gap: 0; }

.txn-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
}

.txn-item:last-child { border-bottom: none; }

.txn-info { 
  flex: 1; 
  padding-right: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px; /* Guaranteed space between title and date */
}

.txn-desc {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
}

.txn-date { 
  font-size: 0.72rem; 
  color: var(--color-text-dim); 
  line-height: 1;
}

.txn-amount {
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.amount-in { color: var(--color-success); }
.amount-out { color: var(--color-danger); }

/* Chart */
.chart-container { position: relative; }
.chart-legend { display: flex; align-items: center; font-size: 0.78rem; color: var(--color-text-muted); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }

/* Empty */
.empty-simple {
  text-align: center;
  padding: 24px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* ========== RESPONSIVE / MOBILE ========== */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 10px;
  }

  .dashboard-row {
    flex-direction: column !important;
  }

  .flex-2, .flex-1 {
    flex: unset !important;
    width: 100% !important;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr !important;
    gap: 10px;
  }
}
</style>
