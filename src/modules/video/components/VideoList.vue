<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold" style="color: #222226">在线课程</h1>
      <button @click="showAdd = true" class="px-4 py-2 rounded-lg text-sm text-white" style="background: #FC5531" onmouseenter="this.style.background='#E04B28'" onmouseleave="this.style.background='#FC5531'">添加课程</button>
    </div>

    <!-- 课程列表 - 卡片式，点击进入播放页 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="video in videos" :key="video.id"
        class="rounded-lg overflow-hidden cursor-pointer transition-all duration-150"
        style="background: #fff; border: 1px solid #e8e8ed"
        onmouseenter="this.style.borderColor='#FC5531';this.style.boxShadow='0 2px 8px rgba(252,85,49,0.1)'"
        onmouseleave="this.style.borderColor='#e8e8ed';this.style.boxShadow='none'"
        @click="$router.push(`/video/${video.id}`)">
        <!-- 缩略图区 -->
        <div class="aspect-video flex items-center justify-center relative" style="background: linear-gradient(135deg, #f0f7ff, #e0efff)">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3178c6" stroke-width="1.5" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span class="absolute bottom-2 right-2 text-xs px-1.5 py-0.5 rounded" style="background: rgba(0,0,0,0.6); color: white">{{ video.platform }}</span>
          <!-- 收藏 -->
          <button @click.stop="toggleFavorite(video)" class="absolute top-2 right-2 text-lg" :style="video.isFavorite ? 'color: #FC5531' : 'color: #ccc'">
            {{ video.isFavorite ? '★' : '☆' }}
          </button>
        </div>
        <div class="p-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium truncate flex-1" style="color: #222226">{{ video.title }}</h3>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs px-1.5 py-0.5 rounded" style="background: #f0f7ff; color: #3178c6">{{ video.platform }}</span>
            <button @click.stop="deleteVideo(video.id)" class="text-xs ml-auto" style="color: #f56c6c" onmouseenter="this.style.textDecoration='underline'" onmouseleave="this.style.textDecoration='none'">移除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="videos.length === 0" class="flex flex-col items-center justify-center py-20">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e8e8ed" stroke-width="1.5" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      <p class="text-sm mt-4" style="color: #999aaa">还没有课程，添加一个吧</p>
    </div>

    <!-- 添加课程弹窗 -->
    <div v-if="showAdd" class="fixed inset-0 flex items-center justify-center z-50" style="background: rgba(0,0,0,0.5)" @click.self="showAdd = false">
      <div class="rounded-xl p-6 w-full max-w-md" style="background: #fff">
        <h2 class="text-lg font-bold mb-4" style="color: #222226">添加视频</h2>
        
        <!-- 标签页切换 -->
        <div class="flex gap-4 mb-4 border-b" style="border-color: #e8e8ed">
          <button @click="addMode = 'url'" :style="addMode === 'url' ? 'color: #FC5531; border-bottom: 2px solid #FC5531' : 'color: #999aaa'" class="pb-2 text-sm font-medium">在线链接</button>
          <button @click="addMode = 'download'" :style="addMode === 'download' ? 'color: #FC5531; border-bottom: 2px solid #FC5531' : 'color: #999aaa'" class="pb-2 text-sm font-medium">下载B站</button>
          <button @click="addMode = 'file'" :style="addMode === 'file' ? 'color: #FC5531; border-bottom: 2px solid #FC5531' : 'color: #999aaa'" class="pb-2 text-sm font-medium">本地上传</button>
        </div>
        
        <!-- 在线链接模式 -->
        <div v-if="addMode === 'url'">
          <input v-model="newUrl" type="url" placeholder="输入视频URL（支持B站/YouTube）" class="w-full px-3 py-2 rounded-lg text-sm mb-3 focus:outline-none" style="border: 1px solid #e8e8ed; color: #222226" />
          <input v-model="newTitle" type="text" placeholder="视频名称（可选）" class="w-full px-3 py-2 rounded-lg text-sm mb-4 focus:outline-none" style="border: 1px solid #e8e8ed; color: #222226" />
        </div>
        
        <!-- 下载B站模式 -->
        <div v-else-if="addMode === 'download'">
          <input v-model="downloadUrl" type="url" placeholder="输入B站视频URL (bilibili.com或b23.tv)" class="w-full px-3 py-2 rounded-lg text-sm mb-3 focus:outline-none" style="border: 1px solid #e8e8ed; color: #222226" />
          <input v-model="downloadTitle" type="text" placeholder="视频名称（可选，下载后自动填充）" class="w-full px-3 py-2 rounded-lg text-sm mb-3 focus:outline-none" style="border: 1px solid #e8e8ed; color: #222226" />
          
          <!-- 画质选择 -->
          <div class="flex items-center gap-2 mb-3">
            <span class="text-sm" style="color: #666">画质：</span>
            <select v-model="downloadQuality" class="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none" style="border: 1px solid #e8e8ed; color: #222226">
              <option value="dash-flv480-HEVC">480P HEVC (推荐，体积小)</option>
              <option value="dash-flv480-AVC">480P AVC (兼容性好)</option>
              <option value="dash-flv360-HEVC">360P HEVC (最小体积)</option>
              <option value="dash-flv360-AVC">360P AVC</option>
            </select>
          </div>
          
          <!-- 下载进度条 -->
          <div v-if="downloading" class="mb-4">
            <div class="h-2 rounded-full overflow-hidden" style="background: #f4f5f5">
              <div class="h-full transition-all duration-300" :style="`width: ${downloadProgress}%; background: #FC5531`"></div>
            </div>
            <p class="text-xs mt-1" style="color: #999aaa">{{ downloadStatusText }}</p>
          </div>
        </div>
        
        <!-- 本地上传模式 -->
        <div v-else>
          <input ref="fileInput" type="file" accept="video/*" @change="handleFileSelect" class="w-full px-3 py-2 rounded-lg text-sm mb-3" style="border: 1px solid #e8e8ed" />
          <p v-if="selectedFile" class="text-sm mb-2" style="color: #666">已选择: {{ selectedFile.name }}</p>
          <!-- 上传进度条 -->
          <div v-if="uploading" class="mb-4">
            <div class="h-2 rounded-full overflow-hidden" style="background: #f4f5f5">
              <div class="h-full transition-all duration-300" :style="`width: ${uploadProgress}%; background: #FC5531`"></div>
            </div>
            <p class="text-xs mt-1" style="color: #999aaa">上传中... {{ uploadProgress }}%</p>
          </div>
        </div>
        
        <p v-if="errorMsg" class="text-sm mb-3" style="color: #f56c6c">{{ errorMsg }}</p>
        
        <div class="flex gap-3 justify-end">
          <button @click="showAdd = false; errorMsg = ''" class="px-4 py-2 text-sm" style="color: #999aaa">取消</button>
          <button @click="handleAdd" :disabled="isButtonDisabled" class="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50" style="background: #FC5531">{{ buttonText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { get, post, patch, del } from '@shared/api/client'
import type { VideoItem } from '@shared/types'
import axios from 'axios'

const videos = ref<VideoItem[]>([])
const showAdd = ref(false)
const newUrl = ref('')
const newTitle = ref('')
const addMode = ref<'url' | 'download' | 'file'>('url')
const selectedFile = ref<File | null>(null)
const errorMsg = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)

// 下载B站相关
const downloadUrl = ref('')
const downloadTitle = ref('')
const downloadQuality = ref('dash-flv480-HEVC')
const downloading = ref(false)
const downloadProgress = ref(0)
const downloadStatusText = ref('')
const currentDownloadId = ref('')

// 计算属性
const isButtonDisabled = computed(() => {
  if (addMode.value === 'url') return !newUrl.value
  if (addMode.value === 'download') return !downloadUrl.value || downloading.value
  return !selectedFile.value
})

const buttonText = computed(() => {
  if (addMode.value === 'url') return '添加'
  if (addMode.value === 'download') return downloading.value ? '下载中...' : '下载'
  return '上传'
})

async function fetchVideos() {
  try {
    const res = await get<{ items: VideoItem[]; total: number }>('/videos')
    if (res.code === 200 && res.data) videos.value = (res.data as any).items || []
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || '获取视频列表失败'
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
}

async function addVideo() {
  if (!newUrl.value) return
  try {
    errorMsg.value = ''
    await post('/videos', { url: newUrl.value, title: newTitle.value || undefined })
    showAdd.value = false
    newUrl.value = ''
    newTitle.value = ''
    await fetchVideos()
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || '添加失败'
  }
}

async function downloadBilibili() {
  if (!downloadUrl.value) return
  try {
    errorMsg.value = ''
    downloading.value = true
    downloadProgress.value = 0
    downloadStatusText.value = '开始下载...'
    
    const res = await post<{ downloadId: string }>('/videos/download-bilibili', { 
      url: downloadUrl.value, 
      title: downloadTitle.value || undefined,
      quality: downloadQuality.value
    })
    
    if (res.code === 200 && res.data) {
      currentDownloadId.value = (res.data as any).downloadId
      
      // 轮询下载进度
      const pollInterval = setInterval(async () => {
        try {
          const progressRes = await get<{ progress: number; status: string; title?: string }>(`/videos/download-progress/${currentDownloadId.value}`)
          if (progressRes.code === 200 && progressRes.data) {
            const { progress, status, title } = progressRes.data as any
            downloadProgress.value = progress
            
            if (status === 'downloading') {
              downloadStatusText.value = `下载中... ${progress.toFixed(1)}%`
            } else if (status === 'completed') {
              downloadStatusText.value = `下载完成: ${title || '视频'}`
              clearInterval(pollInterval)
              downloading.value = false
              showAdd.value = false
              downloadUrl.value = ''
              downloadTitle.value = ''
              await fetchVideos()
            } else if (status === 'failed') {
              downloadStatusText.value = '下载失败'
              clearInterval(pollInterval)
              downloading.value = false
            }
          }
        } catch {
          clearInterval(pollInterval)
          downloading.value = false
        }
      }, 1000)
    }
  } catch (e: any) {
    downloading.value = false
    errorMsg.value = e.response?.data?.message || '下载失败'
  }
}

async function uploadLocal() {
  if (!selectedFile.value) return
  try {
    errorMsg.value = ''
    uploading.value = true
    uploadProgress.value = 0
    
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    await axios.post('/api/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })
    
    showAdd.value = false
    selectedFile.value = null
    uploading.value = false
    uploadProgress.value = 0
    await fetchVideos()
  } catch (e: any) {
    uploading.value = false
    uploadProgress.value = 0
    errorMsg.value = e.response?.data?.message || '上传失败'
  }
}

async function handleAdd() {
  if (addMode.value === 'url') await addVideo()
  else if (addMode.value === 'download') await downloadBilibili()
  else await uploadLocal()
}

async function toggleFavorite(video: VideoItem) {
  await patch(`/videos/${video.id}`, { isFavorite: !video.isFavorite })
  await fetchVideos()
}

async function deleteVideo(id: string) {
  await del(`/videos/${id}`)
  await fetchVideos()
}

onMounted(fetchVideos)
</script>
