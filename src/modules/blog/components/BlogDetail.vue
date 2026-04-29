<template>
  <div class="h-full overflow-y-auto" style="background: #050506">
      <div v-if="post" class="max-w-2xl mx-auto px-6 py-10">
        <!-- 返回导航 -->
        <div class="flex items-center justify-between mb-8">
          <router-link to="/blog" class="inline-flex items-center gap-1.5 text-xs transition-colors duration-150" style="color: #525252" onmouseenter="this.style.color='#8A8F98'" onmouseleave="this.style.color='#525252'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            返回列表
          </router-link>
          <!-- 删除按钮 -->
          <button v-if="isAuthor" @click="deletePost" class="px-3 py-1.5 rounded-lg text-xs transition-all duration-150" style="border: 1px solid rgba(239,68,68,0.3); color: #EF4444" onmouseenter="this.style.background='rgba(239,68,68,0.1)'" onmouseleave="this.style.background='transparent'">
            删除文章
          </button>
        </div>

        <!-- 文章头部 -->
        <header class="mb-10">
          <h1 class="text-3xl font-semibold mb-4" style="color: #EDEDEF; letter-spacing: -0.03em; line-height: 1.3">{{ post.title }}</h1>

          <!-- 元信息 -->
          <div class="flex items-center gap-3 flex-wrap mb-5">
            <span class="text-xs" style="color: #525252">{{ formatDate(post.createdAt) }}</span>
            <div class="w-1 h-1 rounded-full" style="background: #525252"></div>
            <div class="flex items-center gap-1 text-xs" style="color: #525252">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {{ post.viewCount }} 次阅读
            </div>
          </div>

          <!-- 标签 -->
          <div class="flex items-center gap-2 flex-wrap">
            <span v-for="tag in (Array.isArray(post.tags) ? post.tags : [])" :key="tag"
              class="text-[11px] px-2 py-0.5 rounded-md"
              style="background: rgba(99,102,241,0.08); color: #818CF8">#{{ tag }}</span>
          </div>
        </header>

        <!-- 分隔线 -->
        <div class="mb-10" style="height: 1px; background: linear-gradient(90deg, rgba(99,102,241,0.3), rgba(255,255,255,0.06), transparent)"></div>

        <!-- 文章内容 -->
        <article class="prose-invert" style="color: #C0C0C0; font-size: 15px; line-height: 1.8; letter-spacing: -0.01em" v-html="renderedContent"></article>

        <!-- 底部分隔 -->
        <div class="mt-12 mb-6" style="height: 1px; background: rgba(255,255,255,0.04)"></div>
        <div class="flex items-center justify-between">
          <span class="text-[11px]" style="color: #525252">最后更新于 {{ formatDate(post.updatedAt) }}</span>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else class="flex flex-col items-center justify-center h-full">
        <div class="flex gap-1.5 mb-4">
          <div class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: #6366F1; animation-delay: 0ms"></div>
          <div class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: #6366F1; animation-delay: 150ms"></div>
          <div class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: #6366F1; animation-delay: 300ms"></div>
        </div>
        <p class="text-xs" style="color: #525252">加载中</p>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get, del } from '@shared/api/client'
import type { BlogPost } from '@shared/types'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const route = useRoute()
const router = useRouter()
const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
const post = ref<BlogPost | null>(null)

const currentUserId = localStorage.getItem('userId')
const isAuthor = computed(() => post.value?.userId === currentUserId)

const renderedContent = computed(() => {
  if (!post.value) return ''
  return DOMPurify.sanitize(md.render(post.value.content))
})

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

async function deletePost() {
  if (!post.value || !confirm('确定要删除这篇文章吗？')) return
  const res = await del(`/blog/posts/${post.value.id}`)
  if (res.code === 200) {
    router.push('/blog')
  }
}

onMounted(async () => {
  const id = route.params.id as string
  const res = await get<BlogPost>(`/blog/posts/${id}`)
  if (res.code === 200 && res.data) post.value = res.data
})
</script>
