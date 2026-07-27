<template>
  <div class="p-8">
    <RouterLink to="/student/dashboard" class="inline-block mb-4 px-4 py-2 border-[3px] border-brand-teal font-black text-xs hover:bg-brand-amber transition-colors">&lt;- Go Back</RouterLink>
    <h1 class="font-display font-black text-2xl">Quiz Page</h1>
    <p class="text-gray-500 mt-2">Quiz content goes here.</p>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
