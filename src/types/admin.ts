export interface AdminDashboardStats {
    total_teachers: number;
    total_students: number;
    active_sessions: number;
    pending_invitations: number;
    system_health: string;
    recent_activity: any[];
}

export interface AccountListOut {
    id: number;
    full_name: string;
    email: string;
    role: string;
    account_status: string;
    created_at: string;
    section_count?: number;
}

export interface TeacherInviteOut {
    id: number;
    full_name: string;
    email: string;
    token: string;
    status: string;
    expires_at: string;
}

export interface SectionOut {
    id: number;
    name: string;
    grade_level?: string;
    grade_level_id?: number;
    grade_level_name?: string;
    status: string;
    teacher_id?: number;
    teacher_name?: string;
    student_count: number;
    current_count?: number;
}

export interface AuditLogOut {
    id: number;
    user_id?: number;
    role?: string;
    module: string;
    action: string;
    affected_record?: string | null;
    reason?: string | null;
    ip_address?: string | null;
    browser?: string | null;
    os_name?: string | null;
    device_type?: string | null;
    location?: string | null;
    status: string;
    created_at: string;
}

export interface NotificationOut {
    id: number;
    title: string;
    description?: string;
    is_read: boolean;
    created_at: string;
}

export interface ReportOut {
    report_type: string;
    generated_at: string;
    data: any[];
}

export interface PaginatedResponse<T> {
    total: number;
    page: number;
    per_page: number;
    items: T[];
}
