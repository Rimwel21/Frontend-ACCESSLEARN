<template>
  <div class="min-h-screen bg-surface p-4 sm:p-7">
    <div class="mx-auto max-w-5xl">
      <button class="figma-button" @click="router.push('/student/activities')">Back to activities</button>
      <div v-if="loading" class="mt-5 card p-8 text-center font-bold">Loading support activity…</div>
      <div v-else-if="error" class="mt-5 status-error">{{ error }}</div>
      <template v-else-if="activity">
        <header class="mt-5 border-[3px] border-brand-teal bg-brand-amber p-5">
          <div class="font-mono text-[10px] font-black uppercase tracking-widest">Targeted Learning Support</div>
          <h1 class="mt-1 font-display text-2xl font-black">{{ activity.activity_title }}</h1>
          <p class="mt-2 text-sm font-semibold">{{ activity.activity_description }}</p>
          <p class="mt-2 text-xs font-bold text-ink-soft">Assigned review: Topics {{ activity.start_sort_order }}–{{ activity.end_sort_order }}<span v-if="activity.is_late"> · Submitted work will be marked late</span></p>
        </header>
        <section v-if="step === 'review'" class="mt-5 space-y-5">
          <article v-if="activeTopic" class="card p-5">
            <div class="mb-4 flex justify-between gap-3"><h2 class="font-display text-xl font-bold">{{ activeTopic.title }}</h2><span class="text-xs font-bold text-ink-soft">Topic {{ topicIndex + 1 }} of {{ activity.topics.length }}</span></div>
            <div v-if="activeTopic.page_image_urls?.length" class="grid gap-4"><img v-for="url in activeTopic.page_image_urls" :key="url" :src="assetUrl(url)" class="w-full rounded border" /></div>
            <p v-else class="whitespace-pre-line text-sm leading-7">{{ activeTopic.content }}</p>
            <div class="mt-5 flex justify-between"><button class="figma-button" :disabled="topicIndex === 0" @click="topicIndex--">Previous</button><button class="figma-primary" @click="nextTopic">{{ topicIndex === activity.topics.length - 1 ? 'Start activity questions' : 'Next topic' }}</button></div>
          </article>
          <article v-else class="card p-5">No review topics are available.</article>
        </section>
        <section v-else class="mt-5 space-y-4">
          <article v-for="(question, index) in activity.questions" :key="index" class="card p-5">
            <div class="font-bold">Question {{ index + 1 }}</div>
            <template v-if="question.prompt_type === 'sign_video'">
              <video v-if="question.sign_video_url" :src="assetUrl(question.sign_video_url)" controls playsinline class="mt-3 aspect-video w-full max-w-2xl rounded border bg-black" />
              <p v-else class="mt-2 text-sm font-semibold text-status-error">The teacher's signed question video is not available yet.</p>
              <p class="mt-2 text-xs font-semibold text-ink-soft">Watch or replay the signed question, then choose or enter your answer.</p>
            </template>
            <p v-else class="mt-2 text-sm">{{ question.prompt }}</p>
            <div v-if="question.question_type === 'multiple_choice'" class="mt-3 grid gap-2"><button v-for="(option, optionIndex) in question.options ?? []" :key="option" type="button" :disabled="question.prompt_type === 'sign_video' && !question.sign_video_url" :class="['figma-button text-left', answers[String(index)] === String.fromCharCode(65 + optionIndex) ? 'bg-brand-blue text-white' : '']" @click="answers[String(index)] = String.fromCharCode(65 + optionIndex)">{{ String.fromCharCode(65 + optionIndex) }}. {{ option }}</button></div>
            <div v-else-if="question.question_type === 'true_false'" class="mt-3 flex gap-2"><button v-for="choice in ['True', 'False']" :key="choice" class="figma-button flex-1" :disabled="question.prompt_type === 'sign_video' && !question.sign_video_url" @click="answers[String(index)] = choice">{{ choice }}</button></div>
            <input v-else v-model="answers[String(index)]" class="figma-input mt-3" :disabled="question.prompt_type === 'sign_video' && !question.sign_video_url" placeholder="Your answer" />
          </article>
          <div v-if="result" class="status-success">Submitted: {{ result.score }}/{{ result.total }}.</div>
          <div class="flex justify-end"><button class="figma-primary" :disabled="Boolean(result) || saving" @click="submit">{{ saving ? 'Submitting…' : result ? 'Completed' : 'Submit activity' }}</button></div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE_URL, apiFetch } from '@/lib/api'

interface Topic { id: number; title: string; content: string; page_image_urls?: string[] }
interface Activity { activity_title: string; activity_description: string; start_sort_order: number; end_sort_order: number; status: string; score?: number | null; total?: number | null; is_late: boolean; topics: Topic[]; questions: Array<{ prompt?: string; prompt_type?: 'text' | 'sign_video'; sign_video_url?: string | null; question_type?: string; options?: string[] }> }
const route = useRoute(); const router = useRouter()
const activity = ref<Activity | null>(null); const loading = ref(true); const error = ref(''); const saving = ref(false)
const step = ref<'review' | 'questions'>('review'); const topicIndex = ref(0); const answers = ref<Record<string, string>>({}); const result = ref<{ score: number; total: number } | null>(null)
const activeTopic = computed(() => activity.value?.topics[topicIndex.value] ?? null)
onMounted(async () => { try { activity.value = await apiFetch<Activity>(`/student/remediation-activities/${route.params.targetId}`); if (activity.value.status === 'completed') result.value = { score: activity.value.score ?? 0, total: activity.value.total ?? 0 } } catch (err) { error.value = err instanceof Error ? err.message : 'Unable to load support activity.' } finally { loading.value = false } })
function nextTopic() { if (!activity.value || topicIndex.value >= activity.value.topics.length - 1) step.value = 'questions'; else topicIndex.value++ }
function assetUrl(url?: string | null) { return !url || url.startsWith('http') ? url ?? '' : `${API_BASE_URL}${url}` }
async function submit() { if (!activity.value || Object.keys(answers.value).length < activity.value.questions.length) return; saving.value = true; try { const saved = await apiFetch<{ score: number; total: number }>(`/student/remediation-activities/${route.params.targetId}/submit`, { method: 'POST', body: JSON.stringify({ answers: answers.value }) }); result.value = saved } catch (err) { error.value = err instanceof Error ? err.message : 'Unable to submit activity.' } finally { saving.value = false } }
</script>
