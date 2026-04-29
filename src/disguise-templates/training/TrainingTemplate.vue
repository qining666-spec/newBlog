<template>
  <div class="flex h-full bg-white dark:bg-gray-900">
    <!-- 左侧课程目录 -->
    <aside class="w-72 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <h2 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">课程目录</h2>
      <div v-for="(chapter, i) in chapters" :key="i" class="mb-3">
        <div class="text-sm font-medium text-gray-900 dark:text-white mb-1">{{ chapter.title }}</div>
        <div v-for="lesson in chapter.lessons" :key="lesson.name" class="flex items-center gap-2 py-1 px-3 text-sm cursor-pointer"
          :class="lesson.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'">
          <span>{{ lesson.completed ? '✓' : '○' }}</span>
          <span>{{ lesson.name }}</span>
        </div>
      </div>
    </aside>
    <!-- 右侧课程内容 -->
    <main class="flex-1 overflow-y-auto">
      <div class="p-6">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ currentLesson }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">第 {{ currentChapter }} 章 / 第 {{ currentSection }} 节</p>
        <!-- 视频占位区域 -->
        <div class="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-6">
          <div class="text-center">
            <div class="text-white text-4xl mb-2">▶</div>
            <p class="text-gray-400 text-sm">课程视频播放中...</p>
          </div>
        </div>
        <!-- 学习进度条 -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>学习进度</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full transition-all" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
        <!-- 课程笔记 -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">课程笔记</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ noteContent }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentLesson = ref('前端工程化实践')
const currentChapter = ref(3)
const currentSection = ref(2)
const progress = ref(67)
const noteContent = ref('本节介绍了前端工程化的核心概念，包括模块化、组件化、自动化构建等内容...')

const chapters = ref([
  { title: '第1章 基础概念', lessons: [{ name: '1.1 什么是工程化', completed: true }, { name: '1.2 开发环境搭建', completed: true }] },
  { title: '第2章 构建工具', lessons: [{ name: '2.1 Webpack原理', completed: true }, { name: '2.2 Vite实战', completed: true }] },
  { title: '第3章 工程实践', lessons: [{ name: '3.1 代码规范', completed: true }, { name: '3.2 前端工程化实践', completed: false }] },
  { title: '第4章 进阶', lessons: [{ name: '4.1 性能优化', completed: false }, { name: '4.2 自动化测试', completed: false }] },
])

let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshTimer = setInterval(() => {
    progress.value = Math.min(100, progress.value + Math.floor(Math.random() * 3))
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
