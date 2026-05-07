<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-display font-bold text-foreground mb-2">资料库</h1>
        <p class="text-muted-foreground">技术文档与学习资料</p>
      </div>
      <div class="flex gap-3">
        <button @click="showCrawl = true" class="btn-secondary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4 3-9s-1.343-9-3-9a9 9 0 00-9 9"/>
          </svg>
          在线获取
        </button>
        <button @click="showUpload = true" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          导入文档
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-2">
      <button
        v-for="f in filters"
        :key="f.key"
        @click="currentFilter = f.key"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        :class="currentFilter === f.key
          ? 'bg-accent text-accent-foreground shadow-md shadow-accent/20'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted'"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Novel Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      <div
        v-for="novel in filteredNovels"
        :key="novel.id"
        class="bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-xl hover:-translate-y-1 relative"
        @click="$router.push(`/novel/${novel.id}`)"
      >
        <!-- Cover -->
        <div class="aspect-[3/4] flex items-center justify-center relative overflow-hidden"
          style="background: linear-gradient(135deg, rgba(0,82,255,0.05), rgba(77,124,255,0.12))">
          <svg class="w-10 h-10 text-accent/30 group-hover:text-accent/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          <!-- Favorite -->
          <button @click.stop="toggleFavorite(novel)"
            class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
            :class="(novel as any).isFavorite ? 'bg-accent/10 text-accent' : 'bg-white/80 text-muted-foreground/40 hover:text-accent'">
            <svg class="w-4 h-4" fill="(novel as any).isFavorite ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </button>
          <!-- Menu -->
          <button @click.stop="toggleMenu(novel.id)"
            class="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-muted-foreground/60 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-foreground transition-all duration-200">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
          <!-- Dropdown -->
          <div v-if="openMenuId === novel.id"
            class="absolute top-12 left-3 z-30 bg-card rounded-xl border border-border shadow-lg py-1 min-w-[120px] animate-in fade-in slide-in-from-top-2 duration-150">
            <button @click="startRename(novel); openMenuId = ''" class="w-full px-4 py-2 text-sm text-left text-foreground hover:bg-muted transition-colors">重命名</button>
            <button @click="handleDelete(novel.id); openMenuId = ''" class="w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-red-50 transition-colors">删除</button>
          </div>
        </div>
        <!-- Info -->
        <div class="p-4">
          <h3 class="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">{{ novel.title }}</h3>
          <p class="text-xs text-muted-foreground mt-1">{{ novel.author }}</p>
          <div class="flex items-center gap-2 mt-3">
            <span class="text-xs px-2 py-0.5 rounded-lg font-medium"
              :class="novel.source === 'crawl' ? 'bg-accent/10 text-accent' : 'bg-emerald-50 text-emerald-600'">
              {{ novel.source === 'crawl' ? '在线' : '本地' }}
            </span>
            <span class="text-xs text-muted-foreground">{{ (novel as any)._count?.chapters || 0 }}节</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredNovels.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
      </div>
      <p class="text-muted-foreground">{{ currentFilter === 'favorite' ? '还没有收藏的资料' : '还没有资料，导入或在线获取吧' }}</p>
    </div>

    <!-- Upload Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showUpload" class="fixed inset-0 flex items-center justify-center z-50" @click.self="showUpload = false">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="relative card-elevated w-full max-w-md p-6">
            <h2 class="text-xl font-display font-bold text-foreground mb-6">导入技术文档</h2>
            <input type="file" accept=".txt" @change="handleFileSelect" class="w-full mb-6 text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-accent/10 file:text-accent file:font-medium hover:file:bg-accent/20 file:transition-colors file:cursor-pointer" />
            <div class="flex gap-3 justify-end">
              <button @click="showUpload = false" class="btn-secondary">取消</button>
              <button @click="handleUpload" :disabled="!selectedFile" class="btn-primary disabled:opacity-50 disabled:pointer-events-none">导入</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Crawl Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCrawl" class="fixed inset-0 flex items-center justify-center z-50" @click.self="!crawlLoading && (showCrawl = false)">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="relative card-elevated w-full max-w-lg p-6">
            <h2 class="text-xl font-display font-bold text-foreground mb-6">在线获取小说</h2>

            <!-- Search -->
            <div class="flex gap-3 mb-4">
              <input v-model="searchKeyword" type="text" placeholder="搜索小说（笔趣阁）" :disabled="searchLoading" class="input flex-1" @keyup.enter="handleSearch" />
              <button @click="handleSearch" :disabled="!searchKeyword || searchLoading" class="btn-primary disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                {{ searchLoading ? '搜索中...' : '搜索' }}
              </button>
            </div>

            <!-- Search Results -->
            <div v-if="searchResults.length > 0" class="mb-4 max-h-48 overflow-y-auto rounded-xl border border-border">
              <div v-for="(item, idx) in searchResults" :key="idx" @click="selectSearchResult(item)"
                class="px-4 py-3 cursor-pointer transition-colors hover:bg-accent/5"
                :class="idx < searchResults.length - 1 ? 'border-b border-border' : ''">
                <div class="font-medium text-sm text-foreground">{{ item.title }}</div>
                <div class="text-xs text-muted-foreground">{{ item.author }}</div>
              </div>
            </div>

            <!-- Default Source Hint -->
            <div class="mb-4 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-medium">
              默认源：藏海花小说网(m.zanghalhuatxt.cc) - 支持在线爬取
            </div>

            <input v-model="crawlUrl" type="url" placeholder="输入小说目录页URL" :disabled="crawlLoading" class="input mb-4" />
            <input v-model="crawlTitle" type="text" placeholder="标题（可选，留空自动识别）" :disabled="crawlLoading" class="input mb-4" />

            <div class="flex items-center gap-3 mb-4">
              <label class="text-sm text-muted-foreground whitespace-nowrap">最大章数</label>
              <input v-model.number="crawlMaxChapters" type="number" min="1" max="500" :disabled="crawlLoading" class="input w-24" />
            </div>

            <div v-if="crawlLoading" class="flex items-center gap-3 mb-4 py-2">
              <div class="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              <span class="text-sm text-muted-foreground">正在获取，请耐心等待...</span>
            </div>
            <div v-if="crawlError" class="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-500 text-sm">{{ crawlError }}</div>
            <div v-if="crawlSuccess" class="mb-4 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-600 text-sm">{{ crawlSuccess }}</div>

            <div class="flex gap-3 justify-end">
              <button @click="showCrawl = false; crawlError = ''; crawlSuccess = ''; searchResults = []" :disabled="crawlLoading" class="btn-secondary disabled:opacity-50">取消</button>
              <button @click="handleCrawl" :disabled="!crawlUrl || crawlLoading" class="btn-primary disabled:opacity-50 disabled:pointer-events-none">{{ crawlLoading ? '获取中...' : '获取' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Rename Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showRename" class="fixed inset-0 flex items-center justify-center z-50" @click.self="showRename = false">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="relative card-elevated w-full max-w-md p-6">
            <h2 class="text-xl font-display font-bold text-foreground mb-6">重命名</h2>
            <input v-model="renameTitle" type="text" class="input mb-4" />
            <div class="flex gap-3 justify-end">
              <button @click="showRename = false" class="btn-secondary">取消</button>
              <button @click="handleRename" :disabled="!renameTitle.trim()" class="btn-primary disabled:opacity-50 disabled:pointer-events-none">确定</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteConfirm" class="fixed inset-0 flex items-center justify-center z-50">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteConfirm = false; deleteTargetId = ''"></div>
          <div class="relative card-elevated w-full max-w-sm p-6">
            <h2 class="text-xl font-display font-bold text-foreground mb-2">确认删除</h2>
            <p class="text-sm text-muted-foreground mb-6">删除后无法恢复，确定要删除吗？</p>
            <div class="flex gap-3 justify-end">
              <button @click="showDeleteConfirm = false; deleteTargetId = ''" class="btn-secondary">取消</button>
              <button @click="confirmDelete" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-all duration-200">删除</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Click outside to close menu -->
    <div v-if="openMenuId" class="fixed inset-0 z-20" @click="openMenuId = ''"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { get, upload, post, patch, del } from '@shared/api/client'
import type { Novel } from '@shared/types'

const novels = ref<Novel[]>([])
const showUpload = ref(false)
const showCrawl = ref(false)
const showRename = ref(false)
const showDeleteConfirm = ref(false)
const selectedFile = ref<File | null>(null)
const crawlUrl = ref('')
const crawlTitle = ref('')
const crawlMaxChapters = ref(100)
const crawlLoading = ref(false)
const crawlError = ref('')
const crawlSuccess = ref('')
const renameId = ref('')
const renameTitle = ref('')
const deleteTargetId = ref('')
const openMenuId = ref('')
const currentFilter = ref<'all' | 'favorite' | 'local' | 'online'>('all')

const searchKeyword = ref('')
const searchLoading = ref(false)
const searchResults = ref<Array<{ title: string; author: string; url: string }>>([])
const defaultSite = 'https://m.zanghalhuatxt.cc'

const filters = [
  { key: 'all' as const, label: '全部' },
  { key: 'favorite' as const, label: '收藏' },
  { key: 'local' as const, label: '本地' },
  { key: 'online' as const, label: '在线' },
]

const filteredNovels = computed(() => {
  let list = novels.value
  if (currentFilter.value === 'favorite') list = list.filter(n => (n as any).isFavorite)
  if (currentFilter.value === 'local') list = list.filter(n => n.source !== 'crawl')
  if (currentFilter.value === 'online') list = list.filter(n => n.source === 'crawl')
  return list
})

async function fetchNovels() {
  const res = await get<{ items: Novel[]; total: number }>('/novels')
  if (res.code === 200 && res.data) {
    novels.value = res.data.items
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
}

async function handleUpload() {
  if (!selectedFile.value) return
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  const res = await upload<Novel>('/novels/upload', formData)
  if (res.code === 200) {
    showUpload.value = false
    selectedFile.value = null
    await fetchNovels()
  }
}

async function handleSearch() {
  if (!searchKeyword.value) return
  searchLoading.value = true
  try {
    const res = await get<Array<{ title: string; author: string; url: string }>>(`/novels/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
    if (res.code === 200 && res.data) {
      searchResults.value = res.data as any
    }
  } catch (err: any) {
    crawlError.value = '搜索失败'
  } finally {
    searchLoading.value = false
  }
}

function selectSearchResult(item: { title: string; author: string; url: string }) {
  crawlUrl.value = item.url
  crawlTitle.value = item.title
  searchResults.value = []
  searchKeyword.value = ''
}

async function handleCrawl() {
  if (!crawlUrl.value) return
  crawlLoading.value = true
  crawlError.value = ''
  crawlSuccess.value = ''
  try {
    const body: any = { url: crawlUrl.value, maxChapters: crawlMaxChapters.value }
    if (crawlTitle.value) body.title = crawlTitle.value
    const res = await post<Novel>('/novels/crawl', body, { timeout: 300000 })
    if (res.code === 200) {
      const chCount = (res.data as any)?._count?.chapters || 0
      crawlSuccess.value = `获取成功！共 ${chCount} 章`
      await fetchNovels()
      setTimeout(() => {
        showCrawl.value = false
        crawlUrl.value = ''
        crawlTitle.value = ''
        crawlSuccess.value = ''
        crawlError.value = ''
      }, 3000)
    } else {
      crawlError.value = res.message || '获取失败'
    }
  } catch (err: any) {
    if (err.code === 'ECONNABORTED') {
      crawlError.value = '请求超时，请尝试减少最大章数或检查网络'
    } else {
      crawlError.value = err.response?.data?.message || err.message || '网络错误'
    }
  } finally {
    crawlLoading.value = false
  }
}

async function toggleFavorite(novel: Novel) {
  const newVal = !(novel as any).isFavorite
  const res = await patch(`/novels/${novel.id}`, { isFavorite: newVal })
  if (res.code === 200) await fetchNovels()
}

function toggleMenu(id: string) {
  openMenuId.value = openMenuId.value === id ? '' : id
}

function startRename(novel: Novel) {
  renameId.value = novel.id
  renameTitle.value = novel.title
  showRename.value = true
}

async function handleRename() {
  if (!renameTitle.value.trim()) return
  const res = await patch(`/novels/${renameId.value}`, { title: renameTitle.value.trim() })
  if (res.code === 200) {
    showRename.value = false
    await fetchNovels()
  }
}

function handleDelete(id: string) {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deleteTargetId.value) return
  await del(`/novels/${deleteTargetId.value}`)
  showDeleteConfirm.value = false
  deleteTargetId.value = ''
  await fetchNovels()
}

onMounted(fetchNovels)
</script>

<style scoped>
.modal-enter-active { transition: all 200ms ease-out; }
.modal-leave-active { transition: all 150ms ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > :last-child, .modal-leave-to > :last-child { transform: scale(0.95) translateY(10px); }
</style>
