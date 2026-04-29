<template>
  <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ gameTitle }}</h1>
        <div class="flex gap-2">
          <button @click="toggleFullscreen" class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded">全屏</button>
          <button @click="saveState" class="px-3 py-1 text-sm bg-blue-600 text-white rounded">存档</button>
          <button @click="loadState" class="px-3 py-1 text-sm bg-green-600 text-white rounded">读档</button>
        </div>
      </div>
      <!-- NES游戏画面 -->
      <div class="bg-black rounded-lg flex items-center justify-center" style="aspect-ratio: 256/240;">
        <canvas ref="canvasRef" width="256" height="240" class="max-w-full max-h-full"></canvas>
      </div>
      <!-- 虚拟手柄（移动端） -->
      <div class="mt-4 md:hidden">
        <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div></div>
          <button @click="pressKey('up')" class="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-center text-xl">↑</button>
          <div></div>
          <button @click="pressKey('left')" class="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-center text-xl">←</button>
          <button @click="pressKey('down')" class="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-center text-xl">↓</button>
          <button @click="pressKey('right')" class="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-center text-xl">→</button>
        </div>
        <div class="flex justify-center gap-4 mt-3">
          <button @click="pressKey('b')" class="w-12 h-12 bg-red-500 text-white rounded-full text-sm font-bold">B</button>
          <button @click="pressKey('a')" class="w-12 h-12 bg-red-500 text-white rounded-full text-sm font-bold">A</button>
        </div>
        <div class="flex justify-center gap-4 mt-2">
          <button @click="pressKey('select')" class="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded text-xs">SELECT</button>
          <button @click="pressKey('start')" class="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded text-xs">START</button>
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

// TODO: 集成jsnes模拟器
// import { NES } from 'jsnes'

function toggleFullscreen() {
  if (canvasRef.value?.parentElement) {
    canvasRef.value.parentElement.requestFullscreen?.()
  }
}

function saveState() {
  // TODO: 获取jsnes实例的存档数据并保存
  post(`/games/nes/${gameId}/saves`, { saveData: '{}' })
}

function loadState() {
  // TODO: 从服务器加载存档并恢复
}

function pressKey(key: string) {
  // TODO: 映射到jsnes控制器
  console.log('press:', key)
}

onMounted(async () => {
  const res = await get<any>(`/games/nes/${gameId}`)
  if (res.code === 200 && res.data) {
    gameTitle.value = res.data.title
  }
  // TODO: 加载ROM并启动jsnes
})
</script>
