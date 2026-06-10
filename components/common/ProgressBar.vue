<template>
  <div class="flex items-center gap-2.5">
    <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        :class="['h-full rounded-full transition-all duration-700', gradientClass]"
        :style="{ width: `${percent}%` }"
      />
    </div>
    <span v-if="showLabel" class="font-mono text-[11px] text-ink-soft min-w-[36px] text-right">{{ percent }}%</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  percent: number
  gradientClass?: string
  showLabel?: boolean
}>(), {
  gradientClass: 'bg-gradient-to-r from-brand-blue to-brand-violet',
  showLabel: true,
})
</script>
