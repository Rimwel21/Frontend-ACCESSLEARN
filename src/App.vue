<template>
  <RouterView />
  <OfflineStatus />
  <AppInstallPrompt />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import OfflineStatus from '@/components/pwa/OfflineStatus.vue'
import AppInstallPrompt from '@/components/pwa/AppInstallPrompt.vue'
</script>
