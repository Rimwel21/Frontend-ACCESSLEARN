<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-ink">Elementary Resource Monitoring</h2>
        <p class="text-sm text-ink-soft">Academic engagement telemetry and elementary platform activity tracking.</p>
      </div>
      <div class="px-4 py-2 bg-emerald-50 text-brand-green rounded-full flex items-center gap-2 border border-brand-green/10">
          <span class="h-2 w-2 rounded-full bg-brand-green animate-pulse"></span>
          <span class="text-xs font-bold uppercase tracking-widest">Global Activity: High</span>
      </div>
    </div>

    <!-- Activity Overview Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Live Engagement Feed -->
        <div class="lg:col-span-1 space-y-6">
            <div class="card p-6">
                <h3 class="font-display text-lg font-bold text-ink mb-6">Real-time Engagement</h3>
                <div class="space-y-6">
                    <div v-for="node in engagements" :key="node.name" class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] font-bold text-ink-soft uppercase tracking-wider">{{ node.name }}</span>
                            <span :class="['text-xs font-mono font-bold', node.active > 50 ? 'text-brand-green' : 'text-brand-amber']">{{ node.active }}% Active</span>
                        </div>
                        <div class="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden text-[0px]">
                             <div :style="{ width: node.active + '%' }" :class="['h-full transition-all duration-1000', node.active > 50 ? 'bg-brand-green' : 'bg-brand-amber']"></div>
                        </div>
                    </div>
                </div>
                <div class="mt-8 p-4 bg-surface rounded-xl border border-gray-100">
                    <div class="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-2">Peak Usage Time</div>
                    <div class="text-sm font-bold text-ink">08:30 AM — 11:45 AM</div>
                </div>
            </div>

            <!-- Security Pulse -->
            <div class="card p-6 bg-ink text-white">
                <div class="flex items-start justify-between mb-8">
                    <div>
                        <h3 class="font-display text-lg font-bold">Access Registry</h3>
                        <p class="text-[10px] opacity-60 font-bold uppercase tracking-widest">Authentication attempts (24h)</p>
                    </div>
                    <span class="text-2xl">🛡️</span>
                </div>
                <div class="flex gap-[2px] h-10 mb-4 items-end">
                    <div v-for="i in 60" :key="i" :class="['flex-1 rounded-sm', i % 15 === 0 ? 'bg-brand-rose h-4' : 'bg-brand-green/80 h-8']"></div>
                </div>
                <div class="flex justify-between items-baseline">
                    <div class="text-3xl font-display font-bold">94.2%</div>
                    <div class="text-[10px] font-bold text-brand-green">Success Rate</div>
                </div>
            </div>
        </div>

        <!-- Academic Telemetry -->
        <div class="lg:col-span-2 space-y-8">
            <div class="card">
                <div class="border-b border-gray-50 px-8 py-5 flex items-center justify-between">
                    <h3 class="font-display text-lg font-bold text-ink">Activity Volume</h3>
                    <div class="flex gap-4">
                         <span class="text-[10px] font-bold text-brand-blue uppercase">7-Day Engagement Trend</span>
                    </div>
                </div>
                <div class="p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                             <div class="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-4">Daily Submissions</div>
                             <div class="h-40 flex items-end gap-1.5">
                                 <div v-for="h in [40,60,55,70,85,80,65,45,50,75,90,85,70,60,55]" :key="h" :style="{ height: h + '%' }" class="flex-1 bg-brand-violet/20 rounded-t-sm relative group">
                                     <div class="absolute inset-0 bg-brand-violet scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>
                                 </div>
                             </div>
                        </div>
                        <div class="space-y-6">
                            <div class="flex items-center justify-between pb-4 border-b border-gray-50">
                                <span class="text-sm font-semibold text-ink-soft">Recent Uploads</span>
                                <span class="text-lg font-bold text-ink">156 Files</span>
                            </div>
                            <div class="flex items-center justify-between pb-4 border-b border-gray-50">
                                <span class="text-sm font-semibold text-ink-soft">Quiz Active Sessions</span>
                                <span class="text-lg font-bold text-ink">42 Students</span>
                            </div>
                            <div class="flex items-center justify-between pb-4 border-b border-gray-50">
                                <span class="text-sm font-semibold text-ink-soft">Lesson Completion Rate</span>
                                <span class="text-lg font-bold text-brand-green">82.5%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Platform Highlights -->
            <div class="card p-8">
                 <h3 class="font-display text-lg font-bold text-ink mb-6">Monitoring Highlights</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div class="flex gap-5 items-start">
                         <div class="h-12 w-12 rounded-2xl bg-surface flex items-center justify-center text-xl">🎓</div>
                         <div>
                             <div class="text-sm font-bold text-ink">Student Placement</div>
                             <p class="text-xs text-ink-soft mb-3 leading-relaxed">Recent bulk transfers between Grade 6 sections completed.</p>
                             <div class="px-3 py-1 bg-brand-blue/5 text-[10px] font-bold text-brand-blue uppercase inline-block rounded-md tracking-wider">Status: Healthy</div>
                         </div>
                     </div>
                     <div class="flex gap-5 items-start">
                         <div class="h-12 w-12 rounded-2xl bg-surface flex items-center justify-center text-xl">👨‍🏫</div>
                         <div>
                             <div class="text-sm font-bold text-ink">Teacher Activity</div>
                             <p class="text-xs text-ink-soft mb-3 leading-relaxed">High volume of new module creation across Senior High sections.</p>
                             <div class="px-3 py-1 bg-brand-violet/5 text-[10px] font-bold text-brand-violet uppercase inline-block rounded-md tracking-wider">Activity: High</div>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const engagements = ref([
    { name: 'Kindergarten Sections', active: 92 },
    { name: 'Lower Primary (G1-G3)', active: 78 },
    { name: 'Upper Primary (G4-G6)', active: 55 },
    { name: 'SPED Learning Modules', active: 84 }
])

let interval: any

onMounted(() => {
    interval = setInterval(() => {
        engagements.value.forEach(n => {
            const vari = Math.floor(Math.random() * 7) - 3
            n.active = Math.min(100, Math.max(10, n.active + vari))
        })
    }, 3000)
})

onUnmounted(() => {
    clearInterval(interval)
})
</script>
