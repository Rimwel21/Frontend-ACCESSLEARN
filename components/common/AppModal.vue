<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="$emit('update:modelValue', false)">
        <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-display font-bold text-lg">{{ title }}</h3>
            <button @click="$emit('update:modelValue', false)" class="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-ink-soft hover:text-ink transition-all text-lg">×</button>
          </div>
          <div class="px-6 py-5 max-h-[60vh] overflow-y-auto scrollbar-thin">
            <slot />
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button @click="$emit('update:modelValue', false)" class="btn-secondary">Cancel</button>
            <button @click="$emit('confirm')" class="btn-primary">{{ confirmLabel ?? 'Save' }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; title: string; confirmLabel?: string }>()
defineEmits<{ 'update:modelValue': [val: boolean]; confirm: [] }>()
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform .2s, opacity .2s; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .relative { transform: scale(.95); opacity: 0; }
.modal-leave-to { opacity: 0; }
</style>
