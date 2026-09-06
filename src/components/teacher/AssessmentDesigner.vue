<template>
  <div class="figma-page">
    <!-- Header -->
    <div class="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div class="figma-title">{{ title }}</div>
        <p class="mt-1 text-xs font-semibold text-ink-soft">Organize details, availability, and scoring questions before saving.</p>
      </div>
      <span class="rounded-full bg-[#D6E4FF] px-3 py-1 text-[11px] font-bold text-[#315ed8]">{{ form.questions.length }} question{{ form.questions.length === 1 ? '' : 's' }}</span>
    </div>

    <div class="grid gap-2 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)]">
      <!-- Left column: Information + Settings -->
      <div class="grid gap-2">
        <!-- Information panel -->
        <section class="figma-panel">
          <div class="mb-4">
            <h2 class="figma-card-title mb-1">{{ title }} Information</h2>
            <p class="text-xs font-semibold text-ink-soft">Choose the class and context students will see.</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="figma-label" for="assessment-title">{{ title }} Title</label>
              <input id="assessment-title" v-model.trim="form.title" class="figma-input" />
            </div>
            <div class="sm:col-span-2">
              <label class="figma-label" for="assessment-description">Description</label>
              <textarea id="assessment-description" v-model.trim="form.description" class="figma-input min-h-20 resize-y" />
            </div>

            <!-- Question Type Dropdown (replaces free-text input) -->
            <div>
              <label class="figma-label" for="assessment-type">{{ title }} Type</label>
              <select
                id="assessment-type"
                :value="form.category"
                class="figma-input"
                @change="onCategoryChange(($event.target as HTMLSelectElement).value)"
              >
                <option v-for="opt in QUESTION_TYPES" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div>
              <label class="figma-label" for="assessment-week">Week</label>
              <select id="assessment-week" v-model="form.week" class="figma-input">
                <option value="">Select week...</option>
                <option v-for="week in learningWeekOptions" :key="week" :value="week">{{ week }}</option>
              </select>
            </div>
            <div>
              <label class="figma-label" for="assessment-due-date">Due Date</label>
              <input id="assessment-due-date" v-model="form.dueDate" class="figma-input" type="date" />
            </div>
            <div>
              <label class="figma-label" for="assessment-class">Target Class</label>
              <select id="assessment-class" v-model="form.classId" class="figma-input" @change="selectClass">
                <option value="">Select grade and section</option>
                <option v-for="cls in store.classes" :key="cls.id" :value="cls.id">
                  {{ cls.className }} - {{ gradeLabel(cls.gradeLevel) }} Section {{ cls.section }}
                </option>
              </select>
            </div>
          </div>
        </section>

        <!-- Timer / Settings panel -->
        <section class="figma-panel">
          <div class="mb-4">
            <h2 class="figma-card-title mb-1">{{ props.kind === 'quiz' ? 'Quiz Timer' : `${title} Settings` }}</h2>
            <p class="text-xs font-semibold text-ink-soft">{{ props.kind === 'quiz' ? 'Choose if this quiz has a countdown, then set the duration and unit.' : 'Control attempt behavior and answer visibility.' }}</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-if="props.kind === 'quiz'" class="sm:col-span-2">
              <label class="flex items-center gap-2 text-xs font-bold">
                <input v-model="form.timerEnabled" type="checkbox" class="accent-green-500" />
                Enable Quiz Timer
              </label>
              <div class="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]">
                <div>
                  <label class="figma-label" for="time-limit-duration">Duration</label>
                  <input
                    id="time-limit-duration"
                    v-model.number="form.timeLimitValue"
                    class="figma-input"
                    inputmode="numeric"
                    min="1"
                    step="1"
                    type="number"
                    :disabled="!form.timerEnabled"
                    placeholder="Enter number"
                    @input="sanitizeTimerDuration"
                    @keydown="blockInvalidNumberInput"
                  />
                </div>
                <div>
                  <label class="figma-label" for="time-limit-unit">Unit</label>
                  <select id="time-limit-unit" v-model="form.timeLimitUnit" class="figma-input" :disabled="!form.timerEnabled">
                    <option value="hours">Hours</option>
                    <option value="minutes">Minutes</option>
                    <option value="seconds">Seconds</option>
                  </select>
                </div>
              </div>
              <p v-if="!form.timerEnabled" class="mt-2 text-[11px] font-semibold text-ink-soft">Timer disabled: students can answer without a countdown.</p>
            </div>
            <div v-if="props.kind !== 'quiz'">
              <label class="figma-label" for="attempts">Attempts Allowed</label>
              <input id="attempts" v-model.number="form.attemptsAllowed" class="figma-input" min="1" type="number" />
            </div>
            <label class="flex items-center gap-2 text-xs font-bold sm:col-span-2">
              <input v-model="form.shuffleQuestions" type="checkbox" class="accent-green-500" />
              Shuffle Questions
            </label>
            <label class="flex items-center gap-2 text-xs font-bold sm:col-span-2">
              <input v-model="form.showAnswersAfterSubmission" type="checkbox" class="accent-green-500" />
              Show Answers after Submission
            </label>
          </div>
        </section>
      </div>

      <!-- Right column: Questions -->
      <section class="figma-panel">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="figma-card-title mb-1">Questions</h2>
            <p class="text-xs font-semibold text-ink-soft">Add clear prompts and exact answers for automatic scoring.</p>
          </div>
          <button class="figma-button" type="button" @click="addQuestion">Add Question</button>
        </div>

        <div class="rounded-md bg-gray-100 p-3">
          <div class="grid gap-3">
            <div
              v-for="(question, index) in form.questions"
              :key="index"
              class="grid gap-2 rounded-md border border-gray-200 bg-white p-3"
            >
              <!-- Question header row -->
              <div class="flex items-center justify-between gap-2">
                <label class="figma-label mb-0">Question {{ index + 1 }}</label>
                <button
                  class="figma-button flex-shrink-0"
                  type="button"
                  :disabled="form.questions.length === 1"
                  @click="removeQuestion(index)"
                >
                  Remove
                </button>
              </div>

              <!-- Prompt textarea (all types) -->
              <textarea
                v-model.trim="question.prompt"
                class="figma-input min-w-0 resize-y bg-white"
                :placeholder="`Prompt for question ${index + 1}`"
                rows="2"
              />

              <!-- ── IDENTIFICATION ── -->
              <template v-if="form.category === 'Identification'">
                <div>
                  <label class="figma-label">Correct Answer</label>
                  <input
                    v-model.trim="question.answer"
                    class="figma-input bg-white"
                    placeholder="Enter the correct answer"
                  />
                </div>
              </template>

              <!-- ── TRUE OR FALSE ── -->
              <template v-else-if="form.category === 'True or False'">
                <div>
                  <label class="figma-label mb-2">Choices</label>
                  <div class="flex gap-2">
                    <div class="flex flex-1 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-ink-soft">
                      True
                    </div>
                    <div class="flex flex-1 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-ink-soft">
                      False
                    </div>
                  </div>
                </div>
                <div>
                  <label class="figma-label mb-2">Correct Answer</label>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      :class="[
                        'flex-1 rounded-md border px-3 py-2 text-sm font-semibold transition',
                        question._tfAnswer === 'TRUE'
                          ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-400'
                          : 'border-gray-200 bg-white text-ink hover:border-green-300 hover:bg-green-50'
                      ]"
                      @click="question._tfAnswer = 'TRUE'"
                    >
                      ✓ True
                    </button>
                    <button
                      type="button"
                      :class="[
                        'flex-1 rounded-md border px-3 py-2 text-sm font-semibold transition',
                        question._tfAnswer === 'FALSE'
                          ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-400'
                          : 'border-gray-200 bg-white text-ink hover:border-green-300 hover:bg-green-50'
                      ]"
                      @click="question._tfAnswer = 'FALSE'"
                    >
                      ✓ False
                    </button>
                  </div>
                  <p v-if="!question._tfAnswer" class="mt-1 text-[11px] font-semibold text-amber-600">
                    Select the correct answer above.
                  </p>
                </div>
              </template>

              <!-- ── MULTIPLE CHOICE ── -->
              <template v-else-if="form.category === 'Multiple Choice'">
                <div>
                  <label class="figma-label mb-2">
                    Choices
                    <span class="font-normal text-ink-soft">&mdash; click ○ to mark the correct answer</span>
                  </label>
                  <div class="grid gap-2">
                    <div
                      v-for="(choice, choiceIndex) in question._mcChoices"
                      :key="choice.letter"
                      class="flex items-center gap-2"
                    >
                      <!-- Correct-answer selector circle -->
                      <button
                        type="button"
                        :title="question._mcCorrect === choice.letter ? 'Correct answer' : 'Mark as correct'"
                        :class="[
                          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition',
                          question._mcCorrect === choice.letter
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 bg-white hover:border-green-400'
                        ]"
                        @click="question._mcCorrect = choice.letter"
                      >
                        <span v-if="question._mcCorrect === choice.letter" class="text-[10px] font-black leading-none">✓</span>
                      </button>

                      <!-- Letter label -->
                      <span class="w-5 flex-shrink-0 text-center text-xs font-black text-ink-soft">{{ choice.letter }}.</span>

                      <!-- Choice text input -->
                      <input
                        v-model.trim="choice.text"
                        class="figma-input flex-1 bg-white"
                        :placeholder="`Choice ${choice.letter}`"
                      />

                      <!-- Remove choice button (disabled when only 2 left) -->
                      <button
                        type="button"
                        :disabled="question._mcChoices.length <= 2"
                        :class="[
                          'figma-button flex-shrink-0 px-2 text-base leading-none',
                          question._mcChoices.length <= 2 ? 'cursor-not-allowed opacity-40' : ''
                        ]"
                        :title="question._mcChoices.length <= 2 ? 'Minimum 2 choices required' : 'Remove this choice'"
                        @click="removeMcChoice(index, choiceIndex)"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <!-- Add choice button -->
                  <button
                    v-if="question._mcChoices.length < 26"
                    class="figma-button mt-2 w-full"
                    type="button"
                    @click="addMcChoice(index)"
                  >
                    + Add Choice
                  </button>

                  <p v-if="!question._mcCorrect" class="mt-1 text-[11px] font-semibold text-amber-600">
                    Click a circle (○) next to a choice to mark it as the correct answer.
                  </p>
                </div>
              </template>

              <!-- ── SIGN TUTORIAL VIDEO (activities only, always visible) ── -->
              <div v-if="props.kind === 'activity'" class="rounded-md border border-gray-200 bg-gray-50 p-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div class="text-xs font-black uppercase tracking-wide text-ink">Sign tutorial video</div>
                    <p class="mt-0.5 text-[11px] font-semibold text-ink-soft">Saved using the correct answer word.</p>
                  </div>
                  <span class="rounded-full bg-[#D6E4FF] px-3 py-1 text-[11px] font-bold text-[#315ed8]">
                    {{ canonicalPreview(resolvedAnswerWord(question)) || 'Answer needed' }}
                  </span>
                </div>

                <div class="mt-3 flex flex-wrap gap-2">
                  <label
                    :class="[
                      'figma-button cursor-pointer',
                      !resolvedAnswerWord(question) ? 'cursor-not-allowed opacity-50' : ''
                    ]"
                  >
                    Upload Video
                    <input
                      class="hidden"
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                      :disabled="!resolvedAnswerWord(question)"
                      @change="handleTutorialFile(index, $event)"
                    />
                  </label>
                  <button
                    class="figma-button"
                    type="button"
                    :disabled="!resolvedAnswerWord(question)"
                    @click="openRecordingModal(index)"
                  >
                    Take Video
                  </button>
                  <button
                    v-if="tutorialFiles[index]"
                    class="figma-button"
                    type="button"
                    @click="clearTutorialVideo(index)"
                  >
                    Remove Video
                  </button>
                </div>

                <video
                  v-if="tutorialPreviewUrls[index]"
                  class="mt-3 aspect-video w-full rounded-md border border-gray-200 bg-black object-contain"
                  :src="tutorialPreviewUrls[index]"
                  controls
                />
                <p v-if="tutorialUploadMessages[index]" class="mt-2 text-[11px] font-bold text-green-700">
                  {{ tutorialUploadMessages[index] }}
                </p>
                <p v-if="tutorialUploadErrors[index]" class="mt-2 text-[11px] font-bold text-red-700">
                  {{ tutorialUploadErrors[index] }}
                </p>
                <p v-if="!resolvedAnswerWord(question)" class="mt-2 text-[11px] font-semibold text-ink-soft">
                  Enter a correct answer before adding its tutorial video.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Save bar -->
    <div class="mt-3 flex items-center justify-end gap-3">
      <p v-if="error" class="status-error mr-auto" role="alert">{{ error }}</p>
      <p v-if="success" class="status-success mr-auto" role="status">{{ success }}</p>
      <button class="figma-primary" :disabled="saving" @click="saveAssessment">
        {{ saving ? 'Saving...' : `${isEditing ? 'Update' : 'Save'} ${title}` }}
      </button>
    </div>

    <!-- ── Type-change confirmation dialog ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showTypeChangeConfirm"
          class="fixed inset-0 z-[60] grid place-items-center bg-black/30 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div class="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
            <h3 class="font-display text-sm font-bold text-ink">Change Question Type?</h3>
            <p class="mt-2 text-xs font-semibold text-ink-soft">
              Changing the question type will reset the answer choices for questions that already have data entered.
              Question text will be preserved, and the correct answer will be carried over where possible.
            </p>
            <div class="mt-4 flex justify-end gap-2">
              <button class="figma-button" type="button" @click="cancelCategoryChange">Cancel</button>
              <button class="figma-primary" type="button" @click="confirmCategoryChange">Continue</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Recording modal ── -->
    <Teleport to="body">
      <div
        v-if="recordingModal"
        class="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-6"
        role="dialog"
        aria-modal="true"
      >
        <section class="w-full max-w-2xl rounded-md border border-gray-200 bg-white p-4 shadow-xl">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="figma-card-title mb-1">Take Tutorial Video</h2>
              <p class="text-xs font-semibold text-ink-soft">Recording tutorial for {{ canonicalPreview(recordingModal.answer) }}.</p>
            </div>
            <button class="figma-button" type="button" @click="closeRecordingModal">Close</button>
          </div>

          <div class="mt-4 overflow-hidden rounded-md border border-gray-200 bg-black">
            <video ref="recordingVideoRef" class="aspect-video w-full object-cover" autoplay muted playsinline />
          </div>

          <p v-if="recordingError" class="status-error mt-3" role="alert">{{ recordingError }}</p>
          <p v-else class="mt-3 text-xs font-semibold text-ink-soft">
            {{ isRecording ? 'Recording now. Stop when the sign tutorial is finished.' : 'Camera is ready. Start recording when you are ready.' }}
          </p>

          <div class="mt-4 flex flex-wrap justify-end gap-2">
            <button class="figma-button" type="button" :disabled="isRecording || !recordingReady" @click="startTutorialRecording">
              Start Recording
            </button>
            <button class="figma-primary" type="button" :disabled="!isRecording" @click="stopTutorialRecording">
              Stop and Use Video
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { learningWeekOptions } from '@/constants/learning'
import { handsignErrorMessage, uploadTutorialVideo } from '@/services/handsign'
import { useTeacherStore } from '@/stores/teacher'
import type { Activity, Quiz } from '@/stores/teacher'

const props = defineProps<{
  kind: 'quiz' | 'activity'
  title: string
  initialAssessment?: Quiz | Activity | null
}>()
const emit = defineEmits<{
  saved: [mode: 'created' | 'updated']
}>()

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Types
// ─────────────────────────────────────────────────────────────────────────────

const QUESTION_TYPES = ['Identification', 'True or False', 'Multiple Choice'] as const
const CHOICE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * Extended question draft — includes decoded UI state for TF and MC.
 * Before saving, these are encoded back into a single `answer` string for the backend.
 *
 * Encoding formats:
 *  - Identification:  plain text, e.g. "Photosynthesis"
 *  - True or False:   "TRUE" or "FALSE"
 *  - Multiple Choice: "A:Leaf|B:Stem|C:Roots|CORRECT:C"
 */
interface QuestionDraft {
  prompt: string
  answer: string                              // plain text (Identification) or encoded (TF/MC)
  _tfAnswer: 'TRUE' | 'FALSE' | ''           // True/False selection
  _mcChoices: { letter: string; text: string }[] // Multiple Choice choices
  _mcCorrect: string                          // correct letter for MC
}

// ─────────────────────────────────────────────────────────────────────────────
// Store / state
// ─────────────────────────────────────────────────────────────────────────────

const store = useTeacherStore()
const error = ref('')
const success = ref('')

// Type-change confirmation
const showTypeChangeConfirm = ref(false)
const pendingCategoryChange = ref('')

// Tutorial video / recording
const tutorialFiles = ref<Record<number, File | null>>({})
const tutorialPreviewUrls = ref<Record<number, string>>({})
const tutorialUploadMessages = ref<Record<number, string>>({})
const tutorialUploadErrors = ref<Record<number, string>>({})
const recordingModal = ref<{ index: number; answer: string } | null>(null)
const recordingVideoRef = ref<HTMLVideoElement | null>(null)
const recordingReady = ref(false)
const isRecording = ref(false)
const recordingError = ref('')
const tutorialUploadSummary = ref(0)
let recordingStream: MediaStream | null = null
let mediaRecorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []
let discardRecording = false

// ─────────────────────────────────────────────────────────────────────────────
// Form defaults
// ─────────────────────────────────────────────────────────────────────────────

function defaultMcChoices(): { letter: string; text: string }[] {
  return [
    { letter: 'A', text: '' },
    { letter: 'B', text: '' },
    { letter: 'C', text: '' },
  ]
}

function blankQuestion(): QuestionDraft {
  return {
    prompt: '',
    answer: '',
    _tfAnswer: '',
    _mcChoices: defaultMcChoices(),
    _mcCorrect: '',
  }
}

function blankForm() {
  return {
    classId: '',
    title: '',
    description: '',
    category: 'Identification',
    week: '',
    dueDate: '',
    timerEnabled: false,
    timeLimitValue: null as number | null,
    timeLimitUnit: 'minutes' as 'seconds' | 'minutes' | 'hours',
    attemptsAllowed: 1,
    shuffleQuestions: true,
    showAnswersAfterSubmission: true,
    questions: [blankQuestion()] as QuestionDraft[],
  }
}

const form = ref(blankForm())

const saving = computed(() => props.kind === 'quiz' ? store.quizSaving : store.activitySaving)
const isEditing = computed(() => Boolean(props.initialAssessment))

// ─────────────────────────────────────────────────────────────────────────────
// Answer encoding / decoding
// ─────────────────────────────────────────────────────────────────────────────

/** Build the backend `answer` string from the question draft's UI state. */
function encodeAnswer(q: QuestionDraft, category: string): string {
  if (category === 'True or False') return q._tfAnswer
  if (category === 'Multiple Choice') {
    const parts = q._mcChoices.map(c => `${c.letter}:${c.text}`)
    parts.push(`CORRECT:${q._mcCorrect}`)
    return parts.join('|')
  }
  // Identification
  return q.answer
}

/** Parse a stored `answer` string back into the question draft's UI state. */
function decodeAnswer(
  answer: string | null | undefined,
  category: string,
): Pick<QuestionDraft, 'answer' | '_tfAnswer' | '_mcChoices' | '_mcCorrect'> {
  const raw = answer ?? ''

  if (category === 'True or False') {
    const up = raw.toUpperCase()
    const tf = up === 'TRUE' ? 'TRUE' : up === 'FALSE' ? 'FALSE' : ''
    return { answer: raw, _tfAnswer: tf as 'TRUE' | 'FALSE' | '', _mcChoices: defaultMcChoices(), _mcCorrect: '' }
  }

  if (category === 'Multiple Choice') {
    // Parse "A:Leaf|B:Stem|C:Roots|CORRECT:C"
    const parts = raw.split('|')
    const choices: { letter: string; text: string }[] = []
    let correct = ''
    for (const part of parts) {
      const colonIdx = part.indexOf(':')
      if (colonIdx === -1) continue
      const key = part.slice(0, colonIdx).trim()
      const val = part.slice(colonIdx + 1).trim()
      if (key === 'CORRECT') correct = val
      else if (key) choices.push({ letter: key, text: val })
    }
    return {
      answer: raw,
      _tfAnswer: '',
      _mcChoices: choices.length >= 2 ? choices : defaultMcChoices(),
      _mcCorrect: correct,
    }
  }

  // Identification (or unrecognised category → treat as identification)
  return { answer: raw, _tfAnswer: '', _mcChoices: defaultMcChoices(), _mcCorrect: '' }
}

/**
 * Returns the human-readable correct answer word for a question.
 * Used for the Sign Tutorial Video filename and enabled/disabled state.
 */
function resolvedAnswerWord(q: QuestionDraft): string {
  const cat = form.value.category
  if (cat === 'True or False') {
    return q._tfAnswer === 'TRUE' ? 'True' : q._tfAnswer === 'FALSE' ? 'False' : ''
  }
  if (cat === 'Multiple Choice') {
    return q._mcChoices.find(c => c.letter === q._mcCorrect)?.text?.trim() ?? ''
  }
  return q.answer?.trim() ?? ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Type switching with confirmation
// ─────────────────────────────────────────────────────────────────────────────

function hasAnyTypeSpecificData(): boolean {
  const cat = form.value.category
  return form.value.questions.some(q => {
    if (cat === 'True or False') return Boolean(q._tfAnswer)
    if (cat === 'Multiple Choice') return q._mcChoices.some(c => c.text.trim()) || Boolean(q._mcCorrect)
    return Boolean(q.answer?.trim())
  })
}

function onCategoryChange(newCategory: string) {
  if (newCategory === form.value.category) return
  if (hasAnyTypeSpecificData()) {
    pendingCategoryChange.value = newCategory
    showTypeChangeConfirm.value = true
  } else {
    applyCategory(newCategory, form.value.category)
    form.value.category = newCategory
  }
}

function confirmCategoryChange() {
  showTypeChangeConfirm.value = false
  const newCat = pendingCategoryChange.value
  const oldCat = form.value.category
  applyCategory(newCat, oldCat)
  form.value.category = newCat
  pendingCategoryChange.value = ''
}

function cancelCategoryChange() {
  showTypeChangeConfirm.value = false
  pendingCategoryChange.value = ''
  // The select's :value binding will restore itself via form.category (no mutation)
}

/**
 * Migrate question data when switching types.
 * Preserves prompt text and carries over the correct answer where compatible.
 */
function applyCategory(newCat: string, oldCat: string) {
  for (const q of form.value.questions) {
    // Determine the previous plain-text correct answer for migration
    const prevAnswer =
      oldCat === 'Multiple Choice'
        ? (q._mcChoices.find(c => c.letter === q._mcCorrect)?.text?.trim() ?? '')
        : oldCat === 'True or False'
          ? (q._tfAnswer === 'TRUE' ? 'True' : q._tfAnswer === 'FALSE' ? 'False' : '')
          : (q.answer?.trim() ?? '')

    // Reset all type-specific fields
    q._tfAnswer = ''
    q._mcChoices = defaultMcChoices()
    q._mcCorrect = ''
    q.answer = ''

    // Migrate to the new type where possible
    if (newCat === 'Identification') {
      q.answer = prevAnswer                // pre-fill with previous correct answer
    } else if (newCat === 'True or False') {
      if (prevAnswer.toLowerCase() === 'true') q._tfAnswer = 'TRUE'
      else if (prevAnswer.toLowerCase() === 'false') q._tfAnswer = 'FALSE'
    } else if (newCat === 'Multiple Choice') {
      if (prevAnswer) {
        q._mcChoices[0].text = prevAnswer  // seed Choice A with the previous answer
        q._mcCorrect = 'A'
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Multiple Choice helpers
// ─────────────────────────────────────────────────────────────────────────────

function addMcChoice(questionIndex: number) {
  const q = form.value.questions[questionIndex]
  if (!q || q._mcChoices.length >= 26) return
  const nextLetter = CHOICE_LETTERS[q._mcChoices.length]
  q._mcChoices.push({ letter: nextLetter, text: '' })
}

function removeMcChoice(questionIndex: number, choiceIndex: number) {
  const q = form.value.questions[questionIndex]
  if (!q || q._mcChoices.length <= 2) return
  const removedLetter = q._mcChoices[choiceIndex].letter
  q._mcChoices.splice(choiceIndex, 1)
  // Re-letter remaining choices to keep A, B, C… sequential
  q._mcChoices.forEach((c, i) => { c.letter = CHOICE_LETTERS[i] })
  // Clear or update the correct answer tracking
  if (q._mcCorrect === removedLetter) {
    q._mcCorrect = ''
  } else {
    // The letter may have shifted (e.g., D→C); find by current letter assignment
    const stillExists = q._mcChoices.some(c => c.letter === q._mcCorrect)
    if (!stillExists) q._mcCorrect = ''
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Question management
// ─────────────────────────────────────────────────────────────────────────────

function addQuestion() {
  form.value.questions.push(blankQuestion())
}

function removeQuestion(index: number) {
  if (form.value.questions.length === 1) return
  form.value.questions.splice(index, 1)
  shiftTutorialStateAfterRemove(index)
}

function selectClass() {
  store.selectedClassId = form.value.classId || null
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateQuestions(): string | null {
  const cat = form.value.category
  for (let i = 0; i < form.value.questions.length; i++) {
    const q = form.value.questions[i]
    const label = `Question ${i + 1}`
    if (!q.prompt.trim()) return `${label}: Prompt cannot be empty.`

    if (cat === 'Identification') {
      if (!q.answer?.trim()) return `${label}: Correct answer cannot be empty.`
    } else if (cat === 'True or False') {
      if (!q._tfAnswer) return `${label}: Select True or False as the correct answer.`
    } else if (cat === 'Multiple Choice') {
      if (q._mcChoices.length < 2) return `${label}: At least 2 choices are required.`
      const texts = q._mcChoices.map(c => c.text.trim())
      const emptyIdx = texts.findIndex(t => !t)
      if (emptyIdx !== -1) return `${label}: Choice ${CHOICE_LETTERS[emptyIdx]} text cannot be empty.`
      if (new Set(texts).size !== texts.length) return `${label}: Choices must not have duplicate text.`
      if (!q._mcCorrect) return `${label}: Select a correct answer by clicking the circle next to a choice.`
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Save
// ─────────────────────────────────────────────────────────────────────────────

async function saveAssessment() {
  error.value = ''
  success.value = ''
  tutorialUploadSummary.value = 0

  if (!form.value.title || !form.value.description || !form.value.category || !form.value.week || !form.value.classId) {
    error.value = `Please complete the ${props.title.toLowerCase()} information.`
    return
  }

  const questionValidationError = validateQuestions()
  if (questionValidationError) {
    error.value = questionValidationError
    return
  }

  const questionEntries = form.value.questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.prompt.trim())

  if (questionEntries.length === 0) {
    error.value = 'Add at least one question.'
    return
  }

  // Encode answers for the backend (preserves existing schema)
  const questions = questionEntries.map(({ question }) => ({
    prompt: question.prompt,
    answer: encodeAnswer(question, form.value.category),
  }))

  if (props.kind === 'quiz') {
    const timeLimitSeconds = composeTimeLimitSeconds()
    if (form.value.timerEnabled && !timeLimitSeconds) {
      error.value = 'Enter a positive whole-number quiz time limit.'
      return
    }

    const payload = {
      title: form.value.title,
      classId: Number(form.value.classId),
      description: form.value.description,
      quizType: form.value.category,
      week: form.value.week,
      timeLimitSeconds,
      attemptsAllowed: form.value.attemptsAllowed,
      shuffleQuestions: form.value.shuffleQuestions,
      showAnswersAfterSubmission: form.value.showAnswersAfterSubmission,
      questions,
      dueAt: toApiDateTime(form.value.dueDate),
    }

    if (props.initialAssessment) await store.updateQuiz(props.initialAssessment.id, payload)
    else await store.addQuiz(payload)
  } else {
    const payload = {
      title: form.value.title,
      classId: Number(form.value.classId),
      moduleId: null,
      topicId: null,
      description: form.value.description,
      activityType: form.value.category,
      week: form.value.week,
      attemptsAllowed: form.value.attemptsAllowed,
      shuffleQuestions: form.value.shuffleQuestions,
      showAnswersAfterSubmission: form.value.showAnswersAfterSubmission,
      questions,
      dueAt: toApiDateTime(form.value.dueDate),
    }

    if (props.initialAssessment) await store.updateActivity(props.initialAssessment.id, payload)
    else await store.addActivity(payload)

    const tutorialUploadCount = await uploadPendingTutorialVideos(questionEntries)
    tutorialUploadSummary.value = tutorialUploadCount
  }

  const mode = props.initialAssessment ? 'updated' : 'created'
  success.value = `${props.title} ${mode} successfully.${tutorialUploadSummary.value ? ` ${tutorialUploadSummary.value} tutorial video${tutorialUploadSummary.value === 1 ? '' : 's'} uploaded.` : ''}`
  emit('saved', mode)
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutorial video helpers
// ─────────────────────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
  closeRecordingModal()
  Object.values(tutorialPreviewUrls.value).forEach(url => URL.revokeObjectURL(url))
})

function handleTutorialFile(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) setTutorialFile(index, file)
  input.value = ''
}

function setTutorialFile(index: number, file: File) {
  const previous = tutorialPreviewUrls.value[index]
  if (previous) URL.revokeObjectURL(previous)
  tutorialFiles.value = { ...tutorialFiles.value, [index]: file }
  tutorialPreviewUrls.value = { ...tutorialPreviewUrls.value, [index]: URL.createObjectURL(file) }
  tutorialUploadMessages.value = { ...tutorialUploadMessages.value, [index]: 'Ready to upload when the activity is saved.' }
  tutorialUploadErrors.value = { ...tutorialUploadErrors.value, [index]: '' }
}

function clearTutorialVideo(index: number) {
  const previous = tutorialPreviewUrls.value[index]
  if (previous) URL.revokeObjectURL(previous)
  const { [index]: _f, ...rFiles } = tutorialFiles.value
  const { [index]: _p, ...rPreviews } = tutorialPreviewUrls.value
  const { [index]: _m, ...rMessages } = tutorialUploadMessages.value
  const { [index]: _e, ...rErrors } = tutorialUploadErrors.value
  tutorialFiles.value = rFiles
  tutorialPreviewUrls.value = rPreviews
  tutorialUploadMessages.value = rMessages
  tutorialUploadErrors.value = rErrors
}

function shiftTutorialStateAfterRemove(removedIndex: number) {
  clearTutorialVideo(removedIndex)
  tutorialFiles.value = shiftIndexedRecord(tutorialFiles.value, removedIndex)
  tutorialPreviewUrls.value = shiftIndexedRecord(tutorialPreviewUrls.value, removedIndex)
  tutorialUploadMessages.value = shiftIndexedRecord(tutorialUploadMessages.value, removedIndex)
  tutorialUploadErrors.value = shiftIndexedRecord(tutorialUploadErrors.value, removedIndex)
}

function shiftIndexedRecord<T>(source: Record<number, T>, removedIndex: number) {
  return Object.entries(source).reduce<Record<number, T>>((acc, [key, value]) => {
    const index = Number(key)
    if (index < removedIndex) acc[index] = value
    if (index > removedIndex) acc[index - 1] = value
    return acc
  }, {})
}

async function openRecordingModal(index: number) {
  const answer = resolvedAnswerWord(form.value.questions[index])
  if (!answer) {
    tutorialUploadErrors.value = { ...tutorialUploadErrors.value, [index]: 'Enter the correct answer before recording a tutorial.' }
    return
  }
  recordingModal.value = { index, answer }
  recordingError.value = ''
  recordingReady.value = false
  isRecording.value = false
  recordedChunks = []
  await nextTick()
  await startRecordingCamera()
}

async function startRecordingCamera() {
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: false,
    })
    if (!recordingVideoRef.value) {
      closeRecordingModal()
      recordingError.value = 'Recording preview is not ready yet.'
      return
    }
    recordingVideoRef.value.srcObject = recordingStream
    await recordingVideoRef.value.play()
    recordingReady.value = true
  } catch {
    recordingError.value = 'Camera permission is required to take a tutorial video.'
    stopRecordingCamera()
  }
}

function startTutorialRecording() {
  if (!recordingStream || !recordingModal.value || isRecording.value) return
  try {
    recordedChunks = []
    discardRecording = false
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm'
    mediaRecorder = new MediaRecorder(recordingStream, { mimeType })
    mediaRecorder.ondataavailable = event => { if (event.data.size > 0) recordedChunks.push(event.data) }
    mediaRecorder.onstop = () => {
      if (!discardRecording) {
        const word = canonicalPreview(recordingModal.value?.answer ?? 'tutorial') || 'tutorial'
        const blob = new Blob(recordedChunks, { type: 'video/webm' })
        const file = new File([blob], `${word.toLowerCase()}-tutorial.webm`, { type: 'video/webm' })
        if (recordingModal.value) setTutorialFile(recordingModal.value.index, file)
      }
      stopRecordingCamera()
      recordingModal.value = null
      isRecording.value = false
      discardRecording = false
    }
    mediaRecorder.start()
    isRecording.value = true
  } catch {
    recordingError.value = 'This browser could not start video recording.'
    isRecording.value = false
  }
}

function stopTutorialRecording() {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') return
  discardRecording = false
  mediaRecorder.stop()
}

function closeRecordingModal() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    discardRecording = true
    mediaRecorder.stop()
  }
  stopRecordingCamera()
  recordingModal.value = null
  isRecording.value = false
  recordingReady.value = false
  recordedChunks = []
}

function stopRecordingCamera() {
  recordingStream?.getTracks().forEach(track => track.stop())
  recordingStream = null
  recordingReady.value = false
  if (recordingVideoRef.value) recordingVideoRef.value.srcObject = null
}

async function uploadPendingTutorialVideos(entries: Array<{ question: QuestionDraft; index: number }>) {
  let uploaded = 0
  for (const { question, index } of entries) {
    const file = tutorialFiles.value[index]
    if (!file) continue
    const answerWord = resolvedAnswerWord(question)
    if (!answerWord) {
      tutorialUploadErrors.value = { ...tutorialUploadErrors.value, [index]: 'Enter a correct answer before uploading this tutorial video.' }
      throw new Error('A tutorial video is missing its answer word.')
    }
    tutorialUploadMessages.value = { ...tutorialUploadMessages.value, [index]: 'Uploading tutorial video...' }
    tutorialUploadErrors.value = { ...tutorialUploadErrors.value, [index]: '' }
    try {
      const status = await uploadTutorialVideo(answerWord, file)
      tutorialUploadMessages.value = { ...tutorialUploadMessages.value, [index]: `Uploaded tutorial for ${status.word}.` }
      uploaded += 1
    } catch (err) {
      tutorialUploadErrors.value = { ...tutorialUploadErrors.value, [index]: handsignErrorMessage(err) }
      throw new Error('Activity saved, but a tutorial video failed to upload.')
    }
  }
  return uploaded
}

function canonicalPreview(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/_/g, ' ')
    .replace(/[^A-Z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '_')
}

// ─────────────────────────────────────────────────────────────────────────────
// Hydrate from existing assessment
// ─────────────────────────────────────────────────────────────────────────────

watch(() => props.initialAssessment, () => { hydrateForm() }, { deep: true })

onMounted(async () => {
  await store.fetchClasses()
  hydrateForm()
})

async function hydrateForm() {
  error.value = ''
  success.value = ''

  const assessment = props.initialAssessment
  if (!assessment) {
    form.value = blankForm()
    return
  }

  const module = assessment.moduleId
    ? store.modules.find(item => Number(item.id) === assessment.moduleId)
    : null
  const inferredClassId = assessment.classId ?? module?.classId ?? ''

  // Detect the question type — must match one of our known types, else default to Identification
  const rawCategory = assessment.category ?? ('type' in assessment ? assessment.type : assessment.module) ?? ''
  const resolvedCategory = (QUESTION_TYPES as readonly string[]).includes(rawCategory)
    ? rawCategory
    : 'Identification'

  form.value = {
    classId: inferredClassId ? String(inferredClassId) : '',
    title: assessment.title,
    description: assessment.description ?? '',
    category: resolvedCategory,
    week: assessment.week ?? '',
    dueDate: toDateInput(assessment.dueAt),
    ...parseTimeLimit(
      assessment.timeLimitSeconds,
      assessment.timeLimit ?? ('dueTime' in assessment ? assessment.dueTime : '') ?? '',
    ),
    attemptsAllowed: assessment.attemptsAllowed ?? 1,
    shuffleQuestions: assessment.shuffleQuestions ?? true,
    showAnswersAfterSubmission: assessment.showAnswersAfterSubmission ?? true,
    questions: assessment.questions?.length
      ? assessment.questions.map(q => ({
          prompt: q.prompt,
          ...decodeAnswer(q.answer, resolvedCategory),
        })) as QuestionDraft[]
      : [blankQuestion()],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function gradeLabel(value: string) { return value }

function toApiDateTime(value: string) { return value ? `${value}T23:59:00` : null }

function toDateInput(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function composeTimeLimitSeconds() {
  if (!form.value.timerEnabled) return null
  const value = Number(form.value.timeLimitValue)
  if (!Number.isInteger(value) || value <= 0) return null
  if (form.value.timeLimitUnit === 'hours') return value * 3600
  if (form.value.timeLimitUnit === 'minutes') return value * 60
  return value
}

function parseTimeLimit(seconds?: number | null, value?: string | null) {
  const fallback = { timerEnabled: false, timeLimitValue: null as number | null, timeLimitUnit: 'minutes' as const }
  if (seconds && Number.isInteger(seconds) && seconds > 0) {
    if (seconds % 3600 === 0) return { timerEnabled: true, timeLimitValue: seconds / 3600, timeLimitUnit: 'hours' as const }
    if (seconds % 60 === 0) return { timerEnabled: true, timeLimitValue: seconds / 60, timeLimitUnit: 'minutes' as const }
    return { timerEnabled: true, timeLimitValue: seconds, timeLimitUnit: 'seconds' as const }
  }
  if (!value) return fallback
  const match = value.trim().toLowerCase().match(/^(\d+)\s*(second|seconds|minute|minutes|hour|hours|s|m|h)?$/)
  if (!match) return fallback
  const amount = Number(match[1])
  if (!Number.isInteger(amount) || amount <= 0) return fallback
  const unit = match[2] ?? 'minutes'
  if (unit.startsWith('h')) return { timerEnabled: true, timeLimitValue: amount, timeLimitUnit: 'hours' as const }
  if (unit.startsWith('s')) return { timerEnabled: true, timeLimitValue: amount, timeLimitUnit: 'seconds' as const }
  return { timerEnabled: true, timeLimitValue: amount, timeLimitUnit: 'minutes' as const }
}

function blockInvalidNumberInput(event: KeyboardEvent) {
  if (['e', 'E', '+', '-', '.'].includes(event.key)) event.preventDefault()
}

function sanitizeTimerDuration() {
  const value = Number(form.value.timeLimitValue)
  if (!Number.isFinite(value) || value <= 0) { form.value.timeLimitValue = null; return }
  form.value.timeLimitValue = Math.floor(value)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .15s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
