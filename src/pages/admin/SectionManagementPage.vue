<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-ink">Section Registry</h2>
        <p class="text-sm text-ink-soft">Manage grade levels, classroom sections, and teacher assignments.</p>
      </div>
      <button class="btn-primary flex items-center gap-2" @click="showCreateModal = true">
          <span>+</span> New Section
      </button>
    </div>

    <!-- Stats summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="stat in stats" :key="stat.label" class="card p-5 border-l-4" :class="stat.border">
            <div class="text-[10px] font-bold uppercase tracking-widest text-ink-soft opacity-60">{{ stat.label }}</div>
            <div class="text-2xl font-bold text-ink mt-1">{{ stat.value }}</div>
        </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
        <select v-model="filters.grade" class="input-field !w-auto" @change="fetchSections">
            <option value="">All Grade Levels</option>
            <option v-for="g in ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']" :key="g" :value="g">{{ g }}</option>
        </select>
        <div class="flex-1 max-w-sm">
            <input v-model="filters.search" placeholder="Search by section name..." class="input-field" @input="debouncedFetch" />
        </div>
    </div>

    <!-- Grid of Sections -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="section in sections" :key="section.id" class="card group hover:border-brand-blue/30 transition-all">
            <div class="border-b border-gray-50 p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <div class="text-[10px] font-bold text-brand-blue uppercase tracking-widest">{{ section.grade_level }}</div>
                        <h3 class="text-lg font-bold text-ink">{{ section.name }}</h3>
                    </div>
                    <span :class="['badge', section.status === 'active' ? 'badge-green' : 'badge-amber']">{{ section.status }}</span>
                </div>
            </div>
            
            <div class="p-5 space-y-4">
                <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-xs">👨‍🏫</div>
                    <div class="min-w-0">
                        <div class="text-[10px] font-bold text-ink-soft uppercase opacity-60">Assigned Teacher</div>
                        <div class="text-sm font-bold text-ink truncate">{{ section.teacher_name || 'Unassigned' }}</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-2">
                    <div class="flex items-baseline gap-1">
                        <span class="text-xl font-bold text-ink">{{ section.student_count }}</span>
                        <span class="text-xs font-bold text-ink-soft uppercase">Students</span>
                    </div>
                    <div class="flex items-center -space-x-2">
                        <div v-for="i in Math.min(section.student_count, 3)" :key="i" class="h-6 w-6 rounded-full border-2 border-white bg-gray-200"></div>
                        <div v-if="section.student_count > 3" class="h-6 w-6 rounded-full border-2 border-white bg-brand-blue text-[8px] flex items-center justify-center text-white font-bold">+{{ section.student_count - 3 }}</div>
                    </div>
                </div>
            </div>
            
            <div class="border-t border-gray-50 bg-surface/30 p-4 flex justify-between items-center transition-opacity">
                <button class="text-xs font-bold text-brand-blue hover:underline">Manage Students</button>
                <div class="flex gap-2">
                    <button class="p-1 hover:bg-white rounded transition-colors" title="Edit Properties">✏️</button>
                    <button class="p-1 hover:bg-white rounded transition-colors text-brand-rose" title="Archive Section">📦</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Create Modal (Simplified) -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
        <div class="auth-card !max-w-md">
            <h3 class="font-display text-xl font-bold text-ink">Register New Section</h3>
            <div class="form-stack mt-6">
                <div>
                    <label class="field-label">Section Name</label>
                    <input v-model="newSection.name" type="text" class="input-field mt-1" placeholder="e.g. Diamond, Apollo" />
                </div>
                 <div>
                   <label class="field-label">Registry Level</label>
                   <select v-model="newSection.grade" class="input-field mt-1">
                       <option value="">Select Level</option>
                       <option v-for="g in ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']" :key="g" :value="g">{{ g }}</option>
                   </select>
                </div>
            </div>
            <div class="mt-8 flex gap-3">
                <button class="flex-1 btn-secondary" @click="showCreateModal = false">Cancel</button>
                <button class="flex-1 btn-primary" @click="submitSection">Create Section</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showCreateModal = ref(false)
const filters = ref({ grade: '', search: '', page: 1, per_page: 20 })
const sections = ref<any[]>([])

const stats = [
    { label: 'Active Sections', value: '18', border: 'border-brand-blue' },
    { label: 'Teacher-Assigned', value: '15', border: 'border-brand-violet' },
    { label: 'Total Capacity', value: '540', border: 'border-brand-teal' }
]

const newSection = ref({ name: '', grade: '' })

async function fetchSections() {
    // mock data
    sections.value = [
        { id: 1, name: 'Apple', grade_level: 'Grade 1', status: 'active', teacher_name: 'Luna Lovegood', student_count: 24 },
        { id: 2, name: 'Saffron', grade_level: 'Grade 1', status: 'active', teacher_name: 'Severus Snape', student_count: 22 },
        { id: 3, name: 'Starlight', grade_level: 'Grade 5', status: 'active', teacher_name: null, student_count: 0 },
        { id: 4, name: 'Olympus', grade_level: 'Grade 6', status: 'inactive', teacher_name: 'Minerva McGonagall', student_count: 30 },
    ]
}

function submitSection() {
    alert('Section registration queued. Refresh registry in 10s.')
    showCreateModal.value = false
}

let debounceTimer: any
function debouncedFetch() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(fetchSections, 500)
}

onMounted(fetchSections)
</script>
