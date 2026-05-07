<template>
  <div class="flex gap-6 h-[calc(100vh-10rem)]">
    <!-- Chat Main -->
    <div class="flex-1 flex flex-col card-elevated overflow-hidden">
      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4" ref="messageListRef">
        <div v-if="messages.length === 0" class="text-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">💬</span>
          </div>
          <h3 class="text-xl font-display font-semibold text-foreground mb-2">社区讨论</h3>
          <p class="text-sm text-muted-foreground">发送消息开始交流</p>
        </div>

        <div v-for="msg in messages" :key="msg.id" class="flex gap-3" :class="msg.senderId === myId ? 'flex-row-reverse' : ''">
          <div class="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-medium"
            :class="msg.senderId === myId ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'">
            {{ msg.senderName?.charAt(0) || '?' }}
          </div>
          <div class="max-w-[70%]">
            <div class="text-xs mb-1 font-medium" :class="msg.senderId === myId ? 'text-right text-accent' : 'text-muted-foreground'">
              {{ msg.senderName }}
            </div>
            <div class="rounded-2xl px-4 py-2.5 text-sm"
              :class="msg.senderId === myId ? 'bg-accent text-white' : 'bg-muted text-foreground'">
              <span v-if="msg.type === 'text'">{{ msg.content }}</span>
              <span v-else-if="msg.type === 'emoji'" class="text-2xl">{{ msg.content }}</span>
              <img v-else-if="msg.type === 'image'" :src="msg.content" class="max-w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="px-6 py-4 border-t border-border">
        <div class="flex gap-3 items-center">
          <button @click="showEmoji = !showEmoji" class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors text-lg">😊</button>
          <input v-model="inputText" @keyup.enter="sendMessage" placeholder="输入讨论内容..." class="input flex-1" />
          <button @click="sendMessage" class="btn-primary !px-6">发送</button>
        </div>
        <div v-if="showEmoji" class="mt-3 p-3 rounded-xl bg-card border border-border shadow-md">
          <div class="flex flex-wrap gap-1">
            <button v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)" class="text-xl p-1.5 rounded-lg hover:bg-muted transition-colors">{{ emoji }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Online Users -->
    <aside class="w-56 flex-shrink-0 space-y-4">
      <div class="card">
        <h3 class="font-display font-semibold text-foreground mb-4">在线成员</h3>
        <div class="space-y-3">
          <div v-for="user in onlineUsers" :key="user.userId" class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            <span class="text-sm text-foreground">{{ user.nickname }}</span>
          </div>
          <div v-if="onlineUsers.length === 0" class="text-sm text-muted-foreground">暂无在线用户</div>
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

const messages = ref<ChatMessage[]>([])
const onlineUsers = ref<OnlineUser[]>([])
const inputText = ref('')
const showEmoji = ref(false)
const messageListRef = ref<HTMLElement | null>(null)
const myId = ref(localStorage.getItem('userId') || '')

const emojis = ['😀', '😂', '🤣', '😊', '😍', '🥰', '😎', '🤔', '😅', '👍', '👎', '❤️', '🔥', '🎉', '💪', '👀']

let socket: Socket | null = null

function addEmoji(emoji: string) { inputText.value += emoji; showEmoji.value = false }

function sendMessage() {
  if (!inputText.value.trim() || !socket) return
  socket.emit('chat:message', { roomId: 'public', message: { roomId: 'public', senderId: myId.value, senderName: '我', type: 'text', content: inputText.value } })
  inputText.value = ''
}

async function loadHistory() { const res = await get<ChatMessage[]>('/chat/rooms/public/messages'); if (res.code === 200 && res.data) messages.value = res.data as any }
function scrollToBottom() { nextTick(() => { if (messageListRef.value) messageListRef.value.scrollTop = messageListRef.value.scrollHeight }) }

onMounted(async () => {
  await loadHistory(); scrollToBottom()
  const token = localStorage.getItem('accessToken')
  socket = io('/', { auth: { token } })
  socket.on('chat:message', (msg: ChatMessage) => { messages.value.push(msg); scrollToBottom() })
  socket.on('chat:onlineUsers', (users: OnlineUser[]) => { onlineUsers.value = users })
  socket.emit('chat:join', 'public')
})

onUnmounted(() => { if (socket) { socket.emit('chat:leave', 'public'); socket.disconnect() } })
</script>
