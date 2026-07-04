import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/adminService'
import type { 
  AdminDashboardStats, 
  AccountListOut, 
  TeacherInviteOut, 
  SectionOut 
} from '@/types/admin'

export const useAdminStore = defineStore('admin', () => {
  const stats = ref<AdminDashboardStats | null>(null)
  const accounts = ref<AccountListOut[]>([])
  const invitations = ref<TeacherInviteOut[]>([])
  const sections = ref<SectionOut[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalAccounts = ref(0)
  const totalInvitations = ref(0)
  const totalSections = ref(0)

  async function fetchDashboardStats() {
    loading.value = true
    try {
      stats.value = await adminService.getDashboardStats()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchAccounts(params: any) {
    loading.value = true
    try {
      const res = await adminService.getAccounts(params)
      accounts.value = res.items
      totalAccounts.value = res.total
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchInvitations(params: any) {
    loading.value = true
    try {
      const res = await adminService.getInvitations(params)
      invitations.value = res.items
      totalInvitations.value = res.total
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    stats, accounts, invitations, sections, loading, error,
    totalAccounts, totalInvitations, totalSections,
    fetchDashboardStats, fetchAccounts, fetchInvitations
  }
})
