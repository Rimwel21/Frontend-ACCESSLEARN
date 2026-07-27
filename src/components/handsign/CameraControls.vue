<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      type="button"
      class="border-[3px] border-brand-teal bg-brand-blue px-4 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
     
      :disabled="isRunning"
      @click="$emit('start')"
    >
      Start
    </button>
    <button
      type="button"
      class="border-[3px] border-brand-teal bg-white px-4 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-50"
     
      :disabled="!isRunning"
      @click="$emit('stop')"
    >
      Stop
    </button>
    <button
      type="button"
      class="border-[3px] border-brand-teal bg-white px-4 py-2 text-xs font-black"
     
      @click="$emit('backspace')"
    >
      Backspace
    </button>
    <button
      type="button"
      class="border-[3px] border-brand-teal bg-white px-4 py-2 text-xs font-black"
     
      @click="$emit('reset')"
    >
      Clear
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ isRunning: boolean }>()

defineEmits<{
  start: []
  stop: []
  reset: []
  backspace: []
}>()
</script>
