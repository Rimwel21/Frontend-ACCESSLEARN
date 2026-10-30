<template>
  <div class="min-h-full bg-surface p-4 sm:p-7">
    <div class="mx-auto max-w-6xl">
      <header class="flex flex-wrap items-end justify-between gap-4 border-[3px] border-brand-teal bg-brand-blue p-5 text-white shadow-card sm:p-7">
        <div>
          <p class="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/75">Student library</p>
          <h1 class="mt-1 font-display text-2xl font-black sm:text-3xl">Learning Materials</h1>
          <p class="mt-2 text-sm font-semibold text-white/85">Open a lesson to read its slides, view sign-language support, and complete its checkpoints.</p>
        </div>
        <button type="button" class="border-[3px] border-white bg-white px-4 py-2 text-xs font-black text-brand-blue shadow-[2px_2px_0_#0f766e]" :disabled="content.loading" @click="refreshMaterials">
          {{ content.loading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </header>

      <section v-if="content.loading && !content.modules.length" class="mt-5 border-[3px] border-brand-teal bg-white p-8 text-center font-black shadow-card">Loading learning materials…</section>
      <section v-else-if="content.error" class="mt-5 border-[3px] border-brand-rose bg-brand-rose/10 p-6 font-bold text-brand-rose shadow-card">{{ content.error }}</section>
      <section v-else-if="!content.modules.length" class="mt-5 border-[3px] border-brand-teal bg-white p-8 text-center shadow-card">
        <h2 class="font-display text-xl font-black">No learning materials yet.</h2>
        <p class="mt-2 text-sm text-ink-soft">Published lessons assigned to your class will appear here.</p>
      </section>

      <section v-else class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="module in content.modules" :key="module.id" class="flex flex-col border-[3px] border-brand-teal bg-white p-5 shadow-card">
          <div class="flex items-start justify-between gap-3">
            <span class="border-2 border-brand-teal bg-brand-amber px-2 py-1 font-mono text-[10px] font-black uppercase">{{ module.week || 'Lesson' }}</span>
            <span class="font-mono text-xs font-black text-brand-blue">{{ progressFor(module.id) }}%</span>
          </div>
          <h2 class="mt-4 font-display text-xl font-black text-ink">{{ module.title }}</h2>
          <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{{ module.description || 'No description provided.' }}</p>
          <div class="mt-4 flex flex-wrap gap-2 text-xs font-bold text-ink-soft">
            <span class="border border-brand-teal/30 bg-surface px-2 py-1">{{ module.topic_count ?? module.topics.length }} topics</span>
            <span v-if="module.assessments.length" class="border border-brand-teal/30 bg-surface px-2 py-1">{{ module.assessments.length }} quizzes</span>
          </div>
          <button type="button" class="mt-5 w-full border-[3px] border-brand-teal bg-brand-blue px-4 py-2.5 text-sm font-black text-white shadow-[2px_2px_0_#0f766e] transition hover:-translate-y-px hover:bg-brand-teal" @click="router.push(`/student/modules/${module.id}`)">Open learning material</button>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentContentStore } from '@/stores/studentContent'

const router = useRouter()
const content = useStudentContentStore()

onMounted(() => {
  if (!content.modules.length) void content.fetchModules()
  else void content.fetchModules({ background: true })
})

function progressFor(moduleId: number) {
  return content.progressByModule[moduleId]?.percent ?? 0
}

function refreshMaterials() {
  void content.fetchModules()
}
</script>
