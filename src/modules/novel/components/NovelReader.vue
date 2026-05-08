<template>
  <div class="relative h-full bg-background" @click="handlePageClick">
    <!-- Reading Progress Bar -->
    <div class="absolute top-0 left-0 right-0 z-30 h-1 bg-muted">
      <div class="h-full bg-accent transition-all duration-300" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- Floating Toolbar -->
    <div class="absolute top-4 right-4 z-20 flex items-center gap-2">
      <button v-if="currentChapterNum > 1" @click.stop="loadChapter(1)"
        class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 bg-card border border-border text-muted-foreground hover:text-foreground hover:border-accent/30"
        title="跳到首章">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
        </svg>
      </button>
      <button @click="showChapters = !showChapters"
        class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
        :class="showChapters ? 'bg-accent text-accent-foreground shadow-md shadow-accent/20' : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-accent/30'"
        :title="showChapters ? '隐藏目录' : '显示目录'">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <button v-if="currentChapterNum < totalChapters" @click.stop="loadChapter(totalChapters)"
        class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 bg-card border border-border text-muted-foreground hover:text-foreground hover:border-accent/30"
        title="跳到末章">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
        </svg>
      </button>
      <button @click="showSettings = !showSettings"
        class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
        :class="showSettings ? 'bg-accent text-accent-foreground shadow-md shadow-accent/20' : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-accent/30'"
        title="设置">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.57 2.572-1.066z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </button>
    </div>

    <!-- Chapter Info (Top Center) -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-sm">
      <span class="text-muted-foreground">第</span>
      <span class="font-medium text-foreground mx-1">{{ currentChapterNum }}</span>
      <span class="text-muted-foreground">/</span>
      <span class="text-muted-foreground mx-1">{{ totalChapters }}</span>
      <span class="text-muted-foreground">章</span>
    </div>

    <!-- Click Navigation Hint (shows on hover edges) -->
    <div class="absolute left-0 top-0 bottom-0 w-16 z-10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center"
      v-if="currentChapterNum > 1">
      <div class="px-2 py-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-xs text-muted-foreground">
        ← 上一章
      </div>
    </div>
    <div class="absolute right-0 top-0 bottom-0 w-16 z-10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center"
      v-if="currentChapterNum < totalChapters">
      <div class="px-2 py-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-xs text-muted-foreground">
        下一章 →
      </div>
    </div>

    <!-- Chapter Sidebar -->
    <Transition name="slide-left">
      <div v-if="showChapters" class="absolute left-0 top-0 bottom-0 z-10 w-72 overflow-y-auto p-6 bg-card border-r border-border shadow-xl">
        <h2 class="text-sm font-display font-bold text-muted-foreground uppercase tracking-wider mb-4">章节目录</h2>
        <div class="space-y-1">
          <div v-for="ch in chapters" :key="ch.id"
            class="text-sm py-2 px-3 rounded-xl cursor-pointer transition-all duration-200"
            :class="ch.chapterNumber === currentChapterNum
              ? 'bg-accent/10 text-accent font-medium'
              : 'text-foreground hover:bg-muted'"
            @click="loadChapter(ch.chapterNumber); showChapters = false">
            {{ ch.title }}
          </div>
        </div>
      </div>
    </Transition>

    <!-- Settings Sidebar -->
    <Transition name="slide-right">
      <div v-if="showSettings" class="absolute right-0 top-0 bottom-0 z-10 w-64 overflow-y-auto p-6 bg-card border-l border-border shadow-xl">
        <h3 class="text-sm font-display font-bold text-muted-foreground uppercase tracking-wider mb-4">设置</h3>
        <div class="space-y-5">
          <div>
            <label class="text-xs font-medium text-muted-foreground mb-2 block">字体大小: {{ fontSize }}px</label>
            <input v-model.number="fontSize" type="range" min="12" max="24" class="w-full accent-accent" />
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground mb-2 block">行高: {{ lineHeight }}</label>
            <input v-model.number="lineHeight" type="range" min="1.2" max="2.5" step="0.1" class="w-full accent-accent" />
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground mb-2 block">技术/小说比例: {{ techRatio }}:1</label>
            <input v-model.number="techRatio" type="range" min="1" max="5" step="1" class="w-full accent-accent" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Reading Area -->
    <main class="h-full overflow-y-auto p-8" ref="readerRef">
      <div v-if="currentChapter" class="max-w-3xl mx-auto">
        <!-- Tech Article Header (disguise) -->
        <h1 class="text-2xl font-display font-bold text-foreground mb-2">{{ techTitle }}</h1>
        <div class="flex items-center gap-3 mb-8 text-xs text-muted-foreground">
          <span>{{ techAuthor }}</span>
          <span>{{ techDate }}</span>
          <span class="px-2 py-0.5 rounded-lg bg-accent/10 text-accent font-medium">{{ techTag }}</span>
        </div>

        <!-- Interleaved Content -->
        <div :style="{ fontSize: fontSize + 'px', lineHeight: lineHeight }">
          <template v-for="(line, i) in displayLines" :key="i">
            <!-- Tech Image -->
            <div v-if="line.type === 'image'" class="my-6">
              <div class="rounded-2xl overflow-hidden border border-border shadow-sm">
                <svg :viewBox="line.viewBox" class="w-full" style="background: rgba(0,82,255,0.02)">
                  <g v-html="line.svgContent"></g>
                </svg>
              </div>
              <p class="text-xs text-center mt-2 text-muted-foreground">{{ line.caption }}</p>
            </div>
            <!-- Tech Code Block -->
            <div v-else-if="line.type === 'code-block'" class="my-4 rounded-2xl overflow-hidden border border-border shadow-sm">
              <div class="px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border font-mono">{{ line.lang }}</div>
              <pre class="px-4 py-3 text-xs overflow-x-auto text-accent font-mono leading-relaxed" style="background: rgba(0,82,255,0.03)">{{ line.text }}</pre>
            </div>
            <!-- Tech Line -->
            <div v-else-if="line.type === 'tech'" class="py-1 text-foreground leading-relaxed">
              <span v-if="line.isCode" class="font-mono px-2 py-0.5 rounded-lg bg-muted text-accent text-[0.9em]">{{ line.text }}</span>
              <span v-else>{{ line.text }}</span>
            </div>
            <!-- Tech Heading -->
            <div v-else-if="line.type === 'tech-heading'" class="mt-5 mb-2 font-display font-semibold text-foreground">
              {{ line.text }}
            </div>
            <!-- Novel Line -->
            <div v-else class="py-0.5 text-foreground leading-relaxed">
              {{ line.text }}
            </div>
          </template>
        </div>

        <!-- Chapter Navigation -->
        <div class="flex justify-between mt-10 pt-6 border-t border-border">
          <button v-if="currentChapterNum > 1" @click="loadChapter(currentChapterNum - 1)"
            class="btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            上一章
          </button>
          <button v-if="currentChapterNum < totalChapters" @click="loadChapter(currentChapterNum + 1)"
            class="btn-primary ml-auto">
            下一章
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { get, put } from '@shared/api/client'
import type { Chapter } from '@shared/types'

const route = useRoute()
const novelId = computed(() => route.params.id as string)

const chapters = ref<Array<{ id: string; chapterNumber: number; title: string; wordCount: number }>>([])
const currentChapter = ref<Chapter | null>(null)
const currentChapterNum = ref(1)
const totalChapters = computed(() => chapters.value.length)
const fontSize = ref(16)
const lineHeight = ref(1.8)
const techRatio = ref(2)
const showChapters = ref(false)
const showSettings = ref(false)
const readerRef = ref<HTMLElement | null>(null)
const scrollPercent = ref(0)

const progressPercent = computed(() => {
  if (totalChapters.value === 0) return 0
  const chapterProgress = (currentChapterNum.value - 1) / totalChapters.value
  const chapterWeight = 1 / totalChapters.value
  return (chapterProgress + chapterWeight * scrollPercent.value / 100) * 100
})

const techPairs = [
  { code: '// 基于响应式原理的状态管理方案', text: '在Vue3中，ref和reactive的底层实现均基于Proxy代理机制，通过track与trigger函数实现依赖收集与派发更新。' },
  { code: 'const state = reactive({ count: 0 })', text: '当state.count发生变化时，自动触发相关副作用函数重新执行，无需手动订阅。' },
  { code: 'watchEffect(() => { console.log(state.count) })', text: '这种设计模式与Redux的单向数据流有本质区别，Vue3天然支持细粒度更新。' },
  { code: 'interface Store<T> { getState: () => T }', text: '在组合式API中，推荐使用composables封装可复用逻辑，保持代码组织清晰。' },
  { code: 'export function createStore<T>(initial: T)', text: 'TypeScript的类型推导在此场景下能提供完整的类型安全，减少运行时错误。' },
  { code: 'async function fetchData<T>(url: string): Promise<T>', text: '通过泛型约束，确保API响应数据结构的类型正确性，编译期即可发现不匹配。' },
  { code: 'const middleware = (ctx, next) => { await next() }', text: '中间件模式的洋葱模型在Koa中得到了经典应用，请求和响应各执行一半。' },
  { code: 'app.use(cors({ origin: whitelist }))', text: '跨域配置需严格限制白名单，避免安全风险，生产环境禁止使用通配符。' },
  { code: 'const cache = new Map<string, CacheEntry>()', text: 'LRU缓存策略在高频读取场景下可显著提升性能，需合理设置过期时间。' },
  { code: 'function debounce<T extends (...args: any[]) => void>', text: '防抖与节流是前端性能优化的基础手段，搜索输入和滚动事件中必不可少。' },
  { code: 'await prisma.user.findMany({ where: { role } })', text: 'Prisma的类型安全查询构建器消除了SQL注入风险，同时提供自动补全。' },
  { code: 'const stream = readable.pipe(transform).pipe(writable)', text: 'Node.js流式处理在大文件场景下内存占用恒定，避免OOM问题。' },
  { code: 'docker compose -f dev.yml up --build', text: '容器化部署确保开发与生产环境的一致性，消除"在我机器上能跑"的问题。' },
  { code: 'const router = createRouter({ history, routes })', text: 'Vue Router 4支持动态路由和导航守卫，结合Pinia可实现权限控制。' },
  { code: 'const { data, error } = await useFetch("/api/users")', text: 'Nuxt3的auto-fetch组合式函数简化了数据获取，自动处理加载和错误状态。' },
  { code: 'test("should render", () => { render(Component) })', text: 'Vitest + Testing Library的组合提供了快速的单元测试和DOM断言能力。' },
  { code: 'const schema = z.object({ name: z.string() })', text: 'Zod的运行时类型验证与TypeScript静态类型完美互补，确保数据边界安全。' },
  { code: 'export default defineConfig({ plugins: [vue()] })', text: 'Vite的ESM原生导入机制使开发服务器启动速度比Webpack快10-100倍。' },
  { code: 'const worker = new Worker("./worker.ts")', text: 'Web Worker将CPU密集型计算移至后台线程，避免阻塞主线程渲染。' },
  { code: 'ctx.drawImage(canvas, 0, 0, w, h)', text: 'Canvas 2D的离屏渲染技术可实现高性能的图表和动画效果。' },
]

const techHeadings = [
  '响应式系统设计',
  '类型安全实践',
  '性能优化策略',
  '架构设计模式',
  '工程化配置',
  '测试与质量保障',
  '部署与运维',
  '数据流管理',
]

const techCodeBlocks = [
  { lang: 'typescript', code: `import { ref, computed, watch } from 'vue'\n\nexport function useCounter(initial = 0) {\n  const count = ref(initial)\n  const doubled = computed(() => count.value * 2)\n  const increment = () => count.value++\n  watch(count, (v) => console.log('count:', v))\n  return { count, doubled, increment }\n}` },
  { lang: 'typescript', code: `interface ApiResponse<T> {\n  code: number\n  data: T | null\n  message: string\n}\n\nasync function request<T>(url: string): Promise<ApiResponse<T>> {\n  const res = await fetch(url)\n  return res.json()\n}` },
  { lang: 'typescript', code: `class EventBus {\n  private events = new Map<string, Set<Function>>()\n  on(event: string, fn: Function) {\n    this.events.get(event)?.add(fn)\n  }\n  emit(event: string, ...args: any[]) {\n    this.events.get(event)?.forEach(fn => fn(...args))\n  }\n}` },
  { lang: 'sql', code: `SELECT u.id, u.name, COUNT(p.id) as posts\nFROM users u\nLEFT JOIN posts p ON p.author_id = u.id\nWHERE u.role = 'admin'\nGROUP BY u.id, u.name\nHAVING COUNT(p.id) > 10\nORDER BY posts DESC` },
  { lang: 'yaml', code: `services:\n  api:\n    build: ./server\n    ports: ["3000:3000"]\n    environment:\n      DATABASE_URL: postgres://db:5432\n    depends_on: [db, redis]\n  db:\n    image: postgres:15-alpine` },
  { lang: 'typescript', code: `const schema = z.object({\n  email: z.string().email(),\n  password: z.string().min(8),\n  role: z.enum(['admin', 'user']),\n})\ntype Form = z.infer<typeof schema>` },
]

const techImages = [
  {
    viewBox: '0 0 600 200',
    svgContent: `
      <rect x="10" y="60" width="120" height="60" rx="12" fill="rgba(0,82,255,0.05)" stroke="#0052FF" stroke-width="1.5"/>
      <text x="70" y="95" text-anchor="middle" font-size="12" fill="#0052FF">Client</text>
      <line x1="130" y1="90" x2="200" y2="90" stroke="#e5e7eb" stroke-width="1.5" marker-end="url(#arrow)"/>
      <rect x="200" y="60" width="120" height="60" rx="12" fill="rgba(0,82,255,0.05)" stroke="#4D7CFF" stroke-width="1.5"/>
      <text x="260" y="95" text-anchor="middle" font-size="12" fill="#4D7CFF">API Server</text>
      <line x1="320" y1="90" x2="390" y2="90" stroke="#e5e7eb" stroke-width="1.5" marker-end="url(#arrow)"/>
      <rect x="390" y="60" width="120" height="60" rx="12" fill="rgba(16,185,129,0.05)" stroke="#10b981" stroke-width="1.5"/>
      <text x="450" y="95" text-anchor="middle" font-size="12" fill="#10b981">Database</text>
      <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#e5e7eb"/></marker></defs>
    `,
    caption: '图1: 三层架构数据流向',
  },
  {
    viewBox: '0 0 600 220',
    svgContent: `
      <rect x="220" y="10" width="160" height="45" rx="10" fill="rgba(0,82,255,0.05)" stroke="#0052FF" stroke-width="1.5"/>
      <text x="300" y="38" text-anchor="middle" font-size="11" fill="#0052FF">Vue Component</text>
      <line x1="300" y1="55" x2="300" y2="80" stroke="#e5e7eb" stroke-width="1.5"/>
      <rect x="140" y="80" width="140" height="45" rx="10" fill="rgba(77,124,255,0.05)" stroke="#4D7CFF" stroke-width="1.5"/>
      <text x="210" y="108" text-anchor="middle" font-size="11" fill="#4D7CFF">Composable</text>
      <rect x="320" y="80" width="140" height="45" rx="10" fill="rgba(77,124,255,0.05)" stroke="#4D7CFF" stroke-width="1.5"/>
      <text x="390" y="108" text-anchor="middle" font-size="11" fill="#4D7CFF">Pinia Store</text>
      <line x1="300" y1="55" x2="210" y2="80" stroke="#e5e7eb" stroke-width="1.5"/>
      <line x1="300" y1="55" x2="390" y2="80" stroke="#e5e7eb" stroke-width="1.5"/>
      <line x1="210" y1="125" x2="210" y2="150" stroke="#e5e7eb" stroke-width="1.5"/>
      <line x1="390" y1="125" x2="390" y2="150" stroke="#e5e7eb" stroke-width="1.5"/>
      <rect x="100" y="150" width="140" height="45" rx="10" fill="rgba(16,185,129,0.05)" stroke="#10b981" stroke-width="1.5"/>
      <text x="170" y="178" text-anchor="middle" font-size="11" fill="#10b981">API Client</text>
      <rect x="320" y="150" width="140" height="45" rx="10" fill="rgba(245,158,11,0.05)" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="390" y="178" text-anchor="middle" font-size="11" fill="#f59e0b">Cache Layer</text>
    `,
    caption: '图2: 前端状态管理架构',
  },
  {
    viewBox: '0 0 600 180',
    svgContent: `
      <rect x="20" y="30" width="100" height="50" rx="8" fill="rgba(77,124,255,0.05)" stroke="#4D7CFF" stroke-width="1"/>
      <text x="70" y="60" text-anchor="middle" font-size="10" fill="#4D7CFF">Vite Dev</text>
      <rect x="20" y="100" width="100" height="50" rx="8" fill="rgba(77,124,255,0.05)" stroke="#4D7CFF" stroke-width="1"/>
      <text x="70" y="130" text-anchor="middle" font-size="10" fill="#4D7CFF">Vite Build</text>
      <line x1="120" y1="55" x2="180" y2="80" stroke="#e5e7eb" stroke-width="1.5"/>
      <line x1="120" y1="125" x2="180" y2="100" stroke="#e5e7eb" stroke-width="1.5"/>
      <rect x="180" y="60" width="120" height="60" rx="12" fill="rgba(0,82,255,0.05)" stroke="#0052FF" stroke-width="1.5"/>
      <text x="240" y="95" text-anchor="middle" font-size="11" fill="#0052FF">CI/CD Pipeline</text>
      <line x1="300" y1="90" x2="360" y2="90" stroke="#e5e7eb" stroke-width="1.5"/>
      <rect x="360" y="60" width="100" height="60" rx="12" fill="rgba(16,185,129,0.05)" stroke="#10b981" stroke-width="1.5"/>
      <text x="410" y="85" text-anchor="middle" font-size="10" fill="#10b981">Docker</text>
      <text x="410" y="100" text-anchor="middle" font-size="10" fill="#10b981">Image</text>
      <line x1="460" y1="90" x2="520" y2="90" stroke="#e5e7eb" stroke-width="1.5"/>
      <rect x="520" y="60" width="70" height="60" rx="12" fill="rgba(245,158,11,0.05)" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="555" y="95" text-anchor="middle" font-size="10" fill="#f59e0b">K8s</text>
    `,
    caption: '图3: CI/CD部署流水线',
  },
  {
    viewBox: '0 0 600 200',
    svgContent: `
      <circle cx="300" cy="100" r="80" fill="none" stroke="#4D7CFF" stroke-width="1.5" stroke-dasharray="4 2"/>
      <circle cx="300" cy="100" r="50" fill="none" stroke="#0052FF" stroke-width="1.5" stroke-dasharray="4 2"/>
      <circle cx="300" cy="100" r="20" fill="rgba(0,82,255,0.05)" stroke="#0052FF" stroke-width="1.5"/>
      <text x="300" y="105" text-anchor="middle" font-size="9" fill="#0052FF">Core</text>
      <rect x="260" y="10" width="80" height="25" rx="6" fill="rgba(77,124,255,0.05)" stroke="#4D7CFF" stroke-width="1"/>
      <text x="300" y="27" text-anchor="middle" font-size="9" fill="#4D7CFF">Plugin A</text>
      <rect x="420" y="85" width="80" height="25" rx="6" fill="rgba(77,124,255,0.05)" stroke="#4D7CFF" stroke-width="1"/>
      <text x="460" y="102" text-anchor="middle" font-size="9" fill="#4D7CFF">Plugin B</text>
      <rect x="260" y="165" width="80" height="25" rx="6" fill="rgba(77,124,255,0.05)" stroke="#4D7CFF" stroke-width="1"/>
      <text x="300" y="182" text-anchor="middle" font-size="9" fill="#4D7CFF">Plugin C</text>
      <rect x="100" y="85" width="80" height="25" rx="6" fill="rgba(77,124,255,0.05)" stroke="#4D7CFF" stroke-width="1"/>
      <text x="140" y="102" text-anchor="middle" font-size="9" fill="#4D7CFF">Plugin D</text>
    `,
    caption: '图4: 插件化架构设计',
  },
]

const techTitle = computed(() => {
  if (!currentChapter.value) return ''
  const titles = [
    '深入理解响应式系统的设计与实现',
    '基于TypeScript的泛型编程模式详解',
    '前端状态管理方案对比与最佳实践',
    'Node.js高并发架构中的流式处理优化',
    'Vue3组合式API的设计哲学与工程实践',
    '从Proxy到Reflect：JavaScript元编程指南',
    'Prisma ORM类型安全查询深度解析',
    '微前端架构下的模块联邦方案落地',
  ]
  return titles[currentChapterNum.value % titles.length]
})

const techAuthor = '前端架构组'
const techDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})
const techTag = computed(() => {
  const tags = ['Vue3', 'TypeScript', 'Node.js', '架构', '性能优化', 'React', 'Prisma', '微前端']
  return tags[currentChapterNum.value % tags.length]
})

interface DisplayLine {
  type: 'tech' | 'novel' | 'code-block' | 'tech-heading' | 'image'
  text: string
  isCode?: boolean
  lang?: string
  viewBox?: string
  svgContent?: string
  caption?: string
}

const displayLines = computed<DisplayLine[]>(() => {
  if (!currentChapter.value?.content) return []

  const novelContent = currentChapter.value.content
  const novelLines = novelContent.split('\n').filter(l => l.trim())
  const result: DisplayLine[] = []
  let techIdx = 0
  let headingIdx = 0
  let codeBlockIdx = 0
  let imageIdx = 0

  const novelInterval = 1

  for (let i = 0; i < novelLines.length; i++) {
    if (i > 0 && i % novelInterval === 0) {
      for (let t = 0; t < techRatio.value; t++) {
        const cyclePos = techIdx % 8

        if (cyclePos === 0) {
          result.push({ type: 'tech-heading', text: techHeadings[headingIdx % techHeadings.length] })
          headingIdx++
        } else if (cyclePos === 1 || cyclePos === 2) {
          const pair = techPairs[techIdx % techPairs.length]
          result.push({ type: 'tech', text: pair.code, isCode: true })
          result.push({ type: 'tech', text: pair.text, isCode: false })
        } else if (cyclePos === 4) {
          const block = techCodeBlocks[codeBlockIdx % techCodeBlocks.length]
          result.push({ type: 'code-block', text: block.code, lang: block.lang })
          codeBlockIdx++
        } else if (cyclePos === 6) {
          const img = techImages[imageIdx % techImages.length]
          result.push({ type: 'image', viewBox: img.viewBox, svgContent: img.svgContent, caption: img.caption })
          imageIdx++
        } else {
          const pair = techPairs[techIdx % techPairs.length]
          result.push({ type: 'tech', text: pair.code, isCode: true })
          result.push({ type: 'tech', text: pair.text, isCode: false })
        }
        techIdx++
      }
    }
    result.push({ type: 'novel', text: novelLines[i] })
  }

  return result
})

async function fetchChapters() {
  const res = await get<Chapter[]>(`/novels/${novelId.value}/chapters`)
  if (res.code === 200 && res.data) {
    chapters.value = res.data as any
  }
}

async function loadChapter(num: number, savedScrollPosition?: number) {
  const res = await get<Chapter>(`/novels/${novelId.value}/chapters/${num}`)
  if (res.code === 200 && res.data) {
    currentChapter.value = res.data
    currentChapterNum.value = num
    scrollPercent.value = 0
    if (readerRef.value) {
      readerRef.value.scrollTop = savedScrollPosition || 0
    }
  }
}

let saveProgressTimer: ReturnType<typeof setTimeout> | null = null

function saveProgress() {
  if (!currentChapter.value?.id || !readerRef.value) return
  if (saveProgressTimer) clearTimeout(saveProgressTimer)
  
  saveProgressTimer = setTimeout(() => {
    const scrollPosition = readerRef.value?.scrollTop || 0
    put(`/novels/${novelId.value}/progress`, { 
      chapterId: currentChapter.value!.id, 
      scrollPosition 
    })
  }, 500)
}

function handlePageClick(e: MouseEvent) {
  if (showChapters.value || showSettings.value) return
  const target = e.target as HTMLElement
  if (target.closest('button')) return

  const width = window.innerWidth
  const x = e.clientX
  const edgeWidth = width * 0.15

  if (x < edgeWidth && currentChapterNum.value > 1) {
    saveProgress()
    loadChapter(currentChapterNum.value - 1)
  } else if (x > width - edgeWidth && currentChapterNum.value < totalChapters.value) {
    saveProgress()
    loadChapter(currentChapterNum.value + 1)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (showChapters.value || showSettings.value) return
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

  if (e.key === 'ArrowLeft' && currentChapterNum.value > 1) {
    saveProgress()
    loadChapter(currentChapterNum.value - 1)
  } else if (e.key === 'ArrowRight' && currentChapterNum.value < totalChapters.value) {
    saveProgress()
    loadChapter(currentChapterNum.value + 1)
  } else if (e.key === ' ' && currentChapterNum.value < totalChapters.value) {
    e.preventDefault()
    saveProgress()
    loadChapter(currentChapterNum.value + 1)
  }
}

function handleScroll() {
  if (!readerRef.value) return
  const el = readerRef.value
  scrollPercent.value = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 || 0

  saveProgress()

  if (scrollPercent.value > 95 && currentChapterNum.value < totalChapters.value) {
    saveProgress()
    loadChapter(currentChapterNum.value + 1)
  }
}

onMounted(async () => {
  await fetchChapters()
  const progressRes = await get<any>(`/novels/${novelId.value}/progress`)
  if (progressRes.code === 200 && progressRes.data) {
    const chNum = chapters.value.find(c => c.id === progressRes.data.currentChapterId)?.chapterNumber || 1
    await loadChapter(chNum, progressRes.data.currentScrollPosition || 0)
  } else if (chapters.value.length > 0) {
    await loadChapter(1)
  }

  window.addEventListener('keydown', handleKeydown)
  if (readerRef.value) {
    readerRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (saveProgressTimer) clearTimeout(saveProgressTimer)
  saveProgress()
})
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
