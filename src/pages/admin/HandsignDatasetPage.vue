<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal p-6 shadow-card sm:p-7">
      <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:26px 26px;" />
      <div class="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="font-mono text-[11px] font-black uppercase tracking-[0.24em] text-white/75">Handsign Dataset</p>
          <h1 class="mt-2 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">Record and Train Word Signs</h1>
          <p class="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-white/80">
            Capture complete sign samples for each label. Training starts automatically when a label reaches the required sample count.
          </p>
        </div>
        <button
          class="btn-secondary !rounded-xl !border-white/40 !bg-white/90 !text-brand-blue hover:!bg-white"
          :disabled="busy"
          @click="refresh"
        >
          Refresh Dataset
        </button>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="card p-5">
        <p class="text-[11px] font-black uppercase tracking-widest text-ink-soft">Current Label</p>
        <div class="mt-2 truncate font-display text-2xl font-bold text-ink">{{ formatLabel(label) || 'No label' }}</div>
      </article>
      <article class="card p-5">
        <p class="text-[11px] font-black uppercase tracking-widest text-ink-soft">Samples</p>
        <div class="mt-2 font-display text-3xl font-bold text-ink">{{ sampleCount }} / {{ required }}</div>
      </article>
      <article class="card p-5">
        <p class="text-[11px] font-black uppercase tracking-widest text-ink-soft">Progress</p>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div class="h-full rounded-full bg-brand-blue transition-all" :style="{ width: `${sampleProgress}%` }"></div>
        </div>
        <div class="mt-2 text-xs font-bold text-ink-soft">{{ sampleProgress }}% ready</div>
      </article>
      <article class="card p-5">
        <p class="text-[11px] font-black uppercase tracking-widest text-ink-soft">Training</p>
        <div class="mt-2 text-lg font-bold capitalize text-ink">{{ summary?.training.status ?? 'Loading' }}</div>
        <p class="mt-1 line-clamp-2 text-xs font-medium text-ink-soft">{{ summary?.training.message || 'Waiting for dataset status.' }}</p>
      </article>
    </section>

    <section class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div class="card overflow-hidden">
        <div class="grid gap-4 border-b border-gray-50 bg-white p-5 md:grid-cols-2">
          <div>
            <label class="field-label">Week</label>
            <select v-model="week" class="input-field mt-1.5">
              <option v-for="item in weeks" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
          <div>
            <label class="field-label">Word Label</label>
            <select v-model="label" class="input-field mt-1.5">
              <option v-for="item in labels" :key="item" :value="item">{{ formatLabel(item) }}</option>
            </select>
          </div>
        </div>

        <div class="p-4 sm:p-5">
          <div class="relative aspect-[4/3] overflow-hidden rounded-xl bg-black shadow-inner sm:aspect-video">
          <video ref="videoRef" class="h-full w-full -scale-x-100 object-cover" autoplay muted playsinline></video>
          <canvas ref="canvasRef" hidden></canvas>
            <div v-if="!cameraOn && !countdown" class="absolute inset-0 grid place-items-center bg-ink/70 p-6 text-center text-white">
              <div>
                <div class="font-display text-2xl font-bold">Camera Preview</div>
                <p class="mt-2 max-w-sm text-sm text-white/75">Start the camera and keep your hands, wrists, and upper body visible.</p>
              </div>
            </div>
            <div v-if="countdown" class="absolute inset-0 grid place-items-center bg-black/60 text-center text-white">
              <div>
                <div class="text-xs font-bold uppercase tracking-widest">Get ready</div>
                <div class="font-display text-7xl">{{ countdown }}</div>
              </div>
            </div>
            <div class="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-brand-blue">
              {{ cameraOn ? 'Camera Active' : 'Camera Off' }}
            </div>
          </div>

          <div class="mt-4 grid gap-2 sm:grid-cols-3">
            <button class="btn-secondary w-full" :disabled="cameraOn || busy" @click="startCamera">Start Camera</button>
            <button class="btn-primary w-full" :disabled="!cameraOn || busy || !label" @click="recordAndUpload">
              {{ busy ? statusMessage : `Record ${Math.min(sampleCount + 1, required)}/${required}` }}
            </button>
            <button class="btn-secondary w-full" :disabled="!cameraOn || busy" @click="stopCamera">Stop Camera</button>
          </div>

          <div
            :class="[
              'mt-4 rounded-xl border px-4 py-3 text-sm font-semibold',
              error ? 'border-rose-200 bg-rose-50 text-brand-rose' : 'border-brand-teal/30 bg-brand-blue-soft/40 text-ink-soft'
            ]"
          >
            {{ error || statusMessage || 'Keep your upper body, wrists, and hands inside the camera view.' }}
          </div>
        </div>
      </div>

      <aside class="space-y-5">
        <div class="card p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[11px] font-black uppercase tracking-widest text-ink-soft">Training Control</p>
              <h2 class="mt-1 font-display text-xl font-bold text-ink">Current Dataset</h2>
            </div>
            <span class="rounded-full bg-brand-blue-soft px-3 py-1 text-xs font-black capitalize text-brand-blue">
              {{ summary?.training.status ?? 'loading' }}
            </span>
          </div>
          <p class="mt-3 text-sm leading-relaxed text-ink-soft">
            Train only when the selected labels have enough clear samples. Automatic training will still run once the required sample count is reached.
          </p>
          <button
            class="btn-secondary mt-4 w-full"
            :disabled="summary?.training.status === 'training' || summary?.training.status === 'queued'"
            @click="startTraining"
          >
            Train Current Dataset
          </button>
        </div>

        <div class="card overflow-hidden">
          <div class="border-b border-gray-50 bg-white px-5 py-4">
            <h2 class="font-display text-lg font-bold text-ink">Label Progress</h2>
            <p class="text-xs text-ink-soft">Samples recorded for this week.</p>
          </div>
          <div class="max-h-[360px] divide-y divide-gray-50 overflow-y-auto">
            <div v-for="item in labels" :key="item" class="px-5 py-3">
              <div class="flex items-center justify-between gap-3">
                <span class="truncate text-sm font-bold text-ink">{{ formatLabel(item) }}</span>
                <span class="text-xs font-black text-ink-soft">{{ labelSampleCount(item) }}/{{ required }}</span>
              </div>
              <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div class="h-full rounded-full bg-brand-teal" :style="{ width: `${labelProgress(item)}%` }"></div>
              </div>
            </div>
            <div v-if="labels.length === 0" class="px-5 py-8 text-center text-sm font-bold text-ink-soft">
              No labels available.
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getDatasetSummary, trainWordGestureModel, uploadWordGestureSample, type DatasetSummary } from '@/services/handsignAdmin'

const summary = ref<DatasetSummary | null>(null)
const week = ref('WEEK1')
const label = ref('')
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const cameraOn = ref(false)
const busy = ref(false)
const countdown = ref(0)
const error = ref('')
const statusMessage = ref('')
let stream: MediaStream | null = null
let pollTimer: number | null = null

const weeks = computed(() => Object.keys(summary.value?.weekly_labels ?? {}))
const labels = computed(() => summary.value?.weekly_labels[week.value] ?? [])
const required = computed(() => summary.value?.samples_required ?? 40)
const sampleCount = computed(() => summary.value?.classes.find(item => item.label === label.value)?.sample_count ?? 0)
const sampleProgress = computed(() => labelProgress(label.value))

function formatLabel(value: string) {
  return value.replace(/_/g, ' ')
}

function labelSampleCount(value: string) {
  return summary.value?.classes.find(item => item.label === value)?.sample_count ?? 0
}

function labelProgress(value: string) {
  if (!value || required.value <= 0) return 0
  return Math.min(100, Math.round((labelSampleCount(value) / required.value) * 100))
}

watch(weeks, (items) => { if (!items.includes(week.value)) week.value = items[0] ?? '' }, { immediate: true })
watch(labels, (items) => { if (!items.includes(label.value)) label.value = items[0] ?? '' }, { immediate: true })

onMounted(async () => { await refresh(); pollTimer = window.setInterval(refresh, 5000) })
onBeforeUnmount(() => { stopCamera(); if (pollTimer) window.clearInterval(pollTimer) })

async function refresh() { try { summary.value = await getDatasetSummary() } catch (err) { error.value = err instanceof Error ? err.message : 'Unable to load dataset status.' } }
async function startCamera() { try { error.value = ''; stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false }); if (!videoRef.value) return; videoRef.value.srcObject = stream; await videoRef.value.play(); cameraOn.value = true } catch { error.value = 'Camera permission is required to record dataset samples.'; stopCamera() } }
function stopCamera() { stream?.getTracks().forEach(track => track.stop()); stream = null; cameraOn.value = false; if (videoRef.value) videoRef.value.srcObject = null }
async function recordAndUpload() { if (!cameraOn.value || !label.value) return; busy.value = true; error.value = ''; try { for (let value = 3; value >= 1; value -= 1) { countdown.value = value; await wait(1000) }; countdown.value = 0; statusMessage.value = 'Recording 40 frames...'; const images = await captureFrames(); statusMessage.value = 'Uploading sample...'; const result = await uploadWordGestureSample(label.value, week.value, images); await refresh(); statusMessage.value = `Saved sample ${result.sample_count}/${required.value}.`; if (result.ready_to_train) { statusMessage.value = '40 samples reached. Training started automatically.'; await startTraining() } } catch (err) { error.value = err instanceof Error ? err.message : 'Unable to record this sample.' } finally { busy.value = false; countdown.value = 0 } }
async function startTraining() { try { const training = await trainWordGestureModel(); if (summary.value) summary.value.training = training; statusMessage.value = training.message } catch (err) { error.value = err instanceof Error ? err.message : 'Unable to start training.' } }
async function captureFrames() { const images: string[] = []; while (images.length < required.value) { const image = captureFrame(); if (image) images.push(image); await wait(80) } return images }
function captureFrame() { const video = videoRef.value; const canvas = canvasRef.value; if (!video || !canvas || video.readyState < 2) return null; const scale = Math.min(1, 320 / video.videoWidth); canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale); canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height); return canvas.toDataURL('image/jpeg', 0.55) }
function wait(ms: number) { return new Promise(resolve => window.setTimeout(resolve, ms)) }
</script>
