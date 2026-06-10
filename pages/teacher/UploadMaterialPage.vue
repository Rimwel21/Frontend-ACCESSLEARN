<template>
  <div class="space-y-5">
    <div class="flex items-end justify-between">
      <div>
        <Breadcrumb :crumbs="[{ label:'Class Management', to:'/teacher/class' }, { label:'Modules', to:'/teacher/modules' }, { label:'Upload Learning Material' }]" />
        <h2 class="font-display text-2xl font-bold">📤 Upload Learning Materials</h2>
      </div>
      <button @click="publish" class="btn-primary">Publish</button>
    </div>

    <div class="grid grid-cols-[1fr_320px] gap-5">
      <!-- Left: form -->
      <div class="space-y-5">
        <!-- Material Details -->
        <div class="card p-6">
          <h3 class="font-display font-semibold text-base border-b border-gray-100 pb-3 mb-4">Material Details</h3>
          <div class="space-y-4">
            <div><label class="block text-xs font-semibold text-ink-soft mb-1.5">Title</label><input v-model="form.title" class="input-field" placeholder="Enter module title…" /></div>
            <div><label class="block text-xs font-semibold text-ink-soft mb-1.5">Description</label><textarea v-model="form.description" rows="3" class="input-field resize-none" placeholder="Describe what students will learn…" /></div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-ink-soft mb-1.5">Content Type</label>
                <select v-model="form.contentType" class="input-field">
                  <option value="">Select type…</option>
                  <option>Lesson</option><option>Video</option><option>Document</option><option>Activity</option>
                </select>
              </div>
              <div><label class="block text-xs font-semibold text-ink-soft mb-1.5">Week</label><input v-model="form.week" class="input-field" placeholder="e.g. Week 3" /></div>
            </div>
          </div>
        </div>

        <!-- Additional Settings -->
        <div class="card p-6">
          <h3 class="font-display font-semibold text-base border-b border-gray-100 pb-3 mb-4">Additional Settings</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-surface rounded-xl p-3.5">
              <div class="text-xs font-semibold text-ink-soft mb-2">Status</div>
              <select v-model="form.status" class="input-field text-sm">
                <option>Draft</option><option>Published</option>
              </select>
            </div>
            <div class="bg-surface rounded-xl p-3.5">
              <div class="text-xs font-semibold text-ink-soft mb-2">Behavior</div>
              <label class="flex items-center gap-2.5 cursor-pointer">
                <ToggleSwitch v-model="form.required" />
                <span class="text-sm font-medium">Mark as required</span>
              </label>
            </div>
            <div class="bg-surface rounded-xl p-3.5">
              <div class="text-xs font-semibold text-ink-soft mb-2">Release Date</div>
              <input v-model="form.releaseDate" type="date" class="input-field text-sm" />
            </div>
            <div class="bg-surface rounded-xl p-3.5">
              <div class="text-xs font-semibold text-ink-soft mb-2">Estimated Time</div>
              <input v-model="form.estimatedTime" class="input-field text-sm" placeholder="e.g. 16mins" />
            </div>
            <div class="bg-surface rounded-xl p-3.5 flex items-center justify-center text-xs text-ink-soft italic col-span-2">
              More settings coming soon
            </div>
          </div>
        </div>
      </div>

      <!-- Right: drop zone -->
      <div>
        <div
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="onDrop"
          :class="['border-2 border-dashed rounded-2xl min-h-72 flex flex-col items-center justify-center gap-3 p-6 text-center transition-all',
            dragging ? 'border-brand-blue bg-brand-blue-soft' : 'border-gray-200 bg-white hover:border-brand-blue hover:bg-brand-blue-soft/30 cursor-pointer']"
        >
          <div class="text-5xl">☁️</div>
          <div class="font-semibold text-base text-ink">Drag and drop your files here</div>
          <div class="text-xs text-ink-soft">or</div>
          <label class="px-5 py-2.5 rounded-full border border-brand-blue text-brand-blue text-sm font-semibold cursor-pointer hover:bg-brand-blue-soft transition-all">
            Browse File
            <input type="file" multiple class="hidden" @change="onFileSelect" />
          </label>
          <div class="text-[11px] font-mono text-ink-soft">Supports PDF, DOCX, MP4, PNG • Max 50MB</div>

          <!-- File list -->
          <div v-if="files.length" class="w-full mt-2 space-y-2">
            <div v-for="f in files" :key="f.name" class="flex items-center gap-2 bg-surface rounded-lg px-3 py-2 text-left">
              <span class="text-base">📄</span>
              <span class="flex-1 text-xs font-medium truncate">{{ f.name }}</span>
              <span class="text-[10px] font-mono text-ink-soft">{{ (f.size / 1024).toFixed(1) }} KB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import Breadcrumb  from '@/components/common/Breadcrumb.vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'

const router = useRouter()
const store  = useAppStore()

const dragging = ref(false)
const files    = ref<File[]>([])

const form = ref({
  title: '', description: '', contentType: '', week: '',
  status: 'Draft', required: true, releaseDate: '2026-03-24', estimatedTime: '',
})

function onDrop(e: DragEvent) {
  dragging.value = false
  files.value = Array.from(e.dataTransfer?.files ?? [])
}
function onFileSelect(e: Event) {
  files.value = Array.from((e.target as HTMLInputElement).files ?? [])
}
function publish() {
  if (!form.value.title.trim()) { alert('Please enter a module title.'); return }
  store.addModule({
    title: form.value.title,
    description: form.value.description,
    contentType: form.value.contentType,
    week: form.value.week,
    status: form.value.status === 'Published' ? 'Published' : 'Unpublished',
    estimatedTime: form.value.estimatedTime,
    required: form.value.required,
  })
  router.push('/teacher/modules')
}
</script>
