<template>
  <div class="slide-up">
    <!-- Header -->
    <div class="page-header">
      <div>
        <div class="page-title">Kegiatan Kelas</div>
        <div class="page-subtitle">Kelola dana untuk kegiatan dan event kelas</div>
      </div>
      <button class="btn btn-primary" @click="openAddModal">+ Tambah Kegiatan</button>
    </div>

    <!-- Empty -->
    <div v-if="activities.length === 0" class="empty-page">
      <div class="empty-icon">📋</div>
      <div class="empty-title">Belum ada kegiatan</div>
      <div class="empty-sub">Tambahkan kegiatan kelas seperti Makrab, Jalan-jalan, dll.</div>
      <button class="btn btn-primary" style="margin-top: 16px;" @click="openAddModal">+ Tambah Kegiatan</button>
    </div>

    <!-- Cards Grid -->
    <div v-else class="activity-grid">
      <div
        v-for="act in activities"
        :key="act.id"
        class="activity-card"
        @click="openDetail(act)"
      >
        <div class="act-top">
          <div>
            <div class="act-name">{{ act.nama }}</div>
            <div class="act-date text-muted">{{ formatShortDate(act.tanggal) }}</div>
          </div>
          <span class="act-status-badge" :class="act.status">{{ getStatusLabel(act.status) }}</span>
        </div>

        <div class="act-desc text-muted" v-if="act.deskripsi">{{ act.deskripsi }}</div>

        <div class="act-finance">
          <div class="act-fin-row">
            <span class="fin-lbl">Anggaran</span>
            <span class="fin-val">{{ formatCurrency(act.anggaran) }}</span>
          </div>
          <div class="act-fin-row">
            <span class="fin-lbl">Pemasukan</span>
            <span class="fin-val green">{{ formatCurrency(getPemasukan(act.id)) }}</span>
          </div>
          <div class="act-fin-row">
            <span class="fin-lbl">Pengeluaran</span>
            <span class="fin-val red">{{ formatCurrency(getPengeluaran(act.id)) }}</span>
          </div>
          <div class="act-fin-divider"></div>
          <div class="act-fin-row">
            <span class="fin-lbl fw-medium">Sisa Dana</span>
            <span class="fin-val fw-bold" :class="getSisa(act.id) >= 0 ? 'green' : 'red'">
              {{ formatCurrency(getSisa(act.id)) }}
            </span>
          </div>
        </div>

        <div class="act-actions" @click.stop>
          <button class="btn btn-primary btn-sm" @click.stop="openEdit(act)">Edit</button>
          <button class="btn btn-danger btn-sm" @click.stop="confirmDelete(act)">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Modal v-model="showDetail" :title="detailAct?.nama || ''">
      <div class="modal-body" v-if="detailAct">
        <div class="detail-section">
          <div class="detail-sec-title">Informasi Kegiatan</div>
          <div class="detail-grid-box">
            <div class="detail-row"><span class="detail-lbl">Tanggal</span><span class="fw-medium">{{ formatShortDate(detailAct.tanggal) }}</span></div>
            <div class="detail-row"><span class="detail-lbl">Status</span>
              <span class="act-status-badge" :class="detailAct.status">{{ getStatusLabel(detailAct.status) }}</span>
            </div>
            <div class="detail-row" v-if="detailAct.deskripsi"><span class="detail-lbl">Deskripsi</span><span>{{ detailAct.deskripsi }}</span></div>
            <div class="detail-row"><span class="detail-lbl">Anggaran</span><span class="fw-medium">{{ formatCurrency(detailAct.anggaran) }}</span></div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-sec-title">Keuangan Kegiatan</div>
          <div class="fin-summary">
            <div class="fin-box green">
              <div class="fin-box-lbl">Total Pemasukan</div>
              <div class="fin-box-val">{{ formatCurrency(getPemasukan(detailAct.id)) }}</div>
            </div>
            <div class="fin-box red">
              <div class="fin-box-lbl">Total Pengeluaran</div>
              <div class="fin-box-val">{{ formatCurrency(getPengeluaran(detailAct.id)) }}</div>
            </div>
            <div class="fin-box" :class="getSisa(detailAct.id) >= 0 ? 'green' : 'red'">
              <div class="fin-box-lbl">Sisa Dana</div>
              <div class="fin-box-val">{{ formatCurrency(getSisa(detailAct.id)) }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="activityTxns.length > 0">
          <div class="detail-sec-title">Transaksi Terkait</div>
          <div class="table-responsive">
            <table class="mini-table">
              <thead>
                <tr><th>Tanggal</th><th>Keterangan</th><th>Jenis</th><th style="text-align:right;">Nominal</th></tr>
            </thead>
            <tbody>
              <tr v-for="t in activityTxns" :key="t.id">
                <td class="text-muted small">{{ formatShortDate(t.date) }}</td>
                <td>{{ t.description }}</td>
                <td><span class="badge-type" :class="t.type === 'income' ? 'in' : 'out'">{{ t.type === 'income' ? 'Masuk' : 'Keluar' }}</span></td>
                <td style="text-align:right;" class="fw-bold" :class="t.type === 'income' ? 'amount-in' : 'amount-out'">
                  {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
        <div v-else class="empty-simple text-muted small" style="padding: 16px 0;">Belum ada transaksi untuk kegiatan ini.</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showDetail = false">Tutup</button>
        <RouterLink to="/transactions" class="btn btn-primary" @click="showDetail = false">Lihat Transaksi</RouterLink>
      </div>
    </Modal>

    <!-- Add / Edit Modal -->
    <Modal v-model="showModal" :title="editingAct ? 'Edit Kegiatan' : 'Tambah Kegiatan'">
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nama Kegiatan</label>
            <input v-model="form.nama" type="text" class="form-input" placeholder="Contoh: Makrab 3KA25" />
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal</label>
            <input v-model="form.tanggal" type="date" class="form-input" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Anggaran (Rp)</label>
            <input v-model.number="form.anggaran" type="number" class="form-input" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select v-model="form.status" class="form-select">
              <option value="direncanakan">Direncanakan</option>
              <option value="berlangsung">Berlangsung</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Deskripsi (Opsional)</label>
          <textarea v-model="form.deskripsi" class="form-input" rows="2" placeholder="Tujuan atau catatan kegiatan..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showModal = false">Batal</button>
        <button class="btn btn-primary" @click="saveActivity">{{ editingAct ? 'Simpan' : 'Tambah' }}</button>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { RouterLink } from 'vue-router'
import Modal from '../components/common/Modal.vue'
import { kegiatanList, addKegiatan, updateKegiatan, getKegiatanSummary } from '../stores/kegiatan.js'
import { pengeluaranList } from '../stores/pengeluaranKelas.js'
import { formatCurrency, formatShortDate } from '../utils/formatters.js'
import { showStandardConfirm } from '../composables/useConfirm.js'

const toast = inject('toast')

const activities = computed(() => kegiatanList.value)

function getStatusLabel(status) {
  if (status === 'direncanakan') return 'Direncanakan'
  if (status === 'berlangsung') return 'Berlangsung'
  if (status === 'selesai') return 'Selesai'
  return status
}

function getPemasukan(actId) {
  return 0 // Tidak ada tabel khusus pemasukan kegiatan dalam skema saat ini
}
function getPengeluaran(actId) {
  return getKegiatanSummary(actId).totalPengeluaran
}
function getSisa(actId) { 
  return getKegiatanSummary(actId).sisaDana
}

// Detail
const showDetail = ref(false)
const detailAct = ref(null)
const activityTxns = computed(() => {
  if (!detailAct.value) return []
  return pengeluaranList.value.filter(p => p.kegiatan_id === detailAct.value.id && p.status === 'aktif').map(p => ({
    id: p.id,
    date: p.tanggal,
    description: p.keterangan || 'Pengeluaran Kegiatan',
    type: 'expense',
    amount: Number(p.nominal)
  }))
})

function openDetail(act) { detailAct.value = act; showDetail.value = true }

// Form
const showModal = ref(false)
const editingAct = ref(null)
const defaultForm = () => ({ nama: '', tanggal: new Date().toISOString().split('T')[0], anggaran: 0, status: 'direncanakan', deskripsi: '' })
const form = ref(defaultForm())

function openAddModal() { editingAct.value = null; form.value = defaultForm(); showModal.value = true }
function openEdit(act) { editingAct.value = act; form.value = { ...act }; showModal.value = true }

async function saveActivity() {
  if (!form.value.nama) { toast({ type: 'warning', title: 'Nama kegiatan wajib diisi' }); return }
  
  if (editingAct.value) {
    const res = await updateKegiatan(editingAct.value.id, form.value)
    if (res.success) toast({ type: 'success', title: 'Kegiatan diperbarui' })
    else toast({ type: 'error', title: 'Gagal', message: res.message })
  } else {
    const res = await addKegiatan(form.value)
    if (res.success) toast({ type: 'success', title: 'Kegiatan ditambahkan' })
    else toast({ type: 'error', title: 'Gagal', message: res.message })
  }
  showModal.value = false
}

async function confirmDelete(act) {
  const confirmed = await showStandardConfirm(
    'Selesaikan Kegiatan',
    `Selesaikan kegiatan "${act.nama}"?`
  )
  if (confirmed) {
    const res = await updateKegiatan(act.id, { status: 'selesai' })
    if (res.success) toast({ type: 'success', title: 'Kegiatan diselesaikan' })
    else toast({ type: 'error', title: 'Gagal', message: res.message })
  }
}
</script>

<style scoped>
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.activity-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.activity-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: var(--color-border-light); }

.act-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.act-name { font-size: 1rem; font-weight: 600; color: var(--color-text); }
.act-date { font-size: 0.78rem; margin-top: 2px; }

.act-status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}
.act-status-badge.direncanakan { background: #eff6ff; color: #1d4ed8; }
.act-status-badge.berlangsung { background: #fef3c7; color: #92400e; }
.act-status-badge.selesai { background: var(--color-success-bg); color: var(--color-success); }

.act-desc { font-size: 0.82rem; margin-bottom: 16px; line-height: 1.5; }

.act-finance {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.act-fin-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 0.85rem; }
.fin-lbl { color: var(--color-text-muted); }
.fin-val { font-weight: 500; }
.fin-val.green { color: var(--color-success); }
.fin-val.red { color: var(--color-danger); }
.fw-medium { font-weight: 600; }
.fw-bold { font-weight: 700; }
.act-fin-divider { height: 1px; background: var(--color-border); margin: 8px 0; }

.act-actions { display: flex; gap: 6px; }

.icon-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: var(--color-text-muted); padding: 5px 10px; border-radius: 6px; font-weight: 500; }
.icon-btn:hover { background: var(--color-surface-2); }
.icon-btn.danger:hover { background: var(--color-danger-bg); color: var(--color-danger); }

.text-muted { color: var(--color-text-muted); }
.small { font-size: 0.82rem; }

.empty-page { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
.empty-title { font-size: 1rem; font-weight: 600; margin-bottom: 6px; }
.empty-sub { color: var(--color-text-muted); font-size: 0.875rem; }

.detail-section { margin-bottom: 20px; }
.detail-sec-title { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-dim); margin-bottom: 12px; }
.detail-grid-box { display: flex; flex-direction: column; gap: 10px; background: var(--color-surface-2); padding: 16px; border-radius: 10px; border: 1px solid var(--color-border); }
.detail-row { display: flex; align-items: flex-start; gap: 16px; }
.detail-lbl { font-size: 0.82rem; color: var(--color-text-muted); width: 100px; flex-shrink: 0; }

.fin-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.fin-box { border-radius: 10px; padding: 14px; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.08); transition: transform 0.2s ease; }
.fin-box:hover { transform: translateY(-2px); }
.fin-box.green { background: linear-gradient(135deg, #059669, #10b981); }
.fin-box.red { background: linear-gradient(135deg, #dc2626, #ef4444); }
.fin-box.blue { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
.fin-box-lbl { font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.85); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.2px; }
.fin-box-val { font-size: 1.15rem; font-weight: 800; line-height: 1.2; color: white; }

.mini-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.mini-table th { text-align: left; padding: 8px 10px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; color: var(--color-text-dim); border-bottom: 1px solid var(--color-border); }
.mini-table td { padding: 9px 10px; border-bottom: 1px solid var(--color-border); }
.mini-table tr:last-child td { border-bottom: none; }

.badge-type { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; }
.badge-type.in { background: var(--color-success-bg); color: var(--color-success); }
.badge-type.out { background: var(--color-danger-bg); color: var(--color-danger); }

.amount-in { color: var(--color-success); }
.amount-out { color: var(--color-danger); }

.empty-simple { text-align: center; font-size: 0.85rem; }
</style>
