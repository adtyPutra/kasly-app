<template>
  <div class="slide-up">
    <div class="page-header">
      <div>
        <div class="page-title">Notifikasi</div>
        <div class="page-subtitle">{{ unreadCount }} belum dibaca</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost" @click="markAll" v-if="unreadCount > 0"><CheckCheck class="icon-sm" style="margin-right:4px;" /> Tandai Semua Dibaca</button>
        <button class="btn btn-ghost" @click="clearAll" style="color: var(--color-danger);"><Trash2 class="icon-sm" style="margin-right:4px;" /> Hapus Semua</button>
      </div>
    </div>

    <div v-if="notifications.length === 0" class="card">
      <div class="empty-state" style="padding: 60px;">
        <Bell class="empty-state-icon" style="width:48px;height:48px;" />
        <div class="empty-state-title">Tidak ada notifikasi</div>
        <div class="empty-state-text">Semua notifikasi reminder hutang/piutang akan muncul di sini</div>
      </div>
    </div>

    <div v-else style="display: flex; flex-direction: column; gap: 8px;">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="notif-item"
        :class="[`type-${notif.type}`, { unread: !notif.read }]"
        @click="readNotif(notif)"
      >
        <div class="notif-icon" :style="{ background: getNotifBg(notif.type), color: getNotifColor(notif.type) }">
          <AlertCircle v-if="notif.type === 'danger'" class="icon-sm" />
          <AlertTriangle v-else-if="notif.type === 'warning'" class="icon-sm" />
          <Info v-else-if="notif.type === 'info'" class="icon-sm" />
          <CheckCircle v-else-if="notif.type === 'success'" class="icon-sm" />
          <Bell v-else class="icon-sm" />
        </div>
        <div class="notif-content">
          <div class="notif-title">{{ notif.title }}</div>
          <div class="notif-message">{{ notif.message }}</div>
          <div class="notif-time">{{ formatDate(notif.createdAt) }}</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;">
          <span v-if="!notif.read" class="badge badge-primary" style="font-size: 0.65rem;">Baru</span>
          <button class="btn btn-ghost btn-icon btn-sm" @click.stop="deleteNotif(notif.id)" title="Hapus"><X class="icon-sm" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { CheckCheck, Trash2, Bell, AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-vue-next'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '../stores/notifications.js'
import { storage } from '../utils/storage.js'
import { formatDate } from '../utils/formatters.js'

const toast = inject('toast')
const notifications = computed(() => getNotifications())
const unreadCount = computed(() => getUnreadCount())

function getNotifColor(type) {
  return { danger: 'var(--color-danger)', warning: 'var(--color-warning)', info: 'var(--color-primary-light)', success: 'var(--color-success)' }[type] || 'var(--color-primary-light)'
}
function getNotifBg(type) {
  return { danger: 'rgba(239,68,68,0.15)', warning: 'rgba(245,158,11,0.15)', info: 'rgba(99,102,241,0.15)', success: 'rgba(16,185,129,0.15)' }[type] || 'rgba(99,102,241,0.15)'
}

function readNotif(notif) {
  if (!notif.read) markAsRead(notif.id)
}
function deleteNotif(id) {
  deleteNotification(id)
}
function markAll() {
  markAllAsRead()
  toast({ type: 'success', title: 'Semua notifikasi ditandai dibaca' })
}
function clearAll() {
  storage.set('kasly_notifications', [])
  toast({ type: 'success', title: 'Semua notifikasi dihapus' })
}
</script>
