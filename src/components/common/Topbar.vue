<template>
  <div class="app-topbar">
    <div style="display: flex; align-items: center; gap: 12px;">
      <button class="mobile-menu-btn" @click="$emit('toggle-sidebar')">
        <MenuIcon class="icon-md" />
      </button>
      <div>
        <div class="topbar-title">{{ title }}</div>
        <div class="topbar-subtitle" v-if="subtitle">{{ subtitle }}</div>
      </div>
    </div>
    <div class="topbar-right">
      <RouterLink to="/notifications" class="notif-bell">
        <Bell class="icon-sm" />
        <span v-if="unreadCount > 0" class="badge-dot">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
      </RouterLink>
      <div class="avatar" :title="currentUser?.name">
        <Shield v-if="currentUser?.role === 'admin'" class="icon-sm" style="color: white;" />
        <User v-else class="icon-sm" style="color: white;" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getCurrentUser } from '../../stores/auth.js'
import { getUnreadCount } from '../../stores/notifications.js'
import { Bell, Shield, User, Menu as MenuIcon } from 'lucide-vue-next'

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})

defineEmits(['toggle-sidebar'])

const currentUser = computed(() => getCurrentUser())
const unreadCount = computed(() => getUnreadCount())
</script>

<style scoped>
.icon-sm { width: 18px; height: 18px; }
.icon-md { width: 24px; height: 24px; }
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--color-text);
  border-radius: 6px;
}
.mobile-menu-btn:hover {
  background: var(--color-surface-2);
}
@media (max-width: 768px) {
  .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
}
</style>
