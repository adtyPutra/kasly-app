<template>
  <RouterView v-if="route.meta.public" />
  <template v-else>
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>
    <Sidebar :sidebar-open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="app-main">
      <Topbar :title="pageTitle" :subtitle="pageSubtitle" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="app-content">
        <RouterView />
      </div>
    </div>
  </template>
  <Toast ref="toastRef" />
</template>

<script setup>
import { ref, computed, provide, onMounted, watch } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import Sidebar from './components/common/Sidebar.vue'
import Topbar from './components/common/Topbar.vue'
import Toast from './components/common/Toast.vue'
import { getCurrentUser } from './stores/auth.js'
import { fetchAnggota } from './stores/anggota.js'
import { fetchPeriode } from './stores/periodeKas.js'
import { fetchPembayaran } from './stores/pembayaranKas.js'
import { fetchPenarikan } from './stores/penarikanDana.js'
import { fetchPengeluaran, fetchKategori } from './stores/pengeluaranKelas.js'
import { fetchKegiatan } from './stores/kegiatan.js'

const route = useRoute()
const sidebarOpen = ref(false)
const toastRef = ref(null)

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Ringkasan keuangan kas' },
  '/kas': { title: 'Pembayaran Kas', subtitle: 'Pantau status pembayaran kas' },
  '/keuangan': { title: 'Keuangan', subtitle: 'Kelola penarikan dan pengeluaran' },
  '/activities': { title: 'Kegiatan Kelas', subtitle: 'Kelola dana kegiatan kelas' },
  '/reports': { title: 'Laporan', subtitle: 'Ringkasan laporan keuangan' },
  '/members': { title: 'Data Anggota', subtitle: 'Kelola data anggota kelas' },
  '/users': { title: 'Manajemen Akun', subtitle: 'Kelola akun bendahara & admin' },
}

const pageTitle = computed(() => pageTitles[route.path]?.title || 'Kasly')
const pageSubtitle = computed(() => pageTitles[route.path]?.subtitle || '')

watch(() => route.path, () => {
  sidebarOpen.value = false
})

function showToast(options) {
  toastRef.value?.add(options)
}

provide('toast', showToast)

async function loadGlobalData() {
  const user = getCurrentUser()
  if (user) {
    await Promise.all([
      fetchAnggota(),
      fetchPeriode(),
      fetchPembayaran(),
      fetchPenarikan(),
      fetchPengeluaran(),
      fetchKategori(),
      fetchKegiatan()
    ])
  }
}

onMounted(() => {
  loadGlobalData()
})

watch(() => getCurrentUser(), (newUser, oldUser) => {
  if (newUser && !oldUser) {
    loadGlobalData()
  }
})
</script>
