<template>
  <Teleport to="body">
    <Transition name="install-prompt">
      <section
        v-if="isVisible"
        class="install-dialog fixed inset-x-4 top-5 z-[100] mx-auto max-w-[440px] rounded-lg border border-brand-teal/20 bg-white px-5 py-4 shadow-[0_14px_35px_rgba(17,73,62,0.18)] sm:top-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-app-title"
      >
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-blue-soft text-brand-blue">
            <span class="font-body text-sm font-bold">SH</span>
          </div>
          <div class="min-w-0 flex-1">
            <h2 id="install-app-title" class="font-body text-[15px] font-semibold leading-5 text-ink">Do you want to install the app?</h2>
            <p class="mt-1 font-body text-[13px] leading-5 text-ink-soft">Install SIGNHEAR for quicker access and offline-ready learning.</p>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded-md border border-brand-blue bg-white px-4 py-2 font-body text-xs font-semibold text-ink transition hover:bg-brand-blue-soft" @click="dismiss">No</button>
          <button type="button" class="rounded-md bg-brand-amber px-4 py-2 font-body text-xs font-semibold text-white shadow-sm transition hover:bg-brand-rose" @click="install">Yes</button>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const dismissedForSession = ref(false)
const installed = ref(false)

const isVisible = computed(() => Boolean(deferredPrompt.value) && !dismissedForSession.value && !installed.value)

function isInstalled() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
}

function handleBeforeInstallPrompt(event: Event) {
  event.preventDefault()
  deferredPrompt.value = event as BeforeInstallPromptEvent
  dismissedForSession.value = false
}

function handleInstalled() {
  installed.value = true
  deferredPrompt.value = null
}

function dismiss() {
  dismissedForSession.value = true
}

async function install() {
  const prompt = deferredPrompt.value
  if (!prompt) return

  await prompt.prompt()
  const choice = await prompt.userChoice
  deferredPrompt.value = null
  if (choice.outcome !== 'accepted') dismissedForSession.value = true
}

onMounted(() => {
  installed.value = isInstalled()
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleInstalled)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleInstalled)
})
</script>

<style scoped>
.install-dialog {
  font-family: 'DM Sans', sans-serif;
}

.install-prompt-enter-active,
.install-prompt-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.install-prompt-enter-from,
.install-prompt-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
