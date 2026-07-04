<template>
  <div class="space-y-8">
    <!-- Top Action Bar -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Invitation Form -->
        <div class="card p-6 lg:col-span-1 h-fit">
            <h3 class="font-display text-lg font-bold text-ink mb-1">Invite New Teacher</h3>
            <p class="text-xs text-ink-soft mb-6">Send an activation link to a verified email address.</p>
            
            <form @submit.prevent="submitInvitation" class="form-stack">
                <div>
                   <label class="field-label">Full Name</label>
                   <input v-model="form.full_name" type="text" class="input-field mt-1" placeholder="Juan Dela Cruz" required />
                </div>
                <div>
                   <label class="field-label">Institutional Email</label>
                   <input v-model="form.email" type="email" class="input-field mt-1" placeholder="teacher@accesslearn.edu" required />
                </div>
                <div>
                   <label class="field-label">Contact Number (Optional)</label>
                   <input v-model="form.contact_no" type="tel" class="input-field mt-1" placeholder="0912 345 6789" />
                </div>
                
                <div v-if="successMsg" class="status-success text-xs py-2">
                    {{ successMsg }}
                </div>
                <div v-if="errorMsg" class="status-error text-xs py-2">
                    {{ errorMsg }}
                </div>

                <button class="btn-primary w-full mt-4" :disabled="inviting">
                    {{ inviting ? 'Generating Link...' : 'Send Invitation' }}
                </button>
            </form>
        </div>

        <!-- Invitation List -->
        <div class="card lg:col-span-2 overflow-hidden shadow-card">
            <div class="flex items-center justify-between border-b border-gray-50 bg-white px-6 py-4">
               <div>
                  <h3 class="font-display text-lg font-bold text-ink">Active Invitations</h3>
                  <p class="text-[11px] font-bold text-ink-soft uppercase tracking-wider">Pending Activation</p>
               </div>
               <div class="flex items-center gap-2">
                   <button class="p-1.5 grayscale opacity-50 hover:opacity-100" @click="fetchInvitations">🔄</button>
               </div>
            </div>
            
            <div class="overflow-x-auto">
               <table class="w-full border-collapse">
                   <thead>
                       <tr class="bg-surface">
                           <th class="table-th">Teacher</th>
                           <th class="table-th">Status</th>
                           <th class="table-th">Expires</th>
                           <th class="table-th text-right">Actions</th>
                       </tr>
                   </thead>
                   <tbody class="divide-y divide-gray-50">
                       <tr v-for="inv in invitations" :key="inv.id" class="group hover:bg-surface/30">
                           <td class="px-6 py-4">
                               <div class="font-bold text-sm text-ink">{{ inv.full_name }}</div>
                               <div class="text-xs text-ink-soft">{{ inv.email }}</div>
                           </td>
                           <td class="px-6 py-4">
                               <span :class="['badge', inv.status === 'expired' ? 'badge-red' : 'badge-blue']">
                                   {{ inv.status.toUpperCase() }}
                               </span>
                           </td>
                           <td class="px-6 py-4 text-xs font-mono text-ink-soft">
                               {{ formatDateShort(inv.expires_at) }}
                           </td>
                           <td class="px-6 py-4 text-right">
                               <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button class="rounded-md border border-gray-200 px-3 py-1 text-[11px] font-bold text-brand-blue hover:bg-brand-blue-soft" @click="copyLink(inv)">
                                       Copy Link
                                   </button>
                                   <button class="rounded-md border border-gray-200 px-3 py-1 text-[11px] font-bold text-ink-soft hover:bg-gray-100" @click="resend(inv)">
                                       Resend
                                   </button>
                                   <button class="p-1 text-brand-rose hover:scale-110 transition-transform" @click="cancel(inv)">
                                       🗑️
                                   </button>
                               </div>
                           </td>
                       </tr>
                       <tr v-if="invitations.length === 0">
                           <td colspan="4" class="px-6 py-12 text-center text-sm font-semibold text-ink-soft italic">
                               No pending invitations found.
                           </td>
                       </tr>
                   </tbody>
               </table>
            </div>
        </div>
    </div>

    <!-- Active Teachers Grid -->
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h3 class="font-display text-xl font-bold text-ink">Assigned Teachers</h3>
            <button class="text-xs font-bold text-brand-blue hover:underline" @click="router.push('/admin/accounts?role=teacher')">View All Teachers</button>
        </div>
        
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
             <div v-for="teacher in teachers" :key="teacher.id" class="card-hover cursor-pointer p-5" @click="openTeacherDetails(teacher)">
                 <div class="flex items-start justify-between mb-4">
                    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue-soft/30 text-xl font-bold text-brand-blue">
                        {{ teacher.full_name.charAt(0) }}
                    </div>
                    <span :class="['badge', teacher.account_status === 'active' ? 'badge-green' : 'badge-amber']">
                        {{ teacher.account_status }}
                    </span>
                 </div>
                 <h4 class="font-bold text-ink truncate">{{ teacher.full_name }}</h4>
                 <p class="text-[11px] font-medium text-ink-soft truncate mb-4">{{ teacher.email }}</p>
                 
                 <div class="flex items-center gap-2 pt-4 border-t border-gray-50">
                    <div class="flex-1">
                        <div class="text-[10px] font-bold text-ink-soft uppercase opacity-50">Assigned Sections</div>
                        <div class="text-xs font-bold text-ink">{{ teacher.section_count || 0 }} Sections</div>
                    </div>
                    <div class="rounded-lg bg-surface p-2 text-ink-soft group-hover:text-brand-blue transition-colors">
                        👤
                    </div>
                 </div>
             </div>
        </div>
    </div>
    
    <!-- Teacher Detail Side Panel -->
    <div v-if="selectedTeacher" class="fixed inset-0 z-50 flex items-center justify-end bg-ink/40 backdrop-blur-sm" @click.self="selectedTeacher = null">
        <div class="h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-slide-in">
             <!-- Panel Header -->
             <div class="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md px-8 py-6 flex items-center justify-between">
                 <div class="flex items-center gap-4">
                     <button class="h-8 w-8 flex items-center justify-center rounded-full bg-surface text-ink-soft hover:bg-gray-100 transition-colors" @click="selectedTeacher = null">
                         ←
                     </button>
                     <h3 class="font-display text-xl font-bold text-ink">Teacher Profile</h3>
                 </div>
                 <button class="btn-secondary !py-1.5 !px-4 !text-xs" @click="selectedTeacher = null">Close Panel</button>
             </div>

             <!-- Panel Content -->
             <div class="p-8 space-y-8">
                 <!-- Brief Profile -->
                 <div class="flex flex-col items-center text-center">
                    <div class="h-24 w-24 rounded-3xl bg-gradient-to-br from-brand-blue to-brand-violet flex items-center justify-center text-3xl font-bold text-white shadow-xl mb-4">
                        {{ selectedTeacher.full_name.charAt(0) }}
                    </div>
                    <h2 class="text-2xl font-bold text-ink">{{ selectedTeacher.full_name }}</h2>
                    <div class="mt-1 flex items-center gap-2 justify-center">
                        <span :class="['badge', selectedTeacher.account_status === 'active' ? 'badge-green' : 'badge-amber']">{{ selectedTeacher.account_status }}</span>
                        <span class="text-xs font-bold text-ink-soft">• Verified {{ formatDate(selectedTeacher.created_at) }}</span>
                    </div>
                 </div>

                 <!-- Contact Info -->
                 <div class="card p-6 border-gray-100 shadow-sm space-y-4">
                     <h4 class="text-xs font-bold uppercase tracking-widest text-ink-soft mb-4">Contact & Identity</h4>
                     <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div>
                             <p class="text-[10px] font-bold text-ink-soft uppercase opacity-60 mb-1">Institutional Email</p>
                             <p class="text-sm font-bold text-ink">{{ selectedTeacher.email }}</p>
                         </div>
                         <div>
                             <p class="text-[10px] font-bold text-ink-soft uppercase opacity-60 mb-1">Phone Number</p>
                             <p class="text-sm font-bold text-ink">+63 912 345 6789</p>
                         </div>
                         <div>
                             <p class="text-[10px] font-bold text-ink-soft uppercase opacity-60 mb-1">Unique Account ID</p>
                             <p class="text-sm font-mono font-bold text-ink">USR-{{ selectedTeacher.id }}</p>
                         </div>
                         <div>
                             <p class="text-[10px] font-bold text-ink-soft uppercase opacity-60 mb-1">Department</p>
                             <p class="text-sm font-bold text-ink">Academics</p>
                         </div>
                     </div>
                 </div>

                 <!-- Assigned Sections List -->
                 <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-bold uppercase tracking-widest text-ink-soft">Assigned Sections</h4>
                        <button class="text-[11px] font-bold text-brand-blue" @click="router.push('/admin/sections?teacher_id=' + selectedTeacher.id)">Manage Assignments</button>
                    </div>
                    <div class="grid grid-cols-1 gap-3">
                        <div v-for="i in 2" :key="i" class="flex items-center justify-between p-4 bg-surface rounded-xl border border-gray-100 transition-all hover:border-brand-blue/30">
                            <div class="flex items-center gap-3">
                                <div class="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-xs shadow-sm">🏫</div>
                                <div>
                                    <div class="text-[13px] font-bold text-ink">Grade 6 - Section {{ i === 1 ? 'A' : 'B' }}</div>
                                    <div class="text-[10px] text-ink-soft font-medium">32 Students Enrolled</div>
                                </div>
                            </div>
                            <span class="text-xs">→</span>
                        </div>
                    </div>
                 </div>

                 <!-- Danger Zone -->
                 <div class="pt-6 border-t border-gray-100">
                    <button class="w-full btn-secondary !text-brand-rose hover:!bg-red-50 !py-3" @click="confirmSuspend(selectedTeacher)">
                        {{ selectedTeacher.account_status === 'active' ? 'Suspend Account' : 'Reactivate Account' }}
                    </button>
                    <p class="mt-3 text-center text-[10px] text-ink-soft leading-relaxed px-4">Suspending a teacher account will immediately revoke access to the LMS and notify the user via institutional email.</p>
                 </div>
             </div>
        </div>
    </div>
    
    <!-- Copy Link Toastify Mock -->
    <div v-if="copied" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-ink text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl animate-bounce-in">
        Invitation link copied to clipboard!
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

const form = ref({ full_name: '', email: '', contact_no: '' })
const inviting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const copied = ref(false)
const selectedTeacher = ref<any>(null)

const invitations = computed(() => adminStore.invitations)
const teachers = computed(() => adminStore.accounts.filter(a => a.role === 'teacher'))

async function fetchInvitations() {
    await adminStore.fetchInvitations({ status: 'pending', page: 1, per_page: 5 })
}

async function fetchTeachers() {
    await adminStore.fetchAccounts({ role: 'teacher', page: 1, per_page: 4 })
}

async function submitInvitation() {
    inviting.value = true
    successMsg.value = ''
    errorMsg.value = ''
    try {
        await adminService.inviteTeacher(form.value)
        successMsg.value = 'Invitation sent successfully!'
        form.value = { full_name: '', email: '', contact_no: '' }
        fetchInvitations()
    } catch (err: any) {
        errorMsg.value = err.message
    } finally {
        inviting.value = false
    }
}

function copyLink(inv: any) {
    const link = `${window.location.origin}/register?token=${inv.token}`
    navigator.clipboard.writeText(link)
    copied.value = true
    setTimeout(() => copied.value = false, 3000)
}

async function resend(inv: any) {
    try {
        await adminService.resendInvitation(inv.id)
        alert('Invitation link resent (token refreshed)')
        fetchInvitations()
    } catch (err: any) {
        alert(err.message)
    }
}

async function cancel(inv: any) {
    if (!confirm('Are you sure you want to cancel this invitation?')) return
    try {
        await adminService.cancelInvitation(inv.id)
        fetchInvitations()
    } catch (err: any) {
        alert(err.message)
    }
}

function formatDateShort(date: string) {
    return new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function openTeacherDetails(teacher: any) {
    selectedTeacher.value = teacher
}

async function confirmSuspend(teacher: any) {
    const action = teacher.account_status === 'active' ? 'inactive' : 'active'
    const msg = `Are you sure you want to ${action === 'inactive' ? 'suspend' : 'reactivate'} ${teacher.full_name}?`
    if (!confirm(msg)) return
    
    try {
        await adminService.updateAccountStatus(teacher.id, action, 'Administrative requested status change.')
        selectedTeacher.value.account_status = action
        fetchTeachers()
    } catch (err: any) {
        alert(err.message)
    }
}

onMounted(() => {
    fetchInvitations()
    fetchTeachers()
})
</script>

<style scoped>
.animate-bounce-in {
    animation: bounceIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
    from { opacity: 0; transform: translate(-50%, 20px) scale(0.9); }
    to { opacity: 1; transform: translate(-50%, 0) scale(1); }
}

.animate-slide-in {
    animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0.5; }
    to { transform: translateX(0); opacity: 1; }
}
</style>
