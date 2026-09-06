<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type}`"
        >
          <span class="toast-icon" style="display:flex;align-items:center;justify-content:center;"><Icon :name="icons[toast.type]" class="icon-sm" /></span>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" @click="remove(toast.id)"><X class="icon-xs" /></button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
import { X } from 'lucide-vue-next'

const toasts = ref([])
let counter = 0

const icons = { success: 'CheckCircle', danger: 'XCircle', warning: 'AlertTriangle', info: 'Info' }

function add({ type = 'info', title, message, duration = 3500 }) {
  const id = ++counter
  toasts.value.push({ id, type, title, message })
  setTimeout(() => remove(id), duration)
}

function remove(id) {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
}

defineExpose({ add })
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-enter-from { opacity: 0; transform: translateY(-30px); }
.toast-leave-to { opacity: 0; transform: translateY(-30px); }
</style>
