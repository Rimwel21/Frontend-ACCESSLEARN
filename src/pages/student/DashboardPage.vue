<template>
  <div class="bg-white min-h-screen">

    <!-- Hero -->
    <div class="bg-[#1565FF] px-8 py-8 flex items-center justify-between relative overflow-hidden border-b-[3px] border-black">
      <div class="relative z-10">
        <h1 class="font-display font-black text-[32px] text-white leading-tight mb-1.5">Welcome, {{ store.studentName }}!</h1>
        <p class="text-white font-mono text-[11px] tracking-widest">▶ READY TO STUDY?</p>
      </div>
      <div class="flex items-end gap-3 relative z-10">
        <div class="text-5xl" style="animation: float 3s ease-in-out infinite;">🧪</div>
        <div class="text-5xl" style="animation: float 3.4s ease-in-out infinite .3s;">📔</div>
      </div>
    </div>

    <div class="px-7 py-6 space-y-7">

      <!-- Top row: search + icons -->
      <div class="flex items-center gap-3">
        <div class="flex-1 flex items-center gap-2 bg-white border-[3px] border-black px-4 py-2.5" style="box-shadow:4px 4px 0 #000">
          <input type="text" placeholder="Search" class="flex-1 border-0 outline-none text-sm bg-transparent text-gray-700 font-bold" />
          <span class="text-gray-500 text-sm">🔍</span>
        </div>
        <div class="flex gap-2">
          <div class="w-[42px] h-[42px] border-[3px] border-black bg-white" style="box-shadow:3px 3px 0 #000" />
          <div class="w-[42px] h-[42px] border-[3px] border-black bg-white" style="box-shadow:3px 3px 0 #000" />
          <div class="w-[42px] h-[42px] rounded-full border-[3px] border-black bg-white" style="box-shadow:3px 3px 0 #000" />
        </div>
      </div>

      <!-- Modules section -->
      <div>
        <div class="flex items-center gap-3 mb-4">
          <h2 class="font-display font-black text-sm uppercase tracking-widest">Modules</h2>
          <div class="flex-1 h-[2.5px] bg-black" />
        </div>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="mod in store.modules" :key="mod.id"
            @click="mod.locked ? null : router.push('/student/topic')"
            class="border-[3px] border-black overflow-hidden cursor-pointer transition-all hover:-translate-x-[3px] hover:-translate-y-[3px]"
            style="box-shadow: 5px 5px 0 #000"
          >
            <div :class="['h-[88px] flex items-center justify-center relative', mod.locked ? 'bg-[#f0f0f0]' : 'bg-[#FFE135]']">
              <span v-if="mod.locked" class="text-3xl opacity-60">🔒</span>
              <span v-else class="text-4xl">📘</span>
              <span v-if="mod.locked" class="absolute bottom-1.5 right-1.5 bg-[#1a1a1a] text-white font-mono text-[8px] font-bold px-1.5 py-0.5 tracking-wide">LOCKED</span>
            </div>
            <div class="p-2.5 bg-white border-t-[3px] border-black">
              <div class="font-display font-black text-[11px] uppercase tracking-wide">{{ mod.title }}</div>
              <div class="font-mono text-[9px] text-gray-500 mt-0.5">{{ mod.status }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress + Right column -->
      <div class="grid grid-cols-[1fr_280px] gap-5 items-start">

        <!-- Continue Progress -->
        <div>
          <div class="flex items-center gap-3 mb-4">
            <h2 class="font-display font-black text-sm uppercase tracking-widest">Continue Progress</h2>
            <div class="flex-1 h-[2.5px] bg-black" />
          </div>
          <div class="space-y-4">
            <div v-for="item in store.progressItems" :key="item.title"
              class="flex items-center gap-4 p-4 border-[3px] border-black bg-white"
              style="box-shadow: 5px 5px 0 #000"
            >
              <div :class="['w-11 h-11 border-[3px] border-black flex items-center justify-center text-lg flex-shrink-0', item.type === 'video' ? 'bg-[#FFE135]' : 'bg-[#D6E4FF]']">
                {{ item.type === 'video' ? '▶' : '📖' }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-black text-[15px]">{{ item.title }}</div>
                <div class="font-mono text-[10px] text-gray-500 mt-0.5">{{ item.subtitle }}</div>
                <div class="flex items-center gap-2.5 mt-2">
                  <div class="flex-1 h-[11px] bg-[#e8e8e8] border-[2px] border-black overflow-hidden">
                    <div :class="['h-full transition-all', item.type === 'video' ? 'bg-[#FFE135]' : 'bg-[#1565FF]']" :style="{ width: item.percent + '%' }" />
                  </div>
                  <span class="font-mono text-[10px] font-bold whitespace-nowrap text-gray-700">{{ item.lesson }}</span>
                </div>
              </div>
              <button @click="router.push('/student/topic')"
                class="border-[3px] border-black bg-[#1565FF] text-white font-black text-[12px] px-4 py-2.5 hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all flex-shrink-0"
                style="box-shadow: 3px 3px 0 #000">
                RESUME
              </button>
            </div>
          </div>
        </div>

        <!-- Calendar + Deadlines -->
        <div class="space-y-4">
          <!-- Mini Calendar -->
          <div class="border-[3px] border-black bg-white" style="box-shadow: 5px 5px 0 #000">
            <div class="px-3.5 py-2.5 border-b-[3px] border-black flex items-center justify-between">
              <span class="font-display font-black text-[13px]">Sep 2025</span>
              <div class="flex gap-1">
                <button class="w-[20px] h-[20px] border-[2px] border-black font-bold text-[10px] hover:bg-[#FFE135] transition-colors">‹</button>
                <button class="w-[20px] h-[20px] border-[2px] border-black font-bold text-[10px] hover:bg-[#FFE135] transition-colors">›</button>
              </div>
            </div>
            <div class="p-2.5">
              <div class="grid grid-cols-7 gap-0.5 text-center mb-1">
                <div v-for="d in ['M','T','W','T','F','S','S']" :key="d" class="font-mono text-[9px] font-bold text-gray-500 py-1">{{ d }}</div>
              </div>
              <div class="grid grid-cols-7 gap-0.5 text-center">
                <div v-for="day in 30" :key="day"
                  :class="['font-mono text-[11px] py-1.5 cursor-pointer transition-colors',
                    day === 10 ? 'bg-[#1565FF] text-white font-bold' :
                    [11,12].includes(day) ? 'bg-[#D6E4FF] text-[#1565FF] font-bold' :
                    'hover:bg-gray-100'
                  ]"
                >{{ day }}</div>
              </div>
            </div>
          </div>

          <!-- Deadlines -->
          <div class="border-[3px] border-black bg-white" style="box-shadow: 5px 5px 0 #000">
            <div class="px-3.5 py-2.5 border-b-[3px] border-black font-display font-black text-[11px] uppercase tracking-wide">Upcoming Deadlines</div>
            <div class="p-2.5 space-y-2">
              <div v-for="dl in store.deadlines" :key="dl.title"
                class="p-2.5 bg-[#FFE135] border-[2px] border-black hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all cursor-pointer"
                style="box-shadow: 2px 2px 0 #000"
              >
                <div class="font-black text-[12px]">{{ dl.title }}</div>
                <div class="font-mono text-[10px] text-gray-700 mt-0.5">📅 {{ dl.date }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const store  = useAppStore()
</script>
