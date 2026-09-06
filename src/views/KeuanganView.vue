<template>
  <div class="slide-up">
    <!-- Top Stats -->
    <div class="stats-grid">
      <div class="hero-stat-card stat-blue">
        <div class="hsc-inner">
          <div>
            <div class="hsc-label">Total Pemasukan Kas</div>
            <div class="hsc-value">+{{ formatCurrency(totalPemasukanKas) }}</div>
          </div>
        </div>
      </div>
      <div class="hero-stat-card stat-amber">
        <div class="hsc-inner">
          <div>
            <div class="hsc-label">Total Penarikan Dana</div>
            <div class="hsc-value">-{{ formatCurrency(totalPenarikanSemua) }}</div>
          </div>
        </div>
      </div>
      <div class="hero-stat-card stat-amber">
        <div class="hsc-inner">
          <div>
            <div class="hsc-label">Total Pengeluaran Kelas</div>
            <div class="hsc-value">-{{ formatCurrency(totalPengeluaranKelas) }}</div>
          </div>
        </div>
      </div>
      <div class="hero-stat-card stat-green">
        <div class="hsc-inner">
          <div>
            <div class="hsc-label">Saldo Kas Saat Ini</div>
            <div class="hsc-value">{{ formatCurrency(saldoKasComputed) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="card">
      <div class="card-header-flex">
        <div class="tabs">
          <button class="tab-btn" :class="{ active: activeTab === 'semua' }" @click="activeTab = 'semua'">Semua Transaksi</button>
          <button class="tab-btn" :class="{ active: activeTab === 'penarikan' }" @click="activeTab = 'penarikan'">Penarikan Dana</button>
          <button class="tab-btn" :class="{ active: activeTab === 'pengeluaran' }" @click="activeTab = 'pengeluaran'">Pengeluaran Kelas</button>
        </div>
        <div class="actions-group">
          <div class="search-box">
            <Search class="search-icon icon-sm" />
            <input type="text" v-model="search" placeholder="Cari transaksi..." />
          </div>
          <button class="btn btn-primary" @click="showAddMenu = !showAddMenu">
            <Plus class="icon-sm" /> Catat Transaksi
          </button>
          <!-- Dropdown Tambah -->
          <div class="dropdown-menu" v-if="showAddMenu">
            <button class="dropdown-item" @click="openModal('penarikan')">Penarikan Dana Anggota</button>
            <button class="dropdown-item" @click="openModal('pengeluaran')">Pengeluaran Kelas</button>
          </div>
        </div>
      </div>

      <!-- Backdrop Dropdown -->
      <div class="backdrop" v-if="showAddMenu" @click="showAddMenu = false"></div>

      <!-- Data Table -->
      <div class="table-responsive" style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 100px; white-space: nowrap;">Tanggal</th>
              <th style="min-width: 250px;">Nama / Keterangan</th>
              <th style="width: 110px;">Jenis</th>
              <th style="width: 160px;">Kategori / Kegiatan</th>
              <th style="text-align:right; width: 140px; white-space: nowrap;">Nominal</th>
              <th style="text-align:center; width: 110px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in filteredData" :key="t.id" class="clickable-row" @click="openDetail(t)">
              <td class="text-muted small" style="white-space: nowrap;">{{ formatShortDate(t.date) }}</td>
              <td class="fw-medium" style="line-height: 1.4;">{{ t.description }}</td>
              <td>
                <span class="badge-type" :class="t.type === 'income' ? 'in' : 'out'">
                  {{ t.type === 'income' ? 'Masuk' : 'Keluar' }}
                </span>
                <div style="font-size: 0.65rem; color: #9ca3af; margin-top:2px;" v-if="t.sourceType === 'penarikan'">Penarikan</div>
                <div style="font-size: 0.65rem; color: #9ca3af; margin-top:2px;" v-if="t.sourceType === 'pengeluaran'">Pengeluaran</div>
                <div style="font-size: 0.65rem; color: #9ca3af; margin-top:2px;" v-if="t.sourceType === 'pembayaran'">Pembayaran</div>
              </td>
              <td>
                <span v-if="t.category">{{ t.category }}</span>
                <span v-else class="text-muted">-</span>
                <div v-if="t.kegiatan" style="font-size: 0.7rem; color: var(--color-primary-dark);">{{ t.kegiatan }}</div>
              </td>
              <td style="text-align:right; white-space: nowrap;" class="fw-bold" :class="t.type === 'income' ? 'amount-in' : 'amount-out'">
                {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
              </td>
              <td @click.stop style="text-align: center; vertical-align: middle;">
                <button v-if="t.sourceType !== 'pembayaran'" class="btn-action btn-action-delete" style="width: 90px;" @click.stop="handleCancel(t)" title="Batalkan Transaksi">
                  Batalkan
                </button>
                <button v-else class="btn-action btn-action-view" style="width: 90px;" @click.stop="router.push('/kas')" title="Pembayaran ini hanya bisa diubah di menu Pembayaran Kas">
                  Cek di Kas
                </button>
              </td>
            </tr>
            <tr v-if="filteredData.length === 0">
              <td colspan="6" class="empty-cell">Tidak ada transaksi ditemukan.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Modal -->
    <Modal v-model="showDetail" title="Informasi Transaksi">
      <div class="modal-body" v-if="detailTxn">
        
        <!-- Premium Header Block -->
        <div class="detail-header-block" :class="detailTxn.type === 'income' ? 'header-green' : 'header-red'">
          <div class="dh-type">{{ detailTxn.type === 'income' ? 'Pemasukan Kas' : 'Pengeluaran / Penarikan' }}</div>
          <div class="dh-amount">
            {{ detailTxn.type === 'income' ? '+' : '-' }}{{ formatCurrency(detailTxn.amount) }}
          </div>
          <div class="dh-date">{{ formatShortDate(detailTxn.date) }}</div>
        </div>

        <div class="detail-card-info">
          <div class="info-item">
            <span class="info-label">Keterangan</span>
            <span class="info-value fw-bold">{{ detailTxn.description }}</span>
          </div>
          
          <div class="info-row-2">
            <div class="info-item">
              <span class="info-label">Kategori</span>
              <span class="info-value">{{ detailTxn.category }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Sumber Modul</span>
              <span class="info-value" style="text-transform: capitalize;">{{ detailTxn.sourceType }}</span>
            </div>
          </div>

          <div class="info-item" v-if="detailTxn.kegiatan">
            <span class="info-label">Terkait Kegiatan</span>
            <span class="info-value" style="color: var(--color-primary-dark); font-weight: 600;">{{ detailTxn.kegiatan }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Dicatat Oleh</span>
            <span class="info-value text-muted">{{ detailTxn.createdBy }}</span>
          </div>
          
          <div class="info-item" v-if="detailTxn.buktiUrl" style="margin-top: 4px;">
            <span class="info-label">Bukti Transaksi</span>
            <img :src="detailTxn.buktiUrl" style="max-height: 180px; object-fit: cover; border-radius: 8px; border: 1px solid var(--color-border); margin-top: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" />
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showDetail = false">Tutup</button>
      </div>
    </Modal>

    <!-- Modal Catat Penarikan -->
    <Modal v-model="showPenarikanModal" title="Catat Penarikan Dana">
      <div class="modal-body">
        <div class="alert-info" style="margin-bottom: 16px;">
          Penarikan dana akan mengurangi saldo pribadi anggota dan saldo kas kelas.
        </div>
        <div class="form-group">
          <label class="form-label">Anggota</label>
          <select v-model="formPenarikan.anggota_id" class="form-select">
            <option value="">Pilih anggota...</option>
            <option v-for="m in anggotaList" :key="m.id" :value="m.id">
              {{ m.nama }} (Saldo: Rp{{ getSaldoAnggota(m.id).toLocaleString('id-ID') }})
            </option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tanggal</label>
            <input v-model="formPenarikan.tanggal" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Nominal (Rp)</label>
            <input v-model.number="formPenarikan.nominal" type="number" class="form-input" placeholder="0" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Keterangan</label>
          <textarea v-model="formPenarikan.keterangan" class="form-input" rows="2" placeholder="Tujuan penarikan..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Bukti Transfer / Nota (Opsional)</label>
          <div class="file-upload-wrapper">
            <input type="file" id="file-penarikan" @change="onFileSelectPenarikan" class="file-input-hidden" accept="image/*,application/pdf" />
            <label for="file-penarikan" class="file-upload-box" :class="{ 'has-file': selectedFilePenarikan }">
              <UploadCloud class="upload-icon" />
              <div class="upload-text">
                <span v-if="selectedFilePenarikan" class="file-name">{{ selectedFilePenarikan.name }}</span>
                <span v-else>Klik untuk unggah foto/PDF bukti penarikan</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showPenarikanModal = false" :disabled="isUploadingPenarikan">Batal</button>
        <button class="btn btn-primary" @click="submitPenarikan" :disabled="!isPenarikanValid || isUploadingPenarikan">
          {{ isUploadingPenarikan ? 'Mengunggah...' : 'Simpan Penarikan' }}
        </button>
      </div>
    </Modal>

    <!-- Modal Catat Pengeluaran -->
    <Modal v-model="showPengeluaranModal" title="Catat Pengeluaran Kelas">
      <div class="modal-body">
        <div class="alert-info" style="margin-bottom: 16px;">
          Pengeluaran kelas menggunakan saldo kelas, tidak memotong saldo pribadi anggota.
        </div>
        <div class="form-group">
          <label class="form-label">Kategori</label>
          <select v-model="formPengeluaran.kategori_id" class="form-select">
            <option value="">Pilih kategori...</option>
            <option v-for="k in kategoriList" :key="k.id" :value="k.id">{{ k.nama }}</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tanggal</label>
            <input v-model="formPengeluaran.tanggal" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Nominal (Rp)</label>
            <input v-model.number="formPengeluaran.nominal" type="number" class="form-input" placeholder="0" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Terkait Kegiatan (Opsional)</label>
          <select v-model="formPengeluaran.kegiatan_id" class="form-select">
            <option value="">-- Tidak Terkait Kegiatan --</option>
            <option v-for="k in kegiatanList" :key="k.id" :value="k.id">{{ k.nama }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Keterangan</label>
          <textarea v-model="formPengeluaran.keterangan" class="form-input" rows="2" placeholder="Rincian pengeluaran..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Bukti Transfer / Nota (Opsional)</label>
          <div class="file-upload-wrapper">
            <input type="file" id="file-pengeluaran" @change="onFileSelectPengeluaran" class="file-input-hidden" accept="image/*,application/pdf" />
            <label for="file-pengeluaran" class="file-upload-box" :class="{ 'has-file': selectedFilePengeluaran }">
              <UploadCloud class="upload-icon" />
              <div class="upload-text">
                <span v-if="selectedFilePengeluaran" class="file-name">{{ selectedFilePengeluaran.name }}</span>
                <span v-else>Klik untuk unggah foto/PDF bukti pengeluaran</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showPengeluaranModal = false" :disabled="isUploadingPengeluaran">Batal</button>
        <button class="btn btn-primary" @click="submitPengeluaran" :disabled="!isPengeluaranValid || isUploadingPengeluaran">
          {{ isUploadingPengeluaran ? 'Mengunggah...' : 'Simpan Pengeluaran' }}
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, UploadCloud } from 'lucide-vue-next'
import Modal from '../components/common/Modal.vue'
import { formatCurrency, formatShortDate } from '../utils/formatters.js'
import { showDangerConfirm } from '../composables/useConfirm.js'
import { uploadProofFile } from '../utils/uploadFile.js'

import { totalPemasukanKas, totalPenarikanSemua, totalPengeluaranKelas, saldoKasComputed, getSaldoAnggota } from '../stores/saldo.js'
import { pembayaranList } from '../stores/pembayaranKas.js'
import { penarikanList, addPenarikan, cancelPenarikan } from '../stores/penarikanDana.js'
import { pengeluaranList, kategoriList, addPengeluaran, cancelPengeluaran } from '../stores/pengeluaranKelas.js'
import { anggotaList } from '../stores/anggota.js'
import { kegiatanList } from '../stores/kegiatan.js'

const toast = inject('toast')
const router = useRouter()

const activeTab = ref('semua')
const search = ref('')
const showAddMenu = ref(false)

const showDetail = ref(false)
const detailTxn = ref(null)

const showPenarikanModal = ref(false)
const showPengeluaranModal = ref(false)

const defaultPenarikan = () => ({ anggota_id: '', tanggal: new Date().toISOString().split('T')[0], nominal: '', keterangan: '', bukti_url: '' })
const defaultPengeluaran = () => ({ kategori_id: '', kegiatan_id: '', tanggal: new Date().toISOString().split('T')[0], nominal: '', keterangan: '', bukti_url: '' })

const formPenarikan = ref(defaultPenarikan())
const formPengeluaran = ref(defaultPengeluaran())

const selectedFilePenarikan = ref(null)
const selectedFilePengeluaran = ref(null)
const isUploadingPenarikan = ref(false)
const isUploadingPengeluaran = ref(false)

function onFileSelectPenarikan(e) {
  selectedFilePenarikan.value = e.target.files[0]
}

function onFileSelectPengeluaran(e) {
  selectedFilePengeluaran.value = e.target.files[0]
}

// Data Preparation
const allData = computed(() => {
  const data = []
  
  // Pembayaran Kas
  pembayaranList.value.filter(p => p.status !== 'belum_bayar').forEach(p => {
    data.push({
      id: `pembayaran_${p.id}`,
      rawId: p.id,
      sourceType: 'pembayaran',
      type: 'income',
      date: p.tanggal_bayar,
      description: `Pembayaran Kas: ${p.anggota?.nama || p.anggota_id} (${p.periode_kas?.nama_periode || ''})`,
      amount: Number(p.nominal),
      category: 'Kas Kelas',
      createdBy: p.dicatat_oleh_profile?.nama || '-',
      buktiUrl: p.bukti_url,
      kegiatan: null
    })
  })

  // Penarikan
  penarikanList.value.filter(p => p.status === 'aktif').forEach(p => {
    data.push({
      id: `penarikan_${p.id}`,
      rawId: p.id,
      sourceType: 'penarikan',
      type: 'expense',
      date: p.tanggal,
      description: `Penarikan Dana: ${p.anggota?.nama || p.anggota_id} - ${p.keterangan || ''}`,
      amount: Number(p.nominal),
      category: 'Penarikan Dana',
      createdBy: p.dicatat_oleh_profile?.nama || '-',
      buktiUrl: p.bukti_url,
      kegiatan: null
    })
  })

  // Pengeluaran
  pengeluaranList.value.filter(p => p.status === 'aktif').forEach(p => {
    data.push({
      id: `pengeluaran_${p.id}`,
      rawId: p.id,
      sourceType: 'pengeluaran',
      type: 'expense',
      date: p.tanggal,
      description: p.keterangan || 'Pengeluaran Kelas',
      amount: Number(p.nominal),
      category: p.kategori?.nama || '-',
      createdBy: p.dicatat_oleh_profile?.nama || '-',
      buktiUrl: p.bukti_url,
      kegiatan: p.kegiatan?.nama || null
    })
  })

  // Sort by date desc
  return data.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const filteredData = computed(() => {
  let res = allData.value
  
  // Tab Filter
  if (activeTab.value === 'penarikan') {
    res = res.filter(t => t.sourceType === 'penarikan')
  } else if (activeTab.value === 'pengeluaran') {
    res = res.filter(t => t.sourceType === 'pengeluaran')
  }

  // Search
  if (search.value) {
    const s = search.value.toLowerCase()
    res = res.filter(t => 
      t.description?.toLowerCase().includes(s) || 
      t.category?.toLowerCase().includes(s) ||
      t.kegiatan?.toLowerCase().includes(s)
    )
  }

  return res
})

function openModal(type) {
  showAddMenu.value = false
  if (type === 'penarikan') {
    formPenarikan.value = defaultPenarikan()
    selectedFilePenarikan.value = null
    showPenarikanModal.value = true
  } else {
    formPengeluaran.value = defaultPengeluaran()
    selectedFilePengeluaran.value = null
    showPengeluaranModal.value = true
  }
}

function openDetail(txn) {
  detailTxn.value = txn
  showDetail.value = true
}

// Submits
const isPenarikanValid = computed(() => formPenarikan.value.anggota_id && formPenarikan.value.nominal > 0 && formPenarikan.value.tanggal)
const isPengeluaranValid = computed(() => formPengeluaran.value.kategori_id && formPengeluaran.value.nominal > 0 && formPengeluaran.value.tanggal)

async function submitPenarikan() {
  isUploadingPenarikan.value = true
  let finalBuktiUrl = null
  
  if (selectedFilePenarikan.value) {
    const uploadRes = await uploadProofFile(selectedFilePenarikan.value, 'penarikan')
    if (uploadRes.success) {
      finalBuktiUrl = uploadRes.url
    } else {
      isUploadingPenarikan.value = false
      toast({ type: 'error', title: 'Upload Gagal', message: uploadRes.message })
      return
    }
  }

  formPenarikan.value.bukti_url = finalBuktiUrl

  const res = await addPenarikan(formPenarikan.value)
  if (res.success) {
    toast({ title: 'Berhasil', message: 'Penarikan dana berhasil dicatat.', type: 'success' })
    showPenarikanModal.value = false
  } else {
    toast({ title: 'Gagal', message: res.message, type: 'error' })
  }
  isUploadingPenarikan.value = false
}

async function submitPengeluaran() {
  isUploadingPengeluaran.value = true
  let finalBuktiUrl = null
  
  if (selectedFilePengeluaran.value) {
    const uploadRes = await uploadProofFile(selectedFilePengeluaran.value, 'pengeluaran')
    if (uploadRes.success) {
      finalBuktiUrl = uploadRes.url
    } else {
      isUploadingPengeluaran.value = false
      toast({ type: 'error', title: 'Upload Gagal', message: uploadRes.message })
      return
    }
  }

  const payload = { ...formPengeluaran.value, bukti_url: finalBuktiUrl }
  if (!payload.kegiatan_id) payload.kegiatan_id = null

  const res = await addPengeluaran(payload)
  if (res.success) {
    toast({ title: 'Berhasil', message: 'Pengeluaran kelas berhasil dicatat.', type: 'success' })
    showPengeluaranModal.value = false
  } else {
    toast({ title: 'Gagal', message: res.message, type: 'error' })
  }
  isUploadingPengeluaran.value = false
}

async function handleCancel(txn) {
  const confirmed = await showDangerConfirm(
    'Batalkan Transaksi',
    'Apakah Anda yakin ingin membatalkan transaksi ini? Saldo akan dikembalikan.'
  )
  if (!confirmed) return
  
  if (txn.sourceType === 'penarikan') {
    const res = await cancelPenarikan(txn.rawId)
    if(res.success) toast({ title: 'Dibatalkan', message: 'Penarikan berhasil dibatalkan.' })
    else toast({ title: 'Gagal', message: res.message, type: 'error' })
  } else if (txn.sourceType === 'pengeluaran') {
    const res = await cancelPengeluaran(txn.rawId)
    if(res.success) toast({ title: 'Dibatalkan', message: 'Pengeluaran berhasil dibatalkan.' })
    else toast({ title: 'Gagal', message: res.message, type: 'error' })
  }
}
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

/* Rest of Keuangan styles */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.stat-card.highlight {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border: none;
}

.text-white { color: #fff !important; }

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.amount-in { color: var(--color-success); }
.amount-out { color: var(--color-danger); }

/* Card */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 0;
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
.btn-action-delete {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
}
.btn-action-delete:hover {
  background: linear-gradient(135deg, #b91c1c, #dc2626);
}
.btn-action-view {
  background: linear-gradient(135deg, #4b5563, #6b7280);
  color: white;
}
.btn-action-view:hover {
  background: linear-gradient(135deg, #374151, #4b5563);
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.tabs {
  display: flex;
  gap: 4px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-muted);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover { background: var(--color-surface-2); color: var(--color-text); }
.tab-btn.active { background: var(--color-primary-glow); color: var(--color-primary-dark); font-weight: 600; }

.actions-group {
  display: flex;
  gap: 12px;
  position: relative;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--color-text-muted);
}

.search-box input {
  height: 36px;
  padding: 0 16px 0 34px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.82rem;
  outline: none;
  width: 220px;
}

.search-box input:focus { border-color: var(--color-primary); }

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 200px;
  z-index: 100;
  padding: 4px;
}

.dropdown-item {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 10px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
  border-radius: 6px;
  cursor: pointer;
}
.dropdown-item:hover { background: var(--color-surface-2); }

.backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 99;
}

.alert-info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  line-height: 1.4;
}

/* Detail Modal */
.detail-header-block {
  text-align: center;
  padding: 24px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.header-green {
  background: linear-gradient(135deg, #059669, #10b981);
}
.header-red {
  background: linear-gradient(135deg, #dc2626, #ef4444);
}
.dh-type {
  color: rgba(255,255,255,0.9);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}
.dh-amount {
  color: #fff;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}
.dh-date {
  color: rgba(255,255,255,0.8);
  font-size: 0.85rem;
}

.detail-card-info {
  background: var(--color-surface-2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--color-border);
}
.info-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.info-value {
  font-size: 0.95rem;
  color: var(--color-text);
  line-height: 1.4;
}

/* File Upload Box */
.file-upload-wrapper {
  position: relative;
  width: 100%;
}
.file-input-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}
.file-upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  background: var(--color-surface-2);
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}
.file-upload-box:hover {
  background: var(--color-primary-glow);
  border-color: var(--color-primary);
}
.file-upload-box.has-file {
  background: #ecfdf5;
  border-color: var(--color-primary-dark);
  border-style: solid;
}
.upload-icon {
  color: var(--color-primary);
  width: 32px;
  height: 32px;
}
.file-upload-box.has-file .upload-icon {
  color: var(--color-primary-dark);
}
.upload-text {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 500;
}
.file-name {
  color: var(--color-primary-dark);
  font-weight: 600;
  word-break: break-all;
}

/* ========== RESPONSIVE MOBILE ========== */
@media (max-width: 768px) {
  .card-header-flex {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .tabs {
    flex-direction: column;
    width: 100%;
  }

  .tab-btn {
    width: 100%;
    text-align: center;
  }

  .actions-group {
    flex-direction: column;
    width: 100%;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    width: 100%;
  }

  .actions-group .btn {
    width: 100%;
    justify-content: center;
  }

  .dropdown-menu {
    width: 100%;
    right: 0;
    left: 0;
  }
}
</style>
