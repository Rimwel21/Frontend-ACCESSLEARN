<template>
  <nav
    v-if="totalItems > pageSize"
    class="flex flex-col gap-3 border-t border-brand-teal/20 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    aria-label="Pagination"
  >
    <p class="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">
      Showing {{ startItem }}-{{ endItem }} of {{ totalItems }}
    </p>

    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="pagination-button"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
      >
        Previous
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        type="button"
        :class="[
          'pagination-button h-9 min-w-9 px-3',
          page === currentPage ? 'border-brand-blue bg-brand-blue text-white' : '',
        ]"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        class="pagination-button"
        :disabled="currentPage >= pageCount"
        @click="goToPage(currentPage + 1)"
      >
        Next
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalItems: number
  pageSize: number
  currentPage: number
}>()

const emit = defineEmits<{
  'update:currentPage': [value: number]
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)))
const startItem = computed(() => Math.min(props.totalItems, (props.currentPage - 1) * props.pageSize + 1))
const endItem = computed(() => Math.min(props.totalItems, props.currentPage * props.pageSize))
const visiblePages = computed(() => {
  const start = Math.max(1, props.currentPage - 1)
  const end = Math.min(pageCount.value, start + 2)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

function goToPage(page: number) {
  const nextPage = Math.min(Math.max(page, 1), pageCount.value)
  emit('update:currentPage', nextPage)
}
</script>

<style scoped>
.pagination-button {
  border: 2px solid rgb(143 211 199);
  background: white;
  color: rgb(25 100 92);
  font-weight: 800;
  min-height: 2.25rem;
  padding: 0.45rem 0.8rem;
  transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
}

.pagination-button:hover:not(:disabled) {
  border-color: rgb(250 157 83);
  transform: translateY(-1px);
}

.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
</style>
