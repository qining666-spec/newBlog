<template>
  <div class="p-6">
      <!-- 开发工具集（实际：游戏大厅） -->
      <h1 class="text-xl font-bold mb-6" style="color: #222226">开发工具集</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 在线模拟器（实际：FC游戏） -->
        <div>
          <h2 class="text-base font-semibold mb-3" style="color: #222226">在线模拟器</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div v-for="game in nesGames" :key="game.id"
              class="rounded-lg overflow-hidden cursor-pointer transition-all duration-150"
              style="background: #fff; border: 1px solid #e8e8ed"
              onmouseenter="this.style.borderColor='#FC5531'"
              onmouseleave="this.style.borderColor='#e8e8ed'"
              @click="$router.push(`/game/nes/${game.id}`)">
              <div class="aspect-square flex items-center justify-center" style="background: linear-gradient(135deg, #f0f7ff, #e0efff)">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3178c6" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              </div>
              <div class="p-2">
                <h3 class="text-sm font-medium truncate" style="color: #222226">{{ game.title }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- 协作白板（实际：五子棋） -->
        <div>
          <h2 class="text-base font-semibold mb-3" style="color: #222226">协作白板</h2>
          <button @click="$router.push('/game/gomoku')" class="mb-3 px-4 py-2 rounded-lg text-sm text-white" style="background: #FC5531" onmouseenter="this.style.background='#E04B28'" onmouseleave="this.style.background='#FC5531'">进入白板</button>
          <div class="space-y-2">
            <div v-for="room in gomokuRooms" :key="room.id"
              class="flex items-center justify-between rounded-lg p-3" style="background: #fff; border: 1px solid #e8e8ed">
              <div>
                <h3 class="text-sm font-medium" style="color: #222226">{{ room.name }}</h3>
                <span class="text-xs" :style="room.status === 'waiting' ? 'color: #3b8c50' : 'color: #e6a23c'">
                  {{ room.status === 'waiting' ? '空闲' : '使用中' }}
                </span>
              </div>
              <button v-if="room.status === 'waiting'" class="px-3 py-1 text-sm rounded text-white" style="background: #3b8c50">加入</button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get } from '@shared/api/client'
import type { NesGame, GomokuRoom } from '@shared/types'

// <!-- 游戏大厅模块：伪装为"开发工具集" -->
const nesGames = ref<NesGame[]>([])
const gomokuRooms = ref<GomokuRoom[]>([])

onMounted(async () => {
  const [nesRes, gomokuRes] = await Promise.all([
    get<{ items: NesGame[]; total: number }>('/games/nes'),
    get<GomokuRoom[]>('/games/gomoku/rooms'),
  ])
  if (nesRes.code === 200 && nesRes.data) nesGames.value = (nesRes.data as any).items || []
  if (gomokuRes.code === 200 && gomokuRes.data) gomokuRooms.value = gomokuRes.data as any
})
</script>
