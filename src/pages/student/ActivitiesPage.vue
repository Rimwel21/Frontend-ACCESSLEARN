<template>
  <div class="bg-white min-h-screen">

    <!-- Header -->
    <div class="bg-[#1565FF] px-8 py-6 border-b-[3px] border-black">
      <h1 class="font-display font-black text-[28px] text-white">Activity</h1>
    </div>

    <div class="px-7 py-6">
      <div class="grid grid-cols-[1fr_240px] gap-5 items-start">

        <!-- LEFT: Activity list -->
        <div>
          <!-- Toolbar -->
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-display font-black text-sm uppercase tracking-widest">All Activity</h2>
            <div class="flex gap-2">
              <button class="border-[3px] border-black bg-white font-black text-xs px-4 py-2 hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all" style="box-shadow:3px 3px 0 #000">
                Filters
              </button>
              <button class="border-[3px] border-black bg-white font-black text-xs px-4 py-2 hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all" style="box-shadow:3px 3px 0 #000">
                Due Date
              </button>
            </div>
          </div>

          <!-- Activity rows -->
          <div class="space-y-3">
            <div v-for="act in activities" :key="act.id"
              class="flex items-center gap-4 p-4 border-[3px] border-black bg-white cursor-pointer hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all"
              style="box-shadow:4px 4px 0 #000"
              @click="act.to ? router.push(act.to) : null"
            >
              <!-- Checkbox/icon -->
              <div class="w-10 h-10 border-[3px] border-black bg-[#D6E4FF] flex items-center justify-center flex-shrink-0 text-base">
                A-Z
              </div>

              <!-- Title + desc -->
              <div class="flex-1 min-w-0">
                <div class="font-black text-[14px]">{{ act.title }}</div>
                <div class="font-mono text-[11px] text-gray-500 mt-0.5">{{ act.description }}</div>
              </div>

              <!-- Due date -->
              <div class="text-right flex-shrink-0">
                <div class="font-mono text-[11px] font-bold text-gray-700">Due {{ act.dueDate }}</div>
                <div class="font-mono text-[10px] text-gray-500">{{ act.dueTime }}</div>
              </div>

              <!-- Status -->
              <span :class="['border-[2px] border-black font-mono text-[10px] font-black px-2.5 py-1.5 flex-shrink-0', statusStyle(act.status)]">
                {{ act.status }}
              </span>

              <!-- Arrow -->
              <span class="text-lg font-black flex-shrink-0">&gt;</span>
            </div>
          </div>
        </div>

        <!-- RIGHT: side panels -->
        <div class="space-y-4">
          <!-- In Progress -->
          <div class="border-[3px] border-black bg-white" style="box-shadow:5px 5px 0 #000">
            <div class="px-3.5 py-2.5 border-b-[3px] border-black bg-[#1565FF]">
              <span class="font-display font-black text-[12px] text-white uppercase tracking-wide">In Progress</span>
            </div>
            <div class="p-3 min-h-[80px]" />
          </div>

          <!-- Upcoming Deadlines -->
          <div class="border-[3px] border-black bg-white" style="box-shadow:5px 5px 0 #000">
            <div class="px-3.5 py-2.5 border-b-[3px] border-black bg-[#1565FF]">
              <span class="font-display font-black text-[12px] text-white uppercase tracking-wide">Upcoming Deadlines</span>
            </div>
            <div class="p-3 min-h-[80px]" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Activity {
  id: number
  title: string
  description: string
  dueDate: string
  dueTime: string
  status: 'Overdue' | 'In Progress' | 'Not Started' | 'Finished'
  to?: string
}

const activities: Activity[] = [
  { id: 0, title: 'Hand Sign Language', description: 'Practice A-Z alphabet answers with optional camera-based sign detection', dueDate: 'Anytime', dueTime: 'Self-paced', status: 'Not Started', to: '/student/activities/handsign' },
  { id: 1, title: 'Title Of Activity', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', dueDate: 'May 10, 2025', dueTime: '1:00PM', status: 'Overdue' },
  { id: 2, title: 'Title Of Activity', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', dueDate: 'May 20, 2025', dueTime: '1:59PM', status: 'In Progress' },
  { id: 3, title: 'Title Of Activity', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', dueDate: 'May 20, 2025', dueTime: '1:59PM', status: 'Not Started' },
  { id: 4, title: 'Title Of Activity', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', dueDate: 'May 20, 2025', dueTime: '1:59PM', status: 'Finished' },
]

const router = useRouter()

function statusStyle(status: Activity['status']) {
  switch (status) {
    case 'Overdue':     return 'bg-[#FFC2C2] text-red-700'
    case 'In Progress': return 'bg-[#FFE135] text-black'
    case 'Not Started': return 'bg-[#f0f0f0] text-gray-600'
    case 'Finished':    return 'bg-green-200 text-green-700'
    default:            return 'bg-white'
  }
}
</script>
