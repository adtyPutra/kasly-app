<template>
  <div class="slide-up">
    <div class="page-header">
      <div>
        <div class="page-title">Laporan Keuangan</div>
        <div class="page-subtitle">Ringkasan dan detail keuangan kas kelas 3KA25</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" @click="doExportExcel">Export Excel</button>
        <button class="btn btn-primary" @click="doExportPDF">Export PDF</button>
      </div>
    </div>

    <!-- TABS NAVIGATION -->
    <div class="main-tabs">
      <button class="m-tab" :class="{ active: currentTab === 'buku_kas' }" @click="currentTab = 'buku_kas'">Buku Kas (Transaksi)</button>
      <button class="m-tab" :class="{ active: currentTab === 'rekap_anggota' }" @click="currentTab = 'rekap_anggota'">Rekapitulasi Anggota</button>
    </div>

    <!-- TAB 1: BUKU KAS -->
    <div v-show="currentTab === 'buku_kas'">
      <!-- Filter Bar -->
      <div class="filter-card">
        <div class="filter-row">
          <div class="filter-tabs">
            <button class="tab" :class="{ active: period === 'month' }" @click="period = 'month'">Bulanan</button>
            <button class="tab" :class="{ active: period === 'year' }" @click="period = 'year'">Tahunan</button>
            <button class="tab" :class="{ active: period === 'all' }" @click="period = 'all'">Semua</button>
          </div>
          <template v-if="period === 'month'">
            <select v-model="selectedMonth" class="form-select">
              <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
            <select v-model="selectedYear" class="form-select">
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
            </select>
          </template>
          <template v-else-if="period === 'year'">
            <select v-model="selectedYear" class="form-select">
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
            </select>
          </template>
          <select v-model="filterType" class="form-select">
            <option value="">Semua Jenis</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <select v-model="filterCategory" class="form-select">
            <option value="">Semua Kategori</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.nama }}</option>
          </select>
          <select v-model="filterActivity" class="form-select">
            <option value="">Semua Kegiatan</option>
            <option v-for="a in activities" :key="a.id" :value="a.id">{{ a.nama }}</option>
          </select>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="s-lbl">Saldo Awal</div>
          <div class="s-val">
            <input v-if="editingSaldoAwal" v-model.number="saldoAwalInput" type="number" class="saldo-input" @blur="saveSaldoAwal" @keyup.enter="saveSaldoAwal" />
            <span v-else @click="editingSaldoAwal = true" class="editable-val">{{ formatCurrency(saldoAwal) }}</span>
          </div>
          <div class="s-hint" v-if="!editingSaldoAwal">Klik untuk ubah</div>
        </div>
        <div class="summary-card green">
          <div class="s-lbl">Total Pemasukan</div>
          <div class="s-val">+{{ formatCurrency(totalIncome) }}</div>
          <div class="s-hint">{{ incomeCount }} transaksi</div>
        </div>
        <div class="summary-card red">
          <div class="s-lbl">Total Pengeluaran</div>
          <div class="s-val">-{{ formatCurrency(totalExpense) }}</div>
          <div class="s-hint">{{ expenseCount }} transaksi</div>
        </div>
        <div class="summary-card" :class="saldoAkhir >= 0 ? 'primary' : 'red'">
          <div class="s-lbl">Saldo Akhir</div>
          <div class="s-val">{{ formatCurrency(saldoAkhir) }}</div>
          <div class="s-hint">Saldo Awal + Pemasukan − Pengeluaran</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <div class="card flex-2">
          <div class="card-header">
            <div class="card-title">Pemasukan & Pengeluaran</div>
            <div class="legend-row">
              <span class="leg-dot" style="background: var(--color-success)"></span> Pemasukan
              <span class="leg-dot" style="background: var(--color-danger); margin-left: 12px;"></span> Pengeluaran
            </div>
          </div>
          <div class="chart-container" style="height: 200px;"><canvas ref="barChartRef"></canvas></div>
        </div>
        <div class="card flex-1">
          <div class="card-header"><div class="card-title">Pengeluaran per Kategori</div></div>
          <div v-if="categoryChartData.length === 0" class="empty-simple text-muted">Belum ada data</div>
          <div v-else>
            <div class="chart-container" style="height: 150px;"><canvas ref="pieChartRef"></canvas></div>
            <div class="cat-legend">
              <div v-for="d in categoryChartData.slice(0, 6)" :key="d.label" class="cat-leg-item">
                <span class="leg-dot" :style="{ background: d.color }"></span>
                <span class="text-muted">{{ d.label }}</span>
                <span class="fw-medium">{{ formatCurrency(d.value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Detail Transaksi</div>
          <span class="count-badge">{{ filteredTxns.length }} transaksi</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Jenis</th>
                <th>Kategori</th>
                <th style="text-align:right;">Nominal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredTxns.length === 0">
                <td colspan="5" class="empty-cell">Tidak ada transaksi untuk periode ini.</td>
              </tr>
              <tr v-for="t in filteredTxns" :key="t.id">
                <td class="text-muted small">{{ formatShortDate(t.date) }}</td>
                <td>{{ t.description }}</td>
                <td><span class="badge-type" :class="t.type === 'income' ? 'in' : 'out'">{{ t.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}</span></td>
                <td class="text-muted small">{{ getCategoryName(t.categoryId) }}</td>
                <td style="text-align:right;" class="fw-bold" :class="t.type === 'income' ? 'amount-in' : 'amount-out'">
                  {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: REKAP ANGGOTA -->
    <div v-show="currentTab === 'rekap_anggota'">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Rekapitulasi Saldo Anggota</div>
          <span class="count-badge">{{ rekapAnggota.length }} anggota</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 40px">No</th>
                <th>Nama Anggota</th>
                <th style="text-align:right;">Total Setoran Kas</th>
                <th style="text-align:right;">Total Penggunaan/Penarikan</th>
                <th style="text-align:right;">Sisa Saldo Kas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="rekapAnggota.length === 0">
                <td colspan="5" class="empty-cell">Belum ada data anggota.</td>
              </tr>
            <tr v-for="(m, i) in rekapAnggota" :key="m.id">
              <td class="text-muted">{{ i + 1 }}</td>
              <td class="fw-medium">{{ m.nama }}</td>
              <td style="text-align:right;" class="amount-in fw-medium">+{{ formatCurrency(m.totalBayar) }}</td>
              <td style="text-align:right;" class="amount-out fw-medium">-{{ formatCurrency(m.totalTarik) }}</td>
              <td style="text-align:right;" class="fw-bold" :class="m.saldo < 0 ? 'amount-out' : (m.saldo > 0 ? 'text-primary' : 'text-muted')">
                {{ formatCurrency(m.saldo) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="tfoot-row">
              <td colspan="2" style="text-align:right;" class="fw-bold">TOTAL KESELURUHAN:</td>
              <td style="text-align:right;" class="fw-bold amount-in">+{{ formatCurrency(totalSemuaSetoran) }}</td>
              <td style="text-align:right;" class="fw-bold amount-out">-{{ formatCurrency(totalSemuaTarikan) }}</td>
              <td style="text-align:right;" class="fw-bold text-primary">{{ formatCurrency(totalSemuaSaldo) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, inject } from 'vue'
import { Chart, registerables } from 'chart.js'
import { anggotaList } from '../stores/anggota.js'
import { getTotalBayarAnggota, getTotalTarikAnggota, getSaldoAnggota } from '../stores/saldo.js'
import { pembayaranList } from '../stores/pembayaranKas.js'
import { penarikanList } from '../stores/penarikanDana.js'
import { pengeluaranList, kategoriList } from '../stores/pengeluaranKelas.js'
import { kegiatanList } from '../stores/kegiatan.js'
import { formatCurrency, formatShortDate, getLast6Months, isSameMonth } from '../utils/formatters.js'
import { exportReportToExcel, exportRekapToExcel } from '../utils/exportExcel.js'
import { exportReportToPDF, exportRekapToPDF } from '../utils/exportPDF.js'

Chart.register(...registerables)
const toast = inject('toast')

// Tabs
const currentTab = ref('buku_kas') // 'buku_kas' or 'rekap_anggota'

// Stores
const categories = computed(() => kategoriList.value)
const activities = computed(() => kegiatanList.value)

// ----------------------------------------------------
// TAB 1: BUKU KAS (Transaksi)
// ----------------------------------------------------
const allTransactions = computed(() => {
  const data = []
  pembayaranList.value.filter(p => p.status !== 'belum_bayar').forEach(p => {
    data.push({ id: `pembayaran_${p.id}`, date: p.tanggal_bayar, description: `Pembayaran Kas: ${p.anggota?.nama || '-'}`, type: 'income', amount: Number(p.nominal), categoryId: 'kas', activityId: null })
  })
  penarikanList.value.filter(p => p.status === 'aktif').forEach(p => {
    data.push({ id: `penarikan_${p.id}`, date: p.tanggal, description: `Penarikan Dana: ${p.anggota?.nama || '-'} - ${p.keterangan || ''}`, type: 'expense', amount: Number(p.nominal), categoryId: 'penarikan', activityId: null })
  })
  pengeluaranList.value.filter(p => p.status === 'aktif').forEach(p => {
    data.push({ id: `pengeluaran_${p.id}`, date: p.tanggal, description: p.keterangan || 'Pengeluaran Kelas', type: 'expense', amount: Number(p.nominal), categoryId: p.kategori_id, activityId: p.kegiatan_id })
  })
  return data
})

// Filters
const period = ref('month')
const now = new Date()
const selectedMonth = ref(now.getMonth())
const selectedYear = ref(now.getFullYear())
const filterType = ref('')
const filterCategory = ref('')
const filterActivity = ref('')

const monthOptions = [
  { value: 0, label: 'Januari' }, { value: 1, label: 'Februari' }, { value: 2, label: 'Maret' },
  { value: 3, label: 'April' }, { value: 4, label: 'Mei' }, { value: 5, label: 'Juni' },
  { value: 6, label: 'Juli' }, { value: 7, label: 'Agustus' }, { value: 8, label: 'September' },
  { value: 9, label: 'Oktober' }, { value: 10, label: 'November' }, { value: 11, label: 'Desember' },
]
const yearOptions = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]

// Saldo Awal 
const editingSaldoAwal = ref(false)
const saldoAwal = ref(0)
const saldoAwalInput = ref(0)
function saveSaldoAwal() {
  saldoAwal.value = Number(saldoAwalInput.value) || 0
  editingSaldoAwal.value = false
}

const filteredTxns = computed(() => {
  let txns = [...allTransactions.value].sort((a, b) => new Date(a.date) - new Date(b.date))
  if (period.value === 'month') txns = txns.filter(t => isSameMonth(t.date, selectedYear.value, selectedMonth.value))
  else if (period.value === 'year') txns = txns.filter(t => new Date(t.date).getFullYear() === selectedYear.value)
  if (filterType.value) txns = txns.filter(t => t.type === filterType.value)
  if (filterCategory.value) txns = txns.filter(t => t.categoryId === filterCategory.value)
  if (filterActivity.value) txns = txns.filter(t => t.activityId === filterActivity.value)
  return txns
})

const totalIncome = computed(() => filteredTxns.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))
const totalExpense = computed(() => filteredTxns.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
const saldoAkhir = computed(() => saldoAwal.value + totalIncome.value - totalExpense.value)
const incomeCount = computed(() => filteredTxns.value.filter(t => t.type === 'income').length)
const expenseCount = computed(() => filteredTxns.value.filter(t => t.type === 'expense').length)

const categoryChartData = computed(() => {
  const allExpCats = [
    { id: 'penarikan', nama: 'Penarikan Dana', color: '#f59e0b' },
    ...categories.value.map(c => ({ id: c.id, nama: c.nama, color: c.color || '#3b82f6' }))
  ]
  return allExpCats.map(cat => ({
    label: cat.nama,
    value: filteredTxns.value.filter(t => String(t.categoryId) === String(cat.id) && t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    color: cat.color
  })).filter(d => d.value > 0)
})

function getCategoryName(id) { 
  if (id === 'kas') return 'Pemasukan Kas'
  if (id === 'penarikan') return 'Penarikan Dana'
  return categories.value.find(c => String(c.id) === String(id))?.nama || '-' 
}

// Charts
const barChartRef = ref(null)
const pieChartRef = ref(null)
let barChart = null, pieChart = null

function buildCharts() {
  if (currentTab.value !== 'buku_kas') return
  
  if (!barChartRef.value) return
  const months = getLast6Months()
  const incomes = months.map(m => allTransactions.value.filter(t => isSameMonth(t.date, m.year, m.month) && t.type === 'income').reduce((s, t) => s + t.amount, 0))
  const expenses = months.map(m => allTransactions.value.filter(t => isSameMonth(t.date, m.year, m.month) && t.type === 'expense').reduce((s, t) => s + t.amount, 0))

  if (barChart) barChart.destroy()
  barChart = new Chart(barChartRef.value, {
    type: 'bar',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        { label: 'Pemasukan', data: incomes, backgroundColor: 'rgba(5,150,105,0.7)', borderRadius: 4 },
        { label: 'Pengeluaran', data: expenses, backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#fff', borderColor: '#e5e7eb', borderWidth: 1, titleColor: '#1f2937', bodyColor: '#6b7280' } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#9ca3af', callback: v => 'Rp' + (v >= 1000 ? (v / 1000) + 'K' : v) } }
      }
    }
  })

  if (pieChartRef.value && categoryChartData.value.length > 0) {
    if (pieChart) pieChart.destroy()
    pieChart = new Chart(pieChartRef.value, {
      type: 'doughnut',
      data: {
        labels: categoryChartData.value.map(d => d.label),
        datasets: [{ data: categoryChartData.value.map(d => d.value), backgroundColor: categoryChartData.value.map(d => d.color), borderWidth: 0, hoverOffset: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#fff', borderColor: '#e5e7eb', borderWidth: 1, titleColor: '#1f2937', bodyColor: '#6b7280' } },
        cutout: '60%'
      }
    })
  } else if (pieChart) {
    pieChart.destroy()
    pieChart = null
  }
}

onMounted(() => setTimeout(buildCharts, 200))
watch([filteredTxns, allTransactions, currentTab], () => {
  if (currentTab.value === 'buku_kas') {
    nextTick(buildCharts)
  }
}, { deep: true })

// ----------------------------------------------------
// TAB 2: REKAP ANGGOTA
// ----------------------------------------------------
const rekapAnggota = computed(() => {
  return anggotaList.value.map(anggota => {
    return {
      id: anggota.id,
      nama: anggota.nama,
      totalBayar: getTotalBayarAnggota(anggota.id),
      totalTarik: getTotalTarikAnggota(anggota.id),
      saldo: getSaldoAnggota(anggota.id)
    }
  })
})

const totalSemuaSetoran = computed(() => rekapAnggota.value.reduce((sum, item) => sum + item.totalBayar, 0))
const totalSemuaTarikan = computed(() => rekapAnggota.value.reduce((sum, item) => sum + item.totalTarik, 0))
const totalSemuaSaldo = computed(() => rekapAnggota.value.reduce((sum, item) => sum + item.saldo, 0))


function getPeriodLabel() {
  if (period.value === 'month') return `${monthOptions[selectedMonth.value].label} ${selectedYear.value}`
  if (period.value === 'year') return `Tahun ${selectedYear.value}`
  return 'Semua Periode'
}

function doExportExcel() {
  if (currentTab.value === 'rekap_anggota') {
    exportRekapToExcel(rekapAnggota.value)
    toast({ type: 'success', title: 'Export Excel Rekap Anggota berhasil' })
  } else {
    exportReportToExcel({ transactions: filteredTxns.value, accounts: [], categories: categories.value, totalIncome: totalIncome.value, totalExpense: totalExpense.value }, getPeriodLabel())
    toast({ type: 'success', title: 'Export Excel berhasil' })
  }
}

function doExportPDF() {
  if (currentTab.value === 'rekap_anggota') {
    exportRekapToPDF(rekapAnggota.value)
    toast({ type: 'success', title: 'Export PDF Rekap Anggota berhasil' })
  } else {
    exportReportToPDF({ transactions: filteredTxns.value, accounts: [], categories: categories.value, totalIncome: totalIncome.value, totalExpense: totalExpense.value }, getPeriodLabel())
    toast({ type: 'success', title: 'Export PDF berhasil' })
  }
}
</script>

<style scoped>
/* Tabs Navigation */
.main-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--color-border);
}
.m-tab {
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}
.m-tab:hover {
  color: var(--color-primary-dark);
}
.m-tab.active {
  color: var(--color-primary-dark);
}
.m-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-primary-dark);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.filter-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.filter-tabs { display: flex; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 8px; padding: 3px; gap: 2px; }
.tab { background: none; border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.82rem; color: var(--color-text-muted); cursor: pointer; font-weight: 500; }
.tab.active { background: var(--color-surface); color: var(--color-text); box-shadow: 0 1px 3px rgba(0,0,0,0.08); font-weight: 600; }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.summary-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.s-lbl { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; color: var(--color-text-muted); margin-bottom: 8px; }
.s-val { font-size: 1.3rem; font-weight: 700; color: var(--color-text); }
.s-hint { font-size: 0.72rem; color: var(--color-text-dim); margin-top: 4px; }
.summary-card.green .s-val { color: var(--color-success); }
.summary-card.red .s-val { color: var(--color-danger); }
.summary-card.primary .s-val { color: var(--color-primary-dark); }

.editable-val { cursor: pointer; border-bottom: 1px dashed var(--color-border-light); }
.editable-val:hover { color: var(--color-primary-dark); }
.saldo-input { font-size: 1.3rem; font-weight: 700; border: 1px solid var(--color-primary); border-radius: 6px; padding: 4px 8px; width: 140px; outline: none; }

.charts-row { display: flex; gap: 16px; margin-bottom: 20px; }
.flex-2 { flex: 2; }
.flex-1 { flex: 1; }

.card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.card-title { font-size: 0.95rem; font-weight: 600; color: var(--color-text); }

.legend-row { display: flex; align-items: center; font-size: 0.78rem; color: var(--color-text-muted); }
.leg-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }

.cat-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.cat-leg-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
.cat-leg-item .text-muted { flex: 1; }
.fw-medium { font-weight: 600; }
.fw-bold { font-weight: 700; }
.text-primary { color: var(--color-primary-dark); }

.count-badge { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 20px; padding: 3px 10px; font-size: 0.75rem; color: var(--color-text-muted); }

.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table th { text-align: left; padding: 10px 16px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; color: var(--color-text-dim); background: var(--color-surface-2); border-bottom: 1px solid var(--color-border); }
.data-table td { padding: 11px 16px; border-bottom: 1px solid var(--color-border); }
.data-table tr:last-child td { border-bottom: none; }
.empty-cell { text-align: center; padding: 40px; color: var(--color-text-muted); }

.tfoot-row td {
  background-color: var(--color-surface-2);
  border-top: 2px solid var(--color-border);
  padding: 12px 16px;
}

.badge-type { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
.badge-type.in { background: var(--color-success-bg); color: var(--color-success); }
.badge-type.out { background: var(--color-danger-bg); color: var(--color-danger); }

.amount-in { color: var(--color-success); }
.amount-out { color: var(--color-danger); }

.text-muted { color: var(--color-text-muted); }
.small { font-size: 0.82rem; }
.empty-simple { text-align: center; padding: 24px; }

.chart-container { position: relative; }

/* ========== RESPONSIVE MOBILE ========== */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-row .form-select {
    width: 100%;
  }

  .filter-tabs {
    flex-direction: row;
    width: 100%;
  }
  
  .filter-tabs .tab {
    flex: 1;
    text-align: center;
  }

  .summary-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .summary-card {
    padding: 16px;
  }

  .charts-row {
    flex-direction: column;
  }

  .flex-2, .flex-1 {
    width: 100%;
    flex: unset;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
