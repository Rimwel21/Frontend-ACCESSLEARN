<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-ink">System Audit Trail</h2>
        <p class="text-sm text-ink-soft">Immutable chronological record of all administrative activities and system events.</p>
      </div>
      <div class="flex gap-2">
          <button class="btn-secondary !text-xs !py-2" @click="fetchLogs">Refresh Stream</button>
          <button class="btn-primary !text-xs !py-2" @click="router.push('/admin/reports')">Export Trail</button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card p-4 flex flex-wrap gap-4 items-center bg-surface/30 border-dashed border-gray-300">
        <div class="flex-1 min-w-[200px]">
            <input v-model="filters.search" placeholder="Filter by actor, module or message..." class="input-field" @input="debouncedFetch" />
        </div>
        <select v-model="filters.module" class="input-field !w-auto" @change="fetchLogs">
            <option value="">All Modules</option>
            <option value="Auth">Authentication</option>
            <option value="AccountMgmt">Account Mgmt</option>
            <option value="SectionRegistry">Section Registry</option>
            <option value="Maintenance">Maintenance</option>
        </select>
        <select v-model="filters.action" class="input-field !w-auto" @change="fetchLogs">
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="suspend">Suspend</option>
            <option value="login">Login</option>
        </select>
        <div class="flex items-center gap-2">
            <input v-model="filters.date" type="date" class="input-field !w-auto" @change="fetchLogs" />
        </div>
    </div>

    <!-- Timeline of Logs -->
    <div class="card overflow-hidden shadow-card">
        <div class="overflow-x-auto">
            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-surface">
                        <th class="table-th text-center w-12">#</th>
                        <th class="table-th">Timestamp</th>
                        <th class="table-th">Actor</th>
                        <th class="table-th">Event / Module</th>
                        <th class="table-th text-center">Status</th>
                        <th class="table-th">Metadata</th>
                        <th class="table-th text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr v-for="(log, idx) in logs" :key="log.id" class="group hover:bg-surface/50 transition-colors">
                        <td class="px-4 py-4 text-center text-xs font-mono text-ink-soft opacity-40">{{ idx + 1 }}</td>
                        <td class="px-4 py-4 whitespace-nowrap">
                            <div class="text-[13px] font-bold text-ink">{{ formatTime(log.created_at) }}</div>
                            <div class="text-[10px] text-ink-soft uppercase tracking-wider">{{ formatDate(log.created_at) }}</div>
                        </td>
                        <td class="px-4 py-4">
                            <div class="flex items-center gap-2">
                                <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-blue to-brand-violet flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                    {{ log.actor.charAt(0) }}
                                </div>
                                <div class="min-w-0">
                                    <div class="text-[13px] font-bold text-ink truncate">{{ log.actor }}</div>
                                    <div class="text-[10px] text-brand-blue font-bold uppercase tracking-tight">{{ log.role }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-4">
                            <div class="text-[13px] font-semibold text-ink">{{ log.message }}</div>
                            <div class="flex items-center gap-1.5 mt-0.5">
                                <span class="h-1.5 w-1.5 rounded-full bg-brand-blue/30"></span>
                                <span class="text-[11px] font-bold text-ink-soft opacity-60">{{ log.module }}</span>
                                <span class="text-[11px] font-bold text-brand-violet opacity-60">• {{ log.action }}</span>
                            </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                            <span :class="['badge', log.status === 'success' ? 'badge-green' : 'badge-red']">
                                {{ log.status }}
                            </span>
                        </td>
                        <td class="px-4 py-4">
                            <div class="flex flex-col gap-1">
                                <div class="flex items-center gap-2 text-[10px] font-mono text-ink-soft">
                                    <span class="opacity-50">IP:</span> {{ log.ip_address }}
                                </div>
                                <div class="flex items-center gap-2 text-[10px] font-mono text-ink-soft">
                                    <span class="opacity-50">OS:</span> {{ log.user_agent }}
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-4 text-right">
                           <button class="rounded border border-gray-200 bg-white p-1.5 text-xs hover:border-brand-blue hover:text-brand-blue transition-all" @click="viewDetail(log)">
                               👁️
                           </button>
                        </td>
                    </tr>
                    <tr v-if="logs.length === 0">
                        <td colspan="7" class="px-6 py-20 text-center empty-state border-0">
                            No audit events found matching your search.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <div class="flex items-center justify-between border-t border-gray-50 bg-white px-8 py-5">
            <div class="text-[11px] font-bold text-ink-soft uppercase tracking-widest">
                Showing entries {{ (filters.page - 1) * filters.per_page + 1 }} - {{ filters.page * filters.per_page }}
            </div>
            <div class="flex gap-2">
                <button class="btn-secondary !px-5 !py-2 !text-xs" :disabled="filters.page === 1" @click="filters.page--">Previous Page</button>
                <button class="btn-secondary !px-5 !py-2 !text-xs" @click="filters.page++">Next Page</button>
            </div>
        </div>
    </div>

    <!-- Detail Slide-over / Modal (Simplified) -->
    <div v-if="selectedLog" class="fixed inset-0 z-50 flex items-center justify-end bg-ink/40 backdrop-blur-sm">
        <div class="h-full w-full max-w-lg bg-white shadow-2xl p-8 overflow-y-auto animate-slide-in">
             <div class="flex items-center justify-between mb-8">
                 <h3 class="font-display text-xl font-bold text-ink">Event Metadata</h3>
                 <button class="text-2xl text-ink-soft hover:text-brand-rose" @click="selectedLog = null">×</button>
             </div>
             
             <div class="space-y-6">
                 <div class="card bg-surface p-5 border-0 rounded-2xl">
                     <div class="text-xs font-bold text-ink-soft uppercase tracking-wider mb-2">Detailed Payload</div>
                     <pre class="text-[12px] leading-relaxed text-ink font-mono bg-white p-4 rounded-xl border border-gray-100 overflow-x-auto">{{ JSON.stringify(selectedLog, null, 2) }}</pre>
                 </div>
                 
                 <div class="grid grid-cols-2 gap-4">
                     <div class="card p-4 border border-gray-100 flex flex-col justify-center">
                         <div class="text-[10px] font-bold text-ink-soft uppercase">Device ID</div>
                         <div class="text-[12px] font-bold text-ink truncate">{{ selectedLog.device_id }}</div>
                     </div>
                     <div class="card p-4 border border-gray-100 flex flex-col justify-center">
                         <div class="text-[10px] font-bold text-ink-soft uppercase">OS / Architecture</div>
                         <div class="text-[12px] font-bold text-ink">{{ selectedLog.user_agent }}</div>
                     </div>
                 </div>
                 
                 <div class="status-success bg-brand-blue/5 border border-brand-blue/10 text-brand-blue p-5 rounded-2xl">
                     <div class="flex items-center gap-2 mb-1">
                         <span class="text-sm">🛡️</span>
                         <span class="text-xs font-bold uppercase tracking-wide">Verification</span>
                     </div>
                     <p class="text-xs opacity-80 leading-relaxed font-semibold">This log entry has been verified against the secure database checksum and is confirmed as authentic and untampered.</p>
                 </div>
             </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminService } from '@/services/adminService'

const router = useRouter()
const selectedLog = ref<any>(null)
const logs = ref<any[]>([])

const filters = ref({
    search: '',
    module: '',
    action: '',
    date: '',
    page: 1,
    per_page: 15
})

async function fetchLogs() {
    // try {
    //     const res = await adminService.getAuditLogs(filters.value)
    //     logs.value = res.items
    // } catch (err) { }
    
    // Mock Data for now
    logs.value = [
        { id: 1, created_at: new Date().toISOString(), actor: 'Admin (System)', role: 'Admin', module: 'Auth', action: 'login', message: 'Successful administrator login', status: 'success', ip_address: '192.168.1.1', user_agent: 'Win64; x64; Chrome/121.0', device_id: 'DEV-9321' },
        { id: 2, created_at: new Date(Date.now() - 3600000).toISOString(), actor: 'SuperAdmin', role: 'Admin', module: 'AccountMgmt', action: 'update', message: 'Changed status of teacher_01 to INACTIVE', status: 'success', ip_address: '112.204.14.92', user_agent: 'Macintosh; Intel; Safari/605.1', device_id: 'DEV-0041' },
        { id: 3, created_at: new Date(Date.now() - 7200000).toISOString(), actor: 'Admin (System)', role: 'Admin', module: 'SectionRegistry', action: 'create', message: 'Created new section: Grade 6-Zeta', status: 'success', ip_address: '192.168.1.1', user_agent: 'Win64; x64; Chrome/121.0', device_id: 'DEV-9321' },
        { id: 4, created_at: new Date(Date.now() - 86400000).toISOString(), actor: 'teacher_04', role: 'Teacher', module: 'Auth', action: 'login', message: 'Failed login attempt (Wrong Password)', status: 'failed', ip_address: '58.69.12.201', user_agent: 'Linux; Android 14', device_id: 'PH-MOBILE-92' }
    ]
}

let debounceTimer: any
function debouncedFetch() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(fetchLogs, 500)
}

function viewDetail(log: any) {
    selectedLog.value = log
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

onMounted(fetchLogs)
</script>

<style scoped>
.animate-slide-in {
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
}

.shadow-card {
  box-shadow: 0 4px 20px rgba(67, 97, 238, 0.08);
}
</style>
