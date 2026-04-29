<template>
  <div class="h-full flex flex-col" style="background: #050506">
      <!-- 顶部栏 -->
      <div class="px-6 py-3 flex items-center justify-between flex-shrink-0" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
        <div class="flex items-center gap-3">
          <router-link to="/blog" class="flex items-center gap-1.5 text-xs transition-colors duration-150" style="color: #525252" onmouseenter="this.style.color='#8A8F98'" onmouseleave="this.style.color='#525252'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            返回
          </router-link>
          <div class="w-px h-4" style="background: rgba(255,255,255,0.06)"></div>
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full" :style="{ background: title && content ? '#34D399' : '#525252' }"></div>
            <span class="text-[11px]" style="color: #525252">{{ title && content ? '已编辑' : '未编辑' }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button @click="savePost"
            class="px-3.5 py-1.5 rounded-lg text-xs transition-all duration-150"
            style="border: 1px solid rgba(255,255,255,0.1); color: #8A8F98"
            onmouseenter="this.style.background='rgba(255,255,255,0.04)'" onmouseleave="this.style.background='transparent'">
            保存草稿
          </button>
          <button @click="publishPost"
            class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style="background: linear-gradient(135deg, #6366F1, #7C3AED); color: white; box-shadow: 0 0 20px rgba(99,102,241,0.2)">
            发布
          </button>
        </div>
      </div>

      <!-- 标题输入 -->
      <div class="px-8 pt-6 pb-2 flex-shrink-0">
        <input v-model="title" placeholder="文章标题"
          class="w-full text-2xl font-semibold bg-transparent focus:outline-none"
          style="color: #EDEDEF; caret-color: #6366F1; letter-spacing: -0.03em" />
      </div>

      <!-- 工具栏 -->
      <div class="px-8 py-2 flex-shrink-0 flex items-center gap-0.5" style="border-bottom: 1px solid rgba(255,255,255,0.04)">
        <button v-for="btn in toolbar" :key="btn.label" @click="insertMarkdown(btn.syntax)"
          class="w-8 h-8 flex items-center justify-center rounded-md text-xs transition-all duration-100"
          style="color: #525252"
          onmouseenter="this.style.background='rgba(255,255,255,0.04)'; this.style.color='#8A8F98'"
          onmouseleave="this.style.background='transparent'; this.style.color='#525252'"
          :title="btn.label">
          {{ btn.label }}
        </button>
        <div class="ml-auto flex items-center gap-2">
          <span class="text-[10px] tabular-nums" style="color: #525252">{{ wordCount }} 字</span>
        </div>
      </div>

      <!-- 编辑器 - 左右分栏 -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Markdown 编辑区 -->
        <div class="flex-1 flex flex-col overflow-hidden" style="border-right: 1px solid rgba(255,255,255,0.04)">
          <div class="px-4 py-2 flex-shrink-0" style="border-bottom: 1px solid rgba(255,255,255,0.04)">
            <span class="text-[10px] uppercase tracking-wider" style="color: #525252">Markdown</span>
          </div>
          <textarea v-model="content"
            class="flex-1 w-full p-5 bg-transparent resize-none focus:outline-none font-mono text-[13px] leading-relaxed"
            style="color: #EDEDEF; caret-color: #6366F1"
            placeholder="在这里写 Markdown..."></textarea>
        </div>
        <!-- 预览区 -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="px-4 py-2 flex-shrink-0" style="border-bottom: 1px solid rgba(255,255,255,0.04)">
            <span class="text-[10px] uppercase tracking-wider" style="color: #525252">Preview</span>
          </div>
          <div class="flex-1 overflow-y-auto p-5 prose-invert" style="color: #8A8F98; font-size: 13px; line-height: 1.7" v-html="renderedContent"></div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { post, patch } from '@shared/api/client'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const router = useRouter()
const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

const title = ref('')
const content = ref('')
const postId = ref<string | null>(null)

const wordCount = computed(() => content.value.length)

const renderedContent = computed(() => {
  const html = md.render(content.value)
  return DOMPurify.sanitize(html)
})

const toolbar = [
  { label: 'B', syntax: '**bold**' },
  { label: 'I', syntax: '*italic*' },
  { label: 'H1', syntax: '# ' },
  { label: 'H2', syntax: '## ' },
  { label: 'H3', syntax: '### ' },
  { label: '🔗', syntax: '[text](url)' },
  { label: '🖼', syntax: '![alt](url)' },
  { label: '⟨⟩', syntax: '```\n\n```' },
  { label: '•', syntax: '- ' },
  { label: '❝', syntax: '> ' },
]

function insertMarkdown(syntax: string) {
  const textarea = document.querySelector('textarea') as HTMLTextAreaElement
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  content.value = content.value.substring(0, start) + syntax + content.value.substring(end)
}

async function savePost() {
  if (postId.value) {
    await patch(`/blog/posts/${postId.value}`, { title: title.value, content: content.value })
  } else {
    const res = await post('/blog/posts', { title: title.value, content: content.value })
    if (res.code === 200 && res.data) postId.value = (res.data as any).id
  }
}

async function publishPost() {
  await savePost()
  if (postId.value) {
    await post(`/blog/posts/${postId.value}/publish`)
    router.push('/blog')
  }
}
</script>
