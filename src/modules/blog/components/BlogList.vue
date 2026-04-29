<template>
  <div class="p-6" style="background: #fff">
      <!-- 顶部区域 -->
      <div class="flex items-end justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold" style="color: #222226">博客</h1>
          <p class="text-sm mt-1" style="color: #999aaa">技术分享，记录成长</p>
        </div>
        <router-link to="/blog/write"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-150"
          style="background: #FC5531"
          onmouseenter="this.style.background='#E04B28'"
          onmouseleave="this.style.background='#FC5531'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          写文章
        </router-link>
      </div>

      <!-- 搜索栏 -->
      <div class="flex items-center gap-3 mb-6">
        <div class="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-lg" style="border: 1px solid #e8e8ed; background: #f9f9f9">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999aaa" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input v-model="keyword" placeholder="搜索文章..."
            class="flex-1 bg-transparent text-sm focus:outline-none" style="color: #222226"
            @keyup.enter="fetchPosts" />
        </div>
        <button @click="fetchPosts"
          class="px-4 py-2.5 rounded-lg text-sm" style="border: 1px solid #e8e8ed; color: #555666"
          onmouseenter="this.style.background='#f4f5f5'" onmouseleave="this.style.background='transparent'">
          搜索
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="posts.length === 0" class="flex flex-col items-center justify-center py-20">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e8e8ed" stroke-width="1.5" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
        <p class="text-sm mt-4" style="color: #999aaa">还没有文章，开始写第一篇吧</p>
      </div>

      <!-- 文章列表 - CSDN风格单列 -->
      <div class="space-y-4">
        <article v-for="post in posts" :key="post.id"
          class="rounded-lg p-5 cursor-pointer transition-all duration-150"
          style="border: 1px solid #e8e8ed"
          onmouseenter="this.style.borderColor='#FC5531';this.style.boxShadow='0 2px 12px rgba(252,85,49,0.08)'"
          onmouseleave="this.style.borderColor='#e8e8ed';this.style.boxShadow='none'"
          @click="$router.push(`/blog/${post.id}`)">
          <h2 class="text-base font-bold mb-2" style="color: #222226">{{ post.title }}</h2>
          <p v-if="post.excerpt" class="text-sm mb-3 line-clamp-2" style="color: #555666; line-height: 1.6">{{ post.excerpt }}</p>
          <!-- 标签 -->
          <div class="flex items-center gap-1.5 flex-wrap mb-3">
            <span v-for="tag in (Array.isArray(post.tags) ? post.tags : [])" :key="tag"
              class="text-xs px-2 py-0.5 rounded" style="background: #f0f7ff; color: #3178c6">#{{ tag }}</span>
          </div>
          <!-- 底部元信息 -->
          <div class="flex items-center gap-4 text-xs" style="color: #999aaa">
            <span>{{ formatDate(post.createdAt) }}</span>
            <div class="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {{ post.viewCount }}
            </div>
            <span v-if="post.isPublished" style="color: #3b8c50">已发布</span>
            <span v-else>草稿</span>
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
