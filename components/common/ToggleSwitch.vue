<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
    :class="['toggle transition-colors', modelValue ? 'bg-brand-blue' : 'bg-gray-300']"
  >
    <span :class="['toggle-thumb', modelValue ? 'translate-x-5' : 'translate-x-0']" />
  </button>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [val: boolean] }>()
</script>
