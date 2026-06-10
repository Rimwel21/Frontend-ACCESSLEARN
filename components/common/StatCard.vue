<template>
  <div class="card-hover p-5 relative overflow-hidden">
    <!-- Accent blob -->
    <div :class="`absolute w-20 h-20 rounded-full -top-5 -right-5 opacity-10 ${blobColor}`" />

    <div :class="`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${iconBg}`">
      {{ icon }}
    </div>
    <div class="font-display text-3xl font-bold leading-none mb-1">{{ value }}</div>
    <div class="text-[12.5px] text-ink-soft font-medium">{{ label }}</div>
    <div v-if="delta" :class="['text-[11px] font-mono mt-2', deltaUp ? 'text-brand-green' : 'text-brand-rose']">
      {{ deltaUp ? '↑' : '↓' }} {{ delta }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  value: string | number
  label: string
  delta?: string
  deltaUp?: boolean
  iconBg?: string
  blobColor?: string
}>()
</script>
