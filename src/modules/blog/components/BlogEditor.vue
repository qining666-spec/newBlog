<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Top Bar -->
    <div class="flex items-center justify-between">
      <router-link to="/blog" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        返回
      </router-link>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5 mr-4">
          <div class="w-2 h-2 rounded-full" :class="title && content ? 'bg-green-500' : 'bg-muted-foreground'"></div>
          <span class="text-xs text-muted-foreground">{{ title && content ? '已编辑' : '未编辑' }}</span>
        </div>
        <button @click="savePost" class="btn-secondary !px-4 !py-2 text-sm">保存草稿</button>
        <button @click="publishPost" class="btn-primary !px-4 !py-2 text-sm">发布</button>
      </div>
    </div>

    <!-- Title -->
    <input v-model="title" placeholder="文章标题" class="w-full text-3xl font-display font-bold bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground border-none" />

    <!-- Toolbar -->
    <div class="flex items-center gap-1 py-2 border-y border-border">
      <button v-for="btn in toolbar" :key="btn.label" @click="insertMarkdown(btn.syntax)"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        :title="btn.label">
        {{ btn.label }}
      </button>
      <div class="ml-auto text-xs text-muted-foreground tabular-nums">{{ wordCount }} 字</div>
    </div>

    <!-- Editor -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-border rounded-2xl overflow-hidden bg-card" style="min-height: 500px">
      <div class="flex flex-col border-b lg:border-b-0 lg:border-r border-border">
        <div class="px-4 py-2 border-b border-border">
          <span class="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">Markdown</span>
        </div>
        <textarea v-model="content"
          class="flex-1 w-full p-6 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground"
          placeholder="在这里写 Markdown..."></textarea>
      </div>
      <div class="flex flex-col">
        <div class="px-4 py-2 border-b border-border">
          <span class="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">Preview</span>
        </div>
        <div class="flex-1 overflow-y-auto p-6 prose max-w-none text-sm text-foreground" v-html="renderedContent"></div>
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
    await post(`/blog/posts/${postId.value}/publish`, {})
    router.push('/blog')
  }
}
</script>
