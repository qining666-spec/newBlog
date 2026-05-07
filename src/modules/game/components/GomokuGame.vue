<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-display font-bold text-foreground mb-2">协作白板</h1>
        <p class="text-muted-foreground">五子棋对战</p>
      </div>
      <button @click="showCreateRoom = true" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        创建房间
      </button>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Board -->
      <div class="flex-shrink-0">
        <div class="card-elevated p-6 inline-block">
          <div class="bg-amber-50 rounded-2xl p-3 shadow-inner">
            <div v-for="(row, y) in board" :key="y" class="flex">
              <div v-for="(cell, x) in row" :key="x"
                class="w-8 h-8 border border-amber-200 flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-amber-100"
                @click="placeStone(x, y)">
                <div v-if="cell === 1" class="w-6 h-6 bg-gray-900 rounded-full shadow-md"></div>
                <div v-else-if="cell === 2" class="w-6 h-6 bg-white rounded-full shadow-md border border-gray-200"></div>
              </div>
            </div>
          </div>
          <div class="mt-4 text-sm text-center font-medium"
            :class="winner ? 'text-accent' : 'text-muted-foreground'">
            <span v-if="winner">玩家{{ winner }}获胜！</span>
            <span v-else>当前: {{ currentPlayer === 1 ? '黑子' : '白子' }}</span>
          </div>
        </div>
      </div>

      <!-- Room List -->
      <div class="flex-1">
        <div class="card-elevated">
          <div class="p-6 border-b border-border">
            <h2 class="text-xl font-display font-semibold text-foreground">房间列表</h2>
          </div>
          <div class="p-6 space-y-3">
            <div v-for="room in rooms" :key="room.id"
              class="flex items-center justify-between bg-card rounded-2xl border border-border p-4 transition-all duration-200 hover:border-accent/30 hover:shadow-sm">
              <div>
                <h3 class="text-sm font-semibold text-foreground">{{ room.name }}</h3>
                <span class="text-xs font-medium"
                  :class="room.status === 'waiting' ? 'text-emerald-500' : 'text-amber-500'">
                  {{ room.status === 'waiting' ? '等待中' : '对局中' }}
                </span>
              </div>
              <button v-if="room.status === 'waiting'" @click="joinRoom(room.id)"
                class="px-4 py-2 text-sm rounded-xl font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm">
                加入
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Room Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateRoom" class="fixed inset-0 flex items-center justify-center z-50" @click.self="showCreateRoom = false">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="relative card-elevated w-full max-w-sm p-6">
            <h2 class="text-xl font-display font-bold text-foreground mb-6">创建房间</h2>
            <input v-model="roomName" placeholder="房间名称" class="input mb-6" />
            <div class="flex gap-3 justify-end">
              <button @click="showCreateRoom = false" class="btn-secondary">取消</button>
              <button @click="createRoom" class="btn-primary">创建</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get, post } from '@shared/api/client'
import type { GomokuRoom } from '@shared/types'

const BOARD_SIZE = 15
const board = ref<number[][]>(Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0)))
const currentPlayer = ref<1 | 2>(1)
const winner = ref<1 | 2 | null>(null)
const rooms = ref<GomokuRoom[]>([])
const showCreateRoom = ref(false)
const roomName = ref('')

function placeStone(x: number, y: number) {
  if (board.value[y][x] !== 0 || winner.value) return
  board.value[y][x] = currentPlayer.value
  if (checkWin(x, y, currentPlayer.value)) {
    winner.value = currentPlayer.value
  } else {
    currentPlayer.value = currentPlayer.value === 1 ? 2 : 1
  }
}

function checkWin(x: number, y: number, player: number): boolean {
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]
  for (const [dx, dy] of directions) {
    let count = 1
    for (let i = 1; i < 5; i++) {
      if (board.value[y + i * dy]?.[x + i * dx] === player) count++
      else break
    }
    for (let i = 1; i < 5; i++) {
      if (board.value[y - i * dy]?.[x - i * dx] === player) count++
      else break
    }
    if (count >= 5) return true
  }
  return false
}

async function fetchRooms() {
  const res = await get<GomokuRoom[]>('/games/gomoku/rooms')
  if (res.code === 200 && res.data) rooms.value = res.data as any
}

async function createRoom() {
  if (!roomName.value) return
  await post('/games/gomoku/rooms', { name: roomName.value, boardSize: BOARD_SIZE })
  showCreateRoom.value = false
  roomName.value = ''
  await fetchRooms()
}

function joinRoom(roomId: string) {
  console.log('join room:', roomId)
}

onMounted(fetchRooms)
</script>

<style scoped>
.modal-enter-active { transition: all 200ms ease-out; }
.modal-leave-active { transition: all 150ms ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > :last-child, .modal-leave-to > :last-child { transform: scale(0.95) translateY(10px); }
</style>
