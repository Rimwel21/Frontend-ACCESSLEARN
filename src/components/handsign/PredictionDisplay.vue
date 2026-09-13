<template>
  <section class="border-[3px] border-brand-teal bg-white p-4">
    <div class="flex items-center justify-between gap-3 border-b-[3px] border-brand-teal pb-3">
      <h2 class="font-display text-sm font-black uppercase tracking-widest">Answer</h2>
      <ConfidenceBadge
        v-if="detection?.detected"
        :prediction="detection.prediction"
        :confidence="detection.confidence"
        :threshold-met="detection.threshold_met"
      />
    </div>

    <div class="mt-4 min-h-[132px] border-[3px] border-brand-teal bg-surface p-4">
      <div class="break-words font-display text-3xl font-black leading-tight">{{ answer || '...' }}</div>
      <div class="mt-3 font-mono text-[10px] font-bold uppercase tracking-wide text-gray-500">
        {{ detectionStatus }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConfidenceBadge from '@/components/handsign/ConfidenceBadge.vue'
import type { CameraDetectionResponse } from '@/types/handsign'

const props = defineProps<{
  answer: string
  detection: CameraDetectionResponse | null
}>()

const detectionStatus = computed(() => props.detection?.detected
  ? props.detection.confirmation_status
  : 'Waiting for a hand sign')
</script>
