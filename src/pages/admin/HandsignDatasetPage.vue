<template>
  <div class="mx-auto max-w-6xl space-y-5 p-5">
    <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p class="font-mono text-[11px] font-black uppercase tracking-widest text-brand-blue">Handsign Dataset</p>
      <h1 class="mt-1 font-display text-2xl font-bold text-ink">Record and Train Word Signs</h1>
      <p class="mt-2 text-sm text-ink-soft">Record 40 complete sign samples for one label. When it reaches 40 samples, training starts automatically.</p>
    </section>

    <section class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div class="grid gap-3 sm:grid-cols-2">
          <div><label class="field-label">Week</label><select v-model="week" class="input-field mt-1.5"><option v-for="item in weeks" :key="item" :value="item">{{ item }}</option></select></div>
          <div><label class="field-label">Word label</label><select v-model="label" class="input-field mt-1.5"><option v-for="item in labels" :key="item" :value="item">{{ formatLabel(item) }}</option></select></div>
        </div>
        <div class="relative mt-5 aspect-video overflow-hidden rounded-md bg-black">
          <video ref="videoRef" class="h-full w-full -scale-x-100 object-cover" autoplay muted playsinline></video>
          <canvas ref="canvasRef" hidden></canvas>
          <div v-if="countdown" class="absolute inset-0 grid place-items-center bg-black/60 text-center text-white"><div><div class="text-xs font-bold uppercase">Get ready</div><div class="font-display text-7xl">{{ countdown }}</div></div></div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <button class="btn-secondary" :disabled="cameraOn || busy" @click="startCamera">Start Camera</button>
          <button class="btn-primary" :disabled="!cameraOn || busy" @click="recordAndUpload">{{ busy ? statusMessage : `Record sample ${Math.min(sampleCount + 1, required)}/${required}` }}</button>
          <button class="btn-secondary" :disabled="!cameraOn || busy" @click="stopCamera">Stop Camera</button>
        </div>
        <p v-if="error" class="mt-3 text-sm font-bold text-red-600">{{ error }}</p>
        <p v-else class="mt-3 text-sm font-semibold text-ink-soft">{{ statusMessage || 'Keep your upper body, wrists, and hands inside the camera view.' }}</p>
      </div>
      <aside class="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div><div class="text-xs font-bold uppercase text-ink-soft">Current label</div><div class="mt-1 font-display text-xl">{{ formatLabel(label) }}</div></div>
        <div class="rounded-md bg-brand-blue-soft p-4"><div class="text-xs font-bold uppercase text-ink-soft">Samples</div><div class="mt-1 font-display text-3xl">{{ sampleCount }} / {{ required }}</div></div>
        <div class="rounded-md border border-gray-200 p-4"><div class="text-xs font-bold uppercase text-ink-soft">Training</div><div class="mt-1 text-sm font-bold capitalize">{{ summary?.training.status ?? 'Loading' }}</div><p class="mt-1 text-xs text-ink-soft">{{ summary?.training.message }}</p></div>
        <button class="btn-secondary w-full" :disabled="summary?.training.status === 'training' || summary?.training.status === 'queued'" @click="startTraining">Train current dataset</button>
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

function formatLabel(value: string) {
  return value.replace(/_/g, ' ')
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
