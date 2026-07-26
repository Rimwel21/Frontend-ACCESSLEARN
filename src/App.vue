<template>
  <RouterView />
  <OfflineStatus />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import OfflineStatus from '@/components/pwa/OfflineStatus.vue'
</script>
