<template>
  <div class="space-y-6">
    <!-- Header Actions -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-all focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-blue-100">
           <span class="text-sm grayscale opacity-50">🔍</span>
           <input v-model="filters.search" placeholder="Search by name, email, or ID..." class="min-w-[280px] border-0 bg-transparent text-sm text-ink outline-none" @input="debouncedFetch" />
        </div>
        <select v-model="filters.role" class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-blue" @change="fetchAccounts">
            <option value="">All Roles</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
        </select>
        <select v-model="filters.status" class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-blue" @change="fetchAccounts">
            <option value="">All Status</option>
            <option value="pending">Pending Activation</option>
            <option value="waiting">Waiting for Assignment</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
        </select>
      </div>
      
      <div class="flex items-center gap-3">
         <button v-if="selectedIds.length > 0" class="btn-secondary !bg-amber-50 !text-brand-amber hover:!bg-amber-100" @click="showBulkAction = true">
            Bulk Action ({{ selectedIds.length }})
         </button>
         <button class="btn-primary flex items-center gap-2" @click="router.push('/admin/teachers')">
            <span>+</span> Invite Teacher
         </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden shadow-card">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-surface">
              <th class="table-th w-10">
                  <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" class="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
              </th>
              <th class="table-th">User Profile</th>
              <th class="table-th text-center">Role</th>
              <th class="table-th text-center">Status</th>
              <th class="table-th">Created At</th>
              <th class="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in accounts" :key="user.id" class="group hover:bg-surface/50 transition-colors">
              <td class="px-4 py-4">
                  <input type="checkbox" :value="user.id" v-model="selectedIds" class="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-bold text-brand-blue">
                    {{ user.full_name.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <div class="truncate text-[14px] font-bold text-ink">{{ user.full_name }}</div>
                    <div class="truncate text-xs text-ink-soft opacity-70">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 text-center">
                <span :class="['role-pill', user.role === 'teacher' ? 'role-pill-teacher' : '']">{{ user.role }}</span>
              </td>
              <td class="px-4 py-4 text-center">
                <span :class="['badge', getStatusClass(user.account_status)]">
                  {{ formatStatus(user.account_status) }}
                </span>
              </td>
              <td class="px-4 py-4 text-sm text-ink-soft">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-4 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="rounded-md border border-gray-200 bg-white p-1.5 transition-all hover:border-brand-blue hover:text-brand-blue" title="Edit Status" @click="openStatusModal(user)">
                    ✏️
                  </button>
                  <button class="rounded-md border border-gray-200 bg-white p-1.5 transition-all hover:border-brand-rose hover:text-brand-rose" title="Delete Account" @click="confirmDelete(user)">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-gray-50 bg-white px-6 py-4">
          <div class="text-xs font-bold text-ink-soft uppercase tracking-wide">
              Showing {{ accounts.length }} of {{ totalAccounts }} entries
          </div>
          <div class="flex gap-2">
              <button class="btn-secondary !px-4 !py-1.5 !text-xs" :disabled="filters.page === 1" @click="changePage(filters.page - 1)">Previous</button>
              <button class="btn-secondary !px-4 !py-1.5 !text-xs" :disabled="accounts.length < filters.per_page" @click="changePage(filters.page + 1)">Next</button>
          </div>
      </div>
    </div>

    <!-- Status Change Modal -->
    <div v-if="showStatusModal" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
        <div class="auth-card !max-w-md animate-scale-in">
            <h3 class="font-display text-xl font-bold text-ink">Update Account Status</h3>
            <p class="mt-1 text-sm text-ink-soft">Modifying status for <span class="font-bold text-brand-blue">{{ activeUser?.full_name }}</span></p>
            
            <div class="form-stack mt-6">
                <div>
                   <label class="field-label">Target Status</label>
                   <select v-model="statusPayload.status" class="input-field mt-1">
                       <option value="active">Active</option>
                       <option value="inactive">Inactive</option>
                       <option value="archived">Archived</option>
                       <option value="pending">Pending Activation</option>
                       <option value="waiting">Waiting for Assignment</option>
                   </select>
                </div>
                <div>
                   <label class="field-label">Reason for Change</label>
                   <textarea v-model="statusPayload.reason" class="input-field mt-1 min-h-[80px]" placeholder="e.g., Graduated, Leave of Absence, Correction..."></textarea>
                </div>
            </div>
            
            <div class="mt-8 flex gap-3">
                <button class="flex-1 btn-secondary" @click="showStatusModal = false">Cancel</button>
                <button class="flex-1 btn-primary" :disabled="loading" @click="submitStatus">Update Status</button>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal (Premium Hard Delete) -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-red-900/40 backdrop-blur-md p-4">
        <div class="auth-card !max-w-md border-2 border-brand-rose/20 animate-wiggle">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl mb-4">⚠️</div>
            <h3 class="font-display text-xl font-bold text-ink">Confirm Account Deletion</h3>
            <p class="mt-2 text-sm text-ink-soft">This action is <span class="font-bold text-brand-rose uppercase">permanent</span>. All data associated with this user will be removed immediately.</p>
            
            <div class="form-stack mt-6">
                <div>
                   <label class="field-label">Type <span class="text-brand-rose">DELETE</span> to confirm</label>
                   <input v-model="deleteConfirmString" type="text" class="input-field mt-1 border-brand-rose/30 focus:border-brand-rose focus:ring-red-100" placeholder="DELETE" />
                </div>
            </div>
            
            <div class="mt-8 flex gap-3">
                <button class="flex-1 btn-secondary" @click="cancelDelete">Nevermind</button>
                <button 
                  class="flex-1 relative overflow-hidden rounded-full bg-brand-rose py-2.5 text-sm font-bold text-white shadow-md disabled:bg-rose-300"
                  :disabled="deleteConfirmString !== 'DELETE' || isDeleting"
                  @mousedown="startHold"
                  @mouseup="stopHold"
                  @mouseleave="stopHold"
                  @touchstart="startHold"
                  @touchend="stopHold"
                >
                  <div class="relative z-10">
                      {{ isDeleting ? 'Hold for 3s...' : 'Hold to Delete' }}
                  </div>
                  <!-- Progress Bar Overlay -->
                   <div :style="{ width: holdProgress + '%' }" class="absolute inset-0 bg-red-800/30 transition-all duration-100 ease-linear"></div>
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { adminService } from '@/services/adminService'

const router = useRouter()
const adminStore = useAdminStore()

const filters = ref({
    role: '',
    status: '',
    search: '',
    page: 1,
    per_page: 10
})

const accounts = computed(() => adminStore.accounts)
const totalAccounts = computed(() => adminStore.totalAccounts)
const loading = computed(() => adminStore.loading)

const selectedIds = ref<number[]>([])
const allSelected = computed(() => accounts.value.length > 0 && selectedIds.value.length === accounts.value.length)

// Status Modal
const showStatusModal = ref(false)
const activeUser = ref<any>(null)
const statusPayload = ref({ status: '', reason: '' })

// Delete Modal
const showDeleteModal = ref(false)
const deleteConfirmString = ref('')
const isDeleting = ref(false)
const holdProgress = ref(0)
let holdInterval: any = null

function fetchAccounts() {
    adminStore.fetchAccounts(filters.value)
}

let debounceTimer: any
function debouncedFetch() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(fetchAccounts, 500)
}

function changePage(page: number) {
    filters.value.page = page
    fetchAccounts()
}

function toggleSelectAll() {
    if (allSelected.value) selectedIds.value = []
    else selectedIds.value = accounts.value.map(u => u.id)
}

// Status Methods
function openStatusModal(user: any) {
    activeUser.value = user
    statusPayload.value = { status: user.account_status, reason: '' }
    showStatusModal.value = true
}

async function submitStatus() {
    if (!activeUser.value) return
    try {
        await adminService.updateAccountStatus(activeUser.value.id, statusPayload.value.status, statusPayload.value.reason)
        showStatusModal.value = false
        fetchAccounts()
    } catch (err: any) {
        alert(err.message)
    }
}

// Delete Methods
function confirmDelete(user: any) {
    activeUser.value = user
    showDeleteModal.value = true
    deleteConfirmString.value = ''
    holdProgress.value = 0
}

function cancelDelete() {
    showDeleteModal.value = false
    activeUser.value = null
    stopHold()
}

function startHold() {
    if (deleteConfirmString.value !== 'DELETE') return
    isDeleting.value = true
    holdProgress.value = 0
    
    holdInterval = setInterval(() => {
        holdProgress.value += 3.33 // Approx 100/30 (3 seconds at 100ms intervals)
        if (holdProgress.value >= 100) {
            executeDelete()
        }
    }, 100)
}

function stopHold() {
    clearInterval(holdInterval)
    isDeleting.value = false
    holdProgress.value = 0
}

async function executeDelete() {
    stopHold()
    if (!activeUser.value) return
    try {
        await adminService.deleteAccount(activeUser.value.id)
        showDeleteModal.value = false
        fetchAccounts()
        alert('Account permanently deleted.')
    } catch (err: any) {
        alert(err.message)
    }
}

// Utils
function getStatusClass(status: string) {
    switch (status) {
        case 'active': return 'badge-green'
        case 'inactive': return 'badge-amber'
        case 'archived': return 'badge-red'
        case 'waiting': return 'badge-blue'
        default: return 'bg-gray-100 text-gray-600'
    }
}

function formatStatus(status: string) {
    return status.replace(/_/g, ' ').toUpperCase()
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(fetchAccounts)
</script>

<style scoped>
.animate-scale-in {
    animation: scaleIn 0.2s ease-out;
}
.animate-wiggle {
    animation: wiggle 0.4s ease-in-out;
}

@keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

@keyframes wiggle {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
}
</style>
