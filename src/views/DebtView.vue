<template>
  <div class="slide-up">
    <div class="page-header">
      <div>
        <div class="page-title">Hutang & Piutang</div>
        <div class="page-subtitle">Kelola hutang dan piutang kelas 3KA25</div>
      </div>
      <div class="page-actions">
        <button id="btn-export-debt-pdf" class="btn btn-ghost" @click="doExportPDF"><FileText class="icon-sm" style="margin-right:4px;" /> Export PDF</button>
        <button id="btn-add-debt" class="btn btn-primary" @click="openAddModal">
          <Plus class="icon-sm" />
          Tambah
        </button>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid-4" style="margin-bottom: 20px;">
      <div class="stat-card" style="--stat-gradient: linear-gradient(90deg, #10b981, #34d399);">
        <div class="stat-label">Total Piutang</div>
        <div class="stat-value" style="color: var(--color-success);">{{ formatCurrency(totalReceivable) }}</div>
        <div class="stat-sub">Harus diterima</div>
        <div class="stat-icon" style="background: rgba(16,185,129,0.15); color: var(--color-success);"><ArrowDownLeft class="icon-md" /></div>
      </div>
      <div class="stat-card" style="--stat-gradient: linear-gradient(90deg, #ef4444, #f87171);">
        <div class="stat-label">Total Hutang</div>
        <div class="stat-value" style="color: var(--color-danger);">{{ formatCurrency(totalPayable) }}</div>
        <div class="stat-sub">Harus dibayar</div>
        <div class="stat-icon" style="background: rgba(239,68,68,0.15); color: var(--color-danger);"><ArrowUpRight class="icon-md" /></div>
      </div>
      <div class="stat-card" style="--stat-gradient: linear-gradient(90deg, #ef4444, #f87171);">
        <div class="stat-label">Sudah Jatuh Tempo</div>
        <div class="stat-value" style="color: var(--color-danger);">{{ overdueCount }}</div>
        <div class="stat-sub">item melewati deadline</div>
        <div class="stat-icon" style="background: rgba(239,68,68,0.15); color: var(--color-danger);"><AlertCircle class="icon-md" /></div>
      </div>
      <div class="stat-card" style="--stat-gradient: linear-gradient(90deg, #6366f1, #818cf8);">
        <div class="stat-label">Sudah Lunas</div>
        <div class="stat-value" style="color: var(--color-primary-light);">{{ paidCount }}</div>
        <div class="stat-sub">item telah diselesaikan</div>
        <div class="stat-icon" style="background: rgba(99,102,241,0.15); color: var(--color-primary-light);"><CheckCircle class="icon-md" /></div>
      </div>
    </div>

    <!-- Tabs -->
    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
      <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">Semua</button>
        <button class="tab-btn" :class="{ active: activeTab === 'receivable' }" @click="activeTab = 'receivable'"><ArrowDownLeft class="icon-sm" style="display:inline-block; vertical-align:middle; margin-right:4px;" /> Piutang</button>
        <button class="tab-btn" :class="{ active: activeTab === 'payable' }" @click="activeTab = 'payable'"><ArrowUpRight class="icon-sm" style="display:inline-block; vertical-align:middle; margin-right:4px;" /> Hutang</button>
        <button class="tab-btn" :class="{ active: activeTab === 'paid' }" @click="activeTab = 'paid'"><CheckCircle class="icon-sm" style="display:inline-block; vertical-align:middle; margin-right:4px;" /> Lunas</button>
      </div>
      <div class="search-bar" style="width: 240px;">
        <span class="search-icon"><Search class="icon-sm" style="color: var(--color-text-dim);" /></span>
        <input id="debt-search" v-model="search" type="text" class="form-input" placeholder="Cari nama..." />
      </div>
    </div>

    <!-- Debt List -->
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div v-if="filteredDebts.length === 0" class="card">
        <div class="empty-state">
          <ClipboardList class="empty-state-icon" style="width: 48px; height: 48px;" />
          <div class="empty-state-title">Tidak ada data</div>
          <div class="empty-state-text">Tidak ada hutang/piutang untuk kategori ini</div>
        </div>
      </div>
      <div
        v-for="debt in filteredDebts"
        :key="debt.id"
        class="debt-card"
        :class="{ overdue: isOverdue(debt.dueDate) && debt.status === 'unpaid', urgent: daysUntil(debt.dueDate) <= 3 && daysUntil(debt.dueDate) >= 0 && debt.status === 'unpaid' }"
      >
        <div class="debt-card-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <ArrowDownLeft v-if="debt.type === 'receivable'" style="color: var(--color-success); width: 24px; height: 24px;" />
              <ArrowUpRight v-else style="color: var(--color-danger); width: 24px; height: 24px;" />
              <div>
                <div class="debt-name">{{ debt.name }}</div>
                <div class="debt-desc">{{ debt.description }}</div>
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="debt-amount" :style="{ color: debt.type === 'receivable' ? 'var(--color-success)' : 'var(--color-danger)' }">{{ formatCurrency(debt.amount) }}</div>
            <span class="badge" :class="debt.status === 'paid' ? 'badge-success' : isOverdue(debt.dueDate) ? 'badge-danger' : 'badge-warning'">
              <CheckCircle v-if="debt.status === 'paid'" class="icon-xs" style="margin-right:4px;" />
              <AlertCircle v-else-if="isOverdue(debt.dueDate)" class="icon-xs" style="margin-right:4px;" />
              {{ debt.status === 'paid' ? 'Lunas' : isOverdue(debt.dueDate) ? 'Terlambat' : 'Belum Lunas' }}
            </span>
          </div>
        </div>
        <div class="debt-meta">
          <span class="badge badge-neutral">{{ debt.type === 'receivable' ? 'Piutang' : 'Hutang' }}</span>
          <span style="font-size: 0.78rem; color: var(--color-text-muted);">📅 Jatuh Tempo: {{ formatShortDate(debt.dueDate) }}</span>
          <span v-if="debt.status === 'unpaid'" style="font-size: 0.78rem;" :style="{ color: isOverdue(debt.dueDate) ? 'var(--color-danger)' : daysUntil(debt.dueDate) <= 3 ? 'var(--color-warning)' : 'var(--color-text-muted)' }">
            {{ isOverdue(debt.dueDate) ? `${Math.abs(daysUntil(debt.dueDate))} hari terlambat` : `${daysUntil(debt.dueDate)} hari lagi` }}
          </span>
          <span v-else style="font-size: 0.78rem; color: var(--color-text-muted);">Lunas pada {{ debt.paidAt ? formatShortDate(debt.paidAt) : '-' }}</span>
        </div>
        <div class="debt-actions" v-if="debt.status === 'unpaid'">
          <button class="btn btn-success btn-sm" @click="handleMarkPaid(debt)"><CheckCircle class="icon-sm" style="margin-right:4px;" /> Tandai Lunas</button>
          <button class="btn btn-ghost btn-sm" @click="openEditModal(debt)"><Edit2 class="icon-sm" style="margin-right:4px;" /> Edit</button>
          <button class="btn btn-ghost btn-sm" style="color: var(--color-danger);" @click="openDeleteConfirm(debt)"><Trash2 class="icon-sm" style="margin-right:4px;" /> Hapus</button>
        </div>
        <div class="debt-actions" v-else>
          <button class="btn btn-ghost btn-sm" style="color: var(--color-danger);" @click="openDeleteConfirm(debt)"><Trash2 class="icon-sm" style="margin-right:4px;" /> Hapus</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Modal v-model="showModal" :title="editingDebt ? 'Edit Hutang/Piutang' : 'Tambah Hutang/Piutang'">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Jenis</label>
          <div class="type-toggle">
            <button type="button" class="type-toggle-btn" :class="{ 'active-income': form.type === 'receivable' }" @click="form.type = 'receivable'"><ArrowDownLeft class="icon-sm" style="margin-right:4px;" /> Piutang (harus diterima)</button>
            <button type="button" class="type-toggle-btn" :class="{ 'active-expense': form.type === 'payable' }" @click="form.type = 'payable'"><ArrowUpRight class="icon-sm" style="margin-right:4px;" /> Hutang (harus dibayar)</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Nama / Pihak</label>
          <input id="debt-name" v-model="form.name" type="text" class="form-input" placeholder="Nama orang/pihak..." required />
        </div>
        <div class="form-group">
          <label class="form-label">Keterangan</label>
          <input id="debt-desc" v-model="form.description" type="text" class="form-input" placeholder="Keterangan hutang/piutang..." />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Jumlah (Rp)</label>
            <input id="debt-amount" v-model.number="form.amount" type="number" class="form-input" placeholder="0" min="1" required />
          </div>
          <div class="form-group">
            <label class="form-label">Jatuh Tempo</label>
            <input id="debt-due" v-model="form.dueDate" type="date" class="form-input" required />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showModal = false">Batal</button>
        <button id="debt-save" class="btn btn-primary" @click="saveDebt">{{ editingDebt ? 'Simpan' : 'Tambah' }}</button>
      </div>
    </Modal>

    <ConfirmDialog v-model="showDeleteConfirm" title="Hapus Data?" :message="`Hapus hutang/piutang dari &quot;${deletingDebt?.name}&quot;?`" icon="Trash2" confirm-text="Ya, Hapus" @confirm="confirmDelete" />
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import Modal from '../components/common/Modal.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import { Plus, FileText, ArrowDownLeft, ArrowUpRight, AlertCircle, CheckCircle, Search, ClipboardList, Edit2, Trash2 } from 'lucide-vue-next'
import { getDebts, addDebt, updateDebt, deleteDebt, markAsPaid } from '../stores/debts.js'
import { exportDebtToPDF } from '../utils/exportPDF.js'
import { formatCurrency, formatShortDate, isOverdue, daysUntil } from '../utils/formatters.js'

const toast = inject('toast')

const activeTab = ref('all')
const search = ref('')
const debts = computed(() => getDebts())

const filteredDebts = computed(() => {
  let d = debts.value
  if (search.value) d = d.filter(x => x.name.toLowerCase().includes(search.value.toLowerCase()))
  if (activeTab.value === 'receivable') d = d.filter(x => x.type === 'receivable' && x.status === 'unpaid')
  else if (activeTab.value === 'payable') d = d.filter(x => x.type === 'payable' && x.status === 'unpaid')
  else if (activeTab.value === 'paid') d = d.filter(x => x.status === 'paid')
  else d = d.filter(x => x.status === 'unpaid')
  return d
})

const unpaid = computed(() => debts.value.filter(d => d.status === 'unpaid'))
const totalReceivable = computed(() => unpaid.value.filter(d => d.type === 'receivable').reduce((s, d) => s + d.amount, 0))
const totalPayable = computed(() => unpaid.value.filter(d => d.type === 'payable').reduce((s, d) => s + d.amount, 0))
const overdueCount = computed(() => unpaid.value.filter(d => isOverdue(d.dueDate)).length)
const paidCount = computed(() => debts.value.filter(d => d.status === 'paid').length)

const showModal = ref(false)
const editingDebt = ref(null)
const defaultForm = () => ({ type: 'receivable', name: '', description: '', amount: '', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })
const form = ref(defaultForm())

function openAddModal() { form.value = defaultForm(); editingDebt.value = null; showModal.value = true }
function openEditModal(debt) {
  editingDebt.value = debt
  form.value = { type: debt.type, name: debt.name, description: debt.description, amount: debt.amount, dueDate: debt.dueDate.split('T')[0] }
  showModal.value = true
}
function saveDebt() {
  if (!form.value.name || !form.value.amount || !form.value.dueDate) { toast({ type: 'warning', title: 'Lengkapi semua field' }); return }
  const data = { ...form.value, amount: Number(form.value.amount), dueDate: new Date(form.value.dueDate).toISOString() }
  if (editingDebt.value) {
    updateDebt(editingDebt.value.id, data)
    toast({ type: 'success', title: 'Data diperbarui' })
  } else {
    addDebt(data)
    toast({ type: 'success', title: 'Data ditambahkan' })
  }
  showModal.value = false
}

function handleMarkPaid(debt) { markAsPaid(debt.id); toast({ type: 'success', title: `${debt.name} ditandai lunas` }) }

const showDeleteConfirm = ref(false)
const deletingDebt = ref(null)
function openDeleteConfirm(debt) { deletingDebt.value = debt; showDeleteConfirm.value = true }
function confirmDelete() { deleteDebt(deletingDebt.value.id); toast({ type: 'success', title: 'Data dihapus' }) }

function doExportPDF() {
  exportDebtToPDF(debts.value)
  toast({ type: 'success', title: 'Export PDF berhasil' })
}
</script>
