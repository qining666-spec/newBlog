<template>
  <!-- VSCode编辑器伪装界面 -->
  <div class="flex h-full" style="background: #1e1e1e; font-family: 'Segoe UI', 'Consolas', monospace">
    <!-- 左侧活动栏 -->
    <div class="w-12 flex flex-col items-center py-2 flex-shrink-0" style="background: #333333">
      <div v-for="icon in activityIcons" :key="icon.name"
        class="w-10 h-10 flex items-center justify-center rounded-sm cursor-pointer mb-1"
        :style="icon.active ? 'color: #fff; border-left: 2px solid #fff' : 'color: #858585; border-left: 2px solid transparent'"
        @mouseenter="hoverIcon($event, '#fff')"
        @mouseleave="hoverIcon($event, icon.active ? '#fff' : '#858585')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" v-html="icon.path"></svg>
      </div>
      <div class="mt-auto">
        <div class="w-10 h-10 flex items-center justify-center cursor-pointer" style="color: #858585">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </div>
      </div>
    </div>

    <!-- 侧边栏 - 文件浏览器 -->
    <div class="w-56 flex-shrink-0 flex flex-col" style="background: #252526; border-right: 1px solid #3c3c3c">
      <div class="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider" style="color: #bbbbbb">资源管理器</div>
      <div class="flex-1 overflow-y-auto px-1">
        <div v-for="folder in fileTree" :key="folder.name" class="mb-1">
          <div class="flex items-center gap-1 px-2 py-1 text-xs cursor-pointer" style="color: #cccccc" @click="folder.open = !folder.open">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path :d="folder.open ? 'M7 10l5 5 5-5z' : 'M10 7l5 5-5 5z'"/></svg>
            <span>{{ folder.name }}</span>
          </div>
          <div v-if="folder.open">
            <div v-for="file in folder.files" :key="file.name"
              class="flex items-center gap-1.5 pl-6 pr-2 py-1 text-xs cursor-pointer"
              :style="file.active ? 'background: #37373d; color: #fff' : 'color: #cccccc'"
              @mouseenter="hoverFile($event, file.active)"
              @mouseleave="unhoverFile($event, file.active)">
              <span class="text-[10px]" :style="{ color: file.color }">{{ file.icon }}</span>
              <span>{{ file.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主编辑区 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 标签栏 -->
      <div class="flex items-center flex-shrink-0" style="background: #252526; border-bottom: 1px solid #3c3c3c">
        <div v-for="tab in openTabs" :key="tab.name"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
          :style="tab.active ? 'background: #1e1e1e; color: #fff; border-top: 1px solid #007acc' : 'background: #2d2d2d; color: #969696; border-top: 1px solid transparent'">
          <span class="text-[10px]" :style="{ color: tab.color }">{{ tab.icon }}</span>
          <span>{{ tab.name }}</span>
          <span class="ml-1 opacity-0 hover:opacity-100" style="color: #969696">×</span>
        </div>
      </div>

      <!-- 面包屑 -->
      <div class="flex items-center gap-1 px-4 py-1 text-[11px] flex-shrink-0" style="background: #1e1e1e; color: #6a6a6a; border-bottom: 1px solid #2d2d2d">
        <span v-for="(crumb, i) in breadcrumbs" :key="i">
          <span v-if="i > 0" class="mx-1">›</span>
          <span :style="i === breadcrumbs.length - 1 ? 'color: #cccccc' : ''">{{ crumb }}</span>
        </span>
      </div>

      <!-- 代码编辑区 -->
      <div class="flex-1 overflow-y-auto" style="background: #1e1e1e">
        <div class="flex">
          <!-- 行号 -->
          <div class="flex-shrink-0 text-right pr-4 pl-4 select-none" style="color: #6a6a6a; font-size: 13px; line-height: 20px; min-width: 50px">
            <div v-for="n in codeLines.length" :key="n" style="height: 20px">{{ n }}</div>
          </div>
          <!-- 代码内容 -->
          <div class="flex-1 pr-4" style="font-size: 13px; line-height: 20px; font-family: 'Consolas', 'Courier New', monospace">
            <div v-for="(line, i) in codeLines" :key="i" class="flex" style="height: 20px">
              <span v-html="line"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部状态栏 -->
      <div class="flex items-center justify-between px-3 py-0.5 text-[11px] flex-shrink-0" style="background: #007acc; color: #fff">
        <div class="flex items-center gap-3">
          <span>⎇ main</span>
          <span>✓ 0 ✕ 0</span>
        </div>
        <div class="flex items-center gap-3">
          <span>Ln {{ currentLine }}, Col {{ currentCol }}</span>
          <span>UTF-8</span>
          <span>TypeScript</span>
          <span>⚙ Prettier</span>
        </div>
      </div>
    </div>

    <!-- 右侧小地图/缩略图 -->
    <div class="w-16 flex-shrink-0 overflow-hidden" style="background: #1e1e1e; border-left: 1px solid #3c3c3c">
      <div class="py-2 px-1 space-y-px">
        <div v-for="i in 40" :key="i" class="rounded-sm" :style="{ height: (2 + Math.random() * 3) + 'px', background: i < 8 ? 'rgba(255,255,255,0.06)' : i < 15 ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

const currentLine = ref(24)
const currentCol = ref(18)

function hoverIcon(e: MouseEvent, color: string) {
  const el = e.target as HTMLElement
  if (el) el.style.color = color
}

function hoverFile(e: MouseEvent, active: boolean) {
  if (active) return
  const el = e.target as HTMLElement
  if (el) el.style.background = '#2a2d2e'
}

function unhoverFile(e: MouseEvent, active: boolean) {
  if (active) return
  const el = e.target as HTMLElement
  if (el) el.style.background = 'transparent'
}

const activityIcons = [
  { name: 'files', active: true, path: '<path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>' },
  { name: 'search', active: false, path: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>' },
  { name: 'git', active: false, path: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 009 9"/>' },
  { name: 'debug', active: false, path: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>' },
  { name: 'extensions', active: false, path: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
]

const fileTree = reactive([
  { name: 'src', open: true, files: [
    { name: 'main.ts', icon: 'TS', color: '#3178c6', active: false },
    { name: 'App.vue', icon: 'V', color: '#42b883', active: true },
    { name: 'router.ts', icon: 'TS', color: '#3178c6', active: false },
    { name: 'store.ts', icon: 'TS', color: '#3178c6', active: false },
  ]},
  { name: 'components', open: false, files: [
    { name: 'Header.vue', icon: 'V', color: '#42b883', active: false },
    { name: 'Sidebar.vue', icon: 'V', color: '#42b883', active: false },
    { name: 'Editor.vue', icon: 'V', color: '#42b883', active: false },
  ]},
  { name: 'utils', open: false, files: [
    { name: 'helpers.ts', icon: 'TS', color: '#3178c6', active: false },
    { name: 'api.ts', icon: 'TS', color: '#3178c6', active: false },
  ]},
  { name: 'package.json', open: false, files: [] },
])

const openTabs = [
  { name: 'App.vue', icon: 'V', color: '#42b883', active: true },
  { name: 'main.ts', icon: 'TS', color: '#3178c6', active: false },
  { name: 'router.ts', icon: 'TS', color: '#3178c6', active: false },
]

const breadcrumbs = ['src', 'App.vue']

// 模拟代码内容 - 看起来像正常的Vue组件代码
const codeLines = ref([
  '<span style="color:#6a9955">&lt;script setup lang="ts"&gt;</span>',
  '<span style="color:#c586c0">import</span> { ref, computed } <span style="color:#c586c0">from</span> <span style="color:#ce9178">\'vue\'</span>',
  '<span style="color:#c586c0">import</span> { useRouter } <span style="color:#c586c0">from</span> <span style="color:#ce9178">\'vue-router\'</span>',
  '<span style="color:#c586c0">import</span> { useStore } <span style="color:#c586c0">from</span> <span style="color:#ce9178">\'./store\'</span>',
  '',
  '<span style="color:#c586c0">const</span> router = <span style="color:#dcdcaa">useRouter</span>()',
  '<span style="color:#c586c0">const</span> store = <span style="color:#dcdcaa">useStore</span>()',
  '<span style="color:#c586c0">const</span> isLoading = <span style="color:#dcdcaa">ref</span>(<span style="color:#569cd6">false</span>)',
  '',
  '<span style="color:#6a9955">// 初始化应用状态</span>',
  '<span style="color:#c586c0">const</span> appConfig = <span style="color:#dcdcaa">computed</span>(() => ({',
  '  theme: store.state.theme,',
  '  locale: store.state.locale,',
  '  sidebarCollapsed: store.state.sidebarCollapsed,',
  '}))',
  '',
  '<span style="color:#6a9955">// 路由守卫逻辑</span>',
  '<span style="color:#569cd6">function</span> <span style="color:#dcdcaa">handleRouteChange</span>(to: <span style="color:#4ec9b0">Route</span>) {',
  '  <span style="color:#c586c0">if</span> (!store.isAuthenticated && !to.meta.public) {',
  '    router.<span style="color:#dcdcaa">push</span>({ name: <span style="color:#ce9178">\'login\'</span> })',
  '  }',
  '}',
  '',
  '<span style="color:#6a9955">// 生命周期</span>',
  '<span style="color:#dcdcaa">onMounted</span>(() => {',
  '  store.<span style="color:#dcdcaa">initialize</span>()',
  '  <span style="color:#6a9955">// <!-- 小说/游戏/视频内容已折叠到注释中 --></span>',
  '})',
  '',
  '<span style="color:#6a9955">&lt;/script&gt;</span>',
  '',
  '<span style="color:#6a9955">&lt;template&gt;</span>',
  '  <span style="color:#808080">&lt;div</span> <span style="color:#9cdcfe">class</span>=<span style="color:#ce9178">"app-container"</span><span style="color:#808080">&gt;</span>',
  '    <span style="color:#808080">&lt;RouterView /&gt;</span>',
  '  <span style="color:#808080">&lt;/div&gt;</span>',
  '<span style="color:#6a9955">&lt;/template&gt;</span>',
])

let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshTimer = setInterval(() => {
    currentLine.value = 20 + Math.floor(Math.random() * 10)
    currentCol.value = 5 + Math.floor(Math.random() * 30)
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
