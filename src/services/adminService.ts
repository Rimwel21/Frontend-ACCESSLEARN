import { apiFetch } from '@/lib/api'
import type { 
  AdminDashboardStats, 
  AccountListOut, 
  TeacherInviteOut, 
  SectionOut, 
  AuditLogOut, 
  NotificationOut,
  ReportOut,
  PaginatedResponse 
} from '@/types/admin'

const isMock = () => localStorage.getItem('access_token') === 'mock-admin-token'

export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<AdminDashboardStats> {
    if (isMock()) {
       return {
          total_teachers: 45,
          total_students: 1280,
          active_sections: 52,
          pending_invites: 8,
          activation_rate: 88,
          recent_activity: [
             { id: 1, action: 'Section Created', details: 'Kinder-A-2025', time: '10 mins ago' },
             { id: 2, action: 'Teacher Invited', details: 'Mrs. Maria Clara', time: '45 mins ago' }
          ],
          system_status: 'Optimal',
          last_backup: 'Today, 2:00 AM'
       } as any
    }
    return apiFetch<AdminDashboardStats>('/admin/dashboard')
  },

  // Account Management
  async getAccounts(params: { role?: string, status?: string, search?: string, page: number, per_page: number }): Promise<PaginatedResponse<AccountListOut>> {
    if (isMock()) {
       return {
          total: 2,
          page: 1,
          per_page: 10,
          items: [
             { id: 1, full_name: 'Admin User', email: 'admin@signhear.edu.ph', role: 'admin', account_status: 'active', created_at: new Date().toISOString() },
             { id: 2, full_name: 'Mock Teacher', email: 'teacher@test.com', role: 'teacher', account_status: 'pending', created_at: new Date().toISOString() }
          ]
       } as any
    }
    const query = new URLSearchParams()
    if (params.role) query.append('role', params.role)
    if (params.status) query.append('status', params.status)
    if (params.search) query.append('search', params.search)
    query.append('page', params.page.toString())
    query.append('per_page', params.per_page.toString())
    return apiFetch<PaginatedResponse<AccountListOut>>(`/admin/accounts?${query.toString()}`)
  },

  async updateAccountStatus(accountId: number, status: string, reason?: string): Promise<AccountListOut> {
    return apiFetch<AccountListOut>(`/admin/accounts/${accountId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ account_status: status, reason })
    })
  },

  async deleteAccount(accountId: number): Promise<void> {
    return apiFetch<void>(`/admin/accounts/${accountId}`, { method: 'DELETE' })
  },

  async bulkAction(accountIds: number[], action: string, reason?: string): Promise<any> {
    return apiFetch<any>('/admin/bulk-action', {
      method: 'POST',
      body: JSON.stringify({ account_ids: accountIds, action, reason })
    })
  },

  // Teacher Invitations
  async inviteTeacher(data: { full_name: string, email: string, contact_no?: string }): Promise<TeacherInviteOut> {
    return apiFetch<TeacherInviteOut>('/admin/teachers/invite', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  async getInvitations(params: { status?: string, search?: string, page: number, per_page: number }): Promise<PaginatedResponse<TeacherInviteOut>> {
    if (isMock()) {
       return { total: 0, items: [], page: 1, per_page: 5 } as any
    }
    const query = new URLSearchParams()
    if (params.status) query.append('status', params.status)
    if (params.search) query.append('search', params.search)
    query.append('page', params.page.toString())
    query.append('per_page', params.per_page.toString())
    return apiFetch<PaginatedResponse<TeacherInviteOut>>(`/admin/teachers/invitations?${query.toString()}`)
  },

  async resendInvitation(id: number, note?: string): Promise<TeacherInviteOut> {
    return apiFetch<TeacherInviteOut>(`/admin/teachers/invitations/${id}/resend`, {
      method: 'POST',
      body: JSON.stringify({ note })
    })
  },

  async cancelInvitation(id: number): Promise<TeacherInviteOut> {
    return apiFetch<TeacherInviteOut>(`/admin/teachers/invitations/${id}/cancel`, { method: 'DELETE' })
  },

  // Sections
  async getSections(params: { grade_level?: string, status?: string, section_id?: number, page: number, per_page: number }): Promise<PaginatedResponse<SectionOut>> {
      if (isMock()) {
          return { total: 0, items: [], page: 1, per_page: 20 } as any
      }
      const query = new URLSearchParams()
      if (params.grade_level) query.append('grade_level', params.grade_level)
      if (params.status) query.append('status', params.status)
      query.append('page', params.page.toString())
      query.append('per_page', params.per_page.toString())
      return apiFetch<PaginatedResponse<SectionOut>>(`/admin/sections?${query.toString()}`)
  },

  async createSection(data: any): Promise<SectionOut> {
      return apiFetch<SectionOut>('/admin/sections', {
          method: 'POST',
          body: JSON.stringify(data)
      })
  },

  // Audit Logs
  async getAuditLogs(params: any): Promise<PaginatedResponse<AuditLogOut>> {
      if (isMock()) {
          return { total: 0, items: [], page: 1, per_page: 25 } as any
      }
      const query = new URLSearchParams(params)
      return apiFetch<PaginatedResponse<AuditLogOut>>(`/admin/audit-logs?${query.toString()}`)
  },

  // Notifications
  async getNotifications(params: any): Promise<PaginatedResponse<NotificationOut>> {
      if (isMock()) {
          return { total: 0, items: [], page: 1, per_page: 30 } as any
      }
      const query = new URLSearchParams(params)
      return apiFetch<PaginatedResponse<NotificationOut>>(`/admin/notifications?${query.toString()}`)
  },

  async markNotificationRead(id: number): Promise<NotificationOut> {
      return apiFetch<NotificationOut>(`/admin/notifications/${id}/read`, { method: 'PATCH' })
  }
}
