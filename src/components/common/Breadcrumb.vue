<template>
  <nav class="flex items-center gap-1.5 text-xs font-mono mb-1">
    <template v-for="(crumb, i) in crumbs" :key="i">
      <span
        v-if="crumb.to"
        @click="router.push(crumb.to)"
        class="text-ink-soft hover:text-brand-blue cursor-pointer transition-colors"
      >{{ crumb.label }}</span>
      <span v-else class="text-ink font-semibold">{{ crumb.label }}</span>
      <span v-if="i < crumbs.length - 1" class="text-gray-300">›</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
defineProps<{ crumbs: { label: string; to?: string }[] }>()
</script>
