<template>
  <div class="space-y-6">
    <div class="gradient-brand rounded-2xl px-7 py-5 flex items-center justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-white">📚 Class Management</h2>
        <p class="text-white/75 text-sm mt-1">{{ store.selectedClass ? `${store.selectedClass.gradeLevel} — Section ${store.selectedClass.section}` : 'Create a class to get started' }}</p>
      </div>
      <button @click="showAddClass = true" class="px-5 py-2.5 rounded-full border border-white/40 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/30 transition-all">+ New Class</button>
    </div>

    <!-- ════ EMPTY STATE — no classes yet ════ -->
    <div v-if="!store.hasClasses" class="card p-14 flex flex-col items-center text-center">
      <div class="text-6xl mb-4">🏫</div>
      <h3 class="font-display text-xl font-bold mb-2">No classes yet</h3>
      <p class="text-sm text-ink-soft max-w-sm mb-6">Create your first class to start adding modules, activities, and quizzes for your students.</p>
      <button @click="showAddClass = true" class="btn-primary">+ Create Your First Class</button>
    </div>

    <!-- ════ HAS CLASSES ════ -->
    <template v-else>

      <!-- Class list -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-display text-base font-semibold text-ink-soft">Your Classes</h3>
        </div>
        <div class="grid grid-cols-4 gap-3">
          <div v-for="cls in store.classes" :key="cls.id"
            @click="store.selectClass(cls.id)"
            :class="['card-hover p-4 cursor-pointer relative border-2 transition-all',
              store.selectedClassId === cls.id ? 'border-brand-blue' : 'border-transparent']"
          >
            <button @click.stop="confirmDeleteClass(cls.id)" class="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-rose-50 text-gray-300 hover:text-brand-rose flex items-center justify-center text-xs transition-all">✕</button>
            <div class="text-2xl mb-2">🏫</div>
            <div class="font-display font-bold text-sm">{{ cls.gradeLevel }}</div>
            <div class="text-xs text-ink-soft mt-0.5">Section {{ cls.section }}</div>
            <div class="text-[11px] font-mono text-gray-400 mt-2">👥 {{ cls.studentCount }} students</div>
            <div v-if="store.selectedClassId === cls.id" class="absolute -top-2 -left-2 bg-brand-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Active</div>
          </div>
          <!-- Add class tile -->
          <button @click="showAddClass = true"
            class="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-ink-soft hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue-soft/30 transition-all min-h-[120px]">
            <span class="text-2xl">➕</span>
            <span class="text-xs font-semibold">Add Class</span>
          </button>
        </div>
      </div>

      <!-- Selected class content -->
      <template v-if="store.selectedClass">
        <div class="grid grid-cols-3 gap-4">
          <div class="card p-5 flex items-center gap-4">
            <span class="text-3xl">👥</span>
            <div><div class="font-display text-2xl font-bold">{{ store.selectedClass.studentCount }}</div><div class="text-xs text-ink-soft font-medium">Total Students</div></div>
          </div>
          <div class="card p-5 flex items-center gap-4">
            <span class="text-3xl">📘</span>
            <div><div class="font-display text-2xl font-bold">{{ store.publishedModules.length }}</div><div class="text-xs text-ink-soft font-medium">Active Modules</div></div>
          </div>
          <div class="card p-5 flex items-center gap-4">
            <span class="text-3xl">📈</span>
            <div class="flex-1">
              <div class="font-display text-2xl font-bold">74%</div>
              <div class="text-xs text-ink-soft font-medium mb-2">Avg. Progress</div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div class="h-full gradient-brand rounded-full" style="width:74%" /></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-[1fr_210px] gap-5">
          <div class="space-y-4">
            <div v-for="section in sections" :key="section.title" class="card-hover cursor-pointer" @click="router.push(section.to)">
              <div class="flex">
                <div :class="`w-1.5 flex-shrink-0 rounded-l-xl ${section.accent}`" />
                <div class="flex-1 p-5">
                  <h3 class="font-display text-base font-semibold mb-2">{{ section.title }}</h3>
                  <p class="text-sm text-ink-soft leading-relaxed">{{ section.description }}</p>
                  <div class="flex items-center justify-between mt-4">
                    <div class="flex gap-4">
                      <span v-for="meta in section.meta" :key="meta" class="text-[11.5px] text-ink-soft">{{ meta }}</span>
                    </div>
                    <button :class="`text-white text-xs font-bold px-4 py-2 rounded-full ${section.btnClass}`">{{ section.btnLabel }} →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="card p-4">
              <div class="font-display text-[13px] font-semibold mb-3">⚡ Quick Actions</div>
              <div class="space-y-2">
                <button @click="router.push('/teacher/modules')" class="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">➕ Add Module</button>
                <button @click="router.push('/teacher/quizzes')" class="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl gradient-violet text-white text-[13px] font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">📝 Create Quiz</button>
                <button @click="router.push('/teacher/activities')" class="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl gradient-teal text-white text-[13px] font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">🎯 Create Activity</button>
              </div>
            </div>

            <div class="card p-4 flex-1">
              <div class="font-display text-[13px] font-semibold mb-3">🕐 Recent Activities</div>
              <div class="space-y-3">
                <div v-for="act in store.recentActivities" :key="act.text" class="flex items-start gap-2.5 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div :class="`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${act.color}`" />
                  <div>
                    <div class="text-xs text-ink-soft leading-relaxed">{{ act.text }}</div>
                    <div class="text-[10px] font-mono text-gray-400 mt-0.5">{{ act.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- No class selected (but classes exist) -->
      <div v-else class="card p-12 flex flex-col items-center text-center">
        <div class="text-5xl mb-3">👆</div>
        <h3 class="font-display text-lg font-bold mb-1">Select a class above</h3>
        <p class="text-sm text-ink-soft">Choose one of your classes to view its modules, activities, and quizzes.</p>
      </div>
    </template>

    <!-- ════ ADD CLASS MODAL ════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddClass" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showAddClass = false">
          <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="showAddClass = false" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 class="font-display font-bold text-lg">🏫 Create New Class</h3>
              <button @click="showAddClass = false" class="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-ink-soft hover:text-ink transition-all text-lg">×</button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="block text-xs font-semibold text-ink-soft mb-1.5">Grade Level</label>
                <select v-model="newClass.gradeLevel" class="input-field">
                  <option value="">Select grade level…</option>
                  <option v-for="g in gradeOptions" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-ink-soft mb-1.5">Section</label>
                <input v-model="newClass.section" class="input-field" placeholder="e.g. A, B, Diamond, Sampaguita" />
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button @click="showAddClass = false" class="btn-secondary">Cancel</button>
              <button @click="createClass" class="btn-primary">Create Class</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ════ DELETE CONFIRM MODAL ════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTargetId" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="deleteTargetId = null">
          <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="deleteTargetId = null" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div class="text-4xl mb-3">⚠️</div>
            <h3 class="font-display font-bold text-base mb-2">Delete this class?</h3>
            <p class="text-sm text-ink-soft mb-5">This action cannot be undone.</p>
            <div class="flex justify-center gap-3">
              <button @click="deleteTargetId = null" class="btn-secondary">Cancel</button>
              <button @click="performDelete" class="px-5 py-2.5 rounded-full bg-brand-rose text-white font-semibold text-sm hover:bg-red-600 transition-all">Delete</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTeacherStore } from '@/stores/teacher'

const router = useRouter()
const store  = useTeacherStore()

const gradeOptions = ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']

const showAddClass = ref(false)
const newClass = ref({ gradeLevel: '', section: '' })

function createClass() {
  if (!newClass.value.gradeLevel || !newClass.value.section.trim()) {
    alert('Please select a grade level and enter a section name.')
    return
  }
  store.addClass(newClass.value.gradeLevel, newClass.value.section.trim())
  newClass.value = { gradeLevel: '', section: '' }
  showAddClass.value = false
}

const deleteTargetId = ref<string | null>(null)
function confirmDeleteClass(id: string) {
  deleteTargetId.value = id
}
function performDelete() {
  if (deleteTargetId.value) store.deleteClass(deleteTargetId.value)
  deleteTargetId.value = null
}

const sections = computed(() => [
  {
    title: '📖 Modules / Learning Materials',
    description: 'Manage and organize all learning modules, upload materials, set deadlines, and track completion rates.',
    accent: 'bg-gradient-to-b from-brand-blue to-brand-violet',
    btnClass: 'bg-gradient-to-r from-brand-blue to-brand-violet',
    btnLabel: 'Manage', to: '/teacher/modules',
    meta: [`📘 ${store.modules.length} modules`, `✅ ${store.publishedModules.length} published`],
  },
  {
    title: '🎯 Activities',
    description: 'Create and manage student activities, set due dates, and track submission status for each task.',
    accent: 'bg-gradient-to-b from-brand-teal to-brand-green',
    btnClass: 'bg-gradient-to-r from-brand-teal to-brand-green',
    btnLabel: 'Manage', to: '/teacher/activities',
    meta: [`🎯 ${store.activities.length} activities`, `⚠️ ${store.atRiskStudents.length} students need help`],
  },
  {
    title: '🧪 Quizzes / Activities',
    description: 'Create, schedule, and review quizzes. Track scores and generate performance reports for each assessment.',
    accent: 'bg-gradient-to-b from-brand-amber to-brand-rose',
    btnClass: 'bg-gradient-to-r from-brand-amber to-brand-rose',
    btnLabel: 'Review', to: '/teacher/quizzes',
    meta: [`📝 ${store.quizzes.length} quizzes`, `⏳ 3 pending`],
  },
])
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform .2s, opacity .2s; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .relative { transform: scale(.95); opacity: 0; }
.modal-leave-to { opacity: 0; }
</style>
