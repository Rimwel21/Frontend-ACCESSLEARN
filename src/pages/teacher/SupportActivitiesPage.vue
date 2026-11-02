<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="eyebrow">Targeted Support</p>
        <h1 class="font-display text-2xl font-bold">Remediation Activities</h1>
        <p class="mt-1 text-sm text-ink-soft">Create one activity with separate topic groups for the hearing-impaired students who need support.</p>
      </div>
      <RouterLink class="figma-button no-underline" to="/teacher/activities">Back to activities</RouterLink>
    </div>

    <section class="card grid gap-4 p-5 md:grid-cols-2">
      <label>
        <span class="figma-label">Learning material</span>
        <select v-model="selectedModuleId" class="figma-input" @change="loadSummary">
          <option value="">Select completed learning material...</option>
          <option v-for="module in modules" :key="module.id" :value="String(module.id)">{{ module.title }}</option>
        </select>
      </label>
      <div class="rounded border border-brand-teal/30 bg-brand-blue-soft/40 p-3 text-xs font-semibold text-ink-soft">
        Checkpoint reports appear only after a student completes all checkpoint questions in the material.
      </div>
    </section>

    <div v-if="loading" class="empty-state">Loading checkpoint reports...</div>
    <div v-else-if="selectedModuleId && summary && drafts.length === 0" class="card p-8 text-center text-sm font-semibold text-ink-soft">No students currently need a support activity for this material.</div>

    <form v-else-if="drafts.length" class="space-y-4" @submit.prevent="save">
      <section class="card grid gap-4 p-5 md:grid-cols-2">
        <label><span class="figma-label">Activity title</span><input v-model.trim="title" class="figma-input" /></label>
        <label><span class="figma-label">Due date (optional)</span><input v-model="dueAt" class="figma-input" type="datetime-local" /></label>
        <label><span class="figma-label">Admin Handsign dataset week</span><select v-model="answerWeek" class="figma-input" @change="loadDatasetLabels"><option value="">Select week...</option><option v-for="week in datasetWeeks" :key="week" :value="week">{{ week }}</option></select></label>
        <p class="self-end pb-2 text-xs font-semibold text-ink-soft">Select the expected signed word from the Admin dataset for every missed question.</p>
        <label class="md:col-span-2"><span class="figma-label">Description</span><textarea v-model.trim="description" class="figma-input min-h-20" /></label>
      </section>

      <section v-for="draft in drafts" :key="draft.checkpointId" class="card p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div><h2 class="font-display text-lg font-bold">Topics {{ draft.start }}–{{ draft.end }}</h2><p class="text-xs font-semibold text-ink-soft">Select students and turn their missed questions into signed questions for this group.</p></div>
          <span class="badge badge-amber">{{ selectedStudents(draft).length }} selected</span>
        </div>
        <div class="mt-4">
          <div>
            <span class="figma-label">Suggested hearing-impaired students</span>
            <p class="mb-2 text-xs font-semibold text-ink-soft">Students are suggested only when they missed one of the selected questions.</p>
            <label v-for="student in draft.students" :key="student.student_id" class="mt-2 flex items-center gap-2 rounded border border-gray-200 p-2 text-sm font-semibold">
              <input v-model="draft.studentIds" type="checkbox" :value="student.student_id" />
              <span>{{ student.student_name }} — {{ student.score }}/{{ student.total }}</span>
            </label>
          </div>
        </div>
        <div class="mt-4">
          <span class="figma-label">Missed questions to present through sign language</span>
          <article v-for="question in draft.questions" :key="question.index" class="mt-2 rounded border border-gray-200 p-3 text-sm">
            <label class="flex gap-3">
              <input v-model="question.selected" type="checkbox" @change="syncSuggestedStudents(draft)" />
              <span><strong>Question {{ question.index + 1 }}.</strong> {{ question.prompt }}</span>
            </label>
            <div v-if="question.selected" class="mt-3 grid gap-3 border-t border-gray-100 pt-3 md:grid-cols-2">
              <div>
                <span class="figma-label">Signed question video</span>
                <div class="flex flex-wrap gap-2">
                  <label class="upload-file-box cursor-pointer">
                    <span class="upload-file-plus">+</span>
                    <span><strong>Upload video</strong><small>MP4, WebM, MOV or AVI</small></span>
                    <input class="hidden" type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" @change="setQuestionVideo(question, $event)" />
                  </label>
                  <button class="figma-button" type="button" @click="openRecorder(question)">Take video</button>
                </div>
                <span class="mt-2 block text-xs font-semibold text-ink-soft">{{ question.video ? `Ready: ${question.video.name}` : 'Students will see this video instead of the text above.' }}</span>
              </div>
              <label>
                <span class="figma-label">Expected signed answer</span>
                <select v-model="question.answer" class="figma-input" :disabled="!answerWeek || labelsLoading">
                  <option value="">{{ answerWeek ? (labelsLoading ? 'Loading Admin labels...' : 'Select the signed word...') : 'Select the Admin dataset week first...' }}</option>
                  <option v-for="label in datasetLabels" :key="label" :value="label">{{ formatLabel(label) }}</option>
                </select>
                <span class="mt-1 block text-xs font-semibold text-ink-soft">Original checkpoint answer: {{ question.sourceAnswer || 'Not available' }}</span>
              </label>
              <label v-if="false">
                <span class="figma-label">Student answer type</span>
                <select v-model="question.question_type" class="figma-input">
                  <option value="identification">Identification</option>
                  <option value="multiple_choice">Multiple choice</option>
                </select>
              </label>
              <div v-if="question.question_type === 'multiple_choice'" class="md:col-span-2">
                <span class="figma-label">Answer choices</span>
                <p class="mb-2 text-xs font-semibold text-ink-soft">Include the original correct answer: “{{ question.answer }}”.</p>
                <div class="grid gap-2 md:grid-cols-2">
                  <input v-for="(_, optionIndex) in question.options" :key="optionIndex" v-model="question.options[optionIndex]" class="figma-input" :placeholder="`Choice ${optionIndex + 1}`" />
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
      <p v-if="error" class="status-error">{{ error }}</p>
      <div class="flex justify-end"><button class="figma-primary" :disabled="saving">{{ saving ? 'Posting…' : 'Post targeted support activity' }}</button></div>
    </form>

    <Teleport to="body">
      <div v-if="recordingQuestion" class="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4" @click.self="closeRecorder">
        <section class="w-full max-w-2xl rounded-md border border-brand-teal bg-white p-4 shadow-xl">
          <div class="flex items-start justify-between gap-3">
            <div><h2 class="font-display text-lg font-bold">Take signed question video</h2><p class="text-xs font-semibold text-ink-soft">Record the sign-language question students will watch.</p></div>
            <button class="figma-button" type="button" @click="closeRecorder">Cancel</button>
          </div>
          <video ref="recordingVideoRef" class="mt-4 aspect-video w-full rounded border bg-black object-cover" autoplay muted playsinline />
          <p v-if="recordingError" class="status-error mt-3">{{ recordingError }}</p>
          <div class="mt-4 flex justify-end gap-2">
            <button class="figma-button" type="button" :disabled="!recordingReady || recording" @click="startRecorder">Start recording</button>
            <button class="figma-primary" type="button" :disabled="!recording" @click="stopRecorder">Stop and use video</button>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { apiFetch, API_BASE_URL } from '@/lib/api'
import { getDatasetLabelsForWeek, getDatasetSummary } from '@/services/handsignAdmin'

interface Question { prompt: string; answer?: string; question_type?: 'identification' | 'multiple_choice' | 'true_false'; options?: string[] }
interface Student { student_id: number; student_name: string; score: number; total: number; struggling: boolean; missed_question_indexes: number[] }
interface Checkpoint { id: number; start_sort_order: number; end_sort_order: number; title: string; questions: Question[]; struggling_students: Student[] }
interface Summary { module_id: number; module_title: string; checkpoints: Checkpoint[] }
interface SignQuestionDraft extends Question { index: number; selected: boolean; question_type: 'identification' | 'multiple_choice'; options: string[]; video: File | null; sourceAnswer: string }
interface Draft { checkpointId: number; start: number; end: number; students: Student[]; studentIds: number[]; questions: SignQuestionDraft[] }

const modules = ref<Array<{ id: number; title: string }>>([])
const selectedModuleId = ref('')
const summary = ref<Summary | null>(null)
const drafts = ref<Draft[]>([])
const title = ref('Targeted Learning Support')
const description = ref('Review the assigned topics and answer the follow-up questions.')
const dueAt = ref('')
const answerWeek = ref('')
const datasetWeeks = ref<string[]>([])
const datasetLabels = ref<string[]>([])
const labelsLoading = ref(false)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const recordingQuestion = ref<SignQuestionDraft | null>(null)
const recordingVideoRef = ref<HTMLVideoElement | null>(null)
const recordingReady = ref(false)
const recording = ref(false)
const recordingError = ref('')
let recordingStream: MediaStream | null = null
let mediaRecorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []

onMounted(async () => {
  modules.value = await apiFetch('/teacher/modules/')
  try { datasetWeeks.value = (await getDatasetSummary()).weeks ?? [] } catch { /* Save validation provides a clear message if this cannot load. */ }
})

async function loadSummary() {
  summary.value = null
  drafts.value = []
  if (!selectedModuleId.value) return
  loading.value = true
  try {
    summary.value = await apiFetch<Summary>(`/teacher/modules/${selectedModuleId.value}/checkpoint-summary`)
    drafts.value = summary.value.checkpoints
      .filter(checkpoint => checkpoint.struggling_students.length)
      .map(checkpoint => {
        const missed = new Set(checkpoint.struggling_students.flatMap(student => student.missed_question_indexes))
        const questions = checkpoint.questions
          .map((question, index) => ({
            ...question,
            answer: '',
            sourceAnswer: readableAnswer(question.answer ?? ''),
            index,
            selected: true,
            question_type: 'identification' as const,
            options: [],
            video: null,
          }))
          .filter(question => missed.has(question.index))
        return {
          checkpointId: checkpoint.id,
          start: checkpoint.start_sort_order,
          end: checkpoint.end_sort_order,
          students: checkpoint.struggling_students,
          studentIds: checkpoint.struggling_students.map(student => student.student_id),
          questions,
        }
      })
  } catch (err) { error.value = err instanceof Error ? err.message : 'Unable to load checkpoint reports.' }
  finally { loading.value = false }
}

function selectedStudents(draft: Draft) { return draft.studentIds }
async function loadDatasetLabels() {
  datasetLabels.value = []
  if (!answerWeek.value) return
  labelsLoading.value = true
  try { datasetLabels.value = (await getDatasetLabelsForWeek(answerWeek.value)).labels }
  catch (err) { error.value = err instanceof Error ? err.message : 'Unable to load Admin Handsign labels.' }
  finally { labelsLoading.value = false }
}
function formatLabel(value: string) { return value.replace(/_/g, ' ') }
function setQuestionVideo(question: SignQuestionDraft, event: Event) { question.video = (event.target as HTMLInputElement).files?.[0] ?? null }
async function openRecorder(question: SignQuestionDraft) {
  recordingQuestion.value = question
  recordingError.value = ''
  recordingReady.value = false
  recording.value = false
  await nextTick()
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
    if (!recordingVideoRef.value) throw new Error('Camera preview is not ready.')
    recordingVideoRef.value.srcObject = recordingStream
    await recordingVideoRef.value.play()
    recordingReady.value = true
  } catch {
    recordingError.value = 'Camera permission is required to take a signed question video.'
    stopCamera()
  }
}
function startRecorder() {
  if (!recordingStream || recording.value || !recordingQuestion.value) return
  try {
    recordedChunks = []
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm'
    mediaRecorder = new MediaRecorder(recordingStream, { mimeType })
    mediaRecorder.ondataavailable = event => { if (event.data.size) recordedChunks.push(event.data) }
    mediaRecorder.onstop = () => {
      if (recordingQuestion.value && recordedChunks.length) recordingQuestion.value.video = new File([new Blob(recordedChunks, { type: 'video/webm' })], `signed-question-${recordingQuestion.value.index + 1}.webm`, { type: 'video/webm' })
      closeRecorder()
    }
    mediaRecorder.start()
    recording.value = true
  } catch { recordingError.value = 'This browser could not start video recording.' }
}
function stopRecorder() { if (mediaRecorder?.state === 'recording') mediaRecorder.stop() }
function stopCamera() { recordingStream?.getTracks().forEach(track => track.stop()); recordingStream = null; if (recordingVideoRef.value) recordingVideoRef.value.srcObject = null; recordingReady.value = false }
function closeRecorder() { if (mediaRecorder?.state === 'recording') { mediaRecorder.onstop = null; mediaRecorder.stop() }; stopCamera(); recordingQuestion.value = null; recording.value = false; recordedChunks = [] }
function selectedQuestions(draft: Draft) { return draft.questions.filter(question => question.selected) }
function syncSuggestedStudents(draft: Draft) {
  const selectedIndexes = new Set(selectedQuestions(draft).map(question => question.index))
  draft.studentIds = draft.students
    .filter(student => student.missed_question_indexes.some(index => selectedIndexes.has(index)))
    .map(student => student.student_id)
}
function readableAnswer(answer: string) {
  if (!answer.includes('CORRECT:') || !answer.includes('|')) return answer
  const parts = answer.split('|').map(part => part.trim())
  const correct = parts.find(part => part.startsWith('CORRECT:'))?.split(':', 2)[1]?.trim().toUpperCase()
  return parts.find(part => part.split(':', 1)[0]?.trim().toUpperCase() === correct)?.split(':').slice(1).join(':').trim() || answer
}

async function save() {
  error.value = ''
  if (!selectedModuleId.value || !title.value || !description.value || !answerWeek.value) { error.value = 'Complete the activity details and select the Admin Handsign dataset week.'; return }
  const active = drafts.value.filter(draft => draft.studentIds.length && selectedQuestions(draft).length)
  if (!active.length) { error.value = 'Select at least one student and one missed question for a topic group.'; return }
  for (const draft of active) {
    for (const question of selectedQuestions(draft)) {
      if (!question.video) { error.value = `Record or upload the sign-language video for question ${question.index + 1}.`; return }
      if (!question.answer || !datasetLabels.value.includes(question.answer)) { error.value = `Select the Admin dataset answer for question ${question.index + 1}.`; return }
    }
  }
  saving.value = true
  try {
    const created = await apiFetch<{ id: number; interventions: Array<{ id: number }> }>('/teacher/remediation-activities/', {
      method: 'POST',
      body: JSON.stringify({
        module_id: Number(selectedModuleId.value), title: title.value, description: description.value,
        due_at: dueAt.value ? new Date(dueAt.value).toISOString() : null,
        interventions: active.map(draft => ({
          checkpoint_id: draft.checkpointId, start_sort_order: draft.start, end_sort_order: draft.end,
          title: `Topics ${draft.start}–${draft.end} support`, instructions: 'Review the assigned topics before answering the signed follow-up questions.',
          student_ids: draft.studentIds,
          questions: selectedQuestions(draft).map(question => ({
            prompt: question.prompt,
            answer: question.answer,
            answer_week: answerWeek.value,
            source_question_index: question.index,
            prompt_type: 'sign_video',
            question_type: 'identification',
            options: [],
          })),
        })),
      }),
    })
    await Promise.all(active.map(async (draft, index) => {
      const interventionId = created.interventions[index].id
      const uploads: Promise<void>[] = []
      selectedQuestions(draft).forEach((question, questionIndex) => {
        const form = new FormData(); form.append('video', question.video as File)
        uploads.push(uploadVideo(`/teacher/remediation-activities/${created.id}/interventions/${interventionId}/questions/${questionIndex}/video`, form, `sign-language video for question ${question.index + 1}`))
      })
      await Promise.all(uploads)
    }))
    await loadSummary()
  } catch (err) { error.value = err instanceof Error ? err.message : 'Unable to post the support activity.' }
  finally { saving.value = false }
}

async function uploadVideo(path: string, form: FormData, label: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}` },
    body: form,
  })
  if (!response.ok) throw new Error(`Activity was posted but its ${label} could not be uploaded.`)
}

onBeforeUnmount(closeRecorder)
</script>
