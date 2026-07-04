<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-2">
      <h2 class="font-display text-2xl font-bold text-ink">Archive Vault</h2>
      <p class="text-sm text-ink-soft">Restore or permanently purge historical records. Records here do not appear in active modules.</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 border-b border-gray-100">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['px-6 py-3 text-sm font-bold transition-all border-b-2', activeTab === tab.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-ink-soft hover:text-ink']"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="flex items-center justify-between">
       <div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
           <span class="text-sm grayscale opacity-50">🔍</span>
           <input v-model="search" placeholder="Search archive..." class="min-w-[300px] border-0 bg-transparent text-sm text-ink outline-none" />
       </div>
       <button class="btn-secondary !text-brand-rose hover:!bg-red-50" @click="purgeAll">
           Purge All Records
       </button>
    </div>

    <!-- Content -->
    <div class="card overflow-hidden shadow-card">
       <div class="overflow-x-auto">
          <table class="w-full border-collapse">
              <thead>
                  <tr class="bg-surface">
                      <th class="table-th text-center w-12">#</th>
                      <th class="table-th">Identity / Record Name</th>
                      <th class="table-th text-center">Entity Type</th>
                      <th class="table-th">Archived At</th>
                      <th class="table-th">Reason</th>
                      <th class="table-th text-right">Actions</th>
                  </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                  <tr v-for="(item, idx) in filteredItems" :key="item.id" class="group hover:bg-surface/50 transition-colors">
                      <td class="px-4 py-4 text-center text-xs font-mono text-ink-soft opacity-50">{{ idx + 1 }}</td>
                      <td class="px-4 py-4">
                          <div class="font-bold text-sm text-ink">{{ item.name }}</div>
                          <div class="text-xs text-ink-soft">{{ item.id_ref }}</div>
                      </td>
                      <td class="px-4 py-4 text-center">
                          <span class="badge-amber bg-opacity-20">{{ item.type }}</span>
                      </td>
                      <td class="px-4 py-4 text-sm text-ink-soft">
                          {{ formatDate(item.archived_at) }}
                      </td>
                      <td class="px-4 py-4 text-xs text-ink-soft italic">
                          "{{ item.reason || 'No reason provided' }}"
                      </td>
                      <td class="px-4 py-4 text-right">
                          <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button class="btn-secondary !px-4 !py-1.5 !text-[11px] !font-bold hover:!text-brand-blue" @click="restoreItem(item)">
                                  Restore
                              </button>
                              <button class="p-1.5 text-brand-rose hover:scale-110 transition-transform" @click="purgeItem(item)">
                                  🗑️
                              </button>
                          </div>
                      </td>
                  </tr>
                  <tr v-if="filteredItems.length === 0">
                      <td colspan="6" class="px-6 py-20 text-center">
                          <div class="text-4xl mb-3 opacity-20">🗄️</div>
                          <p class="text-sm font-semibold text-ink-soft italic">The vault is currently empty for this category.</p>
                      </td>
                  </tr>
              </tbody>
          </table>
       </div>
    </div>

    <!-- Purge Confirmation (Premium Toast) -->
    <div v-if="purging" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-brand-rose border-t-transparent shadow-2xl"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const activeTab = ref('accounts')
const search = ref('')
const purging = ref(false)

const tabs = [
    { id: 'accounts', label: 'Archived Accounts' },
    { id: 'sections', label: 'Past Sections' },
    { id: 'materials', label: 'Dead Materials' }
]

const archivedItems = ref([
    { id: 101, name: 'S.V. Aguinaldo', id_ref: 'stud_2021_042', type: 'student', archived_at: '2025-12-21T09:00:00Z', reason: 'Graduated' },
    { id: 102, name: 'Grade 5-B (Beta)', id_ref: 'sect_992', type: 'section', archived_at: '2025-11-15T14:30:00Z', reason: 'End of School Year' },
    { id: 103, name: 'Module: Advanced Hand Signs', id_ref: 'mod_114', type: 'material', archived_at: '2025-10-05T08:20:00Z', reason: 'Curriculum Update' },
])

const filteredItems = computed(() => {
    let base = archivedItems.value
    if (activeTab.value === 'accounts') base = base.filter(i => i.type === 'student' || i.type === 'teacher')
    else if (activeTab.value === 'sections') base = base.filter(i => i.type === 'section')
    else if (activeTab.value === 'materials') base = base.filter(i => i.type === 'material')

    if (search.value) {
        const s = search.value.toLowerCase()
        return base.filter(i => i.name.toLowerCase().includes(s) || i.id_ref.toLowerCase().includes(s))
    }
    return base
})

async function fetchArchive() {
    // For now we use the accounts view with ARCHIVED status
    // await adminStore.fetchAccounts({ status: 'archived', page: 1, per_page: 50 })
}

async function restoreItem(item: any) {
    if (!confirm(`Restore ${item.name} to active status?`)) return
    try {
        await adminService.updateAccountStatus(item.id, 'active', 'Restored from archive')
        alert('Record restored successfully.')
        fetchArchive()
    } catch (err: any) {
        alert(err.message)
    }
}

async function purgeItem(item: any) {
    if (!confirm(`PERMANENT PURGE: ${item.name}? This cannot be undone.`)) return
    purging.value = true
    try {
        await adminService.deleteAccount(item.id)
        alert('Record purged from history.')
        fetchArchive()
    } catch (err: any) {
        alert(err.message)
    } finally {
        purging.value = false
    }
}

function purgeAll() {
    alert('This feature requires SuperAdmin clearance. Action restricted.')
}

function formatDate(date: string) {
    return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(fetchArchive)
</script>

<style scoped>
.shadow-card {
  box-shadow: 0 4px 20px rgba(67, 97, 238, 0.08);
}
</style>
