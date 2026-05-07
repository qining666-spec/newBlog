<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="post" class="space-y-8">
      <!-- Back & Actions -->
      <div class="flex items-center justify-between">
        <router-link to="/blog" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          返回列表
        </router-link>
        <button v-if="isAuthor" @click="deletePost" class="btn-secondary !px-3 !py-2 text-sm text-red-500 hover:bg-red-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          删除
        </button>
      </div>

      <!-- Header -->
      <header class="space-y-6">
        <h1 class="text-4xl font-display font-bold text-foreground leading-tight">{{ post.title || '无标题' }}</h1>
        
        <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>{{ formatDate(post.createdAt) }}</span>
          <span class="w-1 h-1 rounded-full bg-muted-foreground"></span>
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            {{ post.viewCount }} 次阅读
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in (Array.isArray(post.tags) ? post.tags : [])"
            :key="tag"
            class="px-3 py-1 rounded-lg text-sm font-medium bg-accent/10 text-accent"
          >
            {{ tag }}
          </span>
        </div>
      </header>

      <!-- Content -->
      <div class="card">
        <article class="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-accent prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded" v-html="renderedContent"></article>
      </div>

      <!-- Footer -->
      <div class="text-sm text-muted-foreground border-t border-border pt-6">
        最后更新于 {{ formatDate(post.updatedAt) }}
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="flex flex-col items-center justify-center py-32">
      <div class="flex gap-1.5 mb-4">
        <div class="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
        <div class="w-2 h-2 rounded-full bg-accent animate-pulse" style="animation-delay: 150ms"></div>
        <div class="w-2 h-2 rounded-full bg-accent animate-pulse" style="animation-delay: 300ms"></div>
      </div>
      <p class="text-muted-foreground">加载中</p>
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
