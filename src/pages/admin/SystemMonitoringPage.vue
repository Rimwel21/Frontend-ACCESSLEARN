<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-ink">Infrastructure Health</h2>
        <p class="text-sm text-ink-soft">Real-time telemetry from platform microservices and database clusters.</p>
      </div>
      <div class="px-4 py-2 bg-emerald-50 text-brand-green rounded-full flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-brand-green animate-pulse"></span>
          <span class="text-xs font-bold uppercase tracking-widest">Master Node: Operational</span>
      </div>
    </div>

    <!-- Health Overview Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Service Map -->
        <div class="lg:col-span-1 space-y-6">
            <div class="card p-6">
                <h3 class="font-display text-lg font-bold text-ink mb-6">Network Latency (ms)</h3>
                <div class="space-y-6">
                    <div v-for="node in nodes" :key="node.name" class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] font-bold text-ink-soft uppercase tracking-wider">{{ node.name }}</span>
                            <span :class="['text-xs font-mono font-bold', node.ms < 100 ? 'text-brand-green' : 'text-brand-amber']">{{ node.ms }}ms</span>
                        </div>
                        <div class="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                             <div :style="{ width: (node.ms / 200 * 100) + '%' }" :class="['h-full transition-all duration-1000', node.ms < 100 ? 'bg-brand-green' : 'bg-brand-amber']"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card p-6 bg-ink text-white">
                <div class="flex items-start justify-between mb-8">
                    <div>
                        <h3 class="font-display text-lg font-bold">Uptime Registry</h3>
                        <p class="text-[10px] opacity-60 font-bold uppercase tracking-widest">Last 365 Days</p>
                    </div>
                    <span class="text-2xl">🛡️</span>
                </div>
                <div class="flex gap-[2px] h-10 mb-4">
                    <div v-for="i in 60" :key="i" :class="['flex-1 rounded-sm', i % 25 === 0 ? 'bg-brand-rose' : 'bg-brand-green/80']"></div>
                </div>
                <div class="flex justify-between items-baseline">
                    <div class="text-3xl font-display font-bold">99.85%</div>
                    <div class="text-[10px] font-bold text-brand-green">↑ 0.02%</div>
                </div>
            </div>
        </div>

        <!-- Detailed Metrics -->
        <div class="lg:col-span-2 space-y-8">
            <div class="card">
                <div class="border-b border-gray-50 px-8 py-5 flex items-center justify-between">
                    <h3 class="font-display text-lg font-bold text-ink">Database Performance</h3>
                    <div class="flex gap-4">
                         <span class="text-[10px] font-bold text-brand-blue uppercase">PostgreSQL Cluster v17</span>
                    </div>
                </div>
                <div class="p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                             <div class="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-4">Read/Write Operations</div>
                             <div class="h-40 flex items-end gap-1.5">
                                 <div v-for="h in [40,60,55,70,85,80,65,45,50,75,90,85,70,60,55]" :key="h" :style="{ height: h + '%' }" class="flex-1 bg-brand-violet/20 rounded-t-sm relative group">
                                     <div class="absolute inset-0 bg-brand-violet scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>
                                 </div>
                             </div>
                        </div>
                        <div class="space-y-6">
                            <div class="flex items-center justify-between pb-4 border-b border-gray-50">
                                <span class="text-sm font-semibold text-ink-soft">Active Connections</span>
                                <span class="text-lg font-bold text-ink">42 / 100</span>
                            </div>
                            <div class="flex items-center justify-between pb-4 border-b border-gray-50">
                                <span class="text-sm font-semibold text-ink-soft">Shared Memory Buffers</span>
                                <span class="text-lg font-bold text-ink">1.2 GB</span>
                            </div>
                            <div class="flex items-center justify-between pb-4 border-b border-gray-50">
                                <span class="text-sm font-semibold text-ink-soft">Index Hit Rate</span>
                                <span class="text-lg font-bold text-brand-green">99.2%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card p-8">
                 <h3 class="font-display text-lg font-bold text-ink mb-6">Cloud Infrastructure</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div class="flex gap-5 items-start">
                         <div class="h-12 w-12 rounded-2xl bg-surface flex items-center justify-center text-xl">☁️</div>
                         <div>
                             <div class="text-sm font-bold text-ink">Cloudinary CDN</div>
                             <p class="text-xs text-ink-soft mb-3 leading-relaxed">Media optimization and distribution across Davao/Manila regions.</p>
                             <div class="px-3 py-1 bg-brand-blue/5 text-[10px] font-bold text-brand-blue uppercase inline-block rounded-md tracking-wider">Storage Tier: Free</div>
                         </div>
                     </div>
                     <div class="flex gap-5 items-start">
                         <div class="h-12 w-12 rounded-2xl bg-surface flex items-center justify-center text-xl">🚀</div>
                         <div>
                             <div class="text-sm font-bold text-ink">FastAPI Backend</div>
                             <p class="text-xs text-ink-soft mb-3 leading-relaxed">Asynchronous worker-based response handling with rate limiting.</p>
                             <div class="px-3 py-1 bg-brand-violet/5 text-[10px] font-bold text-brand-violet uppercase inline-block rounded-md tracking-wider">Workers: 4 Active</div>
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

const nodes = ref([
    { name: 'Davao Primary', ms: 12 },
    { name: 'Manila Secondary', ms: 45 },
    { name: 'Singapore Gateway', ms: 88 },
    { name: 'CDN Edge (Local)', ms: 5 }
])

let interval: any

onMounted(() => {
    interval = setInterval(() => {
        nodes.value.forEach(n => {
            const vari = Math.floor(Math.random() * 5) - 2
            n.ms = Math.max(5, n.ms + vari)
        })
    }, 2000)
})

onUnmounted(() => {
    clearInterval(interval)
})
</script>
