<template>
  <div class="slide-up">
    <div class="page-header">
      <div>
        <div class="page-title">Kategori</div>
        <div class="page-subtitle">Atur kategori pemasukan & pengeluaran</div>
      </div>
      <div class="page-actions">
        <button id="btn-add-category" class="btn btn-primary" @click="openAddModal">
          <Plus class="icon-sm" />
          Tambah Kategori
        </button>
      </div>
    </div>

    <div class="grid-2">
      <!-- Income Categories -->
      <div class="card">
        <div class="card-header">
          <div class="card-title" style="color: var(--color-success); display: flex; align-items: center; gap: 8px;"><TrendingUp class="icon-sm" /> Pemasukan</div>
          <span class="badge badge-success">{{ incomeCategories.length }} kategori</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div v-for="cat in incomeCategories" :key="cat.id" class="category-item">
            <div class="category-icon-box" :style="{ background: cat.color + '22', color: cat.color }"><Icon :name="cat.icon" /></div>
            <div style="flex: 1;">
              <div style="font-size: 0.9rem; font-weight: 600;">{{ cat.name }}</div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted);">
                {{ getTxnCount(cat.id) }} transaksi · {{ formatCurrency(getTxnTotal(cat.id)) }}
              </div>
            </div>
            <span class="color-dot" :style="{ background: cat.color }"></span>
            <button class="btn btn-ghost btn-icon btn-sm" @click="openEditModal(cat)"><Edit2 class="icon-sm" /></button>
            <button class="btn btn-ghost btn-icon btn-sm" style="color: var(--color-danger);" @click="openDeleteConfirm(cat)"><Trash2 class="icon-sm" /></button>
          </div>
          <div v-if="incomeCategories.length === 0" class="empty-state" style="padding: 20px;">
            <div style="font-size: 0.85rem; color: var(--color-text-dim);">Belum ada kategori pemasukan</div>
          </div>
        </div>
      </div>

      <!-- Expense Categories -->
      <div class="card">
        <div class="card-header">
          <div class="card-title" style="color: var(--color-danger); display: flex; align-items: center; gap: 8px;"><TrendingDown class="icon-sm" /> Pengeluaran</div>
          <span class="badge badge-danger">{{ expenseCategories.length }} kategori</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div v-for="cat in expenseCategories" :key="cat.id" class="category-item">
            <div class="category-icon-box" :style="{ background: cat.color + '22', color: cat.color }"><Icon :name="cat.icon" /></div>
            <div style="flex: 1;">
              <div style="font-size: 0.9rem; font-weight: 600;">{{ cat.name }}</div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted);">
                {{ getTxnCount(cat.id) }} transaksi · {{ formatCurrency(getTxnTotal(cat.id)) }}
              </div>
            </div>
            <span class="color-dot" :style="{ background: cat.color }"></span>
            <button class="btn btn-ghost btn-icon btn-sm" @click="openEditModal(cat)"><Edit2 class="icon-sm" /></button>
            <button class="btn btn-ghost btn-icon btn-sm" style="color: var(--color-danger);" @click="openDeleteConfirm(cat)"><Trash2 class="icon-sm" /></button>
          </div>
          <div v-if="expenseCategories.length === 0" class="empty-state" style="padding: 20px;">
            <div style="font-size: 0.85rem; color: var(--color-text-dim);">Belum ada kategori pengeluaran</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Modal v-model="showModal" :title="editingCat ? 'Edit Kategori' : 'Tambah Kategori'">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Jenis</label>
          <div class="type-toggle">
            <button type="button" class="type-toggle-btn" :class="{ 'active-income': form.type === 'income' }" @click="form.type = 'income'"><TrendingUp class="icon-sm" style="display:inline-block; vertical-align:middle; margin-right:4px;" /> Pemasukan</button>
            <button type="button" class="type-toggle-btn" :class="{ 'active-expense': form.type === 'expense' }" @click="form.type = 'expense'"><TrendingDown class="icon-sm" style="display:inline-block; vertical-align:middle; margin-right:4px;" /> Pengeluaran</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Nama Kategori</label>
          <input id="cat-name" v-model="form.name" type="text" class="form-input" placeholder="Nama kategori..." required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Icon</label>
            <div style="display: flex; gap: 8px; align-items: center;">
              <div style="width: 42px; height: 42px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--color-surface-2); border: 1px solid var(--color-border);">
                <Icon :name="form.icon" />
              </div>
              <select id="cat-icon" v-model="form.icon" class="form-select" style="flex: 1;">
                <option v-for="ic in iconOptions" :key="ic.value" :value="ic.value">{{ ic.label }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Warna</label>
            <input id="cat-color" v-model="form.color" type="color" class="form-input" style="height: 42px; cursor: pointer;" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showModal = false">Batal</button>
        <button id="cat-save" class="btn btn-primary" @click="saveCategory">{{ editingCat ? 'Simpan' : 'Tambah' }}</button>
      </div>
    </Modal>

    <ConfirmDialog v-model="showDeleteConfirm" title="Hapus Kategori?" :message="`Hapus kategori &quot;${deletingCat?.name}&quot;? Transaksi dengan kategori ini akan kehilangan kategorinya.`" icon="Trash2" confirm-text="Ya, Hapus" @confirm="confirmDelete" />
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import Modal from '../components/common/Modal.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import Icon from '../components/common/Icon.vue'
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-vue-next'
import { getCategories, addCategory, updateCategory, deleteCategory } from '../stores/categories.js'
import { getTransactions } from '../stores/transactions.js'
import { formatCurrency } from '../utils/formatters.js'

const toast = inject('toast')
const categories = computed(() => getCategories())
const transactions = computed(() => getTransactions())
const incomeCategories = computed(() => categories.value.filter(c => c.type === 'income'))
const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'))

function getTxnCount(catId) { return transactions.value.filter(t => t.categoryId === catId).length }
function getTxnTotal(catId) { return transactions.value.filter(t => t.categoryId === catId).reduce((s, t) => s + t.amount, 0) }

const iconOptions = [
  { value: 'Banknote', label: 'Uang' },
  { value: 'CreditCard', label: 'Kartu Kredit' },
  { value: 'ShoppingCart', label: 'Belanja' },
  { value: 'Coffee', label: 'Konsumsi' },
  { value: 'Car', label: 'Transportasi' },
  { value: 'Heart', label: 'Kesehatan' },
  { value: 'Monitor', label: 'Elektronik' },
  { value: 'Gift', label: 'Hadiah' },
  { value: 'Home', label: 'Rumah' },
  { value: 'Zap', label: 'Listrik' },
  { value: 'Droplets', label: 'Air' },
  { value: 'Smartphone', label: 'Pulsa/Internet' },
  { value: 'Activity', label: 'Olahraga' },
  { value: 'GraduationCap', label: 'Pendidikan' },
  { value: 'Briefcase', label: 'Pekerjaan' },
  { value: 'PenTool', label: 'Alat Tulis' },
  { value: 'Trash', label: 'Kebersihan' },
  { value: 'Users', label: 'Sosial' },
  { value: 'PlusCircle', label: 'Lainnya (Masuk)' },
  { value: 'MinusCircle', label: 'Lainnya (Keluar)' },
]

const showModal = ref(false)
const editingCat = ref(null)
const defaultForm = () => ({ name: '', type: 'income', icon: 'Banknote', color: '#10b981' })
const form = ref(defaultForm())

function openAddModal() { form.value = defaultForm(); editingCat.value = null; showModal.value = true }
function openEditModal(cat) {
  editingCat.value = cat
  form.value = { name: cat.name, type: cat.type, icon: cat.icon, color: cat.color }
  showModal.value = true
}
function saveCategory() {
  if (!form.value.name) { toast({ type: 'warning', title: 'Nama kategori wajib diisi' }); return }
  if (editingCat.value) {
    updateCategory(editingCat.value.id, form.value)
    toast({ type: 'success', title: 'Kategori diperbarui' })
  } else {
    addCategory(form.value)
    toast({ type: 'success', title: 'Kategori ditambahkan' })
  }
  showModal.value = false
}

const showDeleteConfirm = ref(false)
const deletingCat = ref(null)
function openDeleteConfirm(cat) { deletingCat.value = cat; showDeleteConfirm.value = true }
function confirmDelete() { deleteCategory(deletingCat.value.id); toast({ type: 'success', title: 'Kategori dihapus' }) }
</script>
