<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-display font-bold text-foreground mb-2">{{ gameTitle }}</h1>
        <p class="text-muted-foreground">在线模拟器</p>
      </div>
      <div class="flex gap-3">
        <button @click="toggleFullscreen" class="btn-secondary text-sm px-4 py-2">全屏</button>
        <button @click="saveState" class="btn-secondary text-sm px-4 py-2">存档</button>
        <button @click="loadState" class="btn-primary text-sm px-4 py-2">读档</button>
      </div>
    </div>

    <!-- Game Screen -->
    <div class="card-elevated p-0 overflow-hidden">
      <div class="bg-black rounded-2xl flex items-center justify-center" style="aspect-ratio: 256/240;">
        <canvas ref="canvasRef" width="256" height="240" class="max-w-full max-h-full"></canvas>
      </div>
    </div>

    <!-- Virtual Controller (Mobile) -->
    <div class="md:hidden">
      <div class="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        <div></div>
        <button @click="pressKey('up')" class="p-4 bg-card border border-border rounded-2xl text-center text-xl font-bold text-foreground active:bg-accent/10 transition-colors">↑</button>
        <div></div>
        <button @click="pressKey('left')" class="p-4 bg-card border border-border rounded-2xl text-center text-xl font-bold text-foreground active:bg-accent/10 transition-colors">←</button>
        <button @click="pressKey('down')" class="p-4 bg-card border border-border rounded-2xl text-center text-xl font-bold text-foreground active:bg-accent/10 transition-colors">↓</button>
        <button @click="pressKey('right')" class="p-4 bg-card border border-border rounded-2xl text-center text-xl font-bold text-foreground active:bg-accent/10 transition-colors">→</button>
      </div>
      <div class="flex justify-center gap-6 mt-4">
        <button @click="pressKey('b')" class="w-14 h-14 rounded-full text-sm font-bold text-white transition-all duration-200 active:scale-95" style="background: linear-gradient(135deg, #0052FF, #4D7CFF); box-shadow: 0 4px 14px rgba(0,82,255,0.25)">B</button>
        <button @click="pressKey('a')" class="w-14 h-14 rounded-full text-sm font-bold text-white transition-all duration-200 active:scale-95" style="background: linear-gradient(135deg, #0052FF, #4D7CFF); box-shadow: 0 4px 14px rgba(0,82,255,0.25)">A</button>
      </div>
      <div class="flex justify-center gap-4 mt-3">
        <button @click="pressKey('select')" class="px-4 py-2 bg-muted rounded-xl text-xs font-medium text-muted-foreground">SELECT</button>
        <button @click="pressKey('start')" class="px-4 py-2 bg-muted rounded-xl text-xs font-medium text-muted-foreground">START</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { get, post } from '@shared/api/client'

const route = useRoute()
const gameId = route.params.id as string
const gameTitle = ref('FC游戏')
const canvasRef = ref<HTMLCanvasElement | null>(null)

function toggleFullscreen() {
  if (canvasRef.value?.parentElement) {
    canvasRef.value.parentElement.requestFullscreen?.()
  }
}

function saveState() {
  post(`/games/nes/${gameId}/saves`, { saveData: '{}' })
}

function loadState() {
}

function pressKey(key: string) {
  console.log('press:', key)
}

onMounted(async () => {
  const res = await get<any>(`/games/nes/${gameId}`)
  if (res.code === 200 && res.data) {
    gameTitle.value = res.data.title
  }
})
</script>
