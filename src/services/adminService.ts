import { apiFetch, apiUrl } from '@/lib/api'
import type { 
  AdminDashboardStats, 
  AccountListOut, 
  TeacherInviteOut, 
  SectionOut, 
  AuditLogOut, 
  NotificationOut,
  ReportOut,
  PaginatedResponse,
  DatabaseStatus,
  BackupItem,
  BackupVerifyResult,
  RestorePreview,
  RestoreResult,
  DryRunRestoreResult
} from '@/types/admin'

export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<AdminDashboardStats> {
    return apiFetch<AdminDashboardStats>('/admin/dashboard')
  },

  // Account Management
  async getAccounts(params: { role?: string, status?: string, search?: string, page: number, per_page: number }): Promise<PaginatedResponse<AccountListOut>> {
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
    return apiFetch<any>('/admin/accounts/bulk-action', {
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
      const query = new URLSearchParams(params)
      return apiFetch<PaginatedResponse<AuditLogOut>>(`/admin/audit-logs?${query.toString()}`)
  },

  // Notifications
  async getNotifications(params: any): Promise<PaginatedResponse<NotificationOut>> {
      const query = new URLSearchParams(params)
      return apiFetch<PaginatedResponse<NotificationOut>>(`/admin/notifications?${query.toString()}`)
  },

  async markNotificationRead(id: number): Promise<NotificationOut> {
      return apiFetch<NotificationOut>(`/admin/notifications/${id}/read`, { method: 'PATCH' })
  },

  // Backup and Restore
  async getBackupStatus(): Promise<DatabaseStatus> {
    return apiFetch<DatabaseStatus>('/admin/backup/status')
  },

  async getBackups(): Promise<BackupItem[]> {
    return apiFetch<BackupItem[]>('/admin/backup/list')
  },

  async createBackup(data?: { notes?: string; backup_type?: string }): Promise<BackupItem> {
    return apiFetch<BackupItem>('/admin/backup/create', {
      method: 'POST',
      body: JSON.stringify(data ?? {})
    })
  },

  async verifyBackup(backupId: string): Promise<BackupVerifyResult> {
    return apiFetch<BackupVerifyResult>(`/admin/backup/${backupId}/verify`, {
      method: 'POST'
    })
  },

  async downloadBackup(backupId: string): Promise<void> {
    const token = localStorage.getItem('access_token')
    const url = apiUrl(`/admin/backup/${backupId}/download`)
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) {
      throw new Error('Failed to download backup file')
    }
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    const disposition = response.headers.get('content-disposition')
    let filename = `${backupId}.db`
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/)
      if (match && match[1]) filename = match[1]
    }
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
  },

  async previewRestore(backupId: string): Promise<RestorePreview> {
    return apiFetch<RestorePreview>(`/admin/backup/${backupId}/preview`, {
      method: 'POST'
    })
  },

  async dryRunRestore(backupId: string): Promise<DryRunRestoreResult> {
    return apiFetch<DryRunRestoreResult>(`/admin/backup/${backupId}/test-restore`, {
      method: 'POST'
    })
  },

  async restoreBackup(backupId: string, confirmationText: string): Promise<RestoreResult> {
    return apiFetch<RestoreResult>(`/admin/backup/${backupId}/restore`, {
      method: 'POST',
      body: JSON.stringify({ confirmation_text: confirmationText })
    })
  }
}
