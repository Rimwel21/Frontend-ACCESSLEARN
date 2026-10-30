<template>
  <div class="flex h-screen overflow-hidden bg-white">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-20 bg-black/40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col border-r-[3px] border-brand-teal bg-white transition-transform duration-300 z-30',
        'fixed inset-y-0 left-0 w-[260px] lg:sticky lg:top-0 lg:h-screen lg:w-[220px] lg:min-w-[220px] lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Sidebar top -->
      <div class="flex items-center justify-between px-3 pt-3 pb-1 lg:block">
        <RouterLink to="/student/dashboard" class="flex items-center gap-2 border-[3px] border-brand-teal px-3 py-2 text-xs font-black text-ink no-underline transition-colors hover:bg-brand-amber">
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Go Back
        </RouterLink>
        <!-- Close sidebar button (mobile) -->
        <button class="lg:hidden border-[2px] border-brand-teal p-1.5 text-ink" @click="sidebarOpen = false">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="px-3.5 py-2">
        <div class="font-mono text-[10px] uppercase tracking-widest text-gray-500">Module {{ moduleId }}</div>
        <div class="mt-0.5 font-display text-[13px] font-black leading-tight">{{ moduleData?.title || 'Learning module' }}</div>
      </div>

      <div class="px-3.5 py-2">
        <div class="h-[8px] overflow-hidden border-[2px] border-brand-teal bg-gray-200">
          <div class="h-full bg-green-500 transition-all" :style="{ width: progress.percent + '%' }" />
        </div>
        <div class="mt-1 font-mono text-[10px] text-gray-500">{{ progress.percent }}% Progress</div>
      </div>

      <div class="flex-1 space-y-2 overflow-y-auto px-3 py-2">
        <template v-for="(block, index) in learningBlocks" :key="`progress-${block.start}`">
          <button
            :disabled="!isBlockUnlocked(index)"
            :class="[
              'flex w-full items-center gap-2.5 border-[2px] border-brand-teal px-3 py-2.5 text-left text-[13px] font-bold transition-all',
              activeBlockIndex === index ? 'bg-brand-blue text-white' : 'bg-white hover:bg-brand-blue-soft',
              !isBlockUnlocked(index) ? 'cursor-not-allowed opacity-50 hover:bg-white' : ''
            ]"
            :style="isBlockUnlocked(index) ? 'box-shadow:2px 2px 0 #000' : ''"
            @click="selectBlock(index)"
          >
            <span :class="['grid h-[20px] w-[20px] flex-shrink-0 place-items-center rounded-full border-[2px] border-brand-teal text-[10px] font-black', isBlockCompleted(block) ? 'bg-green-500 text-white' : 'bg-white text-ink']">
              {{ isBlockCompleted(block) ? 'OK' : isBlockUnlocked(index) ? '' : 'L' }}
            </span>
            <span class="truncate">Topic Progress {{ index + 1 }}</span>
          </button>

          <button
            v-if="checkpointForBlock(block)"
            :disabled="!isCheckpointReady(checkpointForBlock(block)!) || checkpointForBlock(block)!.student_status === 'completed'"
            :class="[
              'flex w-full items-center gap-2.5 border-[2px] border-brand-amber px-3 py-2.5 text-left text-[12px] font-bold uppercase tracking-wide transition-all',
              activeCheckpoint?.id === checkpointForBlock(block)!.id ? 'bg-brand-amber text-ink' : 'bg-white hover:bg-brand-amber/20',
              !isCheckpointReady(checkpointForBlock(block)!) || checkpointForBlock(block)!.student_status === 'completed' ? 'cursor-not-allowed opacity-50' : ''
            ]"
            @click="openCheckpoint(checkpointForBlock(block)!.id)"
          >
            <span class="grid h-[20px] w-[20px] place-items-center rounded-full border-[2px] border-brand-teal text-[10px] font-black">{{ checkpointForBlock(block)!.student_status === 'completed' ? 'OK' : '?' }}</span>
            <span class="truncate">Checkpoint {{ index + 1 }}</span>
          </button>
        </template>

        <button
          v-for="quiz in quizzes"
          :key="`quiz-${quiz.id}`"
          :disabled="!quizUnlocked"
          :class="[
            'flex w-full items-center gap-2.5 border-[2px] border-brand-teal px-3 py-2.5 text-left text-[12px] font-bold uppercase tracking-wide transition-all',
            activeQuiz?.id === quiz.id ? 'bg-brand-amber text-ink' : 'bg-white hover:bg-brand-amber',
            !quizUnlocked ? 'cursor-not-allowed opacity-45' : ''
          ]"
          :style="quizUnlocked ? 'box-shadow:2px 2px 0 #000' : ''"
          @click="selectQuiz(quiz.id)"
        >
          <span :class="['grid h-[20px] w-[20px] flex-shrink-0 place-items-center rounded-full border-[2px] border-brand-teal text-[10px] font-black', completedQuizIds.has(quiz.id) ? 'bg-green-500 text-white' : 'bg-white text-ink']">
            {{ completedQuizIds.has(quiz.id) ? 'OK' : 'Q' }}
          </span>
          <span class="truncate">{{ quiz.title }}</span>
        </button>
      </div>
    </aside>

    <main class="flex h-screen min-w-0 flex-1 flex-col overflow-hidden lg:ml-0">
      <!-- Top bar -->
      <header class="flex shrink-0 items-center gap-3 border-b-[3px] border-brand-teal bg-brand-teal px-4 py-4 sm:px-8 sm:py-5">
        <!-- Mobile sidebar toggle -->
        <button
          class="flex-shrink-0 rounded border-[2px] border-white/40 bg-white/20 p-1.5 text-white transition hover:bg-white/30 lg:hidden"
          @click="sidebarOpen = true"
          aria-label="Open module navigation"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div class="min-w-0 flex-1">
          <h1 class="truncate font-display text-xl font-black leading-tight text-white sm:text-[28px]">{{ headerTitle }}</h1>
          <p class="mt-0.5 truncate font-display text-[12px] font-bold text-white/80 sm:text-[13px]">{{ headerDescription }}</p>
        </div>
        <!-- Timer badge (shown in header on all screens) -->
        <div
          v-if="quizTimerLabel"
          :class="[
            'flex flex-shrink-0 items-center gap-2 rounded-full border-[2px] px-3 py-1.5 font-mono text-[11px] font-black shadow transition-all',
            quizRemainingSeconds !== null && quizRemainingSeconds <= 60
              ? 'animate-pulse border-red-400 bg-red-50 text-red-600'
              : 'border-white/50 bg-white/20 text-white'
          ]"
          title="Time remaining"
        >
          <svg class="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9"/>
            <path stroke-linecap="round" d="M12 7v5l3 3"/>
          </svg>
          <span>{{ quizTimerLabel }}</span>
        </div>
      </header>

      <section class="min-h-0 flex-1 overflow-y-auto bg-white p-4 sm:p-7">
        <div v-if="content.loading" class="border-[3px] border-brand-teal bg-white p-8 text-center font-black">Loading learning content...</div>
        <div v-else-if="content.error" class="border-[3px] border-brand-teal bg-red-50 p-8 text-center font-black text-red-700">{{ content.error }}</div>
        <div v-else-if="isPresentationProcessing" class="mb-4 border-[3px] border-brand-amber bg-brand-amber/15 px-4 py-3 text-sm font-black text-ink">
          Preparing the presentation slides. This page will update automatically when they are ready.
        </div>
        <div v-else-if="topics.length === 0" class="border-[3px] border-brand-teal bg-white p-10 text-center">
          <h2 class="font-display text-xl font-black">No learning materials are available for this module yet.</h2>
          <p class="mt-2 text-sm text-gray-500">Please check again after your teacher publishes content.</p>
        </div>

        <article v-else-if="activeCheckpoint" class="mx-auto max-w-3xl space-y-5">
          <section class="border-[3px] border-brand-teal bg-brand-amber p-5">
            <div class="font-mono text-[10px] font-black uppercase tracking-widest">Learning Checkpoint</div>
            <h2 class="mt-1 font-display text-xl font-black">{{ activeCheckpoint.title }}</h2>
            <p class="mt-2 text-sm font-semibold text-ink">You have completed Topics {{ activeCheckpoint.start_sort_order }}–{{ activeCheckpoint.end_sort_order }}. Submit these five questions to continue. Your score will not stop you from moving on.</p>
          </section>
          <section v-if="checkpointResult" class="border-[3px] border-brand-teal bg-green-50 p-5 text-green-800">
            <div class="font-display text-xl font-black">{{ checkpointEncouragement }}</div>
            <p class="mt-2 text-sm font-bold">Submitted: {{ checkpointResult.score }} Correct Answer{{ checkpointResult.score === 1 ? '' : 's' }} / {{ checkpointResult.total }}. You can now continue to the next topics.</p>
          </section>
          <section v-for="(question, index) in activeCheckpoint.questions" :key="index" class="border-[3px] border-brand-teal bg-white p-5">
            <label class="block text-sm font-black">Question {{ index + 1 }}</label>
            <p class="mt-2 text-sm font-semibold text-ink">{{ question.prompt }}</p>
            <div v-if="question.question_type === 'multiple_choice'" class="mt-3 grid gap-2">
              <button v-for="(option, optionIndex) in question.options ?? []" :key="option" type="button" :disabled="Boolean(checkpointResult)" :class="['border-[2px] border-brand-teal px-3 py-2 text-left text-sm font-bold', checkpointAnswers[String(index)] === String.fromCharCode(65 + optionIndex) ? 'bg-brand-blue text-white' : 'bg-white']" @click="checkpointAnswers[String(index)] = String.fromCharCode(65 + optionIndex)">
                {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
              </button>
            </div>
            <div v-else-if="question.question_type === 'true_false'" class="mt-3 flex gap-2">
              <button v-for="choice in ['True', 'False']" :key="choice" type="button" :disabled="Boolean(checkpointResult)" :class="['flex-1 border-[2px] border-brand-teal px-3 py-2 text-sm font-bold', checkpointAnswers[String(index)] === choice ? 'bg-brand-blue text-white' : 'bg-white']" @click="checkpointAnswers[String(index)] = choice">{{ choice }}</button>
            </div>
            <input v-else v-model="checkpointAnswers[String(index)]" :disabled="Boolean(checkpointResult)" class="mt-3 w-full border-[2px] border-brand-teal px-3 py-2 text-sm" placeholder="Your answer" />
          </section>
          <div class="flex justify-end">
            <button v-if="!checkpointResult" class="border-[3px] border-brand-teal bg-brand-blue px-5 py-2.5 text-sm font-black text-white disabled:opacity-60" :disabled="checkpointSubmitting" @click="submitActiveCheckpoint">{{ checkpointSubmitting ? 'Submitting…' : 'Submit Checkpoint' }}</button>
            <button v-else class="border-[3px] border-brand-teal bg-brand-blue px-5 py-2.5 text-sm font-black text-white" @click="continueAfterCheckpoint">Continue to Next Topic</button>
          </div>
        </article>

        <article v-else-if="activeQuiz" class="space-y-5">
          <div class="border-[3px] border-brand-teal bg-brand-amber p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="font-mono text-[10px] font-black uppercase tracking-widest">Quiz</div>
                <h2 class="mt-1 font-display text-xl font-black sm:text-2xl">{{ activeQuiz.title }}</h2>
                <p class="mt-2 text-sm text-gray-700">{{ activeQuiz.description }}</p>
              </div>
              <!-- Inline timer badge (supplements header badge) -->
              <div
                v-if="quizTimerLabel"
                :class="[
                  'flex shrink-0 items-center gap-2 rounded-xl border-[2px] px-3.5 py-2 font-mono text-[12px] font-black shadow-sm',
                  quizRemainingSeconds !== null && quizRemainingSeconds <= 60
                    ? 'animate-pulse border-brand-rose bg-brand-rose/10 text-brand-rose'
                    : 'border-brand-teal bg-white/70 text-ink'
                ]"
              >
                <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9"/>
                  <path stroke-linecap="round" d="M12 7v5l3 3"/>
                </svg>
                <span>{{ quizTimerLabel }}</span>
                <span class="hidden text-[10px] font-bold uppercase tracking-wide opacity-60 sm:block">remaining</span>
              </div>
            </div>
          </div>

          <div v-if="quizResult" class="border-[3px] border-brand-teal bg-green-50 p-4 font-black text-green-800">
            Score: {{ quizResult.score }} / {{ quizResult.total }}
          </div>

          <section v-if="activeQuiz.student_retake_eligible || activeQuiz.student_retake_status" class="border-[3px] border-brand-teal bg-white p-4 shadow-card">
            <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Retake</div>
            <p class="mt-1 text-sm font-bold text-ink">
              {{ retakeStatusText(activeQuiz.student_retake_status, activeQuiz.student_retake_reason) }}
            </p>
          </section>

          <div v-for="(question, index) in activeQuiz.questions" :key="index" class="border-[3px] border-brand-teal bg-white p-5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <label class="block text-sm font-black">Question {{ index + 1 }}</label>
              <span class="border-[2px] border-brand-teal bg-brand-blue-soft px-2 py-1 font-mono text-[9px] font-black uppercase text-brand-blue">
                {{ quizQuestionTypeLabel(question.answer) }}
              </span>
            </div>
            <div class="mt-3 border-[2px] border-brand-teal bg-surface p-3">
              <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Visual Prompt</div>
              <p class="mt-1 text-sm font-bold text-gray-700">{{ question.prompt }}</p>
            </div>

            <!-- Multiple Choice -->
            <div v-if="parseQuestionOptions(question.answer).type === 'multiple_choice'" class="mt-3 space-y-2">
              <label
                v-for="choice in parseQuestionOptions(question.answer).choices"
                :key="choice.letter"
                :class="[
                  'flex cursor-pointer items-center gap-3 border-[2px] border-brand-teal p-3 text-sm font-bold transition-all',
                  quizAnswers[String(index)] === choice.letter
                    ? 'bg-brand-blue text-white shadow-[2px_2px_0_#000]'
                    : 'bg-white text-ink hover:bg-brand-blue-soft',
                  quizLocked ? 'cursor-not-allowed opacity-60' : ''
                ]"
              >
                <input
                  type="radio"
                  :name="`q-${index}`"
                  :value="choice.letter"
                  :checked="quizAnswers[String(index)] === choice.letter"
                  :disabled="quizLocked"
                  class="hidden"
                  @change="quizAnswers[String(index)] = choice.letter; saveActiveQuizAnswers()"
                />
                <span :class="['grid h-6 w-6 shrink-0 place-items-center rounded-full border-[2px] border-current text-xs font-black', quizAnswers[String(index)] === choice.letter ? 'bg-white text-brand-blue' : 'bg-surface text-ink']">
                  {{ choice.letter }}
                </span>
                <span>{{ choice.text }}</span>
              </label>
            </div>

            <!-- True or False -->
            <div v-else-if="parseQuestionOptions(question.answer).type === 'true_false'" class="mt-3 flex gap-3">
              <button
                v-for="tf in parseQuestionOptions(question.answer).choices"
                :key="tf.letter"
                type="button"
                :disabled="quizLocked"
                :class="[
                  'flex-1 border-[2px] border-brand-teal py-3 text-center text-sm font-black transition-all',
                  quizAnswers[String(index)] === tf.letter
                    ? 'bg-brand-blue text-white shadow-[2px_2px_0_#000]'
                    : 'bg-white text-ink hover:bg-brand-blue-soft',
                  quizLocked ? 'cursor-not-allowed opacity-60' : ''
                ]"
                @click="quizAnswers[String(index)] = tf.letter; saveActiveQuizAnswers()"
              >
                {{ tf.text }}
              </button>
            </div>

            <!-- Identification (text input) -->
            <input
              v-else
              v-model="quizAnswers[String(index)]"
              class="mt-3 w-full border-[2px] border-brand-teal px-3 py-2 text-sm outline-none focus:bg-brand-blue-soft disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="quizLocked"
              placeholder="Your answer"
              @input="saveActiveQuizAnswers"
            />
          </div>

          <div class="flex justify-end">
            <button
              class="border-[3px] border-brand-teal bg-brand-blue px-5 py-2.5 text-sm font-black text-white transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="quizLocked || quizSubmitting"
              @click="submitActiveQuiz()"
            >
              {{ quizSubmitting ? 'Submitting…' : quizLocked ? 'Submitted' : 'Submit Quiz' }}
            </button>
          </div>
        </article>

        <article v-else-if="activeBlock" class="mx-auto max-w-6xl space-y-6 pb-8">
          <header class="border-[3px] border-brand-teal bg-brand-blue-soft p-5">
            <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Learning block</div>
            <h2 class="mt-1 font-display text-2xl font-black">Topic Progress {{ activeBlockIndex + 1 }}</h2>
            <p class="mt-2 text-sm font-semibold text-ink-soft">Read the learning content below. Continue when you are ready for the checkpoint questions.</p>
          </header>

          <section v-for="topic in activeBlock.topics" v-show="topic.student_visible !== false" :key="topic.id" class="scroll-mt-5 border-[3px] border-brand-teal bg-white p-4 shadow-card sm:p-6">
            <div v-if="topicDisplayTitle(topic)" class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 class="font-display text-lg font-black">{{ topicDisplayTitle(topic) }}</h3>
            </div>

            <template v-if="presentationFor(topic.content)">
              <div v-if="presentationFor(topic.content)?.image_urls?.length" class="grid gap-4" :class="hasMultiplePresentationImages(topic.content) ? 'sm:grid-cols-2' : ''">
                <img v-for="(imageUrl, imageIndex) in presentationFor(topic.content)?.image_urls" :key="imageIndex" :src="assetUrl(imageUrl)" alt="Slide graphic" class="mx-auto max-h-[560px] w-full rounded border border-slate-200 bg-white object-contain" />
              </div>
              <div v-if="presentationFor(topic.content)?.paragraphs?.length" class="mt-4 space-y-3">
                <p v-for="(paragraph, paragraphIndex) in presentationFor(topic.content)?.paragraphs" :key="paragraphIndex" class="rounded border-l-4 border-brand-teal bg-surface p-4 text-sm leading-relaxed text-ink sm:text-base">{{ paragraph }}</p>
              </div>
            </template>
            <template v-else>
              <div v-if="topic.page_image_urls?.length" class="grid gap-4">
                <img v-for="(pageUrl, pageIndex) in topic.page_image_urls" :key="pageIndex" :src="assetUrl(pageUrl)" alt="Learning-material slide" class="mx-auto w-full rounded border border-slate-200 bg-white shadow-sm" />
              </div>
              <p v-else class="whitespace-pre-line text-sm leading-relaxed text-slate-800 sm:text-base">{{ topic.content }}</p>
              <div v-if="topic.image_url && !topic.page_image_urls?.length" class="mt-4 flex flex-col gap-4 lg:flex-row">
                <img :src="assetUrl(topic.image_url)" alt="" class="max-h-[350px] w-full rounded border border-teal-100 object-contain lg:w-[280px]" />
                <p class="flex-1 rounded border-l-4 border-brand-teal bg-surface p-4 text-sm leading-relaxed text-ink">{{ topic.description }}</p>
              </div>
            </template>

          </section>

          <div class="flex flex-wrap items-center justify-between gap-3 border-[3px] border-brand-teal bg-white p-4 shadow-card">
            <button class="border-[3px] border-brand-teal bg-white px-4 py-2.5 text-xs font-black text-ink shadow-[2px_2px_0_#000] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:text-sm" :disabled="activeBlockIndex === 0" @click="goPreviousBlock">Previous progress</button>
            <span class="font-mono text-xs font-bold text-slate-500">Topic Progress {{ activeBlockIndex + 1 }} of {{ learningBlocks.length }}</span>
            <button class="border-[3px] border-brand-teal bg-brand-blue px-4 py-2.5 text-xs font-black text-white shadow-[2px_2px_0_#000] sm:px-5 sm:text-sm" @click="goNextBlock">{{ checkpointAfterActiveBlock ? 'Continue to checkpoint' : activeBlockIndex === learningBlocks.length - 1 ? 'Finish module' : 'Next progress' }}</button>
          </div>
        </article>
      </section>
    </main>

    <Teleport to="body">
      <section
        v-if="floatingVideo && activeBlock"
        class="fixed z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden border-[3px] border-brand-teal bg-white shadow-2xl"
        :style="{ left: `${floatingVideoPosition.x}px`, top: `${floatingVideoPosition.y}px` }"
      >
        <div class="flex cursor-move touch-none items-center justify-between gap-2 bg-brand-amber px-3 py-2 select-none" @pointerdown="startFloatingVideoDrag">
          <div class="min-w-0">
            <div class="font-mono text-[9px] font-black uppercase tracking-wide">Movable sign-language video</div>
            <div class="truncate text-xs font-bold">{{ floatingVideo.title }}</div>
          </div>
          <div class="flex shrink-0 gap-1">
            <button type="button" class="grid h-7 w-7 place-items-center border-2 border-brand-teal bg-white text-sm font-black" :aria-label="floatingVideoMinimized ? 'Restore video' : 'Minimize video'" :title="floatingVideoMinimized ? 'Restore video' : 'Minimize video'" @pointerdown.stop @click="floatingVideoMinimized = !floatingVideoMinimized">
              <svg v-if="floatingVideoMinimized" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="7" y="7" width="11" height="11" /><path d="M5 15V5h10" /></svg>
              <span v-else aria-hidden="true">−</span>
            </button>
            <button type="button" class="grid h-7 w-7 place-items-center border-2 border-brand-teal bg-white text-lg font-black leading-none" aria-label="Close movable video" title="Close video" @pointerdown.stop @click="closeFloatingVideo">×</button>
          </div>
        </div>
        <div v-if="!floatingVideoMinimized" class="bg-black">
          <video ref="floatingVideoElement" :src="assetUrl(floatingVideo.video_url)" autoplay controls playsinline class="aspect-video w-full" />
          <div class="flex justify-end bg-white p-2">
            <button type="button" class="border-2 border-brand-teal px-3 py-1 text-xs font-black" @click="toggleFloatingVideoFullscreen">Full screen</button>
          </div>
        </div>
      </section>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="pendingQuizId"
        class="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 backdrop-blur-sm"
        @click.self="cancelQuizStart"
      >
        <section class="w-full max-w-sm border-[3px] border-brand-teal bg-white p-6 shadow-2xl">
          <div class="mb-1 font-mono text-[10px] font-black uppercase tracking-widest text-brand-teal">Quiz Confirmation</div>
          <h2 class="font-display text-xl font-black text-ink">Ready to Start?</h2>
          <p class="mt-3 text-sm leading-relaxed text-gray-600">
            This quiz has a time limit. The timer starts immediately after confirmation and cannot be paused or restarted.
            When time expires, the quiz submits automatically and unanswered questions remain unanswered.
          </p>
          <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="w-full border-[3px] border-brand-teal bg-white px-5 py-2.5 text-xs font-black text-ink transition-all hover:bg-surface sm:w-auto"
              @click="cancelQuizStart"
            >
              Cancel
            </button>
            <button
              type="button"
              class="w-full border-[3px] border-brand-teal bg-brand-blue px-5 py-2.5 text-xs font-black text-white transition-all hover:bg-brand-teal sm:w-auto"
              @click="confirmQuizStart"
            >
              Start Quiz
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { API_BASE_URL } from '@/lib/api'
import { useStudentContentStore } from '@/stores/studentContent'

const route = useRoute()
const router = useRouter()
const content = useStudentContentStore()
const sidebarOpen = ref(false)
const activeBlockIndex = ref(0)
const activeQuizId = ref<number | null>(null)
const activeCheckpointId = ref<number | null>(null)
const pendingQuizId = ref<number | null>(null)
const checkpointAnswers = ref<Record<string, string>>({})
const checkpointResult = ref<{ score: number; total: number } | null>(null)
const checkpointEncouragement = ref('Great work!')
const checkpointSubmitting = ref(false)
type FloatingVideo = { id: number; title: string; video_url: string }
const floatingVideo = ref<FloatingVideo | null>(null)
const floatingVideoMinimized = ref(false)
const floatingVideoPosition = ref({ x: 24, y: 104 })
const floatingVideoElement = ref<HTMLVideoElement | null>(null)
let floatingVideoDragOffset: { x: number; y: number } | null = null
const quizAnswers = ref<Record<string, string>>({})
const quizResult = ref<{ score: number; total: number } | null>(null)
const quizRemainingSeconds = ref<number | null>(null)
const quizSubmitting = ref(false)
const quizTimeExpired = ref(false)
let quizTimer: number | null = null
let presentationRefreshTimer: number | null = null
let presentationRefreshAttempts = 0
let presentationRefreshInFlight = false
const presentationRefreshLimit = 24

const moduleId = computed(() => String(route.params.moduleId))
const moduleData = computed(() => content.currentModule)
const _allTopics = computed(() => content.sortedTopics)

// Deduplicate and filter out raw "--- Slide X ---" sidebar entries
const SLIDE_MARKER = /^-{2,}\s*Slide\s*\d+\s*-{2,}$/i
const topics = computed(() => {
  const seen = new Set<string>()
  return _allTopics.value.filter(t => {
    if (SLIDE_MARKER.test(t.title ?? '')) return false
    const key = (t.title ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})

const learningBlocks = computed(() => {
  const blocks = []
  for (let index = 0; index < topics.value.length; index += 10) {
    const blockTopics = topics.value.slice(index, index + 10)
    if (!blockTopics.length) continue
    blocks.push({
      topics: blockTopics,
      start: blockTopics[0].sort_order,
      end: blockTopics[blockTopics.length - 1].sort_order,
    })
  }
  return blocks
})
const activeBlock = computed(() => learningBlocks.value[activeBlockIndex.value] ?? null)
const checkpointAfterActiveBlock = computed(() => activeBlock.value
  ? (moduleData.value?.checkpoints ?? []).find(checkpoint => checkpoint.end_sort_order === activeBlock.value?.end && checkpoint.student_status !== 'completed') ?? null
  : null)

function presentationFor(content?: string | null) {
  try {
    const parsed = JSON.parse(content ?? '')
    if (parsed?.type === 'pptx_slide') return parsed as { badge: string; paragraphs: string[]; image_urls: string[] }
  } catch {}
  return null
}

function hasMultiplePresentationImages(content?: string | null) {
  return (presentationFor(content)?.image_urls?.length ?? 0) > 1
}
const progress = computed(() => content.progress)
const completedIds = computed(() => new Set(progress.value.completed_topic_ids))
const completedQuizIds = computed(() => new Set(progress.value.completed_quiz_ids))
const completedCheckpointIds = computed(() => new Set(progress.value.completed_checkpoint_ids))
const quizzes = computed(() => (moduleData.value?.assessments ?? []).filter(item => item.assessment_type === 'quiz'))
const activeQuiz = computed(() => quizzes.value.find(quiz => quiz.id === activeQuizId.value) ?? null)
const activeCheckpoint = computed(() => (moduleData.value?.checkpoints ?? []).find(checkpoint => checkpoint.id === activeCheckpointId.value) ?? null)
const quizUnlocked = computed(() => topics.value.length > 0 && progress.value.completed_topics >= topics.value.length)
const headerTitle = computed(() => activeCheckpoint.value?.title || activeQuiz.value?.title || moduleData.value?.title || 'Learning Content')
const headerDescription = computed(() => {
  if (activeQuiz.value) return activeQuiz.value.description || 'Quiz'
  if (activeCheckpoint.value) return `Topics ${activeCheckpoint.value.start_sort_order}–${activeCheckpoint.value.end_sort_order} checkpoint`
  if (activeBlock.value) return `Topics ${activeBlock.value.start}–${activeBlock.value.end} of ${topics.value.length}`
  return moduleData.value?.description || 'Module description'
})
const quizLocked = computed(() => Boolean(quizResult.value) || quizTimeExpired.value || activeQuiz.value?.student_status === 'completed')
const quizTimerLabel = computed(() => {
  if (quizRemainingSeconds.value === null) return ''
  return formatQuizTime(quizRemainingSeconds.value)
})
const isPresentationProcessing = computed(() => {
  const module = moduleData.value
  if (!module) return false
  if (module.material_processing_status === 'processing') return true
  const isPresentation = /\.(ppt|pptx)$/i.test(module.file_name ?? '')
    || /presentation|powerpoint/i.test(module.file_type ?? '')
    || /pptx?/i.test(module.content_type ?? '')
  const hasPresentationTopic = module.topics.some(topic =>
    (topic.page_image_urls ?? []).some(url => /\/static\/presentation_slides\/.*\.png$/i.test(url))
    || isStructuredPptxTopic(topic.content)
  )
  return isPresentation && !hasPresentationTopic
})

onMounted(async () => {
  await content.fetchModule(moduleId.value)
  const requestedQuizId = route.query.quizId ? Number(route.query.quizId) : null
  if (requestedQuizId && quizzes.value.some(quiz => quiz.id === requestedQuizId) && quizUnlocked.value) {
    await selectQuiz(requestedQuizId)
    return
  }
  activeBlockIndex.value = 0
  openBlockSignVideo(0)
  startPresentationRefresh()
})

onBeforeUnmount(() => {
  clearQuizTimer()
  stopPresentationRefresh()
  stopFloatingVideoDrag()
})

watch(learningBlocks, value => {
  if (activeBlockIndex.value >= value.length) activeBlockIndex.value = 0
})

watch(isPresentationProcessing, processing => {
  if (processing) startPresentationRefresh()
  else stopPresentationRefresh()
})

function startPresentationRefresh() {
  if (!isPresentationProcessing.value || presentationRefreshTimer !== null) return
  presentationRefreshAttempts = 0
  presentationRefreshTimer = window.setInterval(async () => {
    if (presentationRefreshInFlight || document.visibilityState !== 'visible') return
    presentationRefreshInFlight = true
    try {
      await content.fetchModule(moduleId.value, { background: true })
      presentationRefreshAttempts += 1
    } finally {
      presentationRefreshInFlight = false
    }
    if (!isPresentationProcessing.value || presentationRefreshAttempts >= presentationRefreshLimit) {
      stopPresentationRefresh()
    }
  }, 5000)
}

function stopPresentationRefresh() {
  if (presentationRefreshTimer !== null) {
    window.clearInterval(presentationRefreshTimer)
    presentationRefreshTimer = null
  }
  presentationRefreshInFlight = false
}

function isStructuredPptxTopic(content?: string | null) {
  try { return JSON.parse(content ?? '').type === 'pptx_slide' } catch { return false }
}

async function selectBlock(index: number) {
  if (!isBlockUnlocked(index)) return
  clearQuizTimer()
  quizTimeExpired.value = false
  pendingQuizId.value = null
  activeQuizId.value = null
  activeCheckpointId.value = null
  closeFloatingVideo()
  quizResult.value = null
  activeBlockIndex.value = index
  const firstIncompleteTopic = learningBlocks.value[index]?.topics.find(topic => !completedIds.value.has(topic.id))
  if (firstIncompleteTopic) {
    await content.markTopic(moduleId.value, firstIncompleteTopic.id, 'in_progress')
  }
  openBlockSignVideo(index)
}

function isBlockCompleted(block: { topics: Array<{ id: number }> }) {
  return block.topics.every(topic => completedIds.value.has(topic.id))
}

function isBlockUnlocked(index: number) {
  if (index <= 0) return true
  const previous = learningBlocks.value[index - 1]
  const requiredCheckpoint = (moduleData.value?.checkpoints ?? []).find(checkpoint => checkpoint.end_sort_order === previous?.end)
  return Boolean(
    previous
    && isBlockCompleted(previous)
    && (!requiredCheckpoint || completedCheckpointIds.value.has(requiredCheckpoint.id)),
  )
}

function checkpointForBlock(block: { end: number }) {
  return (moduleData.value?.checkpoints ?? []).find(checkpoint => checkpoint.end_sort_order === block.end)
}

function isCheckpointReady(checkpoint: { start_sort_order: number; end_sort_order: number }) {
  return topics.value
    .filter(topic => topic.sort_order >= checkpoint.start_sort_order && topic.sort_order <= checkpoint.end_sort_order)
    .every(topic => completedIds.value.has(topic.id))
}

function openCheckpoint(checkpointId: number) {
  const checkpoint = (moduleData.value?.checkpoints ?? []).find(item => item.id === checkpointId)
  if (!checkpoint || !isCheckpointReady(checkpoint) || checkpoint.student_status === 'completed') return
  clearQuizTimer()
  activeQuizId.value = null
  activeCheckpointId.value = checkpointId
  closeFloatingVideo()
  checkpointAnswers.value = {}
  checkpointResult.value = null
}

async function selectQuiz(quizId: number) {
  if (!quizUnlocked.value) return
  const quiz = quizzes.value.find(item => item.id === quizId)
  if (!quiz) return
  if (quiz.student_status === 'completed' || quiz.student_started_at || !hasQuizTimer(quiz)) {
    await openQuiz(quizId)
    return
  }
  pendingQuizId.value = quizId
}

function cancelQuizStart() {
  pendingQuizId.value = null
}

async function confirmQuizStart() {
  if (!pendingQuizId.value) return
  const quizId = pendingQuizId.value
  pendingQuizId.value = null
  await openQuiz(quizId)
}

async function openQuiz(quizId: number) {
  clearQuizTimer()
  quizTimeExpired.value = false
  activeQuizId.value = quizId
  activeCheckpointId.value = null
  closeFloatingVideo()
  const selectedQuiz = quizzes.value.find(quiz => quiz.id === quizId)
  quizAnswers.value = { ...(selectedQuiz?.student_answers ?? {}) }
  quizResult.value = null
  const timer = await content.startQuiz(moduleId.value, quizId).catch(() => null)
  if (!timer) return
  if (timer.completed) {
    quizTimeExpired.value = timer.expired
    quizResult.value = { score: timer.score ?? 0, total: timer.total ?? 0 }
    return
  }
  if (timer.time_limit_seconds) {
    startQuizTimer(timer.remaining_seconds ?? timer.time_limit_seconds)
  }
}

async function goPreviousBlock() {
  if (activeBlockIndex.value <= 0) return
  await selectBlock(activeBlockIndex.value - 1)
}

async function goNextBlock() {
  if (!activeBlock.value) return
  const incompleteTopics = activeBlock.value.topics.filter(topic => !completedIds.value.has(topic.id))
  // One request and one database transaction for the entire progress block.
  // This avoids ten competing database updates before the next block opens.
  if (incompleteTopics.length) await content.completeTopicBlock(moduleId.value, activeBlock.value.topics.map(topic => topic.id))
  const checkpoint = checkpointAfterActiveBlock.value
  if (checkpoint) {
    activeCheckpointId.value = checkpoint.id
    activeQuizId.value = null
    checkpointAnswers.value = {}
    checkpointResult.value = null
    return
  }
  if (activeBlockIndex.value >= learningBlocks.value.length - 1) {
    if (quizzes.value.length) await selectQuiz(quizzes.value[0].id)
    return
  }
  await selectBlock(activeBlockIndex.value + 1)
}

async function submitActiveCheckpoint() {
  if (!activeCheckpoint.value || checkpointSubmitting.value) return
  if (Object.keys(checkpointAnswers.value).length < activeCheckpoint.value.questions.length) return
  checkpointSubmitting.value = true
  try {
    const result = await content.submitCheckpoint(moduleId.value, activeCheckpoint.value.id, checkpointAnswers.value)
    if (result) {
      checkpointResult.value = { score: result.score, total: result.total }
      checkpointEncouragement.value = checkpointMessage(result.score, result.total)
    }
  } finally {
    checkpointSubmitting.value = false
  }
}

async function continueAfterCheckpoint() {
  if (!activeCheckpoint.value) return
  const nextBlockIndex = learningBlocks.value.findIndex(block => block.start === activeCheckpoint.value!.end_sort_order + 1)
  activeCheckpointId.value = null
  checkpointResult.value = null
  if (nextBlockIndex >= 0) await selectBlock(nextBlockIndex)
  else if (quizzes.value.length) await selectQuiz(quizzes.value[0].id)
}

async function submitActiveQuiz(autoSubmit = false) {
  if (!activeQuiz.value) return
  if (quizSubmitting.value || (quizLocked.value && !autoSubmit)) return
  quizSubmitting.value = true
  try {
    const result = await content.submitQuiz(moduleId.value, activeQuiz.value.id, quizAnswers.value)
    if (result) quizResult.value = { score: result.score, total: result.total }
    clearQuizTimer()
    if (result) {
      await router.push('/student/quiz')
    }
  } finally {
    quizSubmitting.value = false
  }
}

function saveActiveQuizAnswers() {
  if (!activeQuiz.value || quizLocked.value) return
  void content.saveQuizAnswers(moduleId.value, activeQuiz.value.id, quizAnswers.value).catch(() => null)
}

function assetUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_BASE_URL}${url}`
}

function topicDisplayTitle(topic: { title?: string | null }) {
  const title = topic.title?.trim() ?? ''
  return /^slide\s+\d+$/i.test(title) ? '' : title
}

function checkpointMessage(score: number, total: number) {
  const messages = score === total
    ? ['Excellent work!', 'Amazing job!', 'Perfect score—well done!']
    : score > 0
      ? ['Nice effort—keep learning!', 'Good job—keep going!', 'You are making progress!']
      : ['Keep trying—you can do this!', 'Every review helps you improve!', 'Stay curious and keep going!']
  return messages[Math.floor(Math.random() * messages.length)]
}

function openBlockSignVideo(index: number) {
  const video = learningBlocks.value[index]?.topics
    .flatMap(topic => topic.sign_videos ?? [])
    .find(Boolean)
  if (video) openFloatingVideo(video)
}

async function openFloatingVideo(video: FloatingVideo) {
  floatingVideo.value = video
  floatingVideoMinimized.value = false
  const panelWidth = Math.min(352, window.innerWidth - 32)
  floatingVideoPosition.value = {
    x: Math.max(16, window.innerWidth - panelWidth - 24),
    y: Math.max(72, Math.min(104, window.innerHeight - 260)),
  }
  await nextTick()
  // Browsers may refuse autoplay until there is a user gesture.  This call is
  // still needed for a block selected by the student; the autoplay attribute
  // covers the initial block where the browser allows it.
  void floatingVideoElement.value?.play().catch(() => null)
}

function closeFloatingVideo() {
  floatingVideo.value = null
  floatingVideoMinimized.value = false
  stopFloatingVideoDrag()
}

function startFloatingVideoDrag(event: PointerEvent) {
  const panel = event.currentTarget.parentElement
  if (!panel) return
  const bounds = panel.getBoundingClientRect()
  floatingVideoDragOffset = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
  window.addEventListener('pointermove', moveFloatingVideo)
  window.addEventListener('pointerup', stopFloatingVideoDrag, { once: true })
}

function moveFloatingVideo(event: PointerEvent) {
  if (!floatingVideoDragOffset) return
  const panelWidth = Math.min(352, window.innerWidth - 32)
  const panelHeight = floatingVideoMinimized.value ? 62 : 270
  floatingVideoPosition.value = {
    x: Math.max(8, Math.min(window.innerWidth - panelWidth - 8, event.clientX - floatingVideoDragOffset.x)),
    y: Math.max(8, Math.min(window.innerHeight - panelHeight - 8, event.clientY - floatingVideoDragOffset.y)),
  }
}

function stopFloatingVideoDrag() {
  floatingVideoDragOffset = null
  window.removeEventListener('pointermove', moveFloatingVideo)
  window.removeEventListener('pointerup', stopFloatingVideoDrag)
}

async function toggleFloatingVideoFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen()
    return
  }
  await floatingVideoElement.value?.requestFullscreen()
}

function startQuizTimer(initialRemainingSeconds: number) {
  if (initialRemainingSeconds <= 0) {
    quizRemainingSeconds.value = 0
    quizTimeExpired.value = true
    void submitActiveQuiz(true)
    return
  }

  const updateRemaining = () => {
    const remaining = Math.max(0, (quizRemainingSeconds.value ?? initialRemainingSeconds) - 1)
    quizRemainingSeconds.value = remaining
    if (remaining === 0) {
      clearQuizTimer()
      quizTimeExpired.value = true
      void submitActiveQuiz(true)
    }
  }

  quizRemainingSeconds.value = initialRemainingSeconds
  quizTimer = window.setInterval(updateRemaining, 1000)
}

function clearQuizTimer() {
  if (quizTimer !== null) {
    window.clearInterval(quizTimer)
    quizTimer = null
  }
  quizRemainingSeconds.value = null
}

function formatQuizTime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function hasQuizTimer(quiz: { time_limit_seconds?: number | null; time_limit?: string | null }) {
  return Boolean(quiz.time_limit_seconds && quiz.time_limit_seconds > 0) || Boolean(quiz.time_limit)
}

function parseQuestionOptions(rawAnswer?: string | null) {
  if (!rawAnswer) return { type: 'identification', choices: [] as { letter: string; text: string }[] }
  const up = rawAnswer.trim().toUpperCase()
  if (up === 'TRUE' || up === 'FALSE') {
    return {
      type: 'true_false',
      choices: [
        { letter: 'TRUE', text: 'True' },
        { letter: 'FALSE', text: 'False' },
      ],
    }
  }
  if (rawAnswer.includes('CORRECT:') && rawAnswer.includes('|')) {
    const parts = rawAnswer.split('|')
    const choices: { letter: string; text: string }[] = []
    for (const part of parts) {
      if (part.includes(':')) {
        const colonIdx = part.indexOf(':')
        const k = part.slice(0, colonIdx).trim()
        const v = part.slice(colonIdx + 1).trim()
        if (k !== 'CORRECT' && k) {
          choices.push({ letter: k, text: v })
        }
      }
    }
    if (choices.length >= 2) {
      return { type: 'multiple_choice', choices }
    }
  }
  return { type: 'identification', choices: [] as { letter: string; text: string }[] }
}

function quizQuestionTypeLabel(rawAnswer?: string | null) {
  const type = parseQuestionOptions(rawAnswer).type
  if (type === 'multiple_choice') return 'Multiple Choice'
  if (type === 'true_false') return 'True or False'
  return 'Identification'
}

function retakeStatusText(status?: string | null, reason?: string | null) {
  if (status === 'approved') return 'Your teacher allowed a retake. You can answer again.'
  if (status === 'rejected') return 'Retake access is currently disabled by your teacher.'
  if (reason === 'missed_deadline') return 'You missed the deadline. Ask your teacher if another attempt is needed.'
  if (reason === 'failed_low_score') return 'Your score is below half. Your teacher may allow another attempt if needed.'
  return 'Your teacher controls retake access for this quiz.'
}
</script>
