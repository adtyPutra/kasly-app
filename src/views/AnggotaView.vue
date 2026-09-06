<template>
  <div class="slide-up">
    <!-- Header -->
    <div class="page-header">
      <div>
        <div class="page-title">Data Anggota</div>
        <div class="page-subtitle">Kelola dan lihat data anggota kelas</div>
      </div>
      <div class="page-actions desktop-only">
        <button class="btn btn-primary" @click="openAddModal">+ Tambah Anggota</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="hero-stat-card stat-blue">
        <div class="hsc-inner">
          <div class="hsc-icon-box"><Users class="icon-md" /></div>
          <div>
            <div class="hsc-label">Total Anggota</div>
            <div class="hsc-value">{{ members.length }}</div>
            <div class="hsc-sub">Seluruh data anggota</div>
          </div>
        </div>
      </div>
      <div class="hero-stat-card stat-green">
        <div class="hsc-inner">
          <div class="hsc-icon-box"><UserCheck class="icon-md" /></div>
          <div>
            <div class="hsc-label">Anggota Aktif</div>
            <div class="hsc-value">{{ activeCount }}</div>
            <div class="hsc-sub">Anggota yang aktif</div>
          </div>
        </div>
      </div>
      <div class="hero-stat-card stat-amber">
        <div class="hsc-inner">
          <div class="hsc-icon-box"><UserX class="icon-md" /></div>
          <div>
            <div class="hsc-label">Tidak Aktif</div>
            <div class="hsc-value">{{ inactiveCount }}</div>
            <div class="hsc-sub">Non-aktif / keluar</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Button (Mobile Only) -->
    <div class="action-bar-top mobile-only">
      <div class="action-left">
        <button class="btn btn-primary" @click="openAddModal" style="width: 100%; justify-content: center;">+ Tambah Anggota</button>
      </div>
    </div>

    <!-- Search -->
    <div class="filter-bar">
      <input v-model="search" type="text" class="form-input" placeholder="Cari nama anggota..." style="max-width: 300px;" />
      <select v-model="filterStatus" class="form-select" style="max-width: 200px;">
        <option value="">Semua Status</option>
        <option value="aktif">Aktif</option>
        <option value="tidak_aktif">Tidak Aktif</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40px;">No</th>
              <th>Nama Anggota</th>
              <th>Status</th>
              <th>Pembayaran Kas</th>
              <th style="width: 220px; text-align: center;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredMembers.length === 0">
              <td colspan="5" class="empty-cell">Tidak ada anggota ditemukan.</td>
            </tr>
            <tr
              v-for="(m, i) in filteredMembers"
              :key="m.id"
              class="clickable-row"
              @click="openDetail(m)"
            >
              <td class="text-muted">{{ i + 1 }}</td>
              <td class="fw-medium">{{ m.nama }}</td>
              <td>
                <span class="badge-status" :class="m.status === 'aktif' ? 'aktif' : 'nonaktif'">
                  {{ m.status === 'aktif' ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </td>
              <td class="text-muted">{{ getPaymentSummary(m) }}</td>
              <td @click.stop style="text-align: center;">
                <div class="action-row" style="justify-content: center;">
                  <button class="btn-action btn-action-detail" title="Detail" @click.stop="openDetail(m)">
                    Detail
                  </button>
                  <button class="btn-action btn-action-edit" title="Edit" @click.stop="openEdit(m)">
                    Edit
                  </button>
                  <button class="btn-action btn-action-delete" title="Hapus" @click.stop="confirmDelete(m)">
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Modal -->
    <Modal v-model="showDetail" title="Informasi Anggota">
      <div class="modal-body" v-if="detailMember">
        <div class="detail-header-green">
          <div class="dh-avatar">{{ detailMember.nama.charAt(0).toUpperCase() }}</div>
          <div>
            <div class="dh-name-white">{{ detailMember.nama }}</div>
            <div class="dh-sub-white">
              Status: <strong>{{ detailMember.status === 'aktif' ? 'Aktif' : 'Tidak Aktif' }}</strong>
            </div>
            <div class="dh-sub-white" style="margin-top: 4px; color: #fff;">
              Sisa Uang/Saldo: <strong style="font-size: 1.1em;">{{ formatCurrency(getSaldoAnggota(detailMember.id)) }}</strong>
            </div>
          </div>
        </div>
        
        <div class="detail-section-title">Riwayat Pembayaran Kas</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Periode</th>
              <th>Nominal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
          <tr v-for="p in periods" :key="p.id">
              <td>{{ p.nama_periode }}</td>
              <td>{{ formatCurrency(p.nominal) }}</td>
              <td>
                <span class="badge-status" :class="isPaymentLunas(detailMember, p.id) ? 'lunas' : 'belum'">
                  {{ isPaymentLunas(detailMember, p.id) ? 'Lunas' : 'Belum Bayar' }}
                </span>
              </td>
            </tr>
            <tr v-if="periods.length === 0">
              <td colspan="3" class="empty-cell">Belum ada periode kas.</td>
            </tr>
          </tbody>
        </table>

        <!-- Pengeluaran Anggota -->
        <div class="detail-section-title" style="margin-top: 20px;">Pengeluaran atas Nama Anggota Ini</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th style="text-align:right;">Nominal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in memberExpenses" :key="t.id">
              <td class="text-muted small">{{ formatShortDate(t.tanggal) }}</td>
              <td>{{ t.keterangan || 'Penarikan Dana' }}</td>
              <td style="text-align:right;" class="fw-medium amount-out">-{{ formatCurrency(t.nominal) }}</td>
            </tr>
            <tr v-if="memberExpenses.length === 0">
              <td colspan="3" class="empty-cell" style="padding: 16px;">Belum ada pengeluaran atas nama anggota ini.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showDetail = false">Tutup</button>
      </div>
    </Modal>

    <!-- Add / Edit Modal -->
    <Modal v-model="showForm" :title="editingMember ? 'Edit Anggota' : 'Tambah Anggota'">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Nama Lengkap</label>
          <input v-model="form.nama" type="text" class="form-input" placeholder="Nama anggota..." />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select v-model="form.status" class="form-select">
            <option value="aktif">Aktif</option>
            <option value="tidak_aktif">Tidak Aktif</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showForm = false">Batal</button>
        <button class="btn btn-primary" @click="saveMember">{{ editingMember ? 'Simpan' : 'Tambah' }}</button>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import Modal from '../components/common/Modal.vue'
import { Edit2, Trash2, Users, UserCheck, UserX } from 'lucide-vue-next'
import { anggotaList, addAnggota, updateAnggota, deleteAnggota } from '../stores/anggota.js'
import { getSaldoAnggota } from '../stores/saldo.js'
import { periodeList } from '../stores/periodeKas.js'
import { pembayaranList } from '../stores/pembayaranKas.js'
import { penarikanList } from '../stores/penarikanDana.js'
import { formatCurrency, formatShortDate } from '../utils/formatters.js'
import { showDangerConfirm } from '../composables/useConfirm.js'

const toast = inject('toast')

const members = computed(() => anggotaList.value)
const periods = computed(() => periodeList.value)

const search = ref('')
const filterStatus = ref('')

const filteredMembers = computed(() => {
  let list = members.value
  if (search.value) list = list.filter(m => m.nama.toLowerCase().includes(search.value.toLowerCase()))
  if (filterStatus.value) list = list.filter(m => m.status === filterStatus.value)
  return list
})

const activeCount = computed(() => members.value.filter(m => m.status === 'aktif').length)
const inactiveCount = computed(() => members.value.filter(m => m.status !== 'aktif').length)

function isPaymentLunas(member, periodId) {
  const p = pembayaranList.value.find(pay => pay.anggota_id === member.id && pay.periode_kas_id === periodId)
  return p && p.status !== 'belum_bayar'
}

function getPaymentSummary(member) {
  const ps = periods.value
  if (!ps.length) return '0/0 Lunas'
  const paid = ps.filter(p => isPaymentLunas(member, p.id)).length
  return `${paid}/${ps.length} Lunas`
}

// Detail
const showDetail = ref(false)
const detailMember = ref(null)

const memberExpenses = computed(() => {
  if (!detailMember.value) return []
  return penarikanList.value.filter(p => p.anggota_id === detailMember.value.id && p.status === 'aktif')
})

function openDetail(m) {
  detailMember.value = m
  showDetail.value = true
}

// Form
const showForm = ref(false)
const editingMember = ref(null)
const form = ref({ nama: '', status: 'aktif' })

function openAddModal() {
  editingMember.value = null
  form.value = { nama: '', status: 'aktif' }
  showForm.value = true
}

function openEdit(m) {
  editingMember.value = m
  form.value = { nama: m.nama, status: m.status }
  showForm.value = true
}

async function saveMember() {
  if (!form.value.nama.trim()) { toast({ type: 'warning', title: 'Nama wajib diisi' }); return }
  
  if (editingMember.value) {
    const res = await updateAnggota(editingMember.value.id, { nama: form.value.nama, status: form.value.status })
    if (res.success) toast({ type: 'success', title: 'Anggota diperbarui' })
    else toast({ type: 'error', title: 'Gagal', message: res.message })
  } else {
    const res = await addAnggota(form.value.nama.trim())
    if (res.success) toast({ type: 'success', title: 'Anggota ditambahkan' })
    else toast({ type: 'error', title: 'Gagal', message: res.message })
  }
  showForm.value = false
}

async function confirmDelete(m) {
  const confirmed = await showDangerConfirm(
    'Hapus Anggota',
    `Hapus "${m.nama}" dari daftar anggota? (Data akan dihapus permanen)`
  )
  if (confirmed) {
    const res = await deleteAnggota(m.id)
    if (res.success) toast({ type: 'success', title: 'Anggota dihapus' })
    else toast({ type: 'error', title: 'Gagal', message: res.message })
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.hsc-value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 2px;
}
.hsc-sub {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.75);
}
.icon-md {
  width: 20px;
  height: 20px;
}

.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; }

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table th {
  text-align: left;
  padding: 11px 16px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-dim);
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border);
}
.data-table td { padding: 12px 16px; border-bottom: 1px solid var(--color-border); color: var(--color-text); }
.data-table tr:last-child td { border-bottom: none; }
.clickable-row { cursor: pointer; }
.clickable-row:hover td { background: var(--color-surface-2); }

.fw-medium { font-weight: 500; }
.text-muted { color: var(--color-text-muted); }
.empty-cell { text-align: center; padding: 40px; color: var(--color-text-muted); }

.badge-status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; }
.badge-status.aktif { background: var(--color-success-bg); color: var(--color-success); }
.badge-status.nonaktif { background: var(--color-surface-2); color: var(--color-text-muted); border: 1px solid var(--color-border); }
.badge-status.lunas { background: var(--color-success-bg); color: var(--color-success); }
.badge-status.belum { background: var(--color-warning-bg); color: #b45309; }

.action-row { display: flex; gap: 6px; }

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 0;
  width: 65px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.btn-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.btn-action-detail {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
}
.btn-action-detail:hover {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
}
.btn-action-edit {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
}
.btn-action-edit:hover {
  background: linear-gradient(135deg, #047857, #059669);
}
.btn-action-delete {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
}
.btn-action-delete:hover {
  background: linear-gradient(135deg, #b91c1c, #dc2626);
}

.icon-sm { width: 14px; height: 14px; }

.detail-meta { margin-bottom: 16px; }
.detail-section-title { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-dim); margin-bottom: 12px; }

.amount-out { color: var(--color-danger); }
.fw-medium { font-weight: 600; }
.small { font-size: 0.82rem; }

.detail-header-green {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #059669, #10b981);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
}
.dh-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
}
.dh-name-white {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 2px;
}
.dh-sub-white {
  color: rgba(255,255,255,0.9);
  font-size: 0.82rem;
}
</style>
