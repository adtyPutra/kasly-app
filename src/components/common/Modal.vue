<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
        <div class="modal" :class="[`modal-${size}`]">
          <div class="modal-header">
            <div class="modal-title">{{ title }}</div>
            <button class="modal-close" @click="$emit('update:modelValue', false)">
              <X class="icon-sm" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  modelValue: Boolean,
  title: { type: String, default: '' },
  size: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-enter-from .modal { transform: scale(0.9) translateY(10px); }
.modal-leave-to .modal { transform: scale(0.95) translateY(5px); }
</style>
