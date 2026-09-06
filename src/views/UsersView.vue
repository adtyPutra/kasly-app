<template>
  <div class="slide-up">
    <div class="page-header">
      <div>
        <div class="page-title">Manajemen User</div>
        <div class="page-subtitle">{{ users.length }} akun terdaftar</div>
      </div>
      <div class="page-actions">
        <button id="btn-add-user" class="btn btn-primary" @click="openAddModal">
          <Plus class="icon-sm" />
          Tambah User
        </button>
      </div>
    </div>

    <!-- User Cards -->
    <div class="grid-auto">
      <div v-for="user in users" :key="user.id" class="user-card" style="flex-direction: column; align-items: flex-start; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 14px; width: 100%;">
          <div class="avatar" style="width: 48px; height: 48px; font-size: 1rem;">{{ user.avatar }}</div>
          <div class="user-card-info">
            <div class="user-card-name">{{ user.name }}</div>
            <div class="user-card-username">@{{ user.username }}</div>
          </div>
          <div class="user-card-actions">
            <button class="btn btn-ghost btn-icon btn-sm" @click="openEditModal(user)" title="Edit"><Edit2 class="icon-sm" /></button>
            <button class="btn btn-ghost btn-icon btn-sm" @click="openDeleteConfirm(user)" title="Hapus" :disabled="user.id === currentUser?.id"><Trash2 class="icon-sm" :style="{ color: user.id === currentUser?.id ? 'var(--color-text-dim)' : 'var(--color-danger)' }" /></button>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge" :class="user.role === 'admin' ? 'badge-primary' : 'badge-neutral'">
            <Shield v-if="user.role === 'admin'" class="icon-xs" style="margin-right:4px;" />
            <User v-else class="icon-xs" style="margin-right:4px;" />
            {{ user.role === 'admin' ? 'Admin' : 'Bendahara' }}
          </span>
          <span v-if="user.id === currentUser?.id" class="badge badge-success">Anda</span>
        </div>
      </div>
    </div>

    <!-- Info Card -->
    <div class="card" style="margin-top: 20px; border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.05);">
      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <Info style="width: 24px; height: 24px; color: var(--color-primary-light);" />
        <div>
          <div style="font-weight: 600; margin-bottom: 4px; font-size: 0.9rem;">Informasi Akses</div>
          <div style="font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.8;">
            <strong style="color: var(--color-primary-light);">Admin:</strong> Dapat melihat semua data, menambah/hapus user, dan mengakses seluruh fitur.<br>
            <strong style="color: var(--color-text);">Bendahara:</strong> Dapat mencatat transaksi, melihat laporan, dan mengelola hutang/piutang.
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Modal v-model="showModal" :title="editingUser ? 'Edit User' : 'Tambah User Baru'">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Nama Lengkap</label>
          <input id="user-name" v-model="form.name" type="text" class="form-input" placeholder="Nama lengkap..." required />
        </div>
        <div class="form-group">
          <label class="form-label">Username</label>
          <input id="user-username" v-model="form.username" type="text" class="form-input" placeholder="username..." :disabled="!!editingUser" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password {{ editingUser ? '(kosongkan jika tidak diubah)' : '' }}</label>
          <div style="position: relative;">
            <input
              id="user-password"
              v-model="form.password"
              :type="showPw ? 'text' : 'password'"
              class="form-input"
              placeholder="Password..."
              :required="!editingUser"
              style="padding-right: 44px;"
            />
            <button type="button" @click="showPw = !showPw" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--color-text-muted);cursor:pointer; display:flex; align-items:center; justify-content:center; padding:4px;">
              <EyeOff v-if="showPw" class="icon-sm" />
              <Eye v-else class="icon-sm" />
            </button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Role</label>
          <div class="type-toggle">
            <button type="button" class="type-toggle-btn" :class="{ 'active-income': form.role === 'bendahara' }" @click="form.role = 'bendahara'"><User class="icon-sm" style="margin-right:4px;" /> Bendahara</button>
            <button type="button" class="type-toggle-btn" :class="{ 'active-expense': form.role === 'admin' }" @click="form.role = 'admin'"><Shield class="icon-sm" style="margin-right:4px;" /> Admin</button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showModal = false">Batal</button>
        <button id="user-save" class="btn btn-primary" @click="saveUser">{{ editingUser ? 'Simpan' : 'Tambah User' }}</button>
      </div>
    </Modal>

    <ConfirmDialog v-model="showDeleteConfirm" title="Hapus User?" :message="`Hapus akun &quot;${deletingUser?.name}&quot; (@${deletingUser?.username})?`" icon="Trash2" confirm-text="Ya, Hapus" @confirm="confirmDelete" />
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import Modal from '../components/common/Modal.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import { Plus, Edit2, Trash2, Shield, User, Info, Eye, EyeOff } from 'lucide-vue-next'
import { getUsers, addUser, updateUser, deleteUser, getCurrentUser } from '../stores/auth.js'

const toast = inject('toast')
const currentUser = computed(() => getCurrentUser())

const users = ref([])

async function loadUsers() {
  const data = await getUsers()
  // Data dari Supabase profiles table, let's map it so the template works
  // Table profiles has: id, nama, role, created_at. (username is not stored in profiles by default, but we can fake it or use email)
  users.value = data.map(u => ({
    id: u.id,
    name: u.nama,
    username: u.nama.toLowerCase().replace(/\s+/g, ''),
    role: u.role,
    avatar: u.nama.slice(0, 2).toUpperCase()
  }))
}

onMounted(() => {
  loadUsers()
})

const showModal = ref(false)
const editingUser = ref(null)
const showPw = ref(false)
const defaultForm = () => ({ name: '', username: '', password: '', role: 'bendahara' })
const form = ref(defaultForm())

function openAddModal() { form.value = defaultForm(); editingUser.value = null; showPw.value = false; showModal.value = true }

function openEditModal(user) {
  editingUser.value = user
  form.value = { name: user.name, username: user.username, password: '', role: user.role }
  showPw.value = false; showModal.value = true
}

async function saveUser() {
  if (!form.value.name || !form.value.username || (!editingUser.value && !form.value.password)) {
    toast({ type: 'warning', title: 'Lengkapi semua field wajib' }); return
  }
  
  if (editingUser.value) {
    const updateData = { nama: form.value.name, role: form.value.role }
    const res = await updateUser(editingUser.value.id, updateData)
    if (res.success) {
      toast({ type: 'success', title: 'User diperbarui' })
      loadUsers()
    } else {
      toast({ type: 'error', title: 'Gagal', message: res.message })
    }
  } else {
    // For now add user is disabled in auth.js as it requires service_role or backend. 
    const res = await addUser(form.value)
    if (res.success) {
      toast({ type: 'success', title: 'User ditambahkan' })
      loadUsers()
    } else {
      toast({ type: 'error', title: 'Gagal', message: res.message })
    }
  }
  showModal.value = false
}

const showDeleteConfirm = ref(false)
const deletingUser = ref(null)

function openDeleteConfirm(user) {
  if (user.id === currentUser.value?.id) { toast({ type: 'warning', title: 'Tidak bisa hapus akun sendiri' }); return }
  deletingUser.value = user; showDeleteConfirm.value = true
}

async function confirmDelete() { 
  const res = await deleteUser(deletingUser.value.id); 
  if (res.success) {
    toast({ type: 'success', title: 'User berhasil dihapus' })
    loadUsers()
  } else {
    toast({ type: 'error', title: 'Gagal', message: res.message })
  }
}
</script>
