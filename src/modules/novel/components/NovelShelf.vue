<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold" style="color: #222226">技术资料库</h1>
      <div class="flex gap-3">
        <button @click="showUpload = true" class="px-4 py-2 rounded-lg text-sm text-white transition-colors" style="background: #FC5531" onmouseenter="this.style.background='#E04B28'" onmouseleave="this.style.background='#FC5531'">导入文档</button>
        <button @click="showCrawl = true" class="px-4 py-2 rounded-lg text-sm transition-colors" style="border: 1px solid #e8e8ed; color: #555666" onmouseenter="this.style.borderColor='#FC5531';this.style.color='#FC5531'" onmouseleave="this.style.borderColor='#e8e8ed';this.style.color='#555666'">在线获取</button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="flex items-center gap-3 mb-4">
      <button v-for="f in filters" :key="f.key" @click="currentFilter = f.key"
        class="px-3 py-1 rounded-full text-xs transition-all duration-150"
        :style="currentFilter === f.key ? 'background: #FC5531; color: white' : 'background: #f4f5f5; color: #555666'">
        {{ f.label }}
      </button>
    </div>

    <!-- 资料列表 -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div v-for="novel in filteredNovels" :key="novel.id"
        class="rounded-lg overflow-hidden transition-all duration-150 relative group"
        style="background: #fff; border: 1px solid #e8e8ed"
        onmouseenter="this.style.borderColor='#FC5531';this.style.boxShadow='0 2px 8px rgba(252,85,49,0.1)'"
        onmouseleave="this.style.borderColor='#e8e8ed';this.style.boxShadow='none'">
        <!-- 封面区 -->
        <div class="aspect-[3/4] flex items-center justify-center cursor-pointer relative" style="background: linear-gradient(135deg, #fff5f2, #fde8e0)" @click="$router.push(`/novel/${novel.id}`)">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FC5531" stroke-width="1.5" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          <!-- 收藏按钮 -->
          <button @click.stop="toggleFavorite(novel)" class="absolute top-2 right-2 text-lg" :style="(novel as any).isFavorite ? 'color: #FC5531' : 'color: #ccc'" onmouseenter="this.style.transform='scale(1.2)'" onmouseleave="this.style.transform='scale(1)'">
            {{ (novel as any).isFavorite ? '★' : '☆' }}
          </button>
          <!-- 操作菜单按钮 -->
          <button @click.stop="toggleMenu(novel.id)" class="absolute top-2 left-2 w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity" style="background: rgba(0,0,0,0.5); color: white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>
          <!-- 操作菜单 -->
          <div v-if="openMenuId === novel.id" class="absolute top-8 left-2 z-30 rounded-lg shadow-lg py-1" style="background: #fff; border: 1px solid #e8e8ed; min-width: 100px">
            <button @click="startRename(novel); openMenuId = ''" class="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50" style="color: #555666">重命名</button>
            <button @click="handleDelete(novel.id); openMenuId = ''" class="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50" style="color: #f56c6c">删除</button>
          </div>
        </div>
        <!-- 信息区 -->
        <div class="p-3 cursor-pointer" @click="$router.push(`/novel/${novel.id}`)">
          <h3 class="text-sm font-medium truncate" style="color: #222226">{{ novel.title }}</h3>
          <p class="text-xs mt-1" style="color: #999aaa">{{ novel.author }}</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs px-1.5 py-0.5 rounded" style="background: #fff5f2; color: #FC5531">
              {{ novel.source === 'crawl' ? '在线' : '本地' }}
            </span>
            <span class="text-xs" style="color: #999aaa">{{ (novel as any)._count?.chapters || 0 }}节</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredNovels.length === 0" class="flex flex-col items-center justify-center py-20">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e8e8ed" stroke-width="1.5" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
      <p class="text-sm mt-4" style="color: #999aaa">{{ currentFilter === 'favorite' ? '还没有收藏的资料' : '还没有资料，导入或在线获取吧' }}</p>
    </div>

    <!-- 导入弹窗 -->
    <div v-if="showUpload" class="fixed inset-0 flex items-center justify-center z-50" style="background: rgba(0,0,0,0.5)" @click.self="showUpload = false">
      <div class="rounded-xl p-6 w-full max-w-md" style="background: #fff">
        <h2 class="text-lg font-bold mb-4" style="color: #222226">导入技术文档</h2>
        <input type="file" accept=".txt" @change="handleFileSelect" class="w-full mb-4 text-sm" style="color: #555666" />
        <div class="flex gap-3 justify-end">
          <button @click="showUpload = false" class="px-4 py-2 text-sm" style="color: #999aaa">取消</button>
          <button @click="handleUpload" :disabled="!selectedFile" class="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50" style="background: #FC5531">导入</button>
        </div>
      </div>
    </div>

    <!-- 在线获取弹窗 -->
    <div v-if="showCrawl" class="fixed inset-0 flex items-center justify-center z-50" style="background: rgba(0,0,0,0.5)" @click.self="!crawlLoading && (showCrawl = false)">
      <div class="rounded-xl p-6 w-full max-w-lg" style="background: #fff">
        <h2 class="text-lg font-bold mb-4" style="color: #222226">在线获取小说</h2>
        
        <!-- 搜索区域 -->
        <div class="flex gap-2 mb-3">
          <input v-model="searchKeyword" type="text" placeholder="搜索小说（笔趣阁）" :disabled="searchLoading" class="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none" style="border: 1px solid #e8e8ed; color: #222226" @keyup.enter="handleSearch" />
          <button @click="handleSearch" :disabled="!searchKeyword || searchLoading" class="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50" style="background: #3178c6">
            {{ searchLoading ? '搜索中...' : '搜索' }}
          </button>
        </div>
        
        <!-- 搜索结果 -->
        <div v-if="searchResults.length > 0" class="mb-3 max-h-48 overflow-y-auto rounded-lg" style="border: 1px solid #e8e8ed">
          <div v-for="(item, idx) in searchResults" :key="idx" @click="selectSearchResult(item)" class="px-3 py-2 cursor-pointer transition-colors" :style="idx % 2 === 0 ? 'background: #fff' : 'background: #fafafa'" onmouseenter="this.style.background='#fff5f2'" onmouseleave="this.style.background=arguments[0].target.style.background">
            <div class="font-medium text-sm" style="color: #222226">{{ item.title }}</div>
            <div class="text-xs" style="color: #999aaa">{{ item.author }}</div>
          </div>
        </div>
        
        <!-- URL输入 -->
        <div class="mb-3 px-3 py-2 rounded-lg text-xs" style="background: #f0f9eb; color: #67c23a">
          默认源：藏海花小说网(m.zanghalhuatxt.cc) - 支持在线爬取
        </div>
        <input v-model="crawlUrl" type="url" :placeholder="`输入小说目录页URL`" :disabled="crawlLoading" class="w-full px-3 py-2 rounded-lg text-sm mb-3 focus:outline-none" style="border: 1px solid #e8e8ed; color: #222226" />
        <input v-model="crawlTitle" type="text" placeholder="标题（可选，留空自动识别）" :disabled="crawlLoading" class="w-full px-3 py-2 rounded-lg text-sm mb-3 focus:outline-none" style="border: 1px solid #e8e8ed; color: #222226" />
        <div class="flex items-center gap-2 mb-3">
          <label class="text-sm" style="color: #555666">最大章数</label>
          <input v-model.number="crawlMaxChapters" type="number" min="1" max="500" :disabled="crawlLoading" class="w-20 px-2 py-1 rounded text-sm" style="border: 1px solid #e8e8ed; color: #222226" />
        </div>
        <div v-if="crawlLoading" class="flex items-center gap-2 mb-3 py-2">
          <div class="w-4 h-4 border-2 rounded-full animate-spin" style="border-color: #FC5531; border-top-color: transparent"></div>
          <span class="text-sm" style="color: #555666">正在获取，请耐心等待...</span>
        </div>
        <div v-if="crawlError" class="mb-3 px-3 py-2 rounded-lg text-sm" style="background: #fef0f0; color: #f56c6c">{{ crawlError }}</div>
        <div v-if="crawlSuccess" class="mb-3 px-3 py-2 rounded-lg text-sm" style="background: #f0f9eb; color: #67c23a">{{ crawlSuccess }}</div>
        <div class="flex gap-3 justify-end">
          <button @click="showCrawl = false; crawlError = ''; crawlSuccess = ''; searchResults = []" :disabled="crawlLoading" class="px-4 py-2 text-sm disabled:opacity-50" style="color: #999aaa">取消</button>
          <button @click="handleCrawl" :disabled="!crawlUrl || crawlLoading" class="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50" style="background: #FC5531">{{ crawlLoading ? '获取中...' : '获取' }}</button>
        </div>
      </div>
    </div>

    <!-- 重命名弹窗 -->
    <div v-if="showRename" class="fixed inset-0 flex items-center justify-center z-50" style="background: rgba(0,0,0,0.5)" @click.self="showRename = false">
      <div class="rounded-xl p-6 w-full max-w-md" style="background: #fff">
        <h2 class="text-lg font-bold mb-4" style="color: #222226">重命名</h2>
        <input v-model="renameTitle" type="text" class="w-full px-3 py-2 rounded-lg text-sm mb-3 focus:outline-none" style="border: 1px solid #e8e8ed; color: #222226" />
        <div class="flex gap-3 justify-end">
          <button @click="showRename = false" class="px-4 py-2 text-sm" style="color: #999aaa">取消</button>
          <button @click="handleRename" :disabled="!renameTitle.trim()" class="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50" style="background: #FC5531">确定</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 flex items-center justify-center z-50" style="background: rgba(0,0,0,0.5)">
      <div class="rounded-xl p-6 w-full max-w-sm" style="background: #fff">
        <h2 class="text-lg font-bold mb-2" style="color: #222226">确认删除</h2>
        <p class="text-sm mb-4" style="color: #555666">删除后无法恢复，确定要删除吗？</p>
        <div class="flex gap-3 justify-end">
          <button @click="showDeleteConfirm = false; deleteTargetId = ''" class="px-4 py-2 text-sm" style="color: #999aaa">取消</button>
          <button @click="confirmDelete" class="px-4 py-2 rounded-lg text-sm text-white" style="background: #f56c6c">删除</button>
        </div>
      </div>
    </div>

    <!-- 点击其他区域关闭菜单 -->
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

// 搜索相关
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
