<template>
  <label
    :class="[
      'flex items-center justify-between gap-4 border-[3px] border-brand-teal bg-white p-5 shadow-[0_10px_28px_rgba(20,184,166,0.08)]',
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
    ]"
   
  >
    <span>
      <span class="block font-display text-lg font-black text-brand-blue">Sign Language Mode</span>
      <span class="mt-1 block font-mono text-[10px] font-bold uppercase tracking-wide text-gray-500">{{ modeLabel }}</span>
      <span class="mt-1 block text-sm font-bold text-ink-soft">{{ helperLabel }}</span>
    </span>
    <input v-model="enabled" type="checkbox" class="sr-only" :disabled="disabled" />
    <span
      :class="[
        'relative h-9 w-[86px] flex-shrink-0 rounded-full border-[3px] border-brand-teal transition-colors',
        enabled ? 'bg-brand-amber' : 'bg-gray-200',
      ]"
      aria-hidden="true"
    >
      <span
        v-if="enabled"
        class="absolute left-4 top-1.5 text-xs font-black text-white"
      >
        On
      </span>
      <span
        :class="[
          'absolute top-1 h-5 w-5 rounded-full border-[2px] border-brand-teal bg-white transition-transform',
          enabled ? 'translate-x-[53px]' : 'translate-x-1',
        ]"
      />
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false,
})

const enabled = defineModel<boolean>({ required: true })

const modeLabel = computed(() => enabled.value ? 'Camera answers enabled' : 'Text answers only')
const helperLabel = computed(() => enabled.value
  ? 'Use your camera to show hand signs as your answer.'
  : 'Use the text answer box to submit your response.'
)
</script>
