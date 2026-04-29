<template>
  <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">五子棋对战</h1>
        <div class="flex gap-2">
          <button @click="showCreateRoom = true" class="px-3 py-1 text-sm bg-blue-600 text-white rounded">创建房间</button>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 棋盘 -->
        <div class="flex-shrink-0">
          <div class="bg-amber-100 dark:bg-amber-900 p-4 rounded-lg inline-block">
            <div v-for="(row, y) in board" :key="y" class="flex">
              <div v-for="(cell, x) in row" :key="x"
                class="w-8 h-8 border border-amber-300 dark:border-amber-700 flex items-center justify-center cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
                @click="placeStone(x, y)">
                <div v-if="cell === 1" class="w-6 h-6 bg-gray-900 rounded-full shadow"></div>
                <div v-else-if="cell === 2" class="w-6 h-6 bg-white rounded-full shadow border border-gray-300"></div>
              </div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span v-if="winner">玩家{{ winner }}获胜！</span>
            <span v-else>当前: {{ currentPlayer === 1 ? '黑子' : '白子' }}</span>
          </div>
        </div>

        <!-- 房间列表 -->
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">房间列表</h2>
          <div class="space-y-2">
            <div v-for="room in rooms" :key="room.id"
              class="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">{{ room.name }}</h3>
                <span class="text-xs" :class="room.status === 'waiting' ? 'text-green-500' : 'text-yellow-500'">
                  {{ room.status === 'waiting' ? '等待中' : '对局中' }}
                </span>
              </div>
              <button v-if="room.status === 'waiting'" @click="joinRoom(room.id)" class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">加入</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 创建房间弹窗 -->
      <div v-if="showCreateRoom" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showCreateRoom = false">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">创建房间</h2>
          <input v-model="roomName" placeholder="房间名称" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4" />
          <div class="flex gap-3 justify-end">
            <button @click="showCreateRoom = false" class="px-4 py-2 text-gray-600">取消</button>
            <button @click="createRoom" class="px-4 py-2 bg-blue-600 text-white rounded-lg">创建</button>
          </div>
        </div>
      </div>
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
  // TODO: 通过Socket.IO发送落子事件
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
  // TODO: 通过Socket.IO加入房间
  console.log('join room:', roomId)
}

onMounted(fetchRooms)
</script>
