<template>
  <div class="space-y-5">
    <div class="flex items-end justify-between">
      <div>
        <nav class="flex items-center gap-1.5 text-xs font-mono mb-1">
          <span @click="router.push('/teacher/class')" class="text-ink-soft hover:text-brand-blue cursor-pointer transition-colors">Class Management</span>
          <span class="text-gray-300">›</span>
          <span class="text-ink font-semibold">Activities</span>
        </nav>
        <h2 class="font-display text-2xl font-bold">🎯 Activities</h2>
      </div>
      <button @click="openCreate" class="btn-primary">➕ Create Activity</button>
    </div>

    <div class="gradient-violet rounded-xl px-6 py-3.5">
      <p class="text-white text-sm">Create and manage activities for your students to complete</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4">
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center text-xl">🎯</div>
        <div><div class="font-display text-2xl font-bold">{{ store.activities.length }}</div><div class="text-xs text-ink-soft font-medium">Total Activities</div></div>
      </div>
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">✅</div>
        <div><div class="font-display text-2xl font-bold">{{ countByStatus('Finished') }}</div><div class="text-xs text-ink-soft font-medium">Finished</div></div>
      </div>
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-xl">⏳</div>
        <div><div class="font-display text-2xl font-bold">{{ countByStatus('In Progress') }}</div><div class="text-xs text-ink-soft font-medium">In Progress</div></div>
      </div>
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-xl">🚨</div>
        <div><div class="font-display text-2xl font-bold">{{ countByStatus('Overdue') }}</div><div class="text-xs text-ink-soft font-medium">Overdue</div></div>
      </div>
    </div>

    <!-- Search -->
    <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 w-60 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-blue-100 transition-all">
      <span class="text-sm">🔍</span>
      <input v-model="search" class="border-0 bg-transparent outline-none text-sm font-body flex-1" placeholder="Search Activities…" />
    </div>

    <!-- Activity list -->
    <div class="card overflow-hidden">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="table-th">Activity</th>
            <th class="table-th">Module</th>
            <th class="table-th">Due Date</th>
            <th class="table-th">Status</th>
            <th class="table-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filteredActivities" :key="a.id" class="hover:bg-gray-50 transition-colors">
            <td class="table-td">
              <div class="font-medium">{{ a.title }}</div>
              <div class="text-ink-soft text-xs mt-0.5 max-w-xs truncate">{{ a.description }}</div>
            </td>
            <td class="table-td text-ink-soft text-xs">{{ a.module }}</td>
            <td class="table-td font-mono text-xs">{{ a.dueDate }}<br/><span class="text-gray-400">{{ a.dueTime }}</span></td>
            <td class="table-td"><span :class="statusBadge(a.status)">{{ a.status }}</span></td>
            <td class="table-td">
              <div class="flex gap-2">
                <button @click="openEdit(a)" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-all">✏️ Edit</button>
                <button @click="store.deleteActivity(a.id)" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-rose-400 hover:text-brand-rose transition-all">🗑</button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredActivities.length === 0">
            <td colspan="5" class="table-td text-center text-ink-soft py-10">No activities found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
          <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="showModal = false" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 class="font-display font-bold text-lg">{{ editTarget ? '✏️ Edit Activity' : '🎯 Create New Activity' }}</h3>
              <button @click="showModal = false" class="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-ink-soft hover:text-ink transition-all text-lg">×</button>
            </div>
            <div class="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
              <div>
                <label class="block text-xs font-semibold text-ink-soft mb-1.5">Activity Title</label>
                <input v-model="form.title" class="input-field" placeholder="e.g. Lab Report — Acids & Bases" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-ink-soft mb-1.5">Description</label>
                <textarea v-model="form.description" rows="3" class="input-field resize-none" placeholder="Describe what students need to do…" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-ink-soft mb-1.5">Module</label>
                  <select v-model="form.module" class="input-field">
                    <option v-for="m in store.modules" :key="m.id" :value="m.title.split(' — ')[0]">{{ m.title.split(' — ')[0] }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-ink-soft mb-1.5">Status</label>
                  <select v-model="form.status" class="input-field">
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Overdue</option>
                    <option>Finished</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-ink-soft mb-1.5">Due Date</label>
                  <input v-model="form.dueDate" type="date" class="input-field" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-ink-soft mb-1.5">Due Time</label>
                  <input v-model="form.dueTime" type="time" class="input-field" />
                </div>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button @click="showModal = false" class="btn-secondary">Cancel</button>
              <button @click="saveActivity" class="btn-primary">{{ editTarget ? 'Save Changes' : 'Create Activity' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTeacherStore } from '@/stores/teacher'

const router = useRouter()
const store  = useTeacherStore()
const search = ref('')

const filteredActivities = computed(() => store.activities.filter(a =>
  !search.value || a.title.toLowerCase().includes(search.value.toLowerCase())
))

function countByStatus(status: string) {
  return store.activities.filter(a => a.status === status).length
}
function statusBadge(status: string) {
  switch (status) {
    case 'Finished':    return 'badge badge-green'
    case 'In Progress': return 'badge badge-amber'
    case 'Overdue':     return 'badge badge-red'
    default:            return 'badge badge-blue'
  }
}

// ── Modal state ──
const showModal  = ref(false)
const editTarget = ref<{ id: string } | null>(null)
const form = ref({
  title: '', description: '', module: '', dueDate: '', dueTime: '',
  status: 'Not Started' as 'Not Started' | 'In Progress' | 'Overdue' | 'Finished',
})

function openCreate() {
  editTarget.value = null
  form.value = { title: '', description: '', module: store.modules[0]?.title.split(' — ')[0] ?? '', dueDate: '', dueTime: '', status: 'Not Started' }
  showModal.value = true
}
function openEdit(a: typeof store.activities[number]) {
  editTarget.value = a
  form.value = { title: a.title, description: a.description, module: a.module, dueDate: a.dueDate, dueTime: a.dueTime, status: a.status }
  showModal.value = true
}
function saveActivity() {
  if (!form.value.title.trim()) { alert('Please enter an activity title.'); return }
  if (editTarget.value) {
    store.updateActivity(editTarget.value.id, { ...form.value })
  } else {
    store.addActivity({ ...form.value })
  }
  showModal.value = false
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform .2s, opacity .2s; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .relative { transform: scale(.95); opacity: 0; }
.modal-leave-to { opacity: 0; }
</style>
