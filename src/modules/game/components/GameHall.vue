<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-display font-bold text-foreground mb-2">开发工具集</h1>
      <p class="text-muted-foreground">在线模拟器与协作工具</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Emulators (NES Games) -->
      <div class="card-elevated p-0 overflow-hidden">
        <div class="p-6 border-b border-border">
          <h2 class="text-xl font-display font-semibold text-foreground">在线模拟器</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div v-for="game in nesGames" :key="game.id"
              class="bg-card rounded-2xl border border-border overflow-hidden cursor-pointer transition-all duration-300 group hover:shadow-lg hover:-translate-y-1"
              @click="$router.push(`/game/nes/${game.id}`)">
              <div class="aspect-square flex items-center justify-center"
                style="background: linear-gradient(135deg, rgba(0,82,255,0.04), rgba(77,124,255,0.1))">
                <svg class="w-8 h-8 text-accent/25 group-hover:text-accent/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="p-3">
                <h3 class="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">{{ game.title }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Collaboration Board (Gomoku) -->
      <div class="card-elevated p-0 overflow-hidden">
        <div class="p-6 border-b border-border flex items-center justify-between">
          <h2 class="text-xl font-display font-semibold text-foreground">协作白板</h2>
          <button @click="$router.push('/game/gomoku')" class="btn-primary text-sm px-4 py-2">进入白板</button>
        </div>
        <div class="p-6 space-y-3">
          <div v-for="room in gomokuRooms" :key="room.id"
            class="flex items-center justify-between bg-card rounded-2xl border border-border p-4 transition-all duration-200 hover:border-accent/30 hover:shadow-sm">
            <div>
              <h3 class="text-sm font-semibold text-foreground">{{ room.name }}</h3>
              <span class="text-xs font-medium"
                :class="room.status === 'waiting' ? 'text-emerald-500' : 'text-amber-500'">
                {{ room.status === 'waiting' ? '空闲' : '使用中' }}
              </span>
            </div>
            <button v-if="room.status === 'waiting'"
              class="px-4 py-2 text-sm rounded-xl font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm">
              加入
            </button>
          </div>
          <div v-if="gomokuRooms.length === 0" class="text-center py-8 text-muted-foreground text-sm">
            暂无房间，创建一个吧
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
