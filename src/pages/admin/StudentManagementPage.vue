<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-ink">Student Console</h2>
        <p class="text-sm text-ink-soft">Academic lifecycle and section placement for all enrolled students.</p>
      </div>
      <div class="flex items-center gap-3">
         <button class="btn-secondary flex items-center gap-2" @click="showTransferModal = true" :disabled="selectedIds.length === 0">
            🔄 Bulk Transfer ({{ selectedIds.length }})
         </button>
         <button class="btn-primary" @click="router.push('/admin/accounts?role=student')">
            Manage All Accounts
         </button>
      </div>
    </div>

    <!-- Placement Table -->
    <div class="card overflow-hidden shadow-card">
        <div class="bg-surface/50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Grade</span>
                    <select v-model="filters.grade" class="bg-transparent border-0 text-sm font-bold text-ink outline-none" @change="fetchStudents">
                        <option value="">All</option>
                        <option v-for="g in ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']" :key="g" :value="g">{{ g }}</option>
                    </select>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Section</span>
                    <select v-model="filters.section" class="bg-transparent border-0 text-sm font-bold text-ink outline-none" @change="fetchStudents">
                        <option value="">All Sections</option>
                        <option v-for="s in sections" :key="s" :value="s">{{ s }}</option>
                    </select>
                </div>
            </div>
            <div class="text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                {{ studentCount }} Enrolled Students
            </div>
        </div>
        
        <div class="overflow-x-auto">
            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-surface">
                        <th class="table-th w-10">
                            <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" class="h-4 w-4 rounded border-gray-300 text-brand-blue" />
                        </th>
                        <th class="table-th">Student Identity</th>
                        <th class="table-th">Current Placement</th>
                        <th class="table-th text-center">Progress</th>
                        <th class="table-th">Account Status</th>
                        <th class="table-th text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr v-for="std in students" :key="std.id" class="group hover:bg-surface/30">
                        <td class="px-4 py-4">
                            <input type="checkbox" :value="std.id" v-model="selectedIds" class="h-4 w-4 rounded border-gray-300 text-brand-blue" />
                        </td>
                        <td class="px-4 py-4">
                            <div class="flex items-center gap-3">
                                <div class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-surface text-sm font-bold text-ink">
                                    {{ std.full_name.charAt(0) }}
                                </div>
                                <div>
                                    <div class="text-sm font-bold text-ink">{{ std.full_name }}</div>
                                    <div class="text-[10px] font-mono text-ink-soft uppercase opacity-60">REF-{{ std.id }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-4">
                            <div class="text-xs font-bold text-ink">{{ std.grade_level }}</div>
                            <div class="text-xs text-brand-blue font-semibold">{{ std.section_name || 'No Section' }}</div>
                        </td>
                        <td class="px-4 py-4">
                            <div class="w-24 mx-auto space-y-1">
                                <div class="text-[9px] font-bold text-ink-soft text-right">{{ std.progress }}% Complete</div>
                                <div class="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                     <div :style="{ width: std.progress + '%' }" class="h-full bg-brand-green"></div>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-4">
                             <span :class="['badge', getStatusClass(std.account_status)]">{{ std.account_status }}</span>
                        </td>
                        <td class="px-4 py-4 text-right">
                             <div class="flex items-center justify-end gap-2 transition-opacity">
                                  <button class="btn-secondary !py-1 !px-3 !text-[10px] hover:!text-brand-blue" @click="reassign(std)">Change Section</button>
                                  <button class="p-1 hover:bg-gray-100 rounded" title="View Progress Data">📊</button>
                             </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Bulk Transfer Modal -->
    <div v-if="showTransferModal" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
        <div class="auth-card !max-w-md">
            <h3 class="font-display text-xl font-bold text-ink">Bulk Section Transfer</h3>
            <p class="text-sm text-ink-soft mb-6">Relocating <span class="font-bold text-brand-blue">{{ selectedIds.length }}</span> students to a new registry placement.</p>
            
            <div class="form-stack">
                <div class="p-4 bg-surface rounded-xl border border-gray-100 mb-4">
                    <div class="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-1">Target Registry</div>
                    <div class="grid grid-cols-2 gap-4">
                         <select v-model="transferDest.grade" class="input-field !text-xs font-bold shadow-sm bg-white">
                            <option value="">Target Grade</option>
                            <option v-for="g in ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']" :key="g" :value="g">{{ g }}</option>
                        </select>
                        <select v-model="transferDest.section" class="input-field !text-xs font-bold shadow-sm bg-white">
                            <option value="">Target Section</option>
                            <option v-for="s in sections" :key="s" :value="s">{{ s }}</option>
                        </select>
                    </div>
                </div>
                
                <div class="status-success bg-brand-blue/5 text-[11px] leading-relaxed font-semibold">
                    Note: Students will retain all progress and activity history during this transfer. The previous teacher will be notified.
                </div>
            </div>

            <div class="mt-8 flex gap-3">
                <button class="flex-1 btn-secondary" @click="showTransferModal = false">Cancel</button>
                <button class="flex-1 btn-primary" :disabled="!transferDest.section" @click="submitTransfer">Execute Transfer</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const filters = ref({ grade: '', section: '', page: 1 })
const sections = ref(['Diamond', 'Sapphire', 'Emerald', 'Ruby', 'Pearl'])
const students = ref<any[]>([])
const selectedIds = ref<number[]>([])
const showTransferModal = ref(false)
const transferDest = ref({ grade: '', section: '' })

const studentCount = ref(128)

const allSelected = computed(() => students.value.length > 0 && selectedIds.value.length === students.value.length)

async function fetchStudents() {
    students.value = [
        { id: 401, full_name: 'Isagani R. Dela Cruz', grade_level: 'Grade 6', section_name: 'Diamond', account_status: 'active', progress: 85 },
        { id: 402, full_name: 'Basilio M. Santos', grade_level: 'Grade 6', section_name: 'Diamond', account_status: 'active', progress: 92 },
        { id: 403, full_name: 'Julieta G. Capule', grade_level: 'Grade 6', section_name: 'Sapphire', account_status: 'waiting', progress: 0 },
        { id: 404, full_name: 'Victorina S. Tiago', grade_level: 'Grade 5', section_name: 'Pearl', account_status: 'active', progress: 45 },
    ]
}

function toggleSelectAll() {
    if (allSelected.value) selectedIds.value = []
    else selectedIds.value = students.value.map(s => s.id)
}

function submitTransfer() {
   alert(`Transfer complete! ${selectedIds.value.length} students moved to ${transferDest.value.section}.`)
   showTransferModal.value = false
   selectedIds.value = []
   fetchStudents()
}

function reassign(std: any) {
    selectedIds.value = [std.id]
    showTransferModal.value = true
}

function getStatusClass(status: string) {
    switch (status) {
        case 'active': return 'badge-green'
        case 'inactive': return 'badge-amber'
        case 'waiting': return 'badge-blue'
        default: return 'bg-gray-100'
    }
}

onMounted(fetchStudents)
</script>
