<template>
  <div class="flex h-full bg-white dark:bg-gray-900">
    <!-- 左侧文件变更树 -->
    <aside class="w-72 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <h2 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">文件变更</h2>
      <div v-for="file in files" :key="file.name" class="flex items-center gap-2 py-1.5 px-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
        <span :class="file.status === 'added' ? 'text-green-500' : file.status === 'modified' ? 'text-yellow-500' : 'text-red-500'">
          {{ file.status === 'added' ? '+' : file.status === 'modified' ? '~' : '-' }}
        </span>
        <span class="text-gray-700 dark:text-gray-300">{{ file.name }}</span>
      </div>
    </aside>
    <!-- 右侧diff视图 -->
    <main class="flex-1 overflow-y-auto">
      <div class="border-b border-gray-200 dark:border-gray-700 p-4">
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Pull Request #142</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">refactor: 优化状态管理逻辑，提升组件渲染性能</p>
      </div>
      <div v-for="(diff, i) in diffs" :key="i" class="border-b border-gray-200 dark:border-gray-700">
        <div class="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm font-mono text-gray-600 dark:text-gray-400">{{ diff.file }}</div>
        <pre class="p-4 text-xs font-mono overflow-x-auto"><div v-for="(line, j) in diff.lines" :key="j" :class="lineClass(line)">{{ line }}</div></pre>
      </div>
      <!-- 评论列表 -->
      <div class="p-4 space-y-3">
        <div v-for="comment in comments" :key="comment.id" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ comment.author }}</span>
            <span class="text-xs text-gray-400">{{ comment.time }}</span>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300">{{ comment.text }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

function lineClass(line: string) {
  if (line.startsWith('+')) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
  if (line.startsWith('-')) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
  return 'text-gray-700 dark:text-gray-300'
}

const files = ref([
  { name: 'src/stores/user.ts', status: 'modified' },
  { name: 'src/composables/useAuth.ts', status: 'modified' },
  { name: 'src/utils/validator.ts', status: 'added' },
  { name: 'src/types/api.d.ts', status: 'modified' },
  { name: 'tests/auth.test.ts', status: 'added' },
])

const diffs = ref([
  { file: 'src/stores/user.ts', lines: ['@@ -12,7 +12,9 @@', ' export const useUserStore = () => {', '-  const user = ref(null)', '+  const user = ref<User | null>(null)', '+  const isLoading = ref(false)', '+  const error = ref<string | null>(null)', '', '   async function login(credentials) {'] },
  { file: 'src/composables/useAuth.ts', lines: ['@@ -5,6 +5,8 @@', ' export function useAuth() {', '-  const token = localStorage.getItem("token")', '+  const accessToken = localStorage.getItem("accessToken")', '+  const refreshToken = localStorage.getItem("refreshToken")', '+  // 自动刷新逻辑', '   return { token }', ' }'] },
])

const comments = ref([
  { id: 1, author: 'zhangsan', time: '2小时前', text: '这里建议增加错误处理逻辑，避免token过期时未捕获异常' },
  { id: 2, author: 'lisi', time: '1小时前', text: 'LGTM，类型定义很清晰' },
])

let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshTimer = setInterval(() => {
    // 每30s随机更新评论时间
    comments.value = comments.value.map(c => ({ ...c, time: `${Math.floor(Math.random() * 5) + 1}小时前` }))
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
