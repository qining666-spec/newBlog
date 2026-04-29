<template>
  <div class="h-full flex gap-4">
    <!-- 左侧：对话历史 + 知识库面板 -->
    <div v-if="showSidebar" class="w-72 flex-shrink-0 rounded-xl overflow-hidden flex flex-col" style="background: #fff; border: 1px solid #e8e8ed">
      <!-- 标签页切换 -->
      <div class="flex flex-shrink-0" style="border-bottom: 1px solid #e8e8ed">
        <button @click="sidebarTab = 'history'" class="flex-1 py-2.5 text-xs font-medium text-center" :style="sidebarTab === 'history' ? 'color: #FC5531; border-bottom: 2px solid #FC5531' : 'color: #555666'">对话历史</button>
        <button @click="sidebarTab = 'knowledge'" class="flex-1 py-2.5 text-xs font-medium text-center" :style="sidebarTab === 'knowledge' ? 'color: #FC5531; border-bottom: 2px solid #FC5531' : 'color: #555666'">知识库</button>
      </div>

      <!-- 对话历史面板 -->
      <div v-if="sidebarTab === 'history'" class="flex-1 overflow-y-auto">
        <div class="p-2">
          <button @click="newConversation" class="w-full px-3 py-2 rounded-lg text-xs text-white mb-2" style="background: #FC5531">+ 新对话</button>
        </div>
        <div class="space-y-1 px-2">
          <div v-for="conv in conversations" :key="conv.id"
            class="px-3 py-2 rounded-lg cursor-pointer transition-all group"
            :style="currentConvId === conv.id ? 'background: #fff5f2' : ''"
            @click="loadConversation(conv)">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium truncate" style="color: #222226">{{ conv.title }}</span>
              <button @click.stop="deleteConversation(conv.id)" class="text-xs opacity-0 group-hover:opacity-100" style="color: #999aaa">删</button>
            </div>
            <div class="text-xs truncate mt-0.5" style="color: #999aaa">{{ conv.model }} · {{ formatTime(conv.updatedAt) }}</div>
          </div>
          <div v-if="conversations.length === 0" class="text-center py-8 text-xs" style="color: #999aaa">暂无对话历史</div>
        </div>
      </div>

      <!-- 知识库面板 -->
      <div v-if="sidebarTab === 'knowledge'" class="flex-1 overflow-y-auto">
        <div class="p-2">
          <button @click="showAddCard = true" class="w-full px-3 py-2 rounded-lg text-xs text-white mb-2" style="background: #FC5531">+ 新建卡片</button>
        </div>
        <div class="space-y-2 px-2">
          <div v-for="card in knowledgeCards" :key="card.id"
            class="p-3 rounded-lg cursor-pointer transition-all"
            :style="selectedKnowledge.includes(card.id) ? 'background: #fff5f2; border: 1px solid #FC5531' : 'background: #fafafa; border: 1px solid transparent'"
            @click="toggleKnowledge(card.id)">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium" style="color: #222226">{{ card.title }}</span>
              <button @click.stop="deleteCard(card.id)" class="text-xs" style="color: #999aaa">删除</button>
            </div>
            <p class="text-xs truncate" style="color: #999aaa">{{ card.content }}</p>
            <div v-if="card.tags?.length" class="flex gap-1 mt-1 flex-wrap">
              <span v-for="tag in card.tags" :key="tag" class="px-1.5 py-0.5 rounded text-xs" style="background: #f4f5f5; color: #555666">{{ tag }}</span>
            </div>
          </div>
          <div v-if="knowledgeCards.length === 0" class="text-center py-8 text-xs" style="color: #999aaa">暂无知识卡片</div>
        </div>
      </div>

      <!-- 新建卡片弹窗 -->
      <div v-if="showAddCard" class="absolute inset-0 flex items-center justify-center z-10" style="background: rgba(0,0,0,0.3)">
        <div class="rounded-xl p-4 w-64" style="background: #fff">
          <h4 class="text-sm font-bold mb-3" style="color: #222226">新建知识卡片</h4>
          <input v-model="newCard.title" placeholder="标题" class="w-full px-2 py-1.5 rounded text-sm mb-2" style="border: 1px solid #e8e8ed" />
          <textarea v-model="newCard.content" placeholder="内容" class="w-full px-2 py-1.5 rounded text-sm mb-2 h-24 resize-none" style="border: 1px solid #e8e8ed" />
          <input v-model="newCard.tagsStr" placeholder="标签（逗号分隔）" class="w-full px-2 py-1.5 rounded text-sm mb-3" style="border: 1px solid #e8e8ed" />
          <div class="flex gap-2 justify-end">
            <button @click="showAddCard = false" class="px-3 py-1 text-xs" style="color: #999aaa">取消</button>
            <button @click="addCard" class="px-3 py-1 rounded text-xs text-white" style="background: #FC5531">添加</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：对话区域 -->
    <div class="flex-1 flex flex-col rounded-xl overflow-hidden" style="background: #fff; border: 1px solid #e8e8ed">
      <!-- 顶部工具栏 -->
      <div class="px-4 py-3 flex items-center justify-between flex-shrink-0" style="border-bottom: 1px solid #e8e8ed">
        <div class="flex items-center gap-3">
          <h3 class="text-sm font-bold" style="color: #222226">AI 对话</h3>
          <span v-if="selectedKnowledge.length" class="px-2 py-0.5 rounded text-xs" style="background: #fff5f2; color: #FC5531">
            已选 {{ selectedKnowledge.length }} 个知识卡片
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button @click="showSidebar = !showSidebar" class="px-3 py-1 rounded text-xs" :style="showSidebar ? 'background: #fff5f2; color: #FC5531' : 'background: #f4f5f5; color: #555666'">
            侧栏
          </button>
          <button @click="showSettings = !showSettings" class="px-3 py-1 rounded text-xs" :style="showSettings ? 'background: #fff5f2; color: #FC5531' : 'background: #f4f5f5; color: #555666'">
            设置
          </button>
          <button @click="saveCurrentConversation" class="px-3 py-1 rounded text-xs" style="background: #f4f5f5; color: #555666">保存</button>
        </div>
      </div>

      <!-- 设置面板 -->
      <div v-if="showSettings" class="px-4 py-3 flex-shrink-0" style="background: #fafafa; border-bottom: 1px solid #e8e8ed">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs block mb-1" style="color: #555666">API Key</label>
            <input v-model="config.apiKey" type="password" placeholder="sk-..." class="w-full px-2 py-1.5 rounded text-xs" style="border: 1px solid #e8e8ed" />
          </div>
          <div>
            <label class="text-xs block mb-1" style="color: #555666">API Base URL</label>
            <input v-model="config.baseUrl" placeholder="https://api.deepseek.com" class="w-full px-2 py-1.5 rounded text-xs mb-1" style="border: 1px solid #e8e8ed" />
            <div class="flex gap-1 flex-wrap">
              <button @click="switchPlatform('siliconflow')" class="px-2 py-0.5 rounded text-xs" :style="config.baseUrl.includes('siliconflow') ? 'background:#fff5f2;color:#FC5531' : 'background:#f4f5f5;color:#555666'">硅基流动</button>
              <button @click="switchPlatform('deepseek')" class="px-2 py-0.5 rounded text-xs" :style="config.baseUrl.includes('deepseek') && !config.baseUrl.includes('siliconflow') ? 'background:#fff5f2;color:#FC5531' : 'background:#f4f5f5;color:#555666'">DeepSeek</button>
              <button @click="switchPlatform('openai')" class="px-2 py-0.5 rounded text-xs" :style="config.baseUrl.includes('openai') ? 'background:#fff5f2;color:#FC5531' : 'background:#f4f5f5;color:#555666'">OpenAI</button>
              <button @click="switchPlatform('qwen')" class="px-2 py-0.5 rounded text-xs" :style="config.baseUrl.includes('dashscope') ? 'background:#fff5f2;color:#FC5531' : 'background:#f4f5f5;color:#555666'">通义千问</button>
              <button @click="switchPlatform('glm')" class="px-2 py-0.5 rounded text-xs" :style="config.baseUrl.includes('bigmodel') ? 'background:#fff5f2;color:#FC5531' : 'background:#f4f5f5;color:#555666'">GLM</button>
            </div>
          </div>
          <div>
            <label class="text-xs block mb-1" style="color: #555666">模型</label>
            <select v-model="config.model" class="w-full px-2 py-1.5 rounded text-xs" style="border: 1px solid #e8e8ed">
              <optgroup label="DeepSeek">
                <option value="deepseek-v4-flash">DeepSeek V4 Flash</option>
                <option value="deepseek-v4-pro">DeepSeek V4 Pro</option>
                <option value="deepseek-chat">DeepSeek Chat (即将废弃)</option>
                <option value="deepseek-reasoner">DeepSeek Reasoner (即将废弃)</option>
              </optgroup>
              <optgroup label="硅基流动 SiliconFlow">
                <option value="Qwen/Qwen2.5-7B-Instruct">Qwen2.5-7B</option>
                <option value="Qwen/Qwen2.5-14B-Instruct">Qwen2.5-14B</option>
                <option value="Qwen/Qwen2.5-32B-Instruct">Qwen2.5-32B</option>
                <option value="Qwen/Qwen2.5-72B-Instruct">Qwen2.5-72B</option>
                <option value="Qwen/Qwen2.5-Coder-7B-Instruct">Qwen2.5-Coder-7B</option>
                <option value="Qwen/Qwen2.5-Coder-32B-Instruct">Qwen2.5-Coder-32B</option>
                <option value="deepseek-ai/DeepSeek-V3">DeepSeek-V3</option>
                <option value="deepseek-ai/DeepSeek-R1">DeepSeek-R1</option>
                <option value="deepseek-ai/DeepSeek-R1-Distill-Qwen-7B">DeepSeek-R1-Distill-7B</option>
                <option value="deepseek-ai/DeepSeek-R1-Distill-Qwen-32B">DeepSeek-R1-Distill-32B</option>
                <option value="THUDM/glm-4-9b-chat">GLM-4-9B</option>
                <option value="meta-llama/Meta-Llama-3.1-8B-Instruct">Llama-3.1-8B</option>
                <option value="meta-llama/Meta-Llama-3.1-70B-Instruct">Llama-3.1-70B</option>
              </optgroup>
              <optgroup label="OpenAI">
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </optgroup>
              <optgroup label="通义千问">
                <option value="qwen-turbo">Qwen Turbo</option>
                <option value="qwen-plus">Qwen Plus</option>
                <option value="qwen-max">Qwen Max</option>
              </optgroup>
              <optgroup label="智谱 GLM">
                <option value="glm-4-flash">GLM-4 Flash</option>
                <option value="glm-4">GLM-4</option>
                <option value="glm-4-plus">GLM-4 Plus</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label class="text-xs block mb-1" style="color: #555666">温度 ({{ config.temperature.toFixed(1) }})</label>
            <input v-model.number="config.temperature" type="range" min="0" max="2" step="0.1" class="w-full" />
          </div>
          <div>
            <label class="text-xs block mb-1" style="color: #555666">Top P ({{ config.topP.toFixed(1) }})</label>
            <input v-model.number="config.topP" type="range" min="0" max="1" step="0.1" class="w-full" />
          </div>
          <div>
            <label class="text-xs block mb-1" style="color: #555666">最大 Tokens</label>
            <input v-model.number="config.maxTokens" type="number" min="256" max="8192" step="256" class="w-full px-2 py-1.5 rounded text-xs" style="border: 1px solid #e8e8ed" />
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div ref="messageList" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="messages.length === 0" class="text-center py-16">
          <div class="text-4xl mb-4">🤖</div>
          <h3 class="text-base font-medium mb-2" style="color: #222226">AI 智能对话</h3>
          <p class="text-sm" style="color: #999aaa">输入问题开始对话，可选择知识库卡片作为参考</p>
        </div>

        <div v-for="(msg, idx) in messages" :key="idx" class="flex gap-3" :style="msg.role === 'user' ? 'flex-direction: row-reverse' : ''">
          <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
            :style="msg.role === 'user' ? 'background: #FC5531; color: white' : 'background: #f4f5f5; color: #555666'">
            {{ msg.role === 'user' ? '我' : 'AI' }}
          </div>
          <div class="max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap"
            :style="msg.role === 'user' ? 'background: #FC5531; color: white' : 'background: #f4f5f5; color: #222226'">
            {{ msg.content }}
          </div>
        </div>

        <div v-if="loading" class="flex gap-3">
          <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm" style="background: #f4f5f5; color: #555666">AI</div>
          <div class="rounded-xl px-4 py-3 text-sm" style="background: #f4f5f5; color: #999aaa">
            <span class="inline-flex gap-1">
              <span class="animate-bounce" style="animation-delay: 0ms">·</span>
              <span class="animate-bounce" style="animation-delay: 150ms">·</span>
              <span class="animate-bounce" style="animation-delay: 300ms">·</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="px-4 py-3 flex-shrink-0" style="border-top: 1px solid #e8e8ed">
        <div class="flex gap-2">
          <textarea v-model="inputText" @keydown.enter.exact="handleSend" placeholder="输入消息，Enter发送，Shift+Enter换行..."
            class="flex-1 px-3 py-2 rounded-lg text-sm resize-none h-10 focus:outline-none"
            style="border: 1px solid #e8e8ed; color: #222226" />
          <button @click="handleSend" :disabled="!inputText.trim() || loading"
            class="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50 flex-shrink-0"
            style="background: #FC5531">
            {{ loading ? '思考中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue'
import { post, get, del, put } from '@shared/api/client'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface KnowledgeCard {
  id: string
  title: string
  content: string
  tags: string[]
}

interface Conversation {
  id: string
  title: string
  model: string
  messages: string
  config: string
  knowledge: string
  createdAt: string
  updatedAt: string
}

const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const loading = ref(false)
const showSettings = ref(false)
const showSidebar = ref(true)
const sidebarTab = ref<'history' | 'knowledge'>('history')
const showAddCard = ref(false)
const messageList = ref<HTMLDivElement>()

const config = reactive({
  apiKey: localStorage.getItem('ai_api_key') || '',
  baseUrl: localStorage.getItem('ai_base_url') || 'https://api.siliconflow.cn/v1',
  model: localStorage.getItem('ai_model') || 'Qwen/Qwen2.5-7B-Instruct',
  temperature: parseFloat(localStorage.getItem('ai_temperature') || '0.7'),
  topP: parseFloat(localStorage.getItem('ai_top_p') || '1'),
  maxTokens: parseInt(localStorage.getItem('ai_max_tokens') || '2048'),
})

const knowledgeCards = ref<KnowledgeCard[]>([])
const selectedKnowledge = ref<string[]>([])
const conversations = ref<Conversation[]>([])
const currentConvId = ref('')

const newCard = reactive({
  title: '',
  content: '',
  tagsStr: '',
})

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function switchPlatform(platform: string) {
  const platformMap: Record<string, { url: string; model: string }> = {
    siliconflow: { url: 'https://api.siliconflow.cn/v1', model: 'Qwen/Qwen2.5-7B-Instruct' },
    deepseek: { url: 'https://api.deepseek.com', model: 'deepseek-v4-flash' },
    openai: { url: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
    qwen: { url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-turbo' },
    glm: { url: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  }
  const p = platformMap[platform]
  if (p) {
    config.baseUrl = p.url
    config.model = p.model
  }
}

function saveConfig() {
  localStorage.setItem('ai_api_key', config.apiKey)
  localStorage.setItem('ai_base_url', config.baseUrl)
  localStorage.setItem('ai_model', config.model)
  localStorage.setItem('ai_temperature', String(config.temperature))
  localStorage.setItem('ai_top_p', String(config.topP))
  localStorage.setItem('ai_max_tokens', String(config.maxTokens))
}

async function handleSend(e?: KeyboardEvent) {
  if (e?.shiftKey) return
  e?.preventDefault()

  const text = inputText.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  loading.value = true

  saveConfig()

  await nextTick()
  scrollToBottom()

  try {
    const res = await post<{ message: string; usage?: any }>('/ai/chat', {
      messages: messages.value,
      config: {
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        model: config.model,
        temperature: config.temperature,
        topP: config.topP,
        maxTokens: config.maxTokens,
      },
      knowledgeIds: selectedKnowledge.value,
    })

    if (res.code === 200 && res.data) {
      messages.value.push({
        role: 'assistant',
        content: (res.data as any).message,
      })
      // 自动保存
      autoSaveConversation()
    } else {
      messages.value.push({
        role: 'assistant',
        content: `错误: ${(res as any).message || '请求失败'}`,
      })
    }
  } catch (err: any) {
    messages.value.push({
      role: 'assistant',
      content: `请求失败: ${err.response?.data?.message || err.message || '网络错误'}`,
    })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
}

// ---- 对话历史 ----

async function fetchConversations() {
  try {
    const res = await get<Conversation[]>('/ai/conversations')
    if (res.code === 200 && res.data) conversations.value = res.data as any
  } catch {}
}

function newConversation() {
  // 先保存当前对话
  if (messages.value.length > 0) {
    saveCurrentConversation()
  }
  messages.value = []
  currentConvId.value = ''
}

async function loadConversation(conv: Conversation) {
  currentConvId.value = conv.id
  try {
    const parsed = JSON.parse(conv.messages)
    messages.value = Array.isArray(parsed) ? parsed : []
    const savedConfig = JSON.parse(conv.config || '{}')
    if (savedConfig.baseUrl) config.baseUrl = savedConfig.baseUrl
    if (savedConfig.model) config.model = savedConfig.model
    const savedKnowledge = JSON.parse(conv.knowledge || '[]')
    selectedKnowledge.value = Array.isArray(savedKnowledge) ? savedKnowledge : []
  } catch {
    messages.value = []
  }
}

async function saveCurrentConversation() {
  if (messages.value.length === 0) return

  const title = messages.value[0]?.content?.slice(0, 30) || '新对话'
  const convData = {
    title,
    model: config.model,
    messages: messages.value,
    config: { baseUrl: config.baseUrl, model: config.model },
    knowledge: selectedKnowledge.value,
  }

  try {
    if (currentConvId.value) {
      await put(`/ai/conversations/${currentConvId.value}`, convData)
    } else {
      const res = await post<Conversation>('/ai/conversations', convData)
      if (res.code === 200 && res.data) {
        currentConvId.value = (res.data as any).id
      }
    }
    await fetchConversations()
  } catch {}
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
function autoSaveConversation() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveCurrentConversation(), 2000)
}

async function deleteConversation(id: string) {
  try {
    await del(`/ai/conversations/${id}`)
    if (currentConvId.value === id) {
      currentConvId.value = ''
      messages.value = []
    }
    await fetchConversations()
  } catch {}
}

// ---- 知识库 ----

async function fetchKnowledge() {
  try {
    const res = await get<KnowledgeCard[]>('/ai/knowledge')
    if (res.code === 200 && res.data) knowledgeCards.value = res.data as any
  } catch {}
}

function toggleKnowledge(id: string) {
  const idx = selectedKnowledge.value.indexOf(id)
  if (idx === -1) selectedKnowledge.value.push(id)
  else selectedKnowledge.value.splice(idx, 1)
}

async function addCard() {
  if (!newCard.title || !newCard.content) return
  try {
    const tags = newCard.tagsStr ? newCard.tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []
    await post('/ai/knowledge', { title: newCard.title, content: newCard.content, tags })
    newCard.title = ''
    newCard.content = ''
    newCard.tagsStr = ''
    showAddCard.value = false
    await fetchKnowledge()
  } catch {}
}

async function deleteCard(id: string) {
  try {
    await del(`/ai/knowledge/${id}`)
    selectedKnowledge.value = selectedKnowledge.value.filter(k => k !== id)
    await fetchKnowledge()
  } catch {}
}

onMounted(() => {
  fetchKnowledge()
  fetchConversations()
})
</script>
