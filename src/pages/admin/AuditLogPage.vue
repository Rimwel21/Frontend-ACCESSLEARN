<template>
  <div class="space-y-6">
    <!-- Top Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-ink">Administrator Audit Log & Recovery</h2>
        <p class="mt-1 text-xs sm:text-sm text-ink-soft">
          Continuous security activity monitoring, threat triage, and cryptographic database backup and restore.
        </p>
      </div>

      <!-- Header Action Controls -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          v-if="activeTab === 'events'"
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-brand-teal/30 bg-white text-ink text-xs font-semibold hover:bg-surface transition-all shadow-xs"
          :disabled="loading"
          @click="fetchLogs"
        >
          <svg class="h-3.5 w-3.5 text-ink-soft" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Logs</span>
        </button>

        <button
          v-if="activeTab === 'backup'"
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-brand-teal/30 bg-white text-ink text-xs font-semibold hover:bg-surface transition-all shadow-xs"
          :disabled="backupLoading"
          @click="loadBackupData"
        >
          <svg class="h-3.5 w-3.5 text-ink-soft" :class="{ 'animate-spin': backupLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Backups</span>
        </button>

        <button
          v-if="activeTab === 'backup'"
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-bold hover:bg-[#23584d] transition-all shadow-xs"
          @click="openCreateBackupModal"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Database Backup</span>
        </button>
      </div>
    </div>

    <!-- Alert / Status Banner -->
    <div
      v-if="feedbackMsg"
      :class="[
        'flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium shadow-xs transition-all',
        feedbackType === 'error' ? 'border border-red-200 bg-red-50 text-red-900' :
        feedbackType === 'warning' ? 'border border-amber-200 bg-amber-50 text-amber-950' :
        'border border-emerald-200 bg-emerald-50 text-emerald-900'
      ]"
      role="alert"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <svg v-if="feedbackType === 'error'" class="h-4 w-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <svg v-else-if="feedbackType === 'warning'" class="h-4 w-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <svg v-else class="h-4 w-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
        <span class="truncate">{{ feedbackMsg }}</span>
      </div>
      <button
        type="button"
        class="flex-shrink-0 text-xs font-bold opacity-60 hover:opacity-100 px-1"
        aria-label="Dismiss message"
        @click="feedbackMsg = ''"
      >
        ✕
      </button>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-brand-teal/20 gap-3">
      <button
        type="button"
        :class="[
          'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all',
          activeTab === 'events'
            ? 'border-brand-blue text-brand-blue'
            : 'border-transparent text-ink-soft hover:text-ink'
        ]"
        @click="activeTab = 'events'"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Security Events & Audit Logs</span>
        <span class="ml-1 rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-[11px] font-mono font-bold text-brand-blue">
          {{ totalLogs }}
        </span>
      </button>

      <button
        type="button"
        :class="[
          'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all',
          activeTab === 'backup'
            ? 'border-brand-blue text-brand-blue'
            : 'border-transparent text-ink-soft hover:text-ink'
        ]"
        @click="switchTabToBackup"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7h16m-5 4v6m-4-6v6" />
        </svg>
        <span>Database Backup & Restore</span>
        <span v-if="dbStatus" class="ml-1 rounded-md bg-brand-blue-soft/50 border border-brand-teal/30 px-2 py-0.5 text-[10px] font-mono font-bold text-brand-blue uppercase tracking-wider">
          {{ dbStatus.engine_type }}
        </span>
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: SECURITY EVENTS & AUDIT LOGS                                      -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'events'" class="space-y-5">
      <!-- Filter Bar -->
      <section class="card p-4 sm:p-5">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <input
            v-model.trim="filters.search"
            class="input-field sm:col-span-2 xl:col-span-2"
            placeholder="Search actor, activity, or IP..."
            @input="debouncedFetch"
          />

          <!-- Severity Filter -->
          <select v-model="filters.severity" class="input-field" @change="applyFilters">
            <option value="">All Severities</option>
            <option value="critical">Critical Severity</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low / Informational</option>
          </select>

          <select v-model="filters.role" class="input-field" @change="applyFilters">
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>

          <select v-model="filters.activityType" class="input-field" @change="applyFilters">
            <option value="">All Activity Types</option>
            <option v-for="type in activityTypes" :key="type" :value="type">{{ type }}</option>
          </select>

          <select v-model="filters.status" class="input-field" @change="applyFilters">
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          <div class="grid gap-2 sm:col-span-2 lg:col-span-2 xl:col-span-1">
            <input
              v-model="filters.date_from"
              class="input-field !py-1.5 text-xs"
              type="date"
              title="Filter from date"
              @change="applyFilters"
            />
          </div>
        </div>

        <div class="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-brand-teal/15 pt-3 text-xs text-ink-soft">
          <div class="flex items-center gap-3">
            <span class="font-bold text-ink">Severity Legend:</span>
            <span class="inline-flex items-center gap-1 text-[11px] font-bold text-red-900 bg-red-100 px-2 py-0.5 rounded border border-red-300">
              <span class="h-2 w-2 rounded-full bg-red-600"></span> CRITICAL
            </span>
            <span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              <span class="h-2 w-2 rounded-full bg-amber-500"></span> HIGH
            </span>
            <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-900 bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
              MEDIUM
            </span>
            <span class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              LOW
            </span>
          </div>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="font-bold text-brand-blue hover:underline"
            @click="resetFilters"
          >
            Reset Filters
          </button>
        </div>
      </section>

      <!-- Audit Log Table -->
      <section ref="auditTable" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[940px] border-collapse">
            <thead>
              <tr class="bg-surface border-b border-brand-teal/20">
                <th class="table-th w-28">Severity</th>
                <th class="table-th w-40">Date & Time</th>
                <th class="table-th">User / Actor</th>
                <th class="table-th w-32">IP Address</th>
                <th class="table-th w-28">Role</th>
                <th class="table-th">Activity Details</th>
                <th class="table-th w-24">Status</th>
                <th class="table-th w-16 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody :key="filters.page" class="divide-y divide-gray-100">
              <template v-if="!loading">
                <tr
                  v-for="log in filteredLogs"
                  :key="log.id"
                  :class="[
                    'transition-colors cursor-pointer',
                    getRowSeverityClass(log)
                  ]"
                  @click="openInspectModal(log)"
                >
                  <!-- Severity Column -->
                  <td class="table-td">
                    <span :class="getSeverityBadgeClass(log)" :title="`Severity: ${computeSeverity(log).toUpperCase()}`">
                      <svg v-if="computeSeverity(log) === 'critical'" class="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clip-rule="evenodd"/>
                      </svg>
                      <svg v-else-if="computeSeverity(log) === 'high'" class="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      <svg v-else-if="computeSeverity(log) === 'medium'" class="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                      </svg>
                      <span v-else class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                      <span>{{ computeSeverity(log).toUpperCase() }}</span>
                    </span>
                  </td>

                  <!-- Date & Time -->
                  <td class="table-td">
                    <div class="font-mono text-xs font-bold text-ink">{{ formatDate(log.created_at) }}</div>
                    <div class="font-mono text-[11px] text-ink-soft">{{ formatTime(log.created_at) }}</div>
                  </td>

                  <!-- User -->
                  <td class="table-td font-bold text-ink">
                    <div>{{ logUser(log) }}</div>
                    <div v-if="log.user_id" class="font-mono text-[10px] text-ink-soft">ID: #{{ log.user_id }}</div>
                  </td>

                  <!-- IP Address -->
                  <td class="table-td">
                    <span v-if="log.ip_address" class="font-mono text-xs font-semibold text-ink" :title="`Recorded IP: ${log.ip_address}`">
                      {{ log.ip_address }}
                    </span>
                    <span v-else class="text-xs text-ink-soft italic">Unavailable</span>
                  </td>

                  <!-- Role -->
                  <td class="table-td">
                    <span class="badge badge-blue">{{ roleLabel(log.role) }}</span>
                  </td>

                  <!-- Activity -->
                  <td class="table-td">
                    <div class="text-sm font-bold text-ink">{{ activityLabel(log) }}</div>
                    <div class="mt-0.5 text-[11px] font-semibold text-ink-soft flex items-center gap-1.5">
                      <span class="rounded bg-surface px-1.5 py-0.2 border border-brand-teal/20 font-mono">{{ log.module }}</span>
                      <span v-if="log.reason" class="truncate max-w-[280px]" :title="log.reason">"{{ log.reason }}"</span>
                    </div>
                  </td>

                  <!-- Status -->
                  <td class="table-td">
                    <span :class="['badge', log.status === 'success' ? 'badge-green' : 'badge-red']">
                      {{ log.status }}
                    </span>
                  </td>

                  <!-- Inspect Action -->
                  <td class="table-td text-right">
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-ink-soft hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
                      title="Inspect full audit record"
                      @click.stop="openInspectModal(log)"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </template>

              <!-- Empty State -->
              <tr v-if="!loading && filteredLogs.length === 0">
                <td colspan="8" class="px-6 py-16 text-center text-sm font-bold text-ink-soft">
                  <div class="text-3xl mb-2">📋</div>
                  <div>No audit log records match the current filters.</div>
                  <button
                    type="button"
                    class="mt-3 px-3.5 py-1.5 rounded-lg border border-brand-teal/30 bg-white text-ink text-xs font-semibold hover:bg-surface transition-all"
                    @click="resetFilters"
                  >
                    Clear Filters
                  </button>
                </td>
              </tr>

              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="8" class="px-6 py-16 text-center text-sm font-bold text-ink-soft">
                  <div class="animate-spin text-2xl mb-2">↻</div>
                  <div>Loading secure audit records from server...</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div class="flex flex-col gap-3 border-t border-brand-teal/20 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <label class="flex items-center justify-between gap-2 text-xs font-bold text-ink sm:justify-start">
            <span>Rows per page</span>
            <select v-model.number="filters.per_page" class="input-field !min-h-9 !w-20 !px-2 !py-1 text-sm" @change="changePageSize">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </label>
          <div class="text-[11px] font-bold uppercase tracking-widest text-ink-soft">
            Showing {{ pageStart }}-{{ pageEnd }} of {{ totalLogs }} records · Page {{ filters.page }} of {{ totalPages }}
          </div>
          <div class="grid w-full grid-cols-2 gap-2 sm:w-auto">
            <button
              class="px-4 py-2 rounded-lg border border-brand-teal/30 bg-white text-ink text-xs font-semibold hover:bg-surface transition-all disabled:opacity-50 disabled:cursor-not-allowed justify-center inline-flex items-center"
              :disabled="!canGoPrevious || loading"
              @click="changePage(-1)"
            >
              Previous
            </button>
            <button
              class="px-4 py-2 rounded-lg border border-brand-teal/30 bg-white text-ink text-xs font-semibold hover:bg-surface transition-all disabled:opacity-50 disabled:cursor-not-allowed justify-center inline-flex items-center"
              :disabled="!canGoNext || loading"
              @click="changePage(1)"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 2: DATABASE BACKUP & RESTORE                                         -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'backup'" class="space-y-6">
      <!-- 3-Column Structured Architecture KPI Grid -->
      <section class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Card 1: Active Database Architecture -->
        <article class="card p-5 border-l-4 border-l-brand-blue flex flex-col justify-between h-full min-h-[168px] shadow-xs">
          <div>
            <div class="flex items-center justify-between">
              <p class="text-[11px] font-black uppercase tracking-widest text-ink-soft">Active Database Architecture</p>
              <span
                v-if="dbStatus?.engine_type === 'sqlite'"
                class="rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-mono px-2 py-0.5 font-bold border border-emerald-300"
              >
                SQLITE LOCAL
              </span>
              <span
                v-else-if="dbStatus?.engine_type === 'postgresql'"
                class="rounded-md bg-indigo-50 text-indigo-900 text-[10px] font-mono px-2 py-0.5 font-bold border border-indigo-200"
              >
                SUPABASE CLOUD
              </span>
            </div>
            <div class="mt-2.5 font-display text-2xl font-bold text-ink">
              {{ dbStatus?.active_database || 'PostgreSQL' }}
            </div>
            <p class="mt-0.5 text-xs font-semibold text-brand-blue truncate" :title="dbStatus?.database_name">
              Catalog: {{ dbStatus?.database_name || 'postgres' }}
            </p>
          </div>

          <div class="mt-4 border-t border-brand-teal/15 pt-2.5 text-xs text-ink-soft space-y-1">
            <div class="flex items-center gap-1.5 truncate" :title="dbStatus?.host || 'localhost'">
              <svg class="h-3.5 w-3.5 text-ink-soft flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <span class="font-bold text-ink">Host:</span>
              <span class="truncate">{{ dbStatus?.host || 'localhost' }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-[11px] text-ink-soft">
              <svg class="h-3.5 w-3.5 text-ink-soft flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span class="font-bold text-ink">Vault:</span>
              <span class="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink border border-brand-teal/20">backups/</span>
            </div>
          </div>
        </article>

        <!-- Card 2: Backup Readiness & Cadence -->
        <article class="card p-5 border-l-4 border-l-emerald-600 flex flex-col justify-between h-full min-h-[168px] shadow-xs">
          <div>
            <div class="flex items-center justify-between">
              <p class="text-[11px] font-black uppercase tracking-widest text-ink-soft">Backup Readiness</p>
              <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                <span class="h-2 w-2 rounded-full bg-emerald-600"></span> Supported & Active
              </span>
            </div>
            <div class="mt-2.5 font-display text-2xl font-bold text-ink">
              {{ backups.length }} Snapshot{{ backups.length === 1 ? '' : 's' }}
            </div>
            <p class="mt-0.5 text-xs font-medium text-ink-soft">
              Protected snapshots with SHA-256 integrity
            </p>
          </div>

          <div class="mt-4 border-t border-brand-teal/15 pt-2.5 text-xs text-ink-soft">
            <div v-if="dbStatus?.last_backup_time" class="flex items-center gap-1.5 truncate">
              <svg class="h-3.5 w-3.5 text-ink-soft flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-bold text-ink">Latest:</span>
              <span>{{ formatDate(dbStatus.last_backup_time) }} · {{ formatTime(dbStatus.last_backup_time) }}</span>
            </div>
            <div v-else class="text-ink-soft italic">No backups recorded yet.</div>
          </div>
        </article>

        <!-- Card 3: Restoration Governance & Safeguards -->
        <article class="card p-5 border-l-4 border-l-amber-500 sm:col-span-2 lg:col-span-1 flex flex-col justify-between h-full min-h-[168px] shadow-xs">
          <div>
            <div class="flex items-center justify-between">
              <p class="text-[11px] font-black uppercase tracking-widest text-ink-soft">Recovery Governance</p>
              <span
                v-if="dbStatus?.restore_capable"
                class="rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-mono px-2 py-0.5 font-bold border border-emerald-300"
              >
                SAFE RESTORE READY
              </span>
              <span
                v-else
                class="rounded-md bg-amber-50 text-amber-900 text-[10px] font-mono px-2 py-0.5 font-bold border border-amber-300"
              >
                SAFEGUARDS ACTIVE
              </span>
            </div>
            <div class="mt-2.5 font-display text-2xl font-bold text-ink">
              {{ dbStatus?.restore_capable ? 'Local Restore' : 'Production Policy' }}
            </div>
            <p class="mt-0.5 text-xs font-medium text-ink-soft">
              {{ dbStatus?.restore_capable ? 'Pre-restore rollback snapshots active' : 'Multi-tenant live overwrite protected' }}
            </p>
          </div>

          <div class="mt-4 border-t border-brand-teal/15 pt-2.5 text-xs text-ink-soft flex items-center gap-1.5">
            <svg class="h-3.5 w-3.5 text-ink-soft flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span><strong class="text-ink">Sandbox Dry-Run:</strong> Available for all snapshots</span>
          </div>
        </article>
      </section>

      <!-- Governance Notice Banner -->
      <div v-if="dbStatus?.status_message" class="rounded-xl border border-sky-200 bg-sky-50/70 p-4 shadow-xs flex items-start gap-3">
        <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 mt-0.5">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="text-xs text-sky-950 leading-relaxed min-w-0 flex-1">
          <strong class="font-bold text-sky-900">Operational Governance Notice:</strong> {{ dbStatus.status_message }}
        </div>
      </div>

      <!-- Automated Backup Cadence & Storage Vault Section -->
      <section class="card overflow-hidden border border-brand-teal/20 bg-gradient-to-br from-white via-surface/30 to-brand-blue-soft/20 shadow-xs">
        <div class="border-b border-brand-teal/15 bg-white/70 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue text-white shadow-xs">
              <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-display text-sm font-bold text-ink">Automated Backup Cadence & Storage Vault</h3>
              <p class="text-xs text-ink-soft">Configured automatic snapshot schedule, protected physical vault location, and restoration workflow.</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono uppercase tracking-wide border',
                scheduleCadence !== 'disabled'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              ]"
            >
              <span class="h-2 w-2 rounded-full" :class="scheduleCadence !== 'disabled' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
              {{ scheduleCadence !== 'disabled' ? 'Auto-Backup: Active' : 'Auto-Backup: Paused' }}
            </span>
            <button
              type="button"
              class="h-8 px-3 rounded-lg bg-white border border-brand-teal/30 hover:bg-surface text-ink text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
              :disabled="runningScheduleNow"
              @click="triggerScheduleNow"
            >
              <svg class="h-3.5 w-3.5 text-brand-blue" :class="{ 'animate-spin': runningScheduleNow }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{{ runningScheduleNow ? 'Running...' : 'Run Scheduled Now' }}</span>
            </button>
          </div>
        </div>

        <div class="p-5 grid gap-5 grid-cols-1 lg:grid-cols-12">
          <!-- Left: Cadence Controls & Countdown (5 cols) -->
          <div class="lg:col-span-5 space-y-4 rounded-xl border border-brand-teal/20 bg-white p-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                Automated Cadence Frequency
              </label>
              <div class="flex items-center gap-2">
                <select
                  v-model="scheduleCadence"
                  class="input-field !h-10 text-xs font-semibold flex-1"
                  :disabled="updatingSchedule"
                  @change="handleCadenceChange"
                >
                  <option value="every_2_weeks">Every 2 Weeks (Recommended)</option>
                  <option value="every_1_month">Every 1 Month</option>
                  <option value="weekly">Weekly (Every 7 Days)</option>
                  <option value="daily">Daily</option>
                  <option value="disabled">Manual Only (Disable Auto)</option>
                </select>
                <span v-if="updatingSchedule" class="text-xs text-brand-blue font-bold animate-pulse">Saving...</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              <div class="rounded-lg bg-surface/70 border border-brand-teal/15 p-2.5">
                <div class="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Next Scheduled Snapshot</div>
                <div class="font-mono text-xs font-bold text-ink mt-1 truncate" :title="scheduleConfig?.next_run_time || 'N/A'">
                  {{ scheduleConfig?.next_run_time ? formatDate(scheduleConfig.next_run_time) : 'Manual Only' }}
                </div>
                <div class="text-[11px] text-ink-soft truncate font-mono">
                  {{ scheduleConfig?.next_run_time ? formatTime(scheduleConfig.next_run_time) : 'No timer' }}
                </div>
              </div>

              <div class="rounded-lg bg-surface/70 border border-brand-teal/15 p-2.5">
                <div class="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Last Execution</div>
                <div class="font-mono text-xs font-bold text-ink mt-1 truncate" :title="scheduleConfig?.last_run_time || 'None'">
                  {{ scheduleConfig?.last_run_time ? formatDate(scheduleConfig.last_run_time) : 'None recorded' }}
                </div>
                <div class="text-[11px] text-ink-soft truncate font-mono">
                  {{ scheduleConfig?.last_run_time ? formatTime(scheduleConfig.last_run_time) : 'Awaiting first run' }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 text-[11px] bg-emerald-50/70 text-emerald-900 border border-emerald-200/80 rounded-lg p-2.5">
              <svg class="h-4 w-4 text-emerald-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Automated verification: Every snapshot calculates and records a SHA-256 integrity hash automatically.</span>
            </div>
          </div>

          <!-- Right: Physical Storage Vault & Restoration Guide (7 cols) -->
          <div class="lg:col-span-7 space-y-3 rounded-xl border border-brand-teal/20 bg-white p-4">
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-ink-soft">
                Where Backups Are Saved & How Admin Restores Them
              </h4>
            </div>

            <!-- Path Badges -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div class="rounded-lg bg-surface/70 border border-brand-teal/15 p-2.5 space-y-1">
                <div class="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Storage Vault Location</div>
                <div class="font-mono text-xs font-bold text-ink flex items-center gap-1.5">
                  <span class="rounded bg-brand-blue-soft/50 text-brand-blue px-1.5 py-0.5 border border-brand-teal/30">./backups/</span>
                </div>
                <div class="text-[10px] text-ink-soft truncate" :title="scheduleConfig?.absolute_vault_path || 'Server Project Root / backups'">
                  {{ scheduleConfig?.absolute_vault_path || 'Server local vault directory' }}
                </div>
              </div>

              <div class="rounded-lg bg-surface/70 border border-brand-teal/15 p-2.5 space-y-1">
                <div class="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Manifest & Artifacts</div>
                <div class="font-mono text-xs font-bold text-ink truncate">
                  <span class="rounded bg-surface text-ink px-1.5 py-0.5 border border-brand-teal/20">backups/manifest.json</span>
                </div>
                <div class="text-[10px] text-ink-soft">
                  Files: <span class="font-mono">backup_YYYYMMDD_*.db</span>
                </div>
              </div>
            </div>

            <!-- 3-Step Restoration Instructions -->
            <div class="rounded-lg border border-sky-200/80 bg-sky-50/50 p-3 text-xs space-y-2">
              <div class="font-bold text-sky-950 flex items-center gap-1.5">
                <svg class="h-4 w-4 text-sky-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Administrator Restoration Instructions:</span>
              </div>
              <ol class="list-decimal list-inside space-y-1 text-sky-950 pl-1 text-[11px] leading-relaxed">
                <li><strong>Cryptographic Check:</strong> Click <span class="font-semibold text-emerald-800">Verify</span> on any snapshot in the table below to confirm the SHA-256 hash matches the recorded manifest artifact.</li>
                <li><strong>Sandbox Dry-Run:</strong> Click <span class="font-semibold text-sky-800">Dry-Run</span> to test table decompression and structure inside an isolated temporary sandbox without modifying live data.</li>
                <li><strong>Guarded Live Restore:</strong> Click <span class="font-semibold text-rose-700">Restore</span> and type <span class="font-mono bg-white px-1 py-0.2 rounded border border-rose-300 text-rose-800 font-bold">RESTORE</span>. The system automatically creates a pre-restore safety snapshot before applying recovery.</li>
                <li><strong>Offline Disaster Recovery:</strong> If server access is lost, copy the raw <span class="font-mono bg-white px-1 py-0.2 rounded border border-sky-300 text-sky-900">.db</span> file directly from <span class="font-mono">./backups/</span> to replace <span class="font-mono">local.db</span>.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <!-- Backup History Section -->
      <section class="card overflow-hidden">
        <div class="border-b border-brand-teal/20 bg-surface/40 px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="font-display text-base font-bold text-ink">Backup History & Artifacts</h3>
            <p class="text-xs text-ink-soft">Cryptographically validated database snapshots with isolated restoration controls.</p>
          </div>

          <div class="flex items-center gap-2.5 w-full sm:w-auto">
            <!-- Search Bar with SVG Icon -->
            <div class="relative w-full sm:w-60">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-ink-soft">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                v-model.trim="backupSearch"
                class="input-field !h-9 !py-1.5 !pl-8.5 !pr-3 text-xs w-full"
                placeholder="Search by ID or notes..."
              />
            </div>

            <!-- Refresh Button -->
            <button
              type="button"
              class="h-9 px-3 rounded-lg border border-brand-teal/30 bg-white text-ink text-xs font-semibold hover:bg-surface transition-all shadow-xs shrink-0 inline-flex items-center gap-1.5"
              :disabled="backupLoading"
              @click="loadBackupData"
            >
              <svg class="h-3.5 w-3.5 text-ink-soft" :class="{ 'animate-spin': backupLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[980px] border-collapse">
            <thead>
              <tr class="bg-surface border-b border-brand-teal/20">
                <th class="table-th w-64">Backup Identifier</th>
                <th class="table-th w-36">Date Created</th>
                <th class="table-th w-24">Engine</th>
                <th class="table-th w-24">Size</th>
                <th class="table-th w-24">Status</th>
                <th class="table-th w-28">Integrity</th>
                <th class="table-th w-36">Tables</th>
                <th class="table-th text-right w-80">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <template v-if="!backupLoading">
                <tr
                  v-for="b in filteredBackups"
                  :key="b.backup_id"
                  class="transition-colors hover:bg-surface/50"
                >
                  <!-- Backup ID -->
                  <td class="table-td">
                    <div class="flex items-center gap-1.5">
                      <span class="font-mono text-xs font-bold text-ink truncate max-w-[210px]" :title="b.backup_id">
                        {{ b.backup_id }}
                      </span>
                      <!-- Standard SVG Copy Button with Feedback -->
                      <button
                        type="button"
                        class="text-ink-soft hover:text-brand-blue p-1 rounded-md hover:bg-brand-blue/10 transition-colors flex items-center justify-center h-6 w-6"
                        :title="copiedId === b.backup_id ? 'Copied to clipboard!' : 'Copy full Backup ID'"
                        @click="copyText(b.backup_id)"
                      >
                        <svg v-if="copiedId === b.backup_id" class="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <svg v-else class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                      </button>
                    </div>
                    <div v-if="b.notes" class="text-[11px] text-ink-soft italic truncate max-w-[220px] mt-0.5" :title="b.notes">
                      "{{ b.notes }}"
                    </div>
                  </td>

                  <!-- Date Created -->
                  <td class="table-td">
                    <div class="font-mono text-xs font-bold text-ink">{{ formatDate(b.created_at) }}</div>
                    <div class="font-mono text-[11px] text-ink-soft">{{ formatTime(b.created_at) }}</div>
                  </td>

                  <!-- Engine -->
                  <td class="table-td">
                    <span class="rounded-md bg-brand-blue-soft/50 border border-brand-teal/30 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-blue uppercase">
                      {{ b.database_engine }}
                    </span>
                  </td>

                  <!-- Size -->
                  <td class="table-td font-mono text-xs font-semibold text-ink">
                    {{ b.file_size_human }}
                  </td>

                  <!-- Status -->
                  <td class="table-td">
                    <span
                      :class="[
                        'rounded-full px-2.5 py-0.5 text-[11px] font-mono font-semibold border',
                        b.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      ]"
                    >
                      {{ b.status }}
                    </span>
                  </td>

                  <!-- Integrity -->
                  <td class="table-td">
                    <span
                      v-if="b.integrity_status === 'verified'"
                      class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300"
                    >
                      <svg class="h-3 w-3 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </span>
                    <span
                      v-else-if="b.integrity_status === 'corrupted'"
                      class="inline-flex items-center gap-1 text-[11px] font-bold text-red-900 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-300"
                    >
                      <svg class="h-3 w-3 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Corrupted
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300"
                    >
                      Unverified
                    </span>
                  </td>

                  <!-- Tables -->
                  <td class="table-td">
                    <div v-if="b.table_counts" class="text-xs">
                      <span class="rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] font-bold text-ink border border-brand-teal/20 inline-block">
                        {{ Object.keys(b.table_counts).length }} Tables
                      </span>
                      <span class="text-[10px] text-ink-soft block truncate max-w-[150px] mt-0.5" :title="formatTableSummary(b.table_counts)">
                        {{ formatTableSummary(b.table_counts) }}
                      </span>
                    </div>
                    <span v-else class="text-xs text-ink-soft italic">N/A</span>
                  </td>

                  <!-- Standard Action Buttons (Uniform h-8 height, rounded-lg, crisp SVGs, no wrapping) -->
                  <td class="table-td text-right">
                    <div class="flex items-center justify-end gap-1.5 flex-nowrap">
                      <!-- 1. Verify Action -->
                      <button
                        type="button"
                        class="h-8 px-2.5 rounded-lg border border-brand-teal/40 bg-white text-ink hover:bg-brand-blue/[0.08] hover:text-brand-blue hover:border-brand-blue text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                        :disabled="actionLoading[b.backup_id] !== undefined"
                        title="Verify SHA-256 digest and database structure"
                        @click="handleVerify(b.backup_id)"
                      >
                        <svg v-if="actionLoading[b.backup_id] === 'verify'" class="animate-spin h-3.5 w-3.5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <svg v-else class="h-3.5 w-3.5 text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Verify</span>
                      </button>

                      <!-- 2. Dry-Run Sandbox Simulation -->
                      <button
                        type="button"
                        class="h-8 px-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-400 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                        :disabled="actionLoading[b.backup_id] !== undefined"
                        title="Test restore in an isolated sandbox without altering live data"
                        @click="handleDryRun(b.backup_id)"
                      >
                        <svg v-if="actionLoading[b.backup_id] === 'dryrun'" class="animate-spin h-3.5 w-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <svg v-else class="h-3.5 w-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span>Dry-Run</span>
                      </button>

                      <!-- 3. Download Action -->
                      <button
                        type="button"
                        class="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-ink text-xs font-semibold inline-flex items-center gap-1 transition-all shadow-xs shrink-0"
                        title="Download authorized backup file"
                        @click="handleDownload(b.backup_id)"
                      >
                        <svg class="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span class="hidden sm:inline">Export</span>
                      </button>

                      <!-- 4. Restore Action -->
                      <button
                        type="button"
                        class="h-8 px-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                        title="Initiate safe restoration workflow"
                        @click="openRestoreModal(b)"
                      >
                        <svg class="h-3.5 w-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Restore</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Empty Backups State -->
              <tr v-if="!backupLoading && filteredBackups.length === 0">
                <td colspan="8" class="px-6 py-14 text-center text-sm font-bold text-ink-soft">
                  <div class="text-3xl mb-2">💾</div>
                  <div>No backup artifacts recorded yet.</div>
                  <button
                    type="button"
                    class="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-bold hover:bg-[#23584d] transition-all shadow-xs"
                    @click="openCreateBackupModal"
                  >
                    Create First Backup
                  </button>
                </td>
              </tr>

              <!-- Loading State -->
              <tr v-if="backupLoading">
                <td colspan="8" class="px-6 py-14 text-center text-sm font-bold text-ink-soft">
                  <div class="animate-spin text-2xl mb-2">↻</div>
                  <div>Loading backup manifest...</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: CREATE BACKUP                                                     -->
    <!-- ========================================================================= -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs bg-ink/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue-soft/50 text-brand-blue">
              <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 class="font-display text-lg font-bold text-ink">Create Database Snapshot</h3>
          </div>
          <button type="button" class="text-ink-soft hover:text-ink font-bold" @click="showCreateModal = false">✕</button>
        </div>

        <div class="space-y-3 text-sm text-ink-soft">
          <p>
            An atomic, transactionally consistent snapshot will be captured from the active
            <strong class="text-ink">{{ dbStatus?.active_database }}</strong> database.
          </p>

          <div class="rounded-xl border border-brand-teal/20 bg-surface/70 p-3.5 space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-ink-soft">Engine:</span>
              <span class="font-bold text-ink uppercase">{{ dbStatus?.engine_type }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-soft">Catalog:</span>
              <span class="font-semibold text-ink">{{ dbStatus?.database_name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-soft">Integrity Check:</span>
              <span class="text-emerald-700 font-bold">Automatic SHA-256 calculation</span>
            </div>
          </div>

          <label class="block space-y-1">
            <span class="text-xs font-bold text-ink">Administrative Notes (Optional)</span>
            <input
              v-model.trim="newBackupNotes"
              class="input-field"
              placeholder="e.g. Pre-maintenance security baseline snapshot"
              maxlength="200"
            />
          </label>
        </div>

        <div class="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
            :disabled="creatingBackup"
            @click="showCreateModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-bold hover:bg-[#23584d] transition-all shadow-xs disabled:opacity-50"
            :disabled="creatingBackup"
            @click="executeCreateBackup"
          >
            <span v-if="creatingBackup" class="animate-spin text-xs">↻</span>
            <span>{{ creatingBackup ? 'Capturing Snapshot...' : 'Generate Backup Now' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: SAFE RESTORATION WIZARD                                           -->
    <!-- ========================================================================= -->
    <div
      v-if="showRestoreModal && selectedBackupForRestore"
      class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <!-- Title & Close -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 class="font-display text-lg font-bold text-ink">Database Restoration Workflow</h3>
          </div>
          <button type="button" class="text-ink-soft hover:text-ink font-bold" @click="closeRestoreModal">✕</button>
        </div>

        <!-- Pre-flight Review / Details -->
        <div class="space-y-3">
          <div class="rounded-xl border border-brand-teal/20 bg-surface/60 p-3.5 space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-ink-soft">Target Snapshot:</span>
              <span class="font-mono font-bold text-ink">{{ selectedBackupForRestore.backup_id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-soft">Timestamp:</span>
              <span class="font-mono font-semibold text-ink">{{ formatDate(selectedBackupForRestore.created_at) }} {{ formatTime(selectedBackupForRestore.created_at) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-soft">Database Engine:</span>
              <span class="font-bold uppercase text-brand-blue">{{ selectedBackupForRestore.database_engine }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-soft">Artifact Size:</span>
              <span class="font-mono text-ink font-semibold">{{ selectedBackupForRestore.file_size_human }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-soft">SHA-256 Checksum:</span>
              <span class="font-mono text-[10px] text-ink truncate max-w-[280px]" :title="selectedBackupForRestore.checksum_sha256">
                {{ selectedBackupForRestore.checksum_sha256 }}
              </span>
            </div>
          </div>

          <!-- Production Restriction Notice -->
          <div
            v-if="restorePreview && !restorePreview.can_restore"
            class="rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-900 space-y-2"
          >
            <div class="font-bold flex items-center gap-1.5 text-sm">
              <svg class="h-4 w-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Restoration Restricted: Production Environment</span>
            </div>
            <p class="leading-relaxed">{{ restorePreview.restriction_reason }}</p>
            <div class="rounded-lg bg-white/80 p-2.5 text-[11px] font-medium border border-red-200">
              <strong>Multi-Tenant Data Protection Policy:</strong> Automated in-app live database destruction is locked on remote production servers. Use <strong>Dry-Run Test</strong> to simulate recovery or execute manual recovery using verified administrative database tools.
            </div>
          </div>

          <!-- Supported Environment Warnings -->
          <div
            v-else
            class="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-2"
          >
            <div class="font-bold flex items-center gap-1.5 text-sm">
              <svg class="h-4 w-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>High-Risk Administrative Operation</span>
            </div>
            <p>
              Restoring a database will <strong>replace current learner progress, activities, and accounts</strong> with the historical snapshot.
            </p>
            <ul class="list-disc list-inside space-y-1 text-[11px] text-amber-900">
              <li>A pre-restoration safety snapshot will be taken automatically before any change.</li>
              <li>Integrity will be verified both before and after the operation.</li>
              <li>If any error occurs, automatic rollback will be initiated immediately.</li>
            </ul>
          </div>

          <!-- Confirmation Input -->
          <div v-if="restorePreview?.can_restore" class="space-y-2 pt-2 border-t border-gray-100">
            <label class="block space-y-1">
              <span class="text-xs font-bold text-ink">
                To confirm and proceed, type <span class="font-mono text-brand-rose font-black">RESTORE</span> below:
              </span>
              <input
                v-model.trim="restoreConfirmationInput"
                class="input-field font-mono uppercase text-sm"
                placeholder="Type RESTORE"
                autocomplete="off"
              />
            </label>
          </div>

          <!-- Result Display -->
          <div
            v-if="restoreResult"
            class="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950 space-y-1.5"
          >
            <div class="font-bold text-sm flex items-center gap-1.5">
              <svg class="h-4 w-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ restoreResult.message }}</span>
            </div>
            <div class="text-[11px]">
              Safety Snapshot: <span class="font-mono font-bold">{{ restoreResult.pre_restore_safety_backup }}</span>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
            :disabled="restoringActive"
            @click="closeRestoreModal"
          >
            {{ restoreResult ? 'Close' : 'Cancel' }}
          </button>

          <div class="flex items-center gap-2">
            <!-- Sandbox Dry-Run Test Button -->
            <button
              type="button"
              class="h-9 px-3.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 transition-all inline-flex items-center gap-1.5"
              :disabled="restoringActive"
              @click="handleDryRun(selectedBackupForRestore.backup_id)"
            >
              <svg class="h-3.5 w-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>Test in Sandbox</span>
            </button>

            <!-- Execute Restore Button -->
            <button
              v-if="restorePreview?.can_restore && !restoreResult"
              type="button"
              :class="[
                'h-9 px-4 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-xs inline-flex items-center gap-1.5',
                restoreConfirmationInput !== 'RESTORE' || restoringActive ? 'opacity-50 cursor-not-allowed' : ''
              ]"
              :disabled="restoreConfirmationInput !== 'RESTORE' || restoringActive"
              @click="executeRestore"
            >
              <span v-if="restoringActive" class="animate-spin text-xs">↻</span>
              <span>{{ restoringActive ? 'Restoring Database...' : 'Execute Safe Restore' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: AUDIT RECORD INSPECT                                              -->
    <!-- ========================================================================= -->
    <div
      v-if="showInspectModal && inspectedLog"
      class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs bg-ink/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="font-display text-lg font-bold text-ink">Audit Event Details</span>
            <span :class="getSeverityBadgeClass(inspectedLog)">
              {{ computeSeverity(inspectedLog).toUpperCase() }}
            </span>
          </div>
          <button type="button" class="text-ink-soft hover:text-ink font-bold" @click="showInspectModal = false">✕</button>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 text-xs">
          <div class="rounded-xl border border-gray-100 bg-surface/50 p-3 space-y-1.5">
            <div class="font-bold uppercase tracking-wider text-ink-soft text-[10px]">Event Information</div>
            <div><strong>ID:</strong> #{{ inspectedLog.id }}</div>
            <div><strong>Module:</strong> {{ inspectedLog.module }}</div>
            <div><strong>Action:</strong> <span class="font-mono text-brand-blue font-bold">{{ inspectedLog.action }}</span></div>
            <div><strong>Status:</strong> <span :class="['font-bold', inspectedLog.status === 'success' ? 'text-emerald-700' : 'text-red-700']">{{ inspectedLog.status }}</span></div>
            <div><strong>Timestamp:</strong> {{ formatDate(inspectedLog.created_at) }} {{ formatTime(inspectedLog.created_at) }}</div>
          </div>

          <div class="rounded-xl border border-gray-100 bg-surface/50 p-3 space-y-1.5">
            <div class="font-bold uppercase tracking-wider text-ink-soft text-[10px]">Actor & Request Context</div>
            <div><strong>User ID:</strong> {{ inspectedLog.user_id ? `#${inspectedLog.user_id}` : 'System' }}</div>
            <div><strong>Role:</strong> {{ roleLabel(inspectedLog.role) }}</div>
            <div><strong>IP Address:</strong> <span class="font-mono">{{ inspectedLog.ip_address || 'N/A' }}</span></div>
            <div><strong>Browser / OS:</strong> {{ inspectedLog.browser || 'Unknown' }} / {{ inspectedLog.os_name || 'Unknown' }}</div>
            <div><strong>Device:</strong> {{ inspectedLog.device_type || 'Desktop' }}</div>
          </div>
        </div>

        <div v-if="inspectedLog.affected_record" class="rounded-xl border border-gray-100 bg-surface/40 p-3 text-xs">
          <div class="font-bold uppercase tracking-wider text-ink-soft text-[10px] mb-1">Affected Record / Path</div>
          <div class="font-mono font-semibold text-ink">{{ inspectedLog.affected_record }}</div>
        </div>

        <div v-if="inspectedLog.reason" class="rounded-xl border border-gray-100 bg-surface/40 p-3 text-xs">
          <div class="font-bold uppercase tracking-wider text-ink-soft text-[10px] mb-1">Event Note / Reason</div>
          <div class="text-ink">{{ inspectedLog.reason }}</div>
        </div>

        <div v-if="inspectedLog.new_value" class="rounded-xl border border-gray-100 bg-surface/40 p-3 text-xs space-y-1">
          <div class="font-bold uppercase tracking-wider text-ink-soft text-[10px]">Structured Event Data (Redacted)</div>
          <pre class="font-mono text-[11px] overflow-x-auto bg-white p-2.5 rounded border border-gray-200">{{ inspectedLog.new_value }}</pre>
        </div>

        <div class="flex justify-end border-t border-gray-100 pt-3">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
            @click="showInspectModal = false"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { ApiError } from '@/lib/api'
import { adminService } from '@/services/adminService'
import type {
  AuditLogOut,
  BackupItem,
  BackupScheduleConfig,
  DatabaseStatus,
  RestorePreview,
  RestoreResult,
} from '@/types/admin'

// Tabs
const activeTab = ref<'events' | 'backup'>('events')

// Feedback Notification
const feedbackMsg = ref('')
const feedbackType = ref<'success' | 'warning' | 'error'>('success')

function setFeedback(msg: string, type: 'success' | 'warning' | 'error' = 'success') {
  feedbackMsg.value = msg
  feedbackType.value = type
}

// ============================================================================
// AUDIT LOGS STATE & METHODS
// ============================================================================
const logs = ref<AuditLogOut[]>([])
const totalLogs = ref(0)
const loading = ref(false)
const auditTable = ref<HTMLElement | null>(null)

const filters = ref({
  search: '',
  severity: '',
  role: '',
  activityType: '',
  status: '',
  date_from: '',
  date_to: '',
  page: 1,
  per_page: 25,
})

const activityTypes = [
  'Login',
  'Logout',
  'Access Denied',
  'Backup',
  'Restoration',
  'Registration',
  'Verification',
  'Lesson Upload',
  'Quiz Submission',
  'Account Update',
  'Section Management',
  'Blocking',
  'Other',
]

const hasActiveFilters = computed(() => {
  return (
    !!filters.value.search ||
    !!filters.value.severity ||
    !!filters.value.role ||
    !!filters.value.activityType ||
    !!filters.value.status ||
    !!filters.value.date_from ||
    !!filters.value.date_to
  )
})

function computeSeverity(log: AuditLogOut): 'critical' | 'high' | 'medium' | 'low' {
  if (log.severity) {
    const s = String(log.severity).toLowerCase()
    if (s === 'critical' || s === 'high' || s === 'medium' || s === 'low') return s as any
  }
  const act = String(log.action || '').toLowerCase()
  const stat = String(log.status || '').toLowerCase()

  if (act.includes('restore_failed') || act.includes('restore_started') || act.includes('restore_approved') || act.includes('hard_deleted')) {
    return 'critical'
  }
  if (stat === 'failed' && (act.includes('access_denied') || act.includes('restore_validation_failed') || act.includes('backup_failed') || act.includes('backup_verification_failed'))) {
    return 'critical'
  }
  // High in the system: Backup & restore operations, access denials, authentication anomalies
  if (
    act.includes('backup') ||
    act.includes('restore') ||
    act.includes('access_denied') ||
    act.includes('login_failed') ||
    act.includes('password_reset') ||
    stat === 'failed'
  ) {
    return 'high'
  }
  if (
    act.includes('created') ||
    act.includes('updated') ||
    act.includes('assigned') ||
    act.includes('archived') ||
    act.includes('transferred') ||
    act.includes('bulk_action')
  ) {
    return 'medium'
  }
  return 'low'
}

function getSeverityBadgeClass(log: AuditLogOut): string {
  const sev = computeSeverity(log)
  if (sev === 'critical') {
    return 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-red-100 text-red-900 border border-red-300 shadow-sm'
  }
  if (sev === 'high') {
    return 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300 shadow-sm'
  }
  if (sev === 'medium') {
    return 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-200'
  }
  return 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-mono uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200'
}

function getRowSeverityClass(log: AuditLogOut): string {
  const sev = computeSeverity(log)
  if (sev === 'critical') {
    return 'border-l-4 border-l-red-600 bg-red-50/75 hover:bg-red-100/70'
  }
  if (sev === 'high') {
    return 'border-l-4 border-l-amber-500 bg-amber-50/60 hover:bg-amber-100/60'
  }
  if (sev === 'medium') {
    return 'border-l-4 border-l-sky-400 bg-white hover:bg-surface/70'
  }
  return 'border-l-4 border-transparent bg-white hover:bg-surface/70'
}

const filteredLogs = computed(() => {
  const status = filters.value.status
  const type = filters.value.activityType.toLowerCase()
  const sevFilter = filters.value.severity.toLowerCase()

  return logs.value.filter((log) => {
    const matchesStatus = !status || log.status === status
    const matchesType =
      !type ||
      `${log.module} ${log.action} ${log.affected_record || ''}`
        .toLowerCase()
        .includes(type.split(' ')[0])
    const matchesSeverity = !sevFilter || computeSeverity(log) === sevFilter
    return matchesStatus && matchesType && matchesSeverity
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(totalLogs.value / filters.value.per_page)))
const pageStart = computed(() => (totalLogs.value === 0 ? 0 : (filters.value.page - 1) * filters.value.per_page + 1))
const pageEnd = computed(() => Math.min(totalLogs.value, (filters.value.page - 1) * filters.value.per_page + logs.value.length))
const canGoPrevious = computed(() => filters.value.page > 1)
const canGoNext = computed(() => filters.value.page < totalPages.value)

async function fetchLogs() {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      page: filters.value.page,
      per_page: filters.value.per_page,
    }
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.role) params.actor_role = filters.value.role
    if (filters.value.date_from) params.date_from = filters.value.date_from
    if (filters.value.date_to) params.date_to = filters.value.date_to

    const res = await adminService.getAuditLogs(params)
    logs.value = res.items
    totalLogs.value = res.total
    if (totalLogs.value > 0 && filters.value.page > totalPages.value) {
      filters.value.page = totalPages.value
      await fetchLogs()
    }
  } catch (err) {
    setFeedback(err instanceof ApiError ? err.message : 'Failed to load audit logs.', 'error')
    logs.value = []
    totalLogs.value = 0
  } finally {
    loading.value = false
  }
}

async function changePage(delta: number) {
  if (loading.value) return
  const nextPage = Math.min(totalPages.value, Math.max(1, filters.value.page + delta))
  if (nextPage === filters.value.page) return
  filters.value.page = nextPage
  await fetchLogs()
  await nextTick()
  auditTable.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function changePageSize() {
  filters.value.page = 1
  fetchLogs()
}

function applyFilters() {
  filters.value.page = 1
  fetchLogs()
}

function resetFilters() {
  filters.value.search = ''
  filters.value.severity = ''
  filters.value.role = ''
  filters.value.activityType = ''
  filters.value.status = ''
  filters.value.date_from = ''
  filters.value.date_to = ''
  filters.value.page = 1
  fetchLogs()
}

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedFetch() {
  clearTimeout(debounceTimer)
  filters.value.page = 1
  debounceTimer = setTimeout(fetchLogs, 350)
}

function logUser(log: AuditLogOut) {
  if (log.affected_record && log.affected_record.includes(' - ')) {
    return log.affected_record.split(' - ')[0]
  }
  return log.user_id ? `User #${log.user_id}` : 'System'
}

function roleLabel(role?: string) {
  if (role === 'admin') return 'Administrator'
  if (role === 'teacher') return 'Teacher'
  if (role === 'student') return 'Student'
  return 'System'
}

function activityLabel(log: AuditLogOut) {
  const action = String(log.action || 'activity').replace(/_/g, ' ')
  const formattedAction = action.charAt(0).toUpperCase() + action.slice(1)
  if (log.affected_record && log.affected_record.includes(' - ')) {
    const detail = log.affected_record.split(' - ').slice(1).join(' - ')
    return `${formattedAction}: ${detail}`
  }
  return formattedAction
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

// Log inspection modal
const showInspectModal = ref(false)
const inspectedLog = ref<AuditLogOut | null>(null)

function openInspectModal(log: AuditLogOut) {
  inspectedLog.value = log
  showInspectModal.value = true
}

// ============================================================================
// BACKUP AND RESTORE STATE & METHODS
// ============================================================================
const dbStatus = ref<DatabaseStatus | null>(null)
const backups = ref<BackupItem[]>([])
const backupLoading = ref(false)
const backupSearch = ref('')
const actionLoading = ref<Record<string, string>>({})

// Modals
const showCreateModal = ref(false)
const newBackupNotes = ref('')
const creatingBackup = ref(false)

// Automated Schedule State
const scheduleConfig = ref<BackupScheduleConfig | null>(null)
const scheduleCadence = ref('every_2_weeks')
const updatingSchedule = ref(false)
const runningScheduleNow = ref(false)

const showRestoreModal = ref(false)
const selectedBackupForRestore = ref<BackupItem | null>(null)
const restorePreview = ref<RestorePreview | null>(null)
const restoreConfirmationInput = ref('')
const restoringActive = ref(false)
const restoreResult = ref<RestoreResult | null>(null)

const filteredBackups = computed(() => {
  const q = backupSearch.value.toLowerCase()
  if (!q) return backups.value
  return backups.value.filter(
    (b) =>
      b.backup_id.toLowerCase().includes(q) ||
      (b.notes && b.notes.toLowerCase().includes(q)) ||
      b.database_engine.toLowerCase().includes(q)
  )
})

function formatTableSummary(counts?: Record<string, number> | null): string {
  if (!counts) return ''
  return Object.entries(counts)
    .map(([tbl, c]) => `${tbl}: ${c}`)
    .join(', ')
}

function switchTabToBackup() {
  activeTab.value = 'backup'
  if (!dbStatus.value) {
    loadBackupData()
  }
}

async function loadBackupData() {
  backupLoading.value = true
  try {
    const [statusData, backupList, scheduleData] = await Promise.all([
      adminService.getBackupStatus(),
      adminService.getBackups(),
      adminService.getBackupSchedule().catch(() => null),
    ])
    dbStatus.value = statusData
    backups.value = backupList
    if (scheduleData) {
      scheduleConfig.value = scheduleData
      if (scheduleData.cadence) {
        scheduleCadence.value = scheduleData.cadence
      }
    } else if (statusData?.schedule) {
      scheduleConfig.value = statusData.schedule
      if (statusData.schedule.cadence) {
        scheduleCadence.value = statusData.schedule.cadence
      }
    }
  } catch (err) {
    setFeedback(err instanceof ApiError ? err.message : 'Failed to load backup data.', 'error')
  } finally {
    backupLoading.value = false
  }
}

async function handleCadenceChange() {
  updatingSchedule.value = true
  try {
    const isEnabled = scheduleCadence.value !== 'disabled'
    const updated = await adminService.updateBackupSchedule({
      enabled: isEnabled,
      cadence: scheduleCadence.value,
    })
    scheduleConfig.value = updated
    setFeedback(`Automated backup schedule set to ${updated.cadence_human}!`, 'success')
  } catch (err) {
    setFeedback(err instanceof ApiError ? err.message : 'Failed to update backup schedule.', 'error')
  } finally {
    updatingSchedule.value = false
  }
}

async function triggerScheduleNow() {
  runningScheduleNow.value = true
  try {
    const created = await adminService.triggerScheduledBackup()
    if (created) {
      setFeedback(`Automated snapshot '${created.backup_id}' completed and verified!`, 'success')
      await loadBackupData()
    } else {
      setFeedback('Automated schedule is up to date.', 'success')
    }
  } catch (err) {
    setFeedback(err instanceof ApiError ? err.message : 'Failed to trigger scheduled backup.', 'error')
  } finally {
    runningScheduleNow.value = false
  }
}

function openCreateBackupModal() {
  newBackupNotes.value = ''
  showCreateModal.value = true
}

async function executeCreateBackup() {
  creatingBackup.value = true
  try {
    const created = await adminService.createBackup({
      notes: newBackupNotes.value || undefined,
      backup_type: 'full',
    })
    setFeedback(`Backup '${created.backup_id}' created and verified successfully!`, 'success')
    showCreateModal.value = false
    await loadBackupData()
  } catch (err) {
    setFeedback(err instanceof ApiError ? err.message : 'Backup creation failed.', 'error')
  } finally {
    creatingBackup.value = false
  }
}

async function handleVerify(backupId: string) {
  actionLoading.value[backupId] = 'verify'
  try {
    const res = await adminService.verifyBackup(backupId)
    if (res.integrity_status === 'verified') {
      setFeedback(`Backup '${backupId}' integrity verified: ${res.details}`, 'success')
    } else {
      setFeedback(`Backup '${backupId}' integrity failed: ${res.details}`, 'error')
    }
    await loadBackupData()
  } catch (err) {
    setFeedback(err instanceof ApiError ? err.message : 'Verification failed.', 'error')
  } finally {
    delete actionLoading.value[backupId]
  }
}

async function handleDryRun(backupId: string) {
  actionLoading.value[backupId] = 'dryrun'
  try {
    const res = await adminService.dryRunRestore(backupId)
    setFeedback(
      `Dry-Run Success: Sandbox restoration verified (${res.duration_ms} ms). Tables verified: ${Object.keys(res.table_counts).length}. Live data remained untouched.`,
      'success'
    )
  } catch (err) {
    setFeedback(err instanceof ApiError ? err.message : 'Dry-run restoration test failed.', 'error')
  } finally {
    delete actionLoading.value[backupId]
  }
}

async function handleDownload(backupId: string) {
  try {
    await adminService.downloadBackup(backupId)
    setFeedback(`Download started for backup '${backupId}'.`, 'success')
  } catch (err) {
    setFeedback(err instanceof ApiError ? err.message : 'Download failed.', 'error')
  }
}

async function openRestoreModal(backup: BackupItem) {
  selectedBackupForRestore.value = backup
  restoreConfirmationInput.value = ''
  restoreResult.value = null
  showRestoreModal.value = true

  try {
    const preview = await adminService.previewRestore(backup.backup_id)
    restorePreview.value = preview
  } catch (err) {
    setFeedback(err instanceof ApiError ? err.message : 'Failed to load restore preview.', 'error')
  }
}

function closeRestoreModal() {
  showRestoreModal.value = false
  selectedBackupForRestore.value = null
  restorePreview.value = null
  restoreConfirmationInput.value = ''
  restoreResult.value = null
}

async function executeRestore() {
  if (!selectedBackupForRestore.value) return
  if (restoreConfirmationInput.value.trim() !== 'RESTORE') {
    setFeedback("You must type exactly 'RESTORE' to execute restoration.", 'warning')
    return
  }

  restoringActive.value = true
  try {
    const res = await adminService.restoreBackup(selectedBackupForRestore.value.backup_id, 'RESTORE')
    restoreResult.value = res
    setFeedback(`Database restored successfully! Safety snapshot: ${res.pre_restore_safety_backup}`, 'success')
    await loadBackupData()
    await fetchLogs()
  } catch (err) {
    setFeedback(err instanceof ApiError ? err.message : 'Restoration failed.', 'error')
  } finally {
    restoringActive.value = false
  }
}

const copiedId = ref<string | null>(null)

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  copiedId.value = text
  setFeedback(`Copied to clipboard: ${text}`, 'success')
  setTimeout(() => {
    if (copiedId.value === text) {
      copiedId.value = null
    }
  }, 2500)
}

onMounted(() => {
  fetchLogs()
  loadBackupData()
})
</script>
