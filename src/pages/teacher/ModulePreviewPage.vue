<template>
  <div class="flex h-screen flex-col overflow-hidden bg-white">
    <div class="shrink-0 border-b-[3px] border-brand-teal bg-brand-teal px-8 py-6">
      <button class="mb-4 border-[3px] border-brand-teal bg-white px-4 py-2 text-xs font-black" @click="router.push('/teacher/modules')">Back</button>
      <h1 class="font-display text-[32px] font-black text-white">{{ headerTitle }}</h1>
      <p class="mt-1 text-sm font-bold text-white/85">{{ headerDescription }}</p>
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[220px_1fr]">
      <aside class="border-b-[3px] border-brand-teal bg-white p-3 lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-r-[3px]">
        <div class="mb-3 font-mono text-[10px] uppercase tracking-widest text-gray-500">Student Preview</div>
        <button
          v-if="hasAutoIntro"
          :class="['mb-2 flex w-full items-center gap-2 border-[2px] border-brand-teal px-3 py-2.5 text-left text-xs font-black', isIntroActive ? 'bg-brand-blue text-white' : 'bg-white']"
         
          @click="activeTopicId = null"
        >
          <span class="h-4 w-4 rounded-full border-[2px] border-current bg-white" />
          Introduction
        </button>
        <button
          v-for="(topic, index) in topics"
          :key="topic.id"
          :class="['mb-2 flex w-full items-center gap-2 border-[2px] border-brand-teal px-3 py-2.5 text-left text-xs font-black', activeTopic?.id === topic.id ? 'bg-brand-blue text-white' : 'bg-white']"
         
          @click="activeTopicId = topic.id"
        >
          <span class="h-4 w-4 rounded-full border-[2px] border-current bg-white" />
          Topic {{ index + 1 }}
        </button>
        <div
          v-for="quiz in quizzes"
          :key="`quiz-${quiz.id}`"
          class="mb-2 flex w-full items-center gap-2 border-[2px] border-brand-teal bg-gray-50 px-3 py-2.5 text-left text-xs font-black uppercase tracking-wide opacity-70"
        >
          <span class="grid h-4 w-4 place-items-center rounded-full border-[2px] border-brand-teal text-[9px]">Q</span>
          {{ quiz.title }}
        </div>
      </aside>

      <main class="min-h-0 overflow-y-auto p-7">
        <div v-if="loading" class="border-[3px] border-brand-teal p-8 text-center font-black">Loading preview...</div>
        <div v-else-if="error" class="border-[3px] border-brand-teal bg-red-50 p-8 text-center font-black text-red-700">{{ error }}</div>
        <article v-else-if="isIntroActive" class="rounded-lg border-[2px] border-gray-200 bg-white p-6 text-sm leading-7 text-gray-700">
          {{ moduleData?.description || 'Introduction content will be available here.' }}
        </article>
        <div v-else-if="!activeTopic" class="border-[3px] border-brand-teal p-8 text-center">
          <h2 class="font-display text-xl font-black">No generated topics yet.</h2>
          <p class="mt-2 text-sm text-gray-500">Upload or replace the learning material file to generate student content.</p>
        </div>
        <article v-else class="space-y-6">
          <!-- ===== PPTX Presentation-Card Layout ===== -->
          <template v-if="parsedPptxContent">
            <div class="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm md:p-8">
              <!-- Slide Badge -->
              <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div class="inline-block rounded-lg bg-teal-700 px-4 py-1.5 text-lg font-bold text-white shadow-sm">
                  {{ parsedPptxContent.badge || activeTopic.title }}
                </div>
                <div class="font-mono text-xs font-semibold text-slate-500">
                  Slide {{ activeIndex + 1 }} of {{ topics.length }}
                </div>
              </div>
              <!-- Content Grid -->
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                <!-- Images (5 cols) -->
                <div
                  v-if="parsedPptxContent.image_urls?.length"
                  :class="['flex flex-col gap-3', parsedPptxContent.paragraphs?.length ? 'lg:col-span-5' : 'lg:col-span-12']"
                >
                  <div :class="parsedPptxContent.image_urls.length > 1 ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'">
                    <div
                      v-for="(imgUrl, i) in parsedPptxContent.image_urls"
                      :key="i"
                      class="flex items-center justify-center overflow-hidden rounded-xl border border-teal-100 bg-white p-2 shadow-sm"
                    >
                      <img
                        :src="assetUrl(imgUrl)"
                        alt="Slide graphic"
                        class="max-h-[350px] w-full rounded-lg object-contain md:max-h-[420px]"
                      />
                    </div>
                  </div>
                </div>
                <!-- Text (7 cols) -->
                <div
                  :class="['flex flex-col gap-4', parsedPptxContent.image_urls?.length ? 'lg:col-span-7' : 'lg:col-span-12']"
                >
                  <div
                    v-for="(para, i) in parsedPptxContent.paragraphs"
                    :key="i"
                    class="rounded-xl border border-teal-100 border-l-4 border-l-teal-600 bg-white p-4 text-sm leading-relaxed text-slate-800 shadow-sm md:p-5 md:text-base"
                  >
                    {{ para }}
                  </div>
                  <div
                    v-if="!parsedPptxContent.paragraphs?.length"
                    class="rounded-xl border border-teal-100 bg-white p-6 text-center text-sm italic text-slate-500 shadow-sm"
                  >
                    No text content on this slide.
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ===== Default Layout (PDF page images / plain text) ===== -->
          <template v-else>
            <div class="mx-auto max-w-6xl space-y-4">
              <div>
                <h2 class="font-display text-2xl font-black">{{ activeTopic.title }}</h2>
                <p class="mt-1 text-sm text-gray-500">{{ activeTopic.description }}</p>
              </div>
              <div v-if="activeTopic.page_image_urls?.length" class="mx-auto grid max-w-4xl gap-6">
                <img
                  v-for="(pageUrl, index) in activeTopic.page_image_urls"
                  :key="`${activeTopic.id}-${index}`"
                  :src="assetUrl(pageUrl)"
                  alt=""
                  class="w-full rounded-lg border border-slate-200 bg-white shadow-sm"
                />
              </div>
              <div v-else class="whitespace-pre-line rounded-lg border-[2px] border-gray-200 bg-white p-5 text-sm leading-7 text-gray-700">
                {{ activeTopic.content }}
              </div>
            </div>
          </template>

          <!-- Navigation controls -->
          <div class="mx-auto flex max-w-6xl items-center justify-between pt-2">
            <button
              class="border-[3px] border-brand-teal bg-white px-4 py-2.5 text-xs font-black text-ink shadow-[2px_2px_0_#000] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] sm:px-5 sm:text-sm"
              @click="goPrevious"
            >
              Previous
            </button>
            <span class="font-mono text-xs font-bold text-slate-500">
              Topic {{ activeIndex + 1 }} of {{ topics.length }}
            </span>
            <button
              class="border-[3px] border-brand-teal bg-brand-blue px-4 py-2.5 text-xs font-black text-white shadow-[2px_2px_0_#000] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] sm:px-5 sm:text-sm"
              @click="goNext"
            >
              {{ activeIndex === topics.length - 1 ? 'Last Topic' : 'Next Topic' }}
            </button>
          </div>
        </article>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE_URL, apiFetch } from '@/lib/api'

interface Topic {
  id: number
  title: string
  description?: string | null
  content: string
  page_image_urls: string[]
  sort_order: number
}

interface ModuleDetail {
  id: number
  title: string
  description: string
  content_type?: string | null
  topics: Topic[]
  assessments: Array<{ id: number; assessment_type: string; title: string; description: string }>
}

const route = useRoute()
const router = useRouter()
const moduleData = ref<ModuleDetail | null>(null)
const activeTopicId = ref<number | null>(null)
const loading = ref(false)
const error = ref('')

const SLIDE_MARKER = /^-{2,}\s*Slide\s*\d+\s*-{2,}$/i
const topics = computed(() => {
  const seen = new Set<string>()
  return [...(moduleData.value?.topics ?? [])]
    .filter(t => {
      if (SLIDE_MARKER.test(t.title ?? '')) return false
      if (t.title.toLowerCase() === 'introduction') return false
      const key = (t.title ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.sort_order - b.sort_order)
})
const hasAutoIntro = computed(() => !isPagedMaterial(moduleData.value?.content_type))
const quizzes = computed(() => (moduleData.value?.assessments ?? []).filter(item => item.assessment_type === 'quiz'))
const activeTopic = computed(() => activeTopicId.value ? topics.value.find(topic => topic.id === activeTopicId.value) ?? null : null)
const activeIndex = computed(() => activeTopic.value ? topics.value.findIndex(t => t.id === activeTopic.value?.id) : 0)
const isIntroActive = computed(() => hasAutoIntro.value && !activeTopicId.value)
const headerTitle = computed(() => activeTopic.value?.title || moduleData.value?.title || 'Module Preview')
const headerDescription = computed(() => activeTopic.value?.description || moduleData.value?.description || '')

// Parse PPTX JSON slide content — same logic as TopicViewerPage
const parsedPptxContent = computed(() => {
  if (!activeTopic.value) return null
  try {
    const parsed = JSON.parse(activeTopic.value.content ?? '')
    if (parsed?.type === 'pptx_slide') return parsed as { badge: string; paragraphs: string[]; image_urls: string[] }
  } catch {}
  return null
})

onMounted(async () => {
  loading.value = true
  try {
    moduleData.value = await apiFetch<ModuleDetail>(`/teacher/modules/${route.params.moduleId}`)
    activeTopicId.value = hasAutoIntro.value ? null : topics.value[0]?.id ?? null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load preview.'
  } finally {
    loading.value = false
  }
})

function assetUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_BASE_URL}${url}`
}

function isPagedMaterial(contentType?: string | null) {
  // Only PDF uses page-image rendering (no auto-intro tab).
  // PPTX/PPT uses the structured slide card layout.
  return contentType === 'PDF'
}

function goPrevious() {
  if (activeIndex.value <= 0) {
    if (hasAutoIntro.value) activeTopicId.value = null
    return
  }
  activeTopicId.value = topics.value[activeIndex.value - 1]?.id ?? null
}

function goNext() {
  if (isIntroActive.value) {
    activeTopicId.value = topics.value[0]?.id ?? null
    return
  }
  if (activeIndex.value < topics.value.length - 1) {
    activeTopicId.value = topics.value[activeIndex.value + 1]?.id ?? null
  }
}
</script>
