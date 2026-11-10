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
    name?: string;
    username?: string;
    email?: string;
    role: string;
    account_status: string;
    created_at: string;
    contact_no?: string;
    grade_level?: string;
    section_name?: string;
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
    severity?: 'critical' | 'high' | 'medium' | 'low' | string;
    old_value?: string | null;
    new_value?: string | null;
}

export interface DatabaseStatus {
    active_database: string;
    engine_type: string;
    database_name: string;
    host?: string | null;
    backup_capable: boolean;
    restore_capable: boolean;
    backup_storage_path: string;
    vault_relative_path?: string;
    manifest_path?: string;
    total_backups: number;
    last_backup_time?: string | null;
    last_verified_time?: string | null;
    environment: string;
    production_safeguards_active: boolean;
    status_message: string;
    schedule?: BackupScheduleConfig;
}

export interface BackupScheduleConfig {
    enabled: boolean;
    cadence: 'every_2_weeks' | 'every_1_month' | 'weekly' | 'daily' | 'disabled' | string;
    cadence_human: string;
    last_run_time?: string | null;
    next_run_time?: string | null;
    vault_path: string;
    absolute_vault_path?: string;
    manifest_path: string;
    retention_count: number;
    auto_verify: boolean;
    message: string;
}

export interface BackupItem {
    backup_id: string;
    filename: string;
    created_at: string;
    backup_type: string;
    database_engine: string;
    file_size: number;
    file_size_human: string;
    checksum_sha256: string;
    status: string;
    integrity_status: string;
    created_by_id?: number | null;
    created_by_name?: string | null;
    table_counts?: Record<string, number> | null;
    notes?: string | null;
}

export interface BackupVerifyResult {
    backup_id: string;
    integrity_status: string;
    computed_checksum: string;
    expected_checksum: string;
    checksum_matches: boolean;
    structure_valid: boolean;
    details: string;
    verified_at: string;
}

export interface RestorePreview {
    backup_id: string;
    database_engine: string;
    created_at: string;
    file_size_human: string;
    checksum_sha256: string;
    target_database: string;
    target_environment: string;
    can_restore: boolean;
    restriction_reason?: string | null;
    table_counts?: Record<string, number> | null;
    warnings: string[];
    safety_measures: string[];
    required_confirmation_text: string;
}

export interface RestoreResult {
    backup_id: string;
    status: string;
    message: string;
    restored_at: string;
    pre_restore_safety_backup?: string | null;
    verified_tables?: Record<string, number> | null;
}

export interface DryRunRestoreResult {
    backup_id: string;
    status: string;
    message: string;
    sandbox_verified: boolean;
    table_counts: Record<string, number>;
    duration_ms: number;
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
