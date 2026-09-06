<template>
  <div class="slide-up">
    <!-- Header -->
    <div class="page-header">
      <div>
        <div class="page-title">Pembayaran Kas</div>
        <div class="page-subtitle">Pantau dan kelola pembayaran kas anggota per periode.</div>
      </div>
      <div class="page-actions" style="display: flex; gap: 8px;"></div>
    </div>

    <!-- Period Selector + Stats -->
    <div class="period-bar">
      <div class="period-top-row">
        <div class="period-select-group">
          <div class="field-label">Periode Kas</div>
            <div style="display: flex; gap: 8px;">
              <select v-model="selectedMonth" class="form-select" style="font-weight: 600;">
                <option v-for="(m, i) in monthNames" :key="i" :value="i + 1">{{ m }}</option>
              </select>
              <select v-model="selectedYear" class="form-select" style="font-weight: 600;">
                <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
        </div>
      </div>
    </div>

    <!-- Stat Cards Row -->
    <div class="stats-row">
      <div class="stat-card stat-green">
        <div class="stat-card-inner">
          <div class="stat-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <div>
            <div class="stat-label">Sudah Bayar</div>
            <div class="stat-number">{{ paidCount }} <span class="stat-unit">anggota</span></div>
          </div>
        </div>
      </div>

      <div class="stat-card stat-amber">
        <div class="stat-card-inner">
          <div class="stat-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
          </div>
          <div>
            <div class="stat-label">Belum Bayar</div>
            <div class="stat-number">{{ unpaidCount }} <span class="stat-unit">anggota</span></div>
          </div>
        </div>
      </div>

      <div class="stat-card stat-blue">
        <div class="stat-card-inner">
          <div class="stat-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20l-6-4z"/></svg>
          </div>
          <div>
            <div class="stat-label">Total Terkumpul</div>
            <div class="stat-number">{{ formatCurrency((selectedPeriod?.nominal || 0) * paidCount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions & Filters -->
    <div class="action-bar-top">
      <div class="action-left" style="align-items: center;">
        <button class="btn btn-success-solid" @click="openCatatModal(null)">+ Catat Pembayaran</button>
        
      </div>
    </div>

    <div class="filter-bar">
      <input v-model="search" type="text" class="form-input" placeholder="Cari nama anggota..." />
      
      <select v-model="filterStatus" class="form-select">
        <option value="">Semua Status</option>
        <option value="sudah">Sudah Bayar</option>
        <option value="belum">Belum Bayar</option>
        <option value="telat">Telat Bayar</option>
      </select>

      <select v-model="filterMetode" class="form-select">
        <option value="">Semua Metode</option>
        <option value="tunai">Tunai</option>
        <option value="transfer">Transfer</option>
      </select>

      <select v-model="filterTunggakan" class="form-select">
        <option value="">Semua Tunggakan</option>
        <option value="ada">Ada Tunggakan</option>
        <option value="tidak">Tidak Ada Tunggakan</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 40px;">No</th>
              <th>Nama Anggota</th>
              <th class="text-center">Nominal</th>
              <th class="text-center">Tanggal Bayar</th>
              <th class="text-center">Metode</th>
              <th class="text-center">Status</th>
              <th class="text-center">Tunggakan</th>
              <th class="text-center" style="width: 100px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="enrichedMembers.length === 0">
              <td colspan="8" class="empty-cell">
                {{ periods.length === 0 ? 'Belum ada periode kas. Buat periode baru terlebih dahulu.' : 'Tidak ada anggota ditemukan berdasarkan filter.' }}
              </td>
            </tr>
            <tr v-for="(m, i) in enrichedMembers" :key="m.id">
              <td class="text-muted text-center">{{ i + 1 }}</td>
              <td class="fw-medium">{{ m.nama }}</td>
              <td class="text-center">{{ formatCurrency(selectedPeriod?.nominal || 0) }}</td>
              <td class="small text-center">
                <span v-if="m.paymentInfo.payment" class="text-muted">{{ formatDisplayDate(m.paymentInfo.payment.tanggal_bayar) }}</span>
                <span v-else class="text-dim">—</span>
              </td>
              <td class="small text-center">
                <span v-if="m.paymentInfo.payment" style="text-transform: capitalize;">{{ m.paymentInfo.payment.metode || m.paymentInfo.payment.metode_pembayaran || 'tunai' }}</span>
                <span v-else class="text-dim">—</span>
              </td>
              <td class="text-center">
                <span :class="statusClass(m.paymentInfo.status)" class="fw-medium">
                  {{ formatStatusLabel(m.paymentInfo.status) }}
                </span>
              </td>
              <td class="small text-center fw-medium">
                <span
                  v-if="m.arrearsInfo.count > 0"
                  class="arrears-link"
                  @click="openTunggakanModal(m)"
                  title="Klik untuk lihat detail tunggakan"
                >{{ m.arrearsInfo.count }} periode</span>
                <span v-else class="text-dim">—</span>
              </td>
              <td>
                <div class="action-wrap">
                  <button
                    v-if="m.paymentInfo.status === 'belum'"
                    class="btn btn-sm btn-primary"
                    @click="openCatatModal(m)"
                  >Catat</button>
                  <button
                    v-else
                    class="btn btn-sm btn-primary"
                    @click="openDetailModal(m)"
                  >Detail</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Catat Pembayaran -->
    <Modal v-model="showCatatModal" title="Catat Pembayaran">
      <div class="modal-body">
        <!-- User Profile Card -->
        <div class="user-select-card mb-4">
          <label class="form-label mb-2">Anggota</label>
          <select v-if="!catatMemberLocked" v-model="catatForm.memberId" class="form-select select-lg" @change="onCatatMemberChange">
            <option value="">-- Pilih Anggota --</option>
            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.nama }}</option>
          </select>
          <div v-else class="locked-user-card">
            <div class="user-avatar">{{ catatForm.memberName.charAt(0).toUpperCase() }}</div>
            <div class="user-name-text">{{ catatForm.memberName }}</div>
          </div>
        </div>

        <div v-if="catatForm.memberId" class="payment-details-section">
          <label class="form-label mb-2">Pilih Periode yang Dibayar</label>
          <div v-if="unpaidPeriods.length === 0" class="empty-state-box">
            Semua periode telah dilunasi.
          </div>
          <div class="period-checkbox-list" v-else>
            <label v-for="p in unpaidPeriods" :key="p.id" class="period-checkbox-card" :class="{ 'selected': catatForm.selectedPeriodIds.includes(p.id) }">
              <div class="cb-left">
                <input type="checkbox" :value="p.id" v-model="catatForm.selectedPeriodIds" class="custom-cb" />
                <span class="p-name">{{ p.nama_periode }}</span>
              </div>
              <div class="p-nominal">{{ formatCurrency(p.nominal) }}</div>
            </label>
          </div>
          
          <div class="total-summary-card" style="margin-top: 16px;" v-if="catatForm.selectedPeriodIds.length > 0">
            <div class="ts-label">Total Pembayaran</div>
            <div class="ts-value">{{ formatCurrency(calculatedTotal) }} <span class="ts-sub">({{ catatForm.selectedPeriodIds.length }} periode)</span></div>
          </div>
        </div>

        <div class="form-row mt-4">
          <div class="form-group">
            <label class="form-label">Tanggal Bayar</label>
            <input v-model="catatForm.tanggal_bayar" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Metode</label>
            <select v-model="catatForm.metode" class="form-select">
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>

        <div class="form-group mt-3" v-if="catatForm.metode === 'transfer'">
          <label class="form-label">Bukti Transfer <span class="text-danger">*</span></label>
          <div class="file-upload-box">
            <input type="file" @change="onFileSelect" class="file-input" accept="image/*,application/pdf" />
            <div class="upload-placeholder" v-if="!selectedFile">
              <Upload class="icon-lg text-muted mb-2" />
              <div class="fw-medium" style="color: var(--color-text);">Klik untuk memilih bukti transfer</div>
              <div class="small text-muted mt-1">Format: JPG, PNG, PDF (Maks 5MB)</div>
            </div>
            <div class="upload-selected" v-else>
              <File class="icon-lg text-primary mb-2" />
              <div class="fw-medium" style="color: var(--color-primary);">{{ selectedFile.name }}</div>
              <div class="small text-muted mt-1">Klik untuk mengganti file</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer" style="padding-top: 24px; margin-top: 12px; border-top: 1px solid var(--color-border);">
        <button class="btn btn-ghost" @click="showCatatModal = false" :disabled="isUploading">Batal</button>
        <button class="btn btn-success-solid btn-lg" @click="confirmCatat" :disabled="isUploading || !canSubmitCatat">
          {{ isUploading ? 'Memproses...' : 'Simpan Pembayaran' }}
        </button>
      </div>
    </Modal>

    <!-- Modal: Detail Pembayaran -->
    <Modal v-model="showDetailModal" title="Riwayat Pembayaran">
      <div class="modal-body" v-if="detailTarget">
        <div class="detail-header-green">
          <div class="dh-avatar">{{ detailTarget.nama.charAt(0).toUpperCase() }}</div>
          <div>
            <div class="dh-name-white">{{ detailTarget.nama }}</div>
            <div class="dh-sub-white">Total terbayar: <strong>{{ formatCurrency(detailTotal) }}</strong></div>
            <div class="dh-sub-white" style="margin-top: 4px; color: #fff;">
              Sisa Uang/Saldo: <strong style="font-size: 1.1em;">{{ formatCurrency(getSaldoAnggota(detailTarget.id)) }}</strong>
            </div>
          </div>
        </div>

        <div class="history-list mt-3">
          <div class="history-list-label mb-2">Riwayat Pembayaran</div>
          <div v-if="detailHistory.length === 0" class="empty-state-box">Belum ada riwayat pembayaran.</div>
          <div class="history-card" v-for="h in detailHistory" :key="h.id">
            <div class="hc-left">
              <div class="hc-period">{{ h.periode_kas?.nama_periode }}</div>
              <div class="hc-meta">
                <span>{{ formatDisplayDate(h.tanggal_bayar) }}</span>
                <span class="hc-dot">•</span>
                <span style="text-transform: capitalize;">{{ h.metode_pembayaran || h.metode || 'Tunai' }}</span>
                <span class="hc-dot">•</span>
                <span>{{ formatCurrency(h.nominal) }}</span>
              </div>
            </div>
            <div class="hc-right">
              <button v-if="h.bukti_url" @click="openBukti(h.bukti_url)" class="btn-proof-solid">
                <ExternalLink class="icon-xs" /> Bukti
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4" v-if="detailTarget.arrearsInfo.count > 0">
          <div class="arrears-warning-card">
            <div class="awc-icon">
              <Info class="icon-md" />
            </div>
            <div class="awc-content">
              <div class="awc-title">Memiliki Tunggakan!</div>
              <div class="awc-desc">{{ detailTarget.arrearsInfo.count }} periode (Total {{ formatCurrency(detailTarget.arrearsInfo.total) }})</div>
            </div>
            <button class="btn btn-danger awc-btn" @click="openCatatModal(detailTarget, true)">Bayar</button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showDetailModal = false">Tutup</button>
      </div>
    </Modal>

    
    <!-- Modal: Detail Tunggakan -->
    <Modal v-model="showTunggakanModal" title="Detail Tunggakan">
      <div class="modal-body" v-if="tunggakanTarget">
        <!-- Red header card -->
        <div class="tunggakan-header-card">
          <div class="dh-avatar danger-avatar">{{ tunggakanTarget.nama.charAt(0).toUpperCase() }}</div>
          <div>
            <div class="dh-name-white">{{ tunggakanTarget.nama }}</div>
            <div class="dh-sub-white">Total Tunggakan: <strong>{{ formatCurrency(tunggakanTarget.arrearsInfo.total) }}</strong></div>
          </div>
        </div>
        <!-- Arrears list as cards -->
        <div class="history-list-label mb-2 mt-3">Periode Belum Dibayar</div>
        <div v-for="p in tunggakanTarget.arrearsInfo.periods" :key="p.id" class="arrears-item-card">
          <div class="ai-period">{{ p.nama_periode }}</div>
          <div class="ai-nominal">{{ formatCurrency(p.nominal) }}</div>
        </div>
      </div>
      <div class="modal-footer" style="justify-content: space-between; display: flex;">
        <button class="btn btn-ghost" @click="showTunggakanModal = false">Tutup</button>
        <button class="btn btn-success-solid" @click="openCatatFromTunggakan">Bayar Sekarang</button>
      </div>
    </Modal>

    <!-- Lightbox for Bukti -->
    <div v-if="previewImage" class="lightbox-overlay" @click="previewImage = null">
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="previewImage = null"><X class="icon-md" /></button>
        <img :src="previewImage" alt="Bukti Pembayaran" class="lightbox-img" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue'
import Modal from '../components/common/Modal.vue'
import { FileText, Trash2, Info, Upload, File, ExternalLink, X } from 'lucide-vue-next'
import { formatCurrency } from '../utils/formatters.js'
import { getSaldoAnggota } from '../stores/saldo.js'
import { anggotaList } from '../stores/anggota.js'
import { periodeList, getOrCreatePeriode } from '../stores/periodeKas.js'
import { pembayaranList, addBulkPembayaran, cancelPembayaran } from '../stores/pembayaranKas.js'
import { uploadProofFile } from '../utils/uploadFile.js'
import { getPaymentForPeriod, getArrears, getAllUnpaidPeriods, getPaymentStatus, formatStatusLabel, sortPeriods } from '../utils/statusHelper.js'
import { showDangerConfirm } from '../composables/useConfirm.js'
const toast = inject('toast')

const periods = computed(() => periodeList.value)
const members = computed(() => anggotaList.value.filter(m => m.status === 'aktif'))

const selectedPeriodId = ref('')
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const availableYears = [2024, 2025, 2026, 2027, 2028, 2029, 2030]

watch([selectedMonth, selectedYear], async ([m, y]) => {
  const res = await getOrCreatePeriode(m, y)
  if (res.success) {
    selectedPeriodId.value = res.data.id
  }
}, { immediate: true })

const selectedPeriod = computed(() => periods.value.find(p => p.id === selectedPeriodId.value))

// Filters
const search = ref('')
const filterStatus = ref('')
const filterMetode = ref('')
const filterTunggakan = ref('')

// Compute enriched members
const enrichedMembersList = computed(() => {
  if (!selectedPeriod.value) return []
  return members.value.map(m => {
    const paymentInfo = getPaymentStatus(m.id, selectedPeriod.value, pembayaranList.value)
    const arrearsInfo = getArrears(m.id, selectedPeriod.value.id, periods.value, pembayaranList.value)
    return { ...m, paymentInfo, arrearsInfo }
  })
})

const enrichedMembers = computed(() => {
  let list = enrichedMembersList.value
  
  if (search.value) {
    list = list.filter(m => m.nama.toLowerCase().includes(search.value.toLowerCase()))
  }
  if (filterStatus.value) {
    list = list.filter(m => m.paymentInfo.status === filterStatus.value)
  }
  if (filterMetode.value) {
    list = list.filter(m => {
      if (filterMetode.value === 'tunai') return m.paymentInfo.payment && (m.paymentInfo.payment.metode === 'tunai' || m.paymentInfo.payment.metode_pembayaran === 'tunai')
      if (filterMetode.value === 'transfer') return m.paymentInfo.payment && (m.paymentInfo.payment.metode === 'transfer' || m.paymentInfo.payment.metode_pembayaran === 'transfer')
      return true
    })
  }
  if (filterTunggakan.value === 'ada') list = list.filter(m => m.arrearsInfo.count > 0)
  if (filterTunggakan.value === 'tidak') list = list.filter(m => m.arrearsInfo.count === 0)
  
  return list
})

// Stats
const paidCount = computed(() => enrichedMembersList.value.filter(m => m.paymentInfo.status !== 'belum').length)
const unpaidCount = computed(() => enrichedMembersList.value.length - paidCount.value)
const membersWithArrears = computed(() => enrichedMembersList.value.filter(m => m.arrearsInfo.count > 0).length)
const totalArrears = computed(() => enrichedMembersList.value.reduce((sum, m) => sum + m.arrearsInfo.total, 0))

function statusClass(status) {
  if (status === 'sudah') return 'status-sudah'
  if (status === 'belum') return 'status-belum'
  if (status === 'telat') return 'status-telat'
  return 'status-belum'
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Catat Pembayaran Modal
const showCatatModal = ref(false)
const catatMemberLocked = ref(false)
const selectedFile = ref(null)
const isUploading = ref(false)

const catatForm = ref({
  memberId: '',
  memberName: '',
  selectedPeriodIds: [],
  tanggal_bayar: new Date().toISOString().split('T')[0],
  metode: 'tunai'
})

const unpaidPeriods = computed(() => {
  if (!catatForm.value.memberId) return []
  return getAllUnpaidPeriods(catatForm.value.memberId, periods.value, pembayaranList.value)
})

const calculatedTotal = computed(() => {
  return unpaidPeriods.value
    .filter(p => catatForm.value.selectedPeriodIds.includes(p.id))
    .reduce((sum, p) => sum + (p.nominal || 0), 0)
})

const canSubmitCatat = computed(() => {
  if (!catatForm.value.memberId) return false
  if (catatForm.value.selectedPeriodIds.length === 0) return false
  if (!catatForm.value.tanggal_bayar) return false
  if (catatForm.value.metode === 'transfer' && !selectedFile.value) return false
  return true
})

function onFileSelect(e) {
  selectedFile.value = e.target.files[0]
}

function onCatatMemberChange() {
  catatForm.value.selectedPeriodIds = []
  // Auto select active period if unpaid
  if (selectedPeriod.value && unpaidPeriods.value.find(p => p.id === selectedPeriod.value.id)) {
    catatForm.value.selectedPeriodIds = [selectedPeriod.value.id]
  }
}

function openCatatModal(member = null, arrearsMode = false) {
  if (member) {
    catatForm.value.memberId = member.id
    catatForm.value.memberName = member.nama
    catatMemberLocked.value = true
  } else {
    catatForm.value.memberId = ''
    catatForm.value.memberName = ''
    catatMemberLocked.value = false
  }
  
  catatForm.value.tanggal_bayar = new Date().toISOString().split('T')[0]
  catatForm.value.metode = 'tunai'
  catatForm.value.selectedPeriodIds = []
  selectedFile.value = null
  
  // Calculate default checked
  if (member) {
    const unp = getAllUnpaidPeriods(member.id, periods.value, pembayaranList.value)
    if (arrearsMode) {
      // check all arrears
      const arrears = getArrears(member.id, selectedPeriodId.value, periods.value, pembayaranList.value)
      catatForm.value.selectedPeriodIds = arrears.periods.map(p => p.id)
    } else {
      // check selected period if possible
      if (unp.find(p => p.id === selectedPeriodId.value)) {
        catatForm.value.selectedPeriodIds = [selectedPeriodId.value]
      }
    }
  }

  showCatatModal.value = true
  if (showDetailModal.value) showDetailModal.value = false // close detail if opened
}

async function confirmCatat() {
  isUploading.value = true
  let finalBuktiUrl = null

  if (catatForm.value.metode === 'transfer' && selectedFile.value) {
    const uploadRes = await uploadProofFile(selectedFile.value, 'pembayaran')
    if (uploadRes.success) {
      finalBuktiUrl = uploadRes.url
    } else {
      isUploading.value = false
      toast({ type: 'error', title: 'Upload Gagal', message: uploadRes.message })
      return
    }
  }
  
  const payloads = catatForm.value.selectedPeriodIds.map(pid => {
    const pObj = periods.value.find(x => x.id === pid)
    return {
      anggota_id: catatForm.value.memberId,
      periode_kas_id: pid,
      tanggal_bayar: catatForm.value.tanggal_bayar,
      nominal: pObj.nominal,
      metode_pembayaran: catatForm.value.metode,
      bukti_url: finalBuktiUrl
    }
  })

  const res = await addBulkPembayaran(payloads)
  if (res.success) {
    toast({ type: 'success', title: `Berhasil mencatat ${payloads.length} pembayaran` })
    showCatatModal.value = false
  } else {
    toast({ type: 'error', title: 'Gagal', message: res.message })
  }
  isUploading.value = false
}

// Tunggakan Modal
const showTunggakanModal = ref(false)
const tunggakanTarget = ref(null)

function openTunggakanModal(member) {
  tunggakanTarget.value = member
  showTunggakanModal.value = true
}

function openCatatFromTunggakan() {
  const member = tunggakanTarget.value
  showTunggakanModal.value = false
  openCatatModal(member, true)
}

// Detail Modal
const showDetailModal = ref(false)
const detailTarget = ref(null)

const detailHistory = computed(() => {
  if (!detailTarget.value) return []
  const hist = pembayaranList.value.filter(p => p.anggota_id === detailTarget.value.id)
  
  return hist.map(h => {
    const pObj = periods.value.find(x => x.id === h.periode_kas_id)
    return {
      ...h,                          // spread all fields including bukti_url
      periode_kas: pObj,
    }
  }).sort((a, b) => {
    // Sort by period batas_pembayaran descending
    const aDate = a.periode_kas?.batas_pembayaran || a.tanggal_bayar
    const bDate = b.periode_kas?.batas_pembayaran || b.tanggal_bayar
    return new Date(bDate) - new Date(aDate)
  })
})

const detailTotal = computed(() => {
  return detailHistory.value.reduce((sum, h) => sum + (h.nominal || 0), 0)
})

function openDetailModal(member) {
  detailTarget.value = member
  showDetailModal.value = true
}

const previewImage = ref(null)
function openBukti(url) {
  previewImage.value = url
}

async function cancelPayment(paymentId, periodName) {
  const confirmed = await showDangerConfirm(
    'Batalkan Pembayaran',
    `Batalkan pembayaran untuk periode ${periodName || ''}?`
  )
  if (confirmed) {
    const res = await cancelPembayaran(paymentId)
    if (res.success) {
      toast({ type: 'info', title: 'Pembayaran dibatalkan' })
      // Because reactive arrays are updated, UI will auto refresh. 
      // Arrears compute will auto run.
    } else {
      toast({ type: 'error', title: 'Gagal membatalkan', message: res.message })
    }
  }
}


</script>

<style scoped>
.period-bar {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 12px;
}

.period-top-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.period-select-group { 
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Desktop: period dropdowns have fixed min-widths */
.period-select-group > div .form-select:first-child {
  min-width: 140px;
}

.period-select-group > div .form-select:last-child {
  min-width: 100px;
}
.period-select { 
  min-width: 200px;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 8px 36px 8px 12px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}
.field-label { font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-dim); white-space: nowrap; }

.btn-del-period {
  background: none;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--color-danger);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}
.btn-del-period:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-danger);
}

.period-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-chip {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  padding: 4px 12px;
  border-radius: 20px;
}

/* --- Stat Cards Row --- */
.stats-row {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 200px;
  border-radius: 12px;
  padding: 18px 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
.stat-card::before {
  display: none;
}

.stat-card-inner {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-green  { background: linear-gradient(135deg, #059669, #10b981); }
.stat-amber  { background: linear-gradient(135deg, #dc2626, #ef4444); }
.stat-blue   { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }

.stat-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  margin-bottom: 4px;
  letter-spacing: 0.2px;
}

.stat-number {
  font-size: 1.55rem;
  font-weight: 800;
  line-height: 1.1;
}

.stat-unit {
  font-size: 0.85rem;
  font-weight: 500;
  opacity: 0.8;
}

.action-bar-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.action-left {
  display: flex;
  gap: 10px;
}

.filter-bar { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.filter-bar .form-input { max-width: 240px; }
.filter-bar .form-select { width: 160px; }
.filter-count { font-size: 0.82rem; margin-left: auto; }

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; white-space: nowrap; }
.data-table th {
  padding: 12px 16px;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-dim);
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border);
}
.data-table th:not(.text-center) { text-align: left; }
.data-table td { padding: 14px 16px; border-bottom: 1px solid var(--color-border); color: var(--color-text); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--color-surface-2); }

/* Status text colors */
.status-sudah { color: var(--color-success); }
.status-belum { color: var(--color-danger); }
.status-telat { color: #d97706; }

/* Arrears clickable link in table */
.arrears-link {
  color: var(--color-danger);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 3px;
  transition: color 0.15s;
}
.arrears-link:hover { color: #991b1b; }

.text-center { text-align: center; }
.fw-medium { font-weight: 500; }
.text-muted { color: var(--color-text-muted); }
.text-dim { color: var(--color-text-dim); }
.text-danger { color: var(--color-danger); }
.text-primary { color: var(--color-primary); }
.small { font-size: 0.82rem; }
.empty-cell { text-align: center; padding: 48px; color: var(--color-text-muted); font-size: 0.875rem; }

.badge-status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; }
.badge-status.sudah { background: var(--color-success-bg); color: var(--color-success); }
.badge-status.belum { background: var(--color-danger-bg); color: var(--color-danger); }
.badge-status.telat { background: var(--color-warning-bg); color: #92400e; }
.badge-status.muka { background: var(--color-info-bg); color: var(--color-info); }

.action-wrap { display: flex; gap: 6px; justify-content: center; }
.btn-sm { padding: 5px 14px; font-size: 0.78rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
.btn-success { background: var(--color-success); color: #fff; }
.btn-success:hover { background: var(--color-primary-dark); }
.btn-success-solid { background: var(--color-success); color: #fff; border: none; cursor: pointer; font-weight: 600; padding: 8px 20px; border-radius: 8px; }
.btn-success-solid:hover { background: var(--color-primary-dark); }
.btn-danger { background: var(--color-danger); color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-outline { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-muted); cursor: pointer; padding: 8px 16px; border-radius: 8px; font-weight: 600; }
.btn-outline:hover { background: var(--color-surface-2); }
.danger-outline { color: var(--color-danger); border-color: rgba(239, 68, 68, 0.3); }
.danger-outline:hover { background: var(--color-danger-bg); border-color: var(--color-danger); }
.btn-ghost { background: none; border: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 0.78rem; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
.btn-ghost:hover { background: var(--color-surface-2); }

.modal-body {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 6px;
}
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }

.locked-user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-surface-2);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-success);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}
.user-name-text { font-weight: 600; font-size: 1rem; color: var(--color-text); }
.select-lg { padding: 12px 16px; font-size: 0.95rem; }

.period-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 6px;
}
.period-checkbox-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s;
}
.period-checkbox-card:hover { border-color: var(--color-success); }
.period-checkbox-card.selected {
  background: rgba(16, 185, 129, 0.05);
  border-color: var(--color-success);
}
.cb-left { display: flex; align-items: center; gap: 12px; }
.custom-cb { width: 18px; height: 18px; accent-color: var(--color-success); cursor: pointer; }
.p-name { font-weight: 600; color: var(--color-text); }
.p-nominal { font-weight: 600; color: var(--color-text-muted); font-size: 0.9rem; }

.total-summary-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  border: 1px dashed var(--color-success);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ts-label { font-weight: 700; color: var(--color-success); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
.ts-value { font-size: 1.25rem; font-weight: 800; color: var(--color-text); }
.ts-sub { font-size: 0.85rem; font-weight: 500; color: var(--color-text-muted); }

.empty-state-box {
  padding: 24px;
  text-align: center;
  background: var(--color-surface-2);
  border-radius: 8px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.btn-lg { padding: 10px 24px; font-size: 0.95rem; }

.file-upload-box {
  position: relative;
  border: 2px dashed var(--color-border);
  padding: 24px;
  text-align: center;
  border-radius: 12px;
  background: var(--color-surface-2);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.file-upload-box:hover {
  border-color: var(--color-primary);
  background: rgba(14, 165, 233, 0.03);
}
.file-input {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0;
  cursor: pointer;
}
.icon-lg { width: 32px; height: 32px; }

.detail-header-green {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #059669, #10b981);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
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
.dh-name-white { font-size: 1.1rem; font-weight: 700; color: white; }
.dh-sub-white { font-size: 0.82rem; color: rgba(255,255,255,0.85); margin-top: 2px; }

.btn-proof-solid {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  background: var(--color-success);
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
}
.btn-proof-solid:hover {
  background: var(--color-primary-dark);
}
.history-list-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-dim); }

.history-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  margin-bottom: 8px;
  background: var(--color-surface);
  gap: 12px;
}
.hc-left { flex: 1; }
.hc-period { font-weight: 600; font-size: 0.9rem; color: var(--color-text); margin-bottom: 3px; }
.hc-meta { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--color-text-muted); flex-wrap: wrap; }
.hc-dot { color: var(--color-border); }
.hc-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.arrears-warning-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-danger-bg);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 14px 16px;
  border-radius: 12px;
}
.awc-icon { color: var(--color-danger); flex-shrink: 0; }
.awc-content { flex: 1; }
.awc-title { font-weight: 700; color: var(--color-danger); font-size: 0.95rem; margin-bottom: 2px; }
.awc-desc { font-size: 0.8rem; color: #991b1b; }
.awc-btn { white-space: nowrap; font-size: 0.85rem; padding: 8px 16px; border-radius: 8px; }

/* Tunggakan modal header */
.tunggakan-header-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  border-radius: 12px;
  padding: 16px 20px;
}
.danger-avatar {
  background: rgba(255,255,255,0.25) !important;
}

/* Arrears list item card */
.arrears-item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid rgba(239,68,68,0.2);
  background: rgba(239,68,68,0.03);
  margin-bottom: 6px;
}
.ai-period { font-weight: 600; color: var(--color-text); font-size: 0.9rem; }
.ai-nominal { font-weight: 700; color: var(--color-danger); font-size: 0.9rem; }

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.lightbox-content {
  position: relative;
  max-width: 600px;
  max-height: 80vh;
}

.lightbox-img {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  object-fit: contain;
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.2s;
}

.lightbox-close:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .lightbox-close {
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.5);
    border-radius: 50%;
  }

  /* Stats row: stack to single column on mobile */
  .stats-row {
    flex-direction: column !important;
    gap: 10px;
  }

  .stat-card {
    min-width: unset !important;
    flex: unset !important;
    width: 100% !important;
  }

  /* Filter bar: stack all filters vertically */
  .filter-bar {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .filter-bar .form-input,
  .filter-bar .form-select {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Action bar: full width button */
  .action-bar-top {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px;
  }

  .action-left {
    flex-direction: column !important;
    gap: 8px;
  }

  .action-left .btn {
    width: 100% !important;
    justify-content: center;
  }

  /* Period selector: stack month and year vertically on mobile */
  .period-select-group {
    flex-direction: column !important;
    align-items: stretch !important;
    width: 100%;
    gap: 8px;
  }

  .period-select-group > div {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px;
  }

  .period-select-group > div .form-select:first-child,
  .period-select-group > div .form-select:last-child {
    width: 100% !important;
    min-width: unset !important;
    flex: unset !important;
  }

  .period-top-row {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .field-label {
    margin-bottom: 4px;
  }
}
</style>