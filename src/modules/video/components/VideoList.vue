<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-display font-bold text-foreground mb-2">在线课程</h1>
        <p class="text-muted-foreground">视频教程与学习资源</p>
      </div>
      <button @click="showAdd = true" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        添加课程
      </button>
    </div>

    <!-- Video Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="video in videos" :key="video.id"
        class="card-elevated cursor-pointer group overflow-hidden p-0"
        @click="$router.push(`/video/${video.id}`)">
        <!-- Thumbnail -->
        <div class="aspect-video flex items-center justify-center relative overflow-hidden"
          style="background: linear-gradient(135deg, rgba(0,82,255,0.06), rgba(77,124,255,0.15))">
          <svg class="w-12 h-12 text-accent/25 group-hover:text-accent/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132L8 11.168V21l4.752-2.132L17 21V11.168z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h18v18H3z"/>
          </svg>
          <span class="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-lg bg-black/60 text-white font-medium backdrop-blur-sm">{{ video.platform }}</span>
          <!-- Favorite -->
          <button @click.stop="toggleFavorite(video)"
            class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
            :class="video.isFavorite ? 'bg-accent/10 text-accent' : 'bg-white/80 text-muted-foreground/40 hover:text-accent'">
            <svg class="w-4 h-4" :fill="video.isFavorite ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </button>
        </div>
        <!-- Info -->
        <div class="p-5">
          <h3 class="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">{{ video.title }}</h3>
          <div class="flex items-center gap-2 mt-3">
            <span class="text-xs px-2 py-0.5 rounded-lg bg-accent/10 text-accent font-medium">{{ video.platform }}</span>
            <button @click.stop="deleteVideo(video.id)"
              class="text-xs text-red-400 hover:text-red-500 ml-auto transition-colors">移除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="videos.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132L8 11.168V21l4.752-2.132L17 21V11.168z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h18v18H3z"/>
        </svg>
      </div>
      <p class="text-muted-foreground">还没有课程，添加一个吧</p>
    </div>

    <!-- Add Video Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAdd" class="fixed inset-0 flex items-center justify-center z-50" @click.self="showAdd = false">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="relative card-elevated w-full max-w-md p-6">
            <h2 class="text-xl font-display font-bold text-foreground mb-6">添加视频</h2>

            <!-- Tabs -->
            <div class="flex gap-1 mb-6 p-1 bg-muted/50 rounded-xl">
              <button @click="addMode = 'url'"
                class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                :class="addMode === 'url' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'">在线链接</button>
              <button @click="addMode = 'download'"
                class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                :class="addMode === 'download' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'">下载B站</button>
              <button @click="addMode = 'file'"
                class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                :class="addMode === 'file' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'">本地上传</button>
            </div>

            <!-- URL Mode -->
            <div v-if="addMode === 'url'">
              <input v-model="newUrl" type="url" placeholder="输入视频URL（支持B站/YouTube）" class="input mb-4" />
              <input v-model="newTitle" type="text" placeholder="视频名称（可选）" class="input mb-4" />
            </div>

            <!-- Download Mode -->
            <div v-else-if="addMode === 'download'">
              <input v-model="downloadUrl" type="url" placeholder="输入B站视频URL (bilibili.com或b23.tv)" class="input mb-4" />
              <input v-model="downloadTitle" type="text" placeholder="视频名称（可选，下载后自动填充）" class="input mb-4" />
              <div class="flex items-center gap-3 mb-4">
                <label class="text-sm text-muted-foreground whitespace-nowrap">画质：</label>
                <select v-model="downloadQuality" class="input flex-1">
                  <option value="dash-flv480-HEVC">480P HEVC (推荐，体积小)</option>
                  <option value="dash-flv480-AVC">480P AVC (兼容性好)</option>
                  <option value="dash-flv360-HEVC">360P HEVC (最小体积)</option>
                  <option value="dash-flv360-AVC">360P AVC</option>
                </select>
              </div>
              <!-- Download Progress -->
              <div v-if="downloading" class="mb-4">
                <div class="h-2 rounded-full bg-muted overflow-hidden">
                  <div class="h-full transition-all duration-300 rounded-full" :style="`width: ${downloadProgress}%`" style="background: linear-gradient(135deg, #0052FF, #4D7CFF)"></div>
                </div>
                <p class="text-xs text-muted-foreground mt-2">{{ downloadStatusText }}</p>
              </div>
            </div>

            <!-- File Upload Mode -->
            <div v-else>
              <input ref="fileInput" type="file" accept="video/*" @change="handleFileSelect"
                class="w-full mb-4 text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-accent/10 file:text-accent file:font-medium hover:file:bg-accent/20 file:transition-colors file:cursor-pointer" />
              <p v-if="selectedFile" class="text-sm text-muted-foreground mb-3">已选择: {{ selectedFile.name }}</p>
              <!-- Upload Progress -->
              <div v-if="uploading" class="mb-4">
                <div class="h-2 rounded-full bg-muted overflow-hidden">
                  <div class="h-full transition-all duration-300 rounded-full" :style="`width: ${uploadProgress}%`" style="background: linear-gradient(135deg, #0052FF, #4D7CFF)"></div>
                </div>
                <p class="text-xs text-muted-foreground mt-2">上传中... {{ uploadProgress }}%</p>
              </div>
            </div>

            <p v-if="errorMsg" class="text-sm text-red-500 mb-4">{{ errorMsg }}</p>

            <div class="flex gap-3 justify-end">
              <button @click="showAdd = false; errorMsg = ''" class="btn-secondary">取消</button>
              <button @click="handleAdd" :disabled="isButtonDisabled" class="btn-primary disabled:opacity-50 disabled:pointer-events-none">{{ buttonText }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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

const downloadUrl = ref('')
const downloadTitle = ref('')
const downloadQuality = ref('dash-flv480-HEVC')
const downloading = ref(false)
const downloadProgress = ref(0)
const downloadStatusText = ref('')
const currentDownloadId = ref('')

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

<style scoped>
.modal-enter-active { transition: all 200ms ease-out; }
.modal-leave-active { transition: all 150ms ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > :last-child, .modal-leave-to > :last-child { transform: scale(0.95) translateY(10px); }
</style>
