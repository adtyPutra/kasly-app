<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
        <div class="confirm-dialog">
          <div class="confirm-dialog-icon"><Icon :name="icon" class="icon-lg" /></div>
          <div class="confirm-dialog-title" :class="titleClass">{{ title }}</div>
          <div class="confirm-dialog-text">{{ message }}</div>
          <div class="confirm-dialog-actions">
            <button class="btn btn-ghost" @click="$emit('update:modelValue', false)">Batal</button>
            <button class="btn" :class="confirmClass" @click="onConfirm">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: 'Apakah kamu yakin?' },
  icon: { type: String, default: 'HelpCircle' },
  confirmText: { type: String, default: 'Ya, Lanjutkan' },
  confirmClass: { type: String, default: 'btn-danger' },
  titleClass: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

function onConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
