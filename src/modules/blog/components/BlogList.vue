<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-display font-bold text-foreground mb-2">博客</h1>
        <p class="text-muted-foreground">技术分享，记录成长</p>
      </div>
      <router-link to="/blog/write" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        写文章
      </router-link>
    </div>

    <!-- Search -->
    <div class="flex gap-3">
      <div class="flex-1 relative">
        <input
          v-model="keyword"
          placeholder="搜索文章..."
          class="input pl-10"
          @keyup.enter="fetchPosts"
        />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <button @click="fetchPosts" class="btn-secondary">搜索</button>
    </div>

    <!-- Empty State -->
    <div v-if="posts.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
      </div>
      <p class="text-muted-foreground">还没有文章，开始写第一篇吧</p>
    </div>

    <!-- Posts Grid -->
    <div class="grid gap-6 md:grid-cols-2">
      <article
        v-for="post in posts"
        :key="post.id"
        class="card-elevated cursor-pointer group"
        @click="$router.push(`/blog/${post.id}`)"
      >
        <div class="mb-4">
          <h2 class="text-xl font-display font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">
            {{ post.title || '无标题文章' }}
          </h2>
          <p v-if="post.excerpt" class="text-sm text-muted-foreground line-clamp-2">{{ post.excerpt }}</p>
        </div>
        
        <div class="flex items-center flex-wrap gap-2 mb-4">
          <span
            v-for="tag in (Array.isArray(post.tags) ? post.tags : [])"
            :key="tag"
            class="px-2 py-1 rounded-lg text-xs font-medium bg-accent/10 text-accent"
          >
            {{ tag }}
          </span>
        </div>
        
        <div class="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
          <span>{{ formatDate(post.createdAt) }}</span>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              {{ post.viewCount }}
            </div>
            <span :class="post.isPublished ? 'text-green-600' : 'text-yellow-600'" class="font-medium">
              {{ post.isPublished ? '已发布' : '草稿' }}
            </span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get } from '@shared/api/client'
import type { BlogPost } from '@shared/types'

const posts = ref<BlogPost[]>([])
const keyword = ref('')

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

async function fetchPosts() {
  const res = await get<{ items: BlogPost[]; total: number }>('/blog/posts', { keyword: keyword.value || undefined })
  if (res.code === 200 && res.data) posts.value = (res.data as any).items || []
}

onMounted(fetchPosts)
</script>
