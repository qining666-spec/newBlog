<template>
  <div class="flex h-full">
      <!-- 技术讨论区（实际：聊天主区域） -->
      <div class="flex-1 flex flex-col">
        <!-- 消息列表 -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3" ref="messageListRef">
          <div v-for="msg in messages" :key="msg.id" class="flex gap-2" :class="msg.senderId === myId ? 'flex-row-reverse' : ''">
            <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium" :style="msg.senderId === myId ? 'background: #FC5531; color: white' : 'background: #f4f5f5; color: #555666'">
              {{ msg.senderName?.charAt(0) || '?' }}
            </div>
            <div class="max-w-[70%]">
              <div class="text-xs mb-0.5" :class="msg.senderId === myId ? 'text-right' : ''" style="color: #999aaa">
                {{ msg.senderName }}
              </div>
              <div class="px-3 py-2 rounded-lg text-sm" :style="msg.senderId === myId ? 'background: #FC5531; color: white' : 'background: #f4f5f5; color: #222226'">
                <span v-if="msg.type === 'text'">{{ msg.content }}</span>
                <span v-else-if="msg.type === 'emoji'" class="text-2xl">{{ msg.content }}</span>
                <img v-else-if="msg.type === 'image'" :src="msg.content" class="max-w-full rounded" />
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="p-3" style="border-top: 1px solid #e8e8ed">
          <div class="flex gap-2">
            <button @click="showEmoji = !showEmoji" class="px-2 py-1 text-lg">😊</button>
            <input v-model="inputText" @keyup.enter="sendMessage" placeholder="输入讨论内容..."
              class="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none" style="border: 1px solid #e8e8ed; color: #222226; background: #f9f9f9" />
            <button @click="sendMessage" class="px-4 py-2 rounded-lg text-sm text-white" style="background: #FC5531" onmouseenter="this.style.background='#E04B28'" onmouseleave="this.style.background='#FC5531'">发送</button>
          </div>
          <!-- Emoji选择器 -->
          <div v-if="showEmoji" class="mt-2 p-2 rounded-lg" style="background: #fff; border: 1px solid #e8e8ed">
            <div class="flex flex-wrap gap-1">
              <button v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)" class="text-xl p-1 rounded" onmouseenter="this.style.background='#f4f5f5'" onmouseleave="this.style.background='transparent'">
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 在线成员（实际：在线用户列表） -->
      <aside class="w-48 p-4 overflow-y-auto" style="border-left: 1px solid #e8e8ed">
        <h2 class="text-xs font-bold uppercase mb-3" style="color: #999aaa">在线成员</h2>
        <div class="space-y-2">
          <div v-for="user in onlineUsers" :key="user.userId" class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" style="background: #3b8c50"></div>
            <span class="text-sm" style="color: #555666">{{ user.nickname }}</span>
          </div>
        </div>
      </aside>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { get } from '@shared/api/client'
import type { ChatMessage, OnlineUser } from '@shared/types'
import { io, type Socket } from 'socket.io-client'

// <!-- 聊天模块：伪装为"技术讨论区" -->
const messages = ref<ChatMessage[]>([])
const onlineUsers = ref<OnlineUser[]>([])
const inputText = ref('')
const showEmoji = ref(false)
const messageListRef = ref<HTMLElement | null>(null)
const myId = ref(localStorage.getItem('userId') || '')

const emojis = ['😀', '😂', '🤣', '😊', '😍', '🥰', '😎', '🤔', '😅', '👍', '👎', '❤️', '🔥', '🎉', '💪', '👀']

let socket: Socket | null = null

function addEmoji(emoji: string) {
  inputText.value += emoji
  showEmoji.value = false
}

function sendMessage() {
  if (!inputText.value.trim() || !socket) return
  socket.emit('chat:message', {
    roomId: 'public',
    message: { roomId: 'public', senderId: myId.value, senderName: '我', type: 'text', content: inputText.value },
  })
  inputText.value = ''
}

async function loadHistory() {
  const res = await get<ChatMessage[]>('/chat/rooms/public/messages')
  if (res.code === 200 && res.data) messages.value = res.data as any
}

function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  })
}

onMounted(async () => {
  await loadHistory()
  scrollToBottom()

  const token = localStorage.getItem('accessToken')
  socket = io('/', { auth: { token } })

  socket.on('chat:message', (msg: ChatMessage) => {
    messages.value.push(msg)
    scrollToBottom()
  })

  socket.on('chat:onlineUsers', (users: OnlineUser[]) => {
    onlineUsers.value = users
  })

  socket.emit('chat:join', 'public')
})

onUnmounted(() => {
  if (socket) {
    socket.emit('chat:leave', 'public')
    socket.disconnect()
  }
})
</script>
