<template>
  <section class="border-[3px] border-brand-teal bg-white p-4 shadow-[0_10px_28px_rgba(20,184,166,0.08)]">
    <div class="flex items-center justify-between gap-3 border-b-[3px] border-brand-teal pb-3">
      <h2 class="font-display text-sm font-black uppercase tracking-widest">Answer</h2>
      <ConfidenceBadge
        v-if="detection?.detected"
        :prediction="detection.prediction"
        :confidence="detection.confidence"
        :threshold-met="detection.threshold_met"
      />
    </div>

    <textarea
      v-if="!signMode"
      v-model="textAnswer"
      rows="5"
      class="mt-4 w-full resize-none border-[3px] border-brand-teal bg-white p-3 text-sm font-bold outline-none focus:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
      placeholder="Type your answer"
      :disabled="disabled"
    />
    <div v-else class="mt-4 min-h-[150px] border-[3px] border-brand-teal bg-surface p-5">
      <div class="break-words font-display text-3xl font-black leading-tight text-brand-blue">{{ answer || '...' }}</div>
      <div class="mt-3 font-mono text-[10px] font-bold uppercase tracking-wide text-gray-500">
        {{ detectionStatus }}
      </div>
      <p v-if="!detection?.detected" class="mt-2 text-sm font-bold text-brand-blue/80">
        Show your sign in front of the camera...
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConfidenceBadge from '@/components/handsign/ConfidenceBadge.vue'
import type { CameraDetectionResponse } from '@/types/handsign'

const props = defineProps<{
  signMode: boolean
  answer: string
  detection: CameraDetectionResponse | null
  disabled?: boolean
}>()

const textAnswer = defineModel<string>('textAnswer', { required: true })

const detectionStatus = computed(() => props.detection?.detected
  ? props.detection.confirmation_status
  : 'Waiting for a hand sign')
</script>
