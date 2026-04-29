<template>
  <div class="relative h-full" style="background: #fff">
    <!-- 浮动工具栏 -->
    <div class="absolute top-3 right-3 z-20 flex items-center gap-1.5">
      <button @click="showChapters = !showChapters"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all duration-150"
        :style="showChapters ? 'background: #FC5531; color: white' : 'background: #f4f5f5; color: #555666'"
        :title="showChapters ? '隐藏目录' : '显示目录'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
      </button>
      <button @click="showSettings = !showSettings"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all duration-150"
        :style="showSettings ? 'background: #FC5531; color: white' : 'background: #f4f5f5; color: #555666'"
        title="设置">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V15a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
      </button>
    </div>

    <!-- 章节目录 - 浮动面板 -->
    <Transition name="slide-left">
      <div v-if="showChapters" class="absolute left-0 top-0 bottom-0 z-10 w-64 overflow-y-auto p-4 shadow-lg" style="background: #fff; border-right: 1px solid #e8e8ed">
        <h2 class="text-sm font-bold text-gray-500 uppercase mb-3">章节目录</h2>
        <div v-for="ch in chapters" :key="ch.id"
          class="text-sm py-1.5 px-2 rounded cursor-pointer"
          :class="ch.chapterNumber === currentChapterNum ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'"
          @click="loadChapter(ch.chapterNumber); showChapters = false">
          {{ ch.title }}
        </div>
      </div>
    </Transition>

    <!-- 设置面板 - 浮动面板 -->
    <Transition name="slide-right">
      <div v-if="showSettings" class="absolute right-0 top-0 bottom-0 z-10 w-56 overflow-y-auto p-4 shadow-lg" style="background: #fff; border-left: 1px solid #e8e8ed">
        <h3 class="text-sm font-bold text-gray-500 uppercase mb-3">设置</h3>
        <div class="space-y-4">
          <div>
            <label class="text-xs text-gray-500">字体大小: {{ fontSize }}px</label>
            <input v-model.number="fontSize" type="range" min="12" max="24" class="w-full" />
          </div>
          <div>
            <label class="text-xs text-gray-500">行高: {{ lineHeight }}</label>
            <input v-model.number="lineHeight" type="range" min="1.2" max="2.5" step="0.1" class="w-full" />
          </div>
          <div>
            <label class="text-xs text-gray-500">技术/小说比例: {{ techRatio }}:1</label>
            <input v-model.number="techRatio" type="range" min="1" max="5" step="1" class="w-full" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- 阅读区域 - 技术文章+小说交替显示 -->
    <main class="h-full overflow-y-auto p-8" ref="readerRef">
      <div v-if="currentChapter" class="max-w-3xl mx-auto">
        <!-- 技术文章标题区 -->
        <h1 class="text-xl font-bold mb-2" style="color: #222226">{{ techTitle }}</h1>
        <div class="flex items-center gap-3 mb-6 text-xs" style="color: #999aaa">
          <span>{{ techAuthor }}</span>
          <span>{{ techDate }}</span>
          <span class="px-1.5 py-0.5 rounded" style="background: #f0f7ff; color: #3178c6">{{ techTag }}</span>
        </div>

        <!-- 交替内容区域 -->
        <div :style="{ fontSize: fontSize + 'px', lineHeight: lineHeight }">
          <template v-for="(line, i) in displayLines" :key="i">
            <!-- 技术图片 -->
            <div v-if="line.type === 'image'" class="my-4">
              <div class="rounded-lg overflow-hidden" style="border: 1px solid #e8e8ed">
                <svg :viewBox="line.viewBox" class="w-full" style="background: #f9fafb">
                  <g v-html="line.svgContent"></g>
                </svg>
              </div>
              <p class="text-xs text-center mt-1.5" style="color: #999aaa">{{ line.caption }}</p>
            </div>
            <!-- 技术代码块 -->
            <div v-else-if="line.type === 'code-block'" class="my-3 rounded-lg overflow-hidden" style="border: 1px solid #e8e8ed">
              <div class="px-3 py-1.5 text-[10px] uppercase tracking-wider" style="background: #f4f5f5; color: #999aaa; border-bottom: 1px solid #e8e8ed">{{ line.lang }}</div>
              <pre class="px-3 py-2.5 text-xs overflow-x-auto" style="background: #f9fafb; color: #3178c6; font-family: 'Consolas', 'Courier New', monospace; line-height: 1.6">{{ line.text }}</pre>
            </div>
            <!-- 技术文章行 -->
            <div v-else-if="line.type === 'tech'" class="py-1" style="color: #222226; line-height: 1.8">
              <span v-if="line.isCode" class="font-mono px-1.5 py-0.5 rounded" style="background: #f4f5f5; color: #3178c6; font-size: 0.9em">{{ line.text }}</span>
              <span v-else>{{ line.text }}</span>
            </div>
            <!-- 技术小标题 -->
            <div v-else-if="line.type === 'tech-heading'" class="mt-4 mb-2 font-semibold" style="color: #222226">
              {{ line.text }}
            </div>
            <!-- 小说内容行 -->
            <div v-else class="py-0.5" style="color: #222226">
              {{ line.text }}
            </div>
          </template>
        </div>

        <!-- 章节导航 -->
        <div class="flex justify-between mt-8">
          <button v-if="currentChapterNum > 1" @click="loadChapter(currentChapterNum - 1)" class="px-4 py-2 text-sm rounded-lg" style="color: #FC5531" onmouseenter="this.style.background='#fff5f2'" onmouseleave="this.style.background='transparent'">上一章</button>
          <button v-if="currentChapterNum < totalChapters" @click="loadChapter(currentChapterNum + 1)" class="px-4 py-2 text-sm rounded-lg ml-auto" style="color: #FC5531" onmouseenter="this.style.background='#fff5f2'" onmouseleave="this.style.background='transparent'">下一章</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
const techRatio = ref(2) // 技术行数:小说行数 = 2:1
const showChapters = ref(false)
const showSettings = ref(false)
const readerRef = ref<HTMLElement | null>(null)

// 技术文章伪装数据 - 代码+解释成对出现
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

// 技术小标题
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

// 技术代码块
const techCodeBlocks = [
  { lang: 'typescript', code: `import { ref, computed, watch } from 'vue'\n\nexport function useCounter(initial = 0) {\n  const count = ref(initial)\n  const doubled = computed(() => count.value * 2)\n  const increment = () => count.value++\n  watch(count, (v) => console.log('count:', v))\n  return { count, doubled, increment }\n}` },
  { lang: 'typescript', code: `interface ApiResponse<T> {\n  code: number\n  data: T | null\n  message: string\n}\n\nasync function request<T>(url: string): Promise<ApiResponse<T>> {\n  const res = await fetch(url)\n  return res.json()\n}` },
  { lang: 'typescript', code: `class EventBus {\n  private events = new Map<string, Set<Function>>()\n  on(event: string, fn: Function) {\n    this.events.get(event)?.add(fn)\n  }\n  emit(event: string, ...args: any[]) {\n    this.events.get(event)?.forEach(fn => fn(...args))\n  }\n}` },
  { lang: 'sql', code: `SELECT u.id, u.name, COUNT(p.id) as posts\nFROM users u\nLEFT JOIN posts p ON p.author_id = u.id\nWHERE u.role = 'admin'\nGROUP BY u.id, u.name\nHAVING COUNT(p.id) > 10\nORDER BY posts DESC` },
  { lang: 'yaml', code: `services:\n  api:\n    build: ./server\n    ports: ["3000:3000"]\n    environment:\n      DATABASE_URL: postgres://db:5432\n    depends_on: [db, redis]\n  db:\n    image: postgres:15-alpine` },
  { lang: 'typescript', code: `const schema = z.object({\n  email: z.string().email(),\n  password: z.string().min(8),\n  role: z.enum(['admin', 'user']),\n})\ntype Form = z.infer<typeof schema>` },
]

// 技术性SVG图片 - 架构图/流程图
const techImages = [
  {
    viewBox: '0 0 600 200',
    svgContent: `
      <rect x="10" y="60" width="120" height="60" rx="8" fill="#fff5f2" stroke="#FC5531" stroke-width="1.5"/>
      <text x="70" y="95" text-anchor="middle" font-size="12" fill="#FC5531">Client</text>
      <line x1="130" y1="90" x2="200" y2="90" stroke="#e8e8ed" stroke-width="1.5" marker-end="url(#arrow)"/>
      <rect x="200" y="60" width="120" height="60" rx="8" fill="#f0f7ff" stroke="#3178c6" stroke-width="1.5"/>
      <text x="260" y="95" text-anchor="middle" font-size="12" fill="#3178c6">API Server</text>
      <line x1="320" y1="90" x2="390" y2="90" stroke="#e8e8ed" stroke-width="1.5" marker-end="url(#arrow)"/>
      <rect x="390" y="60" width="120" height="60" rx="8" fill="#f0f9eb" stroke="#67c23a" stroke-width="1.5"/>
      <text x="450" y="95" text-anchor="middle" font-size="12" fill="#67c23a">Database</text>
      <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#e8e8ed"/></marker></defs>
    `,
    caption: '图1: 三层架构数据流向',
  },
  {
    viewBox: '0 0 600 220',
    svgContent: `
      <rect x="220" y="10" width="160" height="45" rx="8" fill="#fff5f2" stroke="#FC5531" stroke-width="1.5"/>
      <text x="300" y="38" text-anchor="middle" font-size="11" fill="#FC5531">Vue Component</text>
      <line x1="300" y1="55" x2="300" y2="80" stroke="#e8e8ed" stroke-width="1.5"/>
      <rect x="140" y="80" width="140" height="45" rx="8" fill="#f0f7ff" stroke="#3178c6" stroke-width="1.5"/>
      <text x="210" y="108" text-anchor="middle" font-size="11" fill="#3178c6">Composable</text>
      <rect x="320" y="80" width="140" height="45" rx="8" fill="#f0f7ff" stroke="#3178c6" stroke-width="1.5"/>
      <text x="390" y="108" text-anchor="middle" font-size="11" fill="#3178c6">Pinia Store</text>
      <line x1="300" y1="55" x2="210" y2="80" stroke="#e8e8ed" stroke-width="1.5"/>
      <line x1="300" y1="55" x2="390" y2="80" stroke="#e8e8ed" stroke-width="1.5"/>
      <line x1="210" y1="125" x2="210" y2="150" stroke="#e8e8ed" stroke-width="1.5"/>
      <line x1="390" y1="125" x2="390" y2="150" stroke="#e8e8ed" stroke-width="1.5"/>
      <rect x="100" y="150" width="140" height="45" rx="8" fill="#f0f9eb" stroke="#67c23a" stroke-width="1.5"/>
      <text x="170" y="178" text-anchor="middle" font-size="11" fill="#67c23a">API Client</text>
      <rect x="320" y="150" width="140" height="45" rx="8" fill="#fdf6ec" stroke="#e6a23c" stroke-width="1.5"/>
      <text x="390" y="178" text-anchor="middle" font-size="11" fill="#e6a23c">Cache Layer</text>
    `,
    caption: '图2: 前端状态管理架构',
  },
  {
    viewBox: '0 0 600 180',
    svgContent: `
      <rect x="20" y="30" width="100" height="50" rx="6" fill="#f0f7ff" stroke="#3178c6" stroke-width="1"/>
      <text x="70" y="60" text-anchor="middle" font-size="10" fill="#3178c6">Vite Dev</text>
      <rect x="20" y="100" width="100" height="50" rx="6" fill="#f0f7ff" stroke="#3178c6" stroke-width="1"/>
      <text x="70" y="130" text-anchor="middle" font-size="10" fill="#3178c6">Vite Build</text>
      <line x1="120" y1="55" x2="180" y2="80" stroke="#e8e8ed" stroke-width="1.5"/>
      <line x1="120" y1="125" x2="180" y2="100" stroke="#e8e8ed" stroke-width="1.5"/>
      <rect x="180" y="60" width="120" height="60" rx="8" fill="#fff5f2" stroke="#FC5531" stroke-width="1.5"/>
      <text x="240" y="95" text-anchor="middle" font-size="11" fill="#FC5531">CI/CD Pipeline</text>
      <line x1="300" y1="90" x2="360" y2="90" stroke="#e8e8ed" stroke-width="1.5"/>
      <rect x="360" y="60" width="100" height="60" rx="8" fill="#f0f9eb" stroke="#67c23a" stroke-width="1.5"/>
      <text x="410" y="85" text-anchor="middle" font-size="10" fill="#67c23a">Docker</text>
      <text x="410" y="100" text-anchor="middle" font-size="10" fill="#67c23a">Image</text>
      <line x1="460" y1="90" x2="520" y2="90" stroke="#e8e8ed" stroke-width="1.5"/>
      <rect x="520" y="60" width="70" height="60" rx="8" fill="#fdf6ec" stroke="#e6a23c" stroke-width="1.5"/>
      <text x="555" y="95" text-anchor="middle" font-size="10" fill="#e6a23c">K8s</text>
    `,
    caption: '图3: CI/CD部署流水线',
  },
  {
    viewBox: '0 0 600 200',
    svgContent: `
      <circle cx="300" cy="100" r="80" fill="none" stroke="#3178c6" stroke-width="1.5" stroke-dasharray="4 2"/>
      <circle cx="300" cy="100" r="50" fill="none" stroke="#FC5531" stroke-width="1.5" stroke-dasharray="4 2"/>
      <circle cx="300" cy="100" r="20" fill="#fff5f2" stroke="#FC5531" stroke-width="1.5"/>
      <text x="300" y="105" text-anchor="middle" font-size="9" fill="#FC5531">Core</text>
      <rect x="260" y="10" width="80" height="25" rx="4" fill="#f0f7ff" stroke="#3178c6" stroke-width="1"/>
      <text x="300" y="27" text-anchor="middle" font-size="9" fill="#3178c6">Plugin A</text>
      <rect x="420" y="85" width="80" height="25" rx="4" fill="#f0f7ff" stroke="#3178c6" stroke-width="1"/>
      <text x="460" y="102" text-anchor="middle" font-size="9" fill="#3178c6">Plugin B</text>
      <rect x="260" y="165" width="80" height="25" rx="4" fill="#f0f7ff" stroke="#3178c6" stroke-width="1"/>
      <text x="300" y="182" text-anchor="middle" font-size="9" fill="#3178c6">Plugin C</text>
      <rect x="100" y="85" width="80" height="25" rx="4" fill="#f0f7ff" stroke="#3178c6" stroke-width="1"/>
      <text x="140" y="102" text-anchor="middle" font-size="9" fill="#3178c6">Plugin D</text>
    `,
    caption: '图4: 插件化架构设计',
  },
]

// 伪装标题/作者/日期
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

// 将小说内容与技术文章交替排列，技术内容占比为小说的 techRatio 倍
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

  // 每隔 novelInterval 行小说，插入 techRatio 行技术内容
  // novelInterval = 1 表示每1行小说后插入techRatio行技术内容
  const novelInterval = 1

  for (let i = 0; i < novelLines.length; i++) {
    // 每隔 novelInterval 行小说，插入技术内容块
    if (i > 0 && i % novelInterval === 0) {
      // 插入 techRatio 行技术内容
      for (let t = 0; t < techRatio.value; t++) {
        // 每8行技术内容中：1行小标题 + 2行代码+解释 + 1行代码块 + 1行图片
        const cyclePos = techIdx % 8

        if (cyclePos === 0) {
          // 技术小标题
          result.push({ type: 'tech-heading', text: techHeadings[headingIdx % techHeadings.length] })
          headingIdx++
        } else if (cyclePos === 1 || cyclePos === 2) {
          // 代码+解释对
          const pair = techPairs[techIdx % techPairs.length]
          result.push({ type: 'tech', text: pair.code, isCode: true })
          result.push({ type: 'tech', text: pair.text, isCode: false })
        } else if (cyclePos === 4) {
          // 代码块
          const block = techCodeBlocks[codeBlockIdx % techCodeBlocks.length]
          result.push({ type: 'code-block', text: block.code, lang: block.lang })
          codeBlockIdx++
        } else if (cyclePos === 6) {
          // 技术图片
          const img = techImages[imageIdx % techImages.length]
          result.push({ type: 'image', viewBox: img.viewBox, svgContent: img.svgContent, caption: img.caption })
          imageIdx++
        } else {
          // 普通技术行
          const pair = techPairs[techIdx % techPairs.length]
          result.push({ type: 'tech', text: pair.code, isCode: true })
          result.push({ type: 'tech', text: pair.text, isCode: false })
        }
        techIdx++
      }
    }
    // 小说行
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

async function loadChapter(num: number) {
  const res = await get<Chapter>(`/novels/${novelId.value}/chapters/${num}`)
  if (res.code === 200 && res.data) {
    currentChapter.value = res.data
    currentChapterNum.value = num
    if (res.data.id) {
      put(`/novels/${novelId.value}/progress`, { chapterId: res.data.id, scrollPosition: 0 })
    }
    if (readerRef.value) readerRef.value.scrollTop = 0
  }
}

onMounted(async () => {
  await fetchChapters()
  const progressRes = await get<any>(`/novels/${novelId.value}/progress`)
  if (progressRes.code === 200 && progressRes.data) {
    const chNum = chapters.value.find(c => c.id === progressRes.data.currentChapterId)?.chapterNumber || 1
    await loadChapter(chNum)
  } else if (chapters.value.length > 0) {
    await loadChapter(1)
  }
})
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.2s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.2s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
