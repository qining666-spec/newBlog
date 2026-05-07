<template>
  <div class="flex gap-6 h-[calc(100vh-10rem)]">
    <!-- Sidebar -->
    <div v-if="showSidebar" class="w-72 flex-shrink-0 space-y-4">
      <!-- Tab Switch -->
      <div class="flex bg-muted rounded-xl p-1">
        <button @click="sidebarTab = 'history'" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all" :class="sidebarTab === 'history' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'">对话历史</button>
        <button @click="sidebarTab = 'knowledge'" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all" :class="sidebarTab === 'knowledge' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'">知识库</button>
      </div>

      <!-- History Panel -->
      <div v-if="sidebarTab === 'history'" class="space-y-2">
        <button @click="newConversation" class="btn-primary w-full !py-2 text-sm">+ 新对话</button>
        <div class="space-y-1 max-h-[60vh] overflow-y-auto">
          <div v-for="conv in conversations" :key="conv.id"
            class="p-3 rounded-xl cursor-pointer group transition-all"
            :class="currentConvId === conv.id ? 'bg-accent/10 border border-accent/20' : 'hover:bg-muted'"
            @click="loadConversation(conv)">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium truncate text-foreground">{{ conv.title }}</span>
              <button @click.stop="deleteConversation(conv.id)" class="text-xs opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500">删</button>
            </div>
            <div class="text-xs text-muted-foreground mt-1">{{ conv.model }} · {{ formatTime(conv.updatedAt) }}</div>
          </div>
          <div v-if="conversations.length === 0" class="text-center py-8 text-sm text-muted-foreground">暂无对话历史</div>
        </div>
      </div>

      <!-- Knowledge Panel -->
      <div v-if="sidebarTab === 'knowledge'" class="space-y-2">
        <button @click="showAddCard = true" class="btn-primary w-full !py-2 text-sm">+ 新建卡片</button>
        <div class="space-y-2 max-h-[60vh] overflow-y-auto">
          <div v-for="card in knowledgeCards" :key="card.id"
            class="p-3 rounded-xl cursor-pointer transition-all group"
            :class="selectedKnowledge.includes(card.id) ? 'bg-accent/10 border border-accent/30' : 'bg-card border border-border hover:shadow-md'"
            @click="toggleKnowledge(card.id)">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-foreground">{{ card.title }}</span>
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click.stop="editCard(card)" class="text-xs text-muted-foreground hover:text-accent">编辑</button>
                <button @click.stop="deleteCard(card.id)" class="text-xs text-muted-foreground hover:text-red-500">删除</button>
              </div>
            </div>
            <p class="text-xs text-muted-foreground line-clamp-2">{{ card.content }}</p>
            <div v-if="card.tags?.length" class="flex gap-1 mt-2 flex-wrap">
              <span v-for="tag in card.tags" :key="tag" class="px-2 py-0.5 rounded-lg text-xs bg-muted text-muted-foreground">{{ tag }}</span>
            </div>
          </div>
          <div v-if="knowledgeCards.length === 0" class="text-center py-8 text-sm text-muted-foreground">暂无知识卡片</div>
        </div>
      </div>

      <!-- Add/Edit Card Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showAddCard" class="fixed inset-0 flex items-center justify-center z-50" @click.self="showAddCard = false">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div class="relative card-elevated w-[480px] max-w-[90vw] p-6">
              <h4 class="text-xl font-display font-semibold text-foreground mb-2">{{ editingCard ? '编辑知识卡片' : '新建知识卡片' }}</h4>
              <p class="text-xs text-muted-foreground mb-5">知识卡片将作为AI对话的上下文参考，帮助AI更好地理解你的问题</p>

              <label class="text-xs font-medium text-muted-foreground block mb-1.5">标题</label>
              <input v-model="newCard.title" placeholder="例如：Vue3响应式原理" class="input mb-4" />

              <label class="text-xs font-medium text-muted-foreground block mb-1.5">内容</label>
              <textarea v-model="newCard.content" placeholder="输入详细的知识内容、笔记、代码片段或参考资料...&#10;&#10;支持多行文本，可以是技术文档、API说明、代码示例等。" class="input mb-4 h-40 resize-y" />

              <label class="text-xs font-medium text-muted-foreground block mb-1.5">标签（可选）</label>
              <input v-model="newCard.tagsStr" placeholder="Vue, 前端, 响应式（逗号分隔）" class="input mb-5" />

              <div class="flex gap-3 justify-end">
                <button @click="cancelCardEdit" class="btn-secondary">取消</button>
                <button @click="saveCard" :disabled="!newCard.title || !newCard.content" class="btn-primary disabled:opacity-50 disabled:pointer-events-none">{{ editingCard ? '保存修改' : '添加卡片' }}</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Chat Area -->
    <div class="flex-1 flex flex-col card-elevated overflow-hidden">
      <!-- Top Bar -->
      <div class="px-6 py-4 flex items-center justify-between border-b border-border">
        <div class="flex items-center gap-3">
          <h3 class="font-display font-semibold text-foreground">AI 对话</h3>
          <span v-if="selectedKnowledge.length" class="px-2 py-1 rounded-lg text-xs font-medium bg-accent/10 text-accent">
            已选 {{ selectedKnowledge.length }} 个知识卡片
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button @click="showSidebar = !showSidebar" class="btn-secondary !px-3 !py-1.5 text-xs" :class="showSidebar ? '!bg-accent/10 !text-accent !border-accent/20' : ''">侧栏</button>
          <button @click="showSettings = !showSettings" class="btn-secondary !px-3 !py-1.5 text-xs" :class="showSettings ? '!bg-accent/10 !text-accent !border-accent/20' : ''">设置</button>
          <button @click="saveCurrentConversation" class="btn-secondary !px-3 !py-1.5 text-xs">保存</button>
        </div>
      </div>

      <!-- Settings Panel -->
      <div v-if="showSettings" class="px-6 py-4 bg-muted/50 border-b border-border">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-medium text-muted-foreground block mb-1.5">API Key</label>
            <input v-model="config.apiKey" type="password" placeholder="sk-..." class="input" />
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground block mb-1.5">API Base URL</label>
            <input v-model="config.baseUrl" placeholder="https://api.deepseek.com" class="input mb-2" />
            <div class="flex gap-1 flex-wrap">
              <button @click="switchPlatform('siliconflow')" class="px-2 py-1 rounded-lg text-xs transition-all" :class="config.baseUrl.includes('siliconflow') ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'">硅基流动</button>
              <button @click="switchPlatform('deepseek')" class="px-2 py-1 rounded-lg text-xs transition-all" :class="config.baseUrl.includes('deepseek') && !config.baseUrl.includes('siliconflow') ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'">DeepSeek</button>
              <button @click="switchPlatform('openai')" class="px-2 py-1 rounded-lg text-xs transition-all" :class="config.baseUrl.includes('openai') ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'">OpenAI</button>
              <button @click="switchPlatform('qwen')" class="px-2 py-1 rounded-lg text-xs transition-all" :class="config.baseUrl.includes('dashscope') ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'">通义千问</button>
              <button @click="switchPlatform('glm')" class="px-2 py-1 rounded-lg text-xs transition-all" :class="config.baseUrl.includes('bigmodel') ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'">GLM</button>
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground block mb-1.5">模型</label>
            <select v-model="config.model" class="input">
              <optgroup label="DeepSeek"><option value="deepseek-v4-flash">DeepSeek V4 Flash</option><option value="deepseek-v4-pro">DeepSeek V4 Pro</option><option value="deepseek-chat">DeepSeek Chat</option><option value="deepseek-reasoner">DeepSeek Reasoner</option></optgroup>
              <optgroup label="硅基流动"><option value="Qwen/Qwen2.5-7B-Instruct">Qwen2.5-7B</option><option value="Qwen/Qwen2.5-14B-Instruct">Qwen2.5-14B</option><option value="Qwen/Qwen2.5-32B-Instruct">Qwen2.5-32B</option><option value="Qwen/Qwen2.5-72B-Instruct">Qwen2.5-72B</option><option value="deepseek-ai/DeepSeek-V3">DeepSeek-V3</option><option value="deepseek-ai/DeepSeek-R1">DeepSeek-R1</option></optgroup>
              <optgroup label="OpenAI"><option value="gpt-4o-mini">GPT-4o Mini</option><option value="gpt-4o">GPT-4o</option></optgroup>
              <optgroup label="通义千问"><option value="qwen-turbo">Qwen Turbo</option><option value="qwen-plus">Qwen Plus</option><option value="qwen-max">Qwen Max</option></optgroup>
              <optgroup label="智谱 GLM"><option value="glm-4-flash">GLM-4 Flash</option><option value="glm-4">GLM-4</option><option value="glm-4-plus">GLM-4 Plus</option></optgroup>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground block mb-1.5">温度 ({{ config.temperature.toFixed(1) }})</label>
            <input v-model.number="config.temperature" type="range" min="0" max="2" step="0.1" class="w-full accent-accent" />
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground block mb-1.5">Top P ({{ config.topP.toFixed(1) }})</label>
            <input v-model.number="config.topP" type="range" min="0" max="1" step="0.1" class="w-full accent-accent" />
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground block mb-1.5">最大 Tokens</label>
            <input v-model.number="config.maxTokens" type="number" min="256" max="8192" step="256" class="input" />
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div ref="messageList" class="flex-1 overflow-y-auto p-6 space-y-6">
        <div v-if="messages.length === 0" class="text-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">🤖</span>
          </div>
          <h3 class="text-xl font-display font-semibold text-foreground mb-2">AI 智能对话</h3>
          <p class="text-sm text-muted-foreground">输入问题开始对话，可选择知识库卡片作为参考</p>
        </div>

        <div v-for="(msg, idx) in messages" :key="idx" class="flex gap-4" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
          <div class="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-medium"
            :class="msg.role === 'user' ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'">
            {{ msg.role === 'user' ? '我' : 'AI' }}
          </div>
          <div class="max-w-[75%] rounded-2xl px-5 py-3 text-sm whitespace-pre-wrap"
            :class="msg.role === 'user' ? 'bg-accent text-white' : 'bg-muted text-foreground'">
            {{ msg.content }}
          </div>
        </div>

        <div v-if="loading" class="flex gap-4">
          <div class="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sm text-muted-foreground">AI</div>
          <div class="rounded-2xl px-5 py-3 bg-muted text-muted-foreground text-sm">
            <span class="inline-flex gap-1">
              <span class="animate-bounce" style="animation-delay: 0ms">·</span>
              <span class="animate-bounce" style="animation-delay: 150ms">·</span>
              <span class="animate-bounce" style="animation-delay: 300ms">·</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="px-6 py-4 border-t border-border">
        <div class="flex gap-3">
          <textarea v-model="inputText" @keydown.enter.exact="handleSend" placeholder="输入消息，Enter发送，Shift+Enter换行..."
            class="input flex-1 h-12 resize-none" />
          <button @click="handleSend" :disabled="!inputText.trim() || loading" class="btn-primary !px-6 flex-shrink-0 disabled:opacity-50">
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
import { encryptSync, decryptSync } from '@shared/utils/crypto'

interface ChatMessage { role: 'user' | 'assistant'; content: string }
interface KnowledgeCard { id: string; title: string; content: string; tags: string[] }
interface Conversation { id: string; title: string; model: string; messages: string; config: string; knowledge: string; createdAt: string; updatedAt: string }

const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const loading = ref(false)
const showSettings = ref(false)
const showSidebar = ref(true)
const sidebarTab = ref<'history' | 'knowledge'>('history')
const showAddCard = ref(false)
const messageList = ref<HTMLDivElement>()

const config = reactive({
  apiKey: decryptSync(localStorage.getItem('ai_api_key') || ''),
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
const editingCard = ref<KnowledgeCard | null>(null)

const newCard = reactive({ title: '', content: '', tagsStr: '' })

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
  if (p) { config.baseUrl = p.url; config.model = p.model }
}

function saveConfig() {
  localStorage.setItem('ai_api_key', encryptSync(config.apiKey))
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
  await nextTick(); scrollToBottom()
  try {
    const res = await post<{ message: string; usage?: any }>('/ai/chat', {
      messages: messages.value,
      config: { apiKey: config.apiKey, baseUrl: config.baseUrl, model: config.model, temperature: config.temperature, topP: config.topP, maxTokens: config.maxTokens },
      knowledgeIds: selectedKnowledge.value,
    })
    if (res.code === 200 && res.data) {
      messages.value.push({ role: 'assistant', content: (res.data as any).message })
      autoSaveConversation()
    } else {
      messages.value.push({ role: 'assistant', content: `错误: ${(res as any).message || '请求失败'}` })
    }
  } catch (err: any) {
    messages.value.push({ role: 'assistant', content: `请求失败: ${err.response?.data?.message || err.message || '网络错误'}` })
  } finally { loading.value = false; await nextTick(); scrollToBottom() }
}

function scrollToBottom() { if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight }

async function fetchConversations() { try { const res = await get<Conversation[]>('/ai/conversations'); if (res.code === 200 && res.data) conversations.value = res.data as any } catch {} }
function newConversation() { if (messages.value.length > 0) saveCurrentConversation(); messages.value = []; currentConvId.value = '' }
async function loadConversation(conv: Conversation) { currentConvId.value = conv.id; try { const parsed = JSON.parse(conv.messages); messages.value = Array.isArray(parsed) ? parsed : []; const savedConfig = JSON.parse(conv.config || '{}'); if (savedConfig.baseUrl) config.baseUrl = savedConfig.baseUrl; if (savedConfig.model) config.model = savedConfig.model; const savedKnowledge = JSON.parse(conv.knowledge || '[]'); selectedKnowledge.value = Array.isArray(savedKnowledge) ? savedKnowledge : [] } catch { messages.value = [] } }
async function saveCurrentConversation() { if (messages.value.length === 0) return; const title = messages.value[0]?.content?.slice(0, 30) || '新对话'; const convData = { title, model: config.model, messages: messages.value, config: { baseUrl: config.baseUrl, model: config.model }, knowledge: selectedKnowledge.value }; try { if (currentConvId.value) { await put(`/ai/conversations/${currentConvId.value}`, convData) } else { const res = await post<Conversation>('/ai/conversations', convData); if (res.code === 200 && res.data) currentConvId.value = (res.data as any).id } await fetchConversations() } catch {} }
let saveTimer: ReturnType<typeof setTimeout> | null = null
function autoSaveConversation() { if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(() => saveCurrentConversation(), 2000) }
async function deleteConversation(id: string) { try { await del(`/ai/conversations/${id}`); if (currentConvId.value === id) { currentConvId.value = ''; messages.value = [] } await fetchConversations() } catch {} }
async function fetchKnowledge() { try { const res = await get<KnowledgeCard[]>('/ai/knowledge'); if (res.code === 200 && res.data) knowledgeCards.value = res.data as any } catch {} }
function toggleKnowledge(id: string) { const idx = selectedKnowledge.value.indexOf(id); if (idx === -1) selectedKnowledge.value.push(id); else selectedKnowledge.value.splice(idx, 1) }
function editCard(card: KnowledgeCard) {
  editingCard.value = card
  newCard.title = card.title
  newCard.content = card.content
  newCard.tagsStr = card.tags?.join(', ') || ''
  showAddCard.value = true
}
function cancelCardEdit() {
  showAddCard.value = false
  editingCard.value = null
  newCard.title = ''
  newCard.content = ''
  newCard.tagsStr = ''
}
async function saveCard() {
  if (!newCard.title || !newCard.content) return
  try {
    const tags = newCard.tagsStr ? newCard.tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []
    if (editingCard.value) {
      await put(`/ai/knowledge/${editingCard.value.id}`, { title: newCard.title, content: newCard.content, tags })
    } else {
      await post('/ai/knowledge', { title: newCard.title, content: newCard.content, tags })
    }
    cancelCardEdit()
    await fetchKnowledge()
  } catch {}
}
async function addCard() { if (!newCard.title || !newCard.content) return; try { const tags = newCard.tagsStr ? newCard.tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []; await post('/ai/knowledge', { title: newCard.title, content: newCard.content, tags }); newCard.title = ''; newCard.content = ''; newCard.tagsStr = ''; showAddCard.value = false; await fetchKnowledge() } catch {} }
async function deleteCard(id: string) { try { await del(`/ai/knowledge/${id}`); selectedKnowledge.value = selectedKnowledge.value.filter(k => k !== id); await fetchKnowledge() } catch {} }
onMounted(() => { fetchKnowledge(); fetchConversations() })
</script>

<style scoped>
.modal-enter-active { transition: all 200ms ease-out; }
.modal-leave-active { transition: all 150ms ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > :last-child, .modal-leave-to > :last-child { transform: scale(0.95) translateY(10px); }
</style>
