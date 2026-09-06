<template>
  <component :is="lucideComponent" :class="iconClass" />
</template>

<script setup>
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

const props = defineProps({
  name: { type: String, required: true },
  iconClass: { type: String, default: 'icon-sm' }
})

// Emoji to Lucide Icon mapping for backward compatibility
const emojiMap = {
  '🏦': 'Landmark', '💰': 'Banknote', '📦': 'Package', '🎒': 'Backpack',
  '⚽': 'Activity', '🎓': 'GraduationCap', '🏫': 'School', '🎪': 'Tent',
  '📚': 'Book', '🧾': 'Receipt', '🎁': 'Gift', '➕': 'PlusCircle',
  '✏️': 'PenTool', '🍱': 'Coffee', '🧹': 'Trash', '🤝': 'Users',
  '➖': 'MinusCircle', '🔄': 'ArrowLeftRight'
}

const lucideComponent = computed(() => {
  // If the name is an emoji, map it
  let iconName = emojiMap[props.name] || props.name
  // If no mapping and it's not a valid Lucide component, fallback to Circle
  return LucideIcons[iconName] || LucideIcons['Circle']
})
</script>

<style scoped>
.icon-sm { width: 18px; height: 18px; }
.icon-md { width: 24px; height: 24px; }
.icon-lg { width: 32px; height: 32px; }
</style>
