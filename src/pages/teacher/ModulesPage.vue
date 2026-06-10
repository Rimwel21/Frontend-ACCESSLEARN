<template>
  <div class="space-y-5">
    <div class="flex items-end justify-between">
      <div>
        <Breadcrumb :crumbs="[{ label:'Class Management', to:'/teacher/class' }, { label:'Modules' }]" />
        <h2 class="font-display text-2xl font-bold">📖 Learning Materials</h2>
      </div>
      <RouterLink to="/teacher/modules/new" class="btn-primary">➕ Create Module</RouterLink>
    </div>

    <div class="gradient-brand rounded-xl px-6 py-3.5">
      <p class="text-white text-sm">Organize and manage all learning materials for your class</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-brand-blue-soft flex items-center justify-center text-xl">📘</div>
        <div><div class="font-display text-2xl font-bold">{{ store.modules.length }}</div><div class="text-xs text-ink-soft font-medium">Total Modules</div></div>
      </div>
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">✅</div>
        <div><div class="font-display text-2xl font-bold">{{ store.publishedModules.length }}</div><div class="text-xs text-ink-soft font-medium">Published</div></div>
      </div>
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-xl">📝</div>
        <div><div class="font-display text-2xl font-bold">{{ store.unpublishedModules.length }}</div><div class="text-xs text-ink-soft font-medium">Unpublished</div></div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 w-60 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <span class="text-sm">🔍</span>
        <input v-model="search" class="border-0 bg-transparent outline-none text-sm font-body flex-1" placeholder="Search Modules…" />
      </div>
      <div class="flex gap-2">
        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
          :class="['text-xs font-semibold px-4 py-2 rounded-full border transition-all',
            activeTab === tab.value ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-ink-soft border-gray-200 hover:border-brand-blue hover:text-brand-blue']">
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="table-th">Module</th>
            <th class="table-th">Description</th>
            <th class="table-th">Last Updated</th>
            <th class="table-th">Status</th>
            <th class="table-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in filteredModules" :key="m.id" class="hover:bg-gray-50 transition-colors">
            <td class="table-td font-medium">{{ m.title }}</td>
            <td class="table-td text-ink-soft max-w-xs truncate">{{ m.description }}</td>
            <td class="table-td font-mono text-xs">{{ m.lastUpdated }}</td>
            <td class="table-td">
              <span :class="m.status === 'Published' ? 'badge-green' : 'badge-amber'" class="badge">{{ m.status }}</span>
            </td>
            <td class="table-td">
              <div class="flex gap-2">
                <button @click="editTarget = m; showEdit = true" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-all">✏️ Edit</button>
                <button @click="store.deleteModule(m.id)" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-rose-400 hover:text-brand-rose transition-all">🗑</button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredModules.length === 0">
            <td colspan="5" class="table-td text-center text-ink-soft py-10">No modules found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <AppModal v-model="showEdit" title="✏️ Edit Module" confirm-label="Save Changes" @confirm="saveEdit">
      <div class="space-y-4" v-if="editTarget">
        <div><label class="block text-xs font-semibold text-ink-soft mb-1">Module Title</label><input v-model="editTarget.title" class="input-field" /></div>
        <div><label class="block text-xs font-semibold text-ink-soft mb-1">Description</label><textarea v-model="editTarget.description" rows="3" class="input-field resize-none" /></div>
        <div><label class="block text-xs font-semibold text-ink-soft mb-1">Status</label>
          <select v-model="editTarget.status" class="input-field">
            <option>Published</option><option>Unpublished</option>
          </select>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@/stores/app'
import type { Module } from '@/types'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import AppModal   from '@/components/common/AppModal.vue'

const store     = useAppStore()
const search    = ref('')
const activeTab = ref('')
const showEdit  = ref(false)
const editTarget = ref<Module | null>(null)

const tabs = [
  { label: 'All Modules', value: '' },
  { label: 'Published',   value: 'Published' },
  { label: 'Unpublished', value: 'Unpublished' },
]

const filteredModules = computed(() => store.modules.filter(m => {
  const matchSearch = !search.value || m.title.toLowerCase().includes(search.value.toLowerCase())
  const matchTab    = !activeTab.value || m.status === activeTab.value
  return matchSearch && matchTab
}))

function saveEdit() {
  if (editTarget.value) store.updateModule(editTarget.value.id, editTarget.value)
  showEdit.value = false
}
</script>
