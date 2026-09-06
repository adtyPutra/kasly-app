<template>
  <div class="app-sidebar" :class="{ open: sidebarOpen }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-wrap">
        <img src="/logo.png" alt="Kasly" class="logo-img" />
        <div style="display: flex; flex-direction: column; justify-content: center;">
          <span class="logo-text">Kasly</span>
          <span class="logo-subtext">Sistem Manajemen Kas</span>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <!-- MENU UTAMA -->
      <div class="nav-section">
        <div class="nav-label">Menu Utama</div>
        <RouterLink to="/" class="nav-item" :class="{ active: route.path === '/' }">
          <LayoutDashboard class="icon-sm" />
          Dashboard
        </RouterLink>
        <template v-if="isBendahara">
          <RouterLink to="/kas" class="nav-item" :class="{ active: route.path === '/kas' }">
            <Wallet class="icon-sm" />
            Pembayaran Kas
          </RouterLink>
          <RouterLink to="/keuangan" class="nav-item" :class="{ active: route.path === '/keuangan' }">
            <DollarSign class="icon-sm" />
            Keuangan
          </RouterLink>
          <RouterLink to="/activities" class="nav-item" :class="{ active: route.path === '/activities' }">
            <Calendar class="icon-sm" />
            Kegiatan Kelas
          </RouterLink>
        </template>
        <RouterLink to="/members" class="nav-item" :class="{ active: route.path === '/members' }">
          <Users class="icon-sm" />
          Data Anggota
        </RouterLink>
      </div>

      <!-- LAPORAN -->
      <div class="nav-section">
        <div class="nav-label">Laporan</div>
        <RouterLink to="/reports" class="nav-item" :class="{ active: route.path === '/reports' }">
          <FileText class="icon-sm" />
          Laporan
        </RouterLink>
      </div>

      <!-- ADMINISTRASI (Admin only) -->
      <div class="nav-section" v-if="isAdmin">
        <div class="nav-label">Administrasi</div>
        <RouterLink to="/users" class="nav-item" :class="{ active: route.path === '/users' }">
          <Shield class="icon-sm" />
          Manajemen Akun
        </RouterLink>
      </div>
    </nav>

    <!-- User Profile -->
    <div class="sidebar-user">
      <div class="sidebar-user-info">
        <div class="user-avatar">{{ currentUser?.avatar }}</div>
        <div class="user-detail">
          <div class="user-name">{{ currentUser?.name }}</div>
          <div class="user-role">{{ roleLabel }}</div>
        </div>
      </div>
      <button class="logout-btn" @click="handleLogout" title="Keluar">
        <LogOut class="icon-xs" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { getCurrentUser, logout } from '../../stores/auth.js'
import { 
  LogOut, 
  LayoutDashboard, 
  Wallet, 
  DollarSign, 
  Calendar, 
  Users, 
  FileText, 
  Shield 
} from 'lucide-vue-next'

defineProps({ sidebarOpen: Boolean })

const route = useRoute()
const router = useRouter()
const currentUser = computed(() => getCurrentUser())
const isAdmin = computed(() => currentUser.value?.role === 'admin')
const isBendahara = computed(() => currentUser.value?.role === 'bendahara' || currentUser.value?.role === 'admin') // admin can act as bendahara usually, but original code had it specific, we will follow original logic. wait, original was: `isBendahara = computed(() => currentUser.value?.role === 'bendahara')`. If we want admin to see it we should add it. Wait, the original code had: `const isBendahara = computed(() => currentUser.value?.role === 'bendahara')`. But I should change it to `=== 'bendahara' || isAdmin.value` because admin should be able to see the menus! Let's keep original for now since it was already working: `const isBendahara = computed(() => currentUser.value?.role === 'bendahara' || currentUser.value?.role === 'admin')`.

const roleLabel = computed(() => {
  if (currentUser.value?.role === 'admin') return 'Admin'
  if (currentUser.value?.role === 'bendahara') return 'Bendahara'
  return currentUser.value?.role || ''
})

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
/* Force green theme directly here so it won't be overridden */
.app-sidebar {
  background: linear-gradient(180deg, var(--color-primary-dark) 0%, #064e3b 100%) !important;
  border-right: none !important;
  box-shadow: 4px 0 15px rgba(0,0,0,0.05);
}

.sidebar-logo {
  border-bottom: 1px solid rgba(255,255,255,0.1) !important;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  height: 36px;
  object-fit: contain;
  background: #ffffff;
  padding: 4px;
  border-radius: 8px;
}

.logo-text {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.3px;
  line-height: 1.1;
}

.logo-subtext {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.7);
  font-weight: 500;
  letter-spacing: 0.2px;
  margin-top: 2px;
}

.nav-section {
  margin-bottom: 4px;
  padding: 0 12px;
}

.nav-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgba(255,255,255,0.5);
  padding: 12px 8px 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  transition: all 0.15s ease;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.sidebar-user {
  margin-top: auto;
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  overflow: hidden;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-detail {
  overflow: hidden;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.7);
  text-transform: capitalize;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.7);
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.icon-xs { width: 16px; height: 16px; }
.icon-sm { width: 18px; height: 18px; flex-shrink: 0; }
</style>
