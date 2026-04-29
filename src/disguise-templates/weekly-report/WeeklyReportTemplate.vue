<template>
  <div class="flex h-full" style="background: #050506">
    <!-- 左侧导航 -->
    <aside class="w-60 flex-shrink-0 flex flex-col" style="border-right: 1px solid rgba(255,255,255,0.06); background: #080809">
      <!-- Logo区域 -->
      <div class="px-4 py-5 flex items-center gap-2.5" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
        <div class="w-6 h-6 rounded flex items-center justify-center" style="background: linear-gradient(135deg, #6366F1, #A855F7)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>
        </div>
        <span class="text-sm font-semibold" style="color: #EDEDEF; letter-spacing: -0.02em">ProjectFlow</span>
      </div>

      <!-- 导航项 -->
      <nav class="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <div v-for="item in menuItems" :key="item.label"
          class="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-all duration-150"
          :style="item.active ? 'background: rgba(99,102,241,0.12); color: #A5B4FC' : 'color: #8A8F98'"
          @mouseenter="($event.target as HTMLElement).style.background = item.active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)'"
          @mouseleave="($event.target as HTMLElement).style.background = item.active ? 'rgba(99,102,241,0.12)' : 'transparent'">
          <span class="text-xs opacity-70">{{ item.icon }}</span>
          <span class="text-[13px]" style="letter-spacing: -0.01em">{{ item.label }}</span>
          <span v-if="item.badge" class="ml-auto text-[10px] px-1.5 py-0.5 rounded-full" style="background: rgba(99,102,241,0.2); color: #A5B4FC">{{ item.badge }}</span>
        </div>
      </nav>

      <!-- 底部用户 -->
      <div class="px-3 py-3 flex items-center gap-2.5" style="border-top: 1px solid rgba(255,255,255,0.06)">
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold" style="background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white">ZS</div>
        <div class="flex-1 min-w-0">
          <div class="text-xs truncate" style="color: #EDEDEF">张三</div>
          <div class="text-[10px]" style="color: #525252">技术部</div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-y-auto" style="background: #050506">
      <!-- 顶部栏 -->
      <div class="px-6 py-4 flex items-center justify-between" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
        <div>
          <h1 class="text-base font-semibold" style="color: #EDEDEF; letter-spacing: -0.02em">本周工作周报</h1>
          <p class="text-xs mt-0.5" style="color: #525252">2024年第3周 · 1月15日 - 1月21日</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 rounded-md text-xs transition-all duration-150" style="border: 1px solid rgba(255,255,255,0.1); color: #8A8F98" onmouseenter="this.style.background='rgba(255,255,255,0.04)'" onmouseleave="this.style.background='transparent'">导出</button>
          <button class="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150" style="background: linear-gradient(135deg, #6366F1, #7C3AED); color: white; box-shadow: 0 0 20px rgba(99,102,241,0.25)">提交周报</button>
        </div>
      </div>

      <div class="p-6 space-y-5">
        <!-- 进度统计卡片 -->
        <div class="grid grid-cols-3 gap-3">
          <div v-for="stat in stats" :key="stat.label"
            class="rounded-lg p-4 transition-all duration-200"
            style="background: #0A0A0B; border: 1px solid rgba(255,255,255,0.06)"
            onmouseenter="this.style.borderColor='rgba(99,102,241,0.2)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.06)'">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] uppercase tracking-wider" style="color: #525252">{{ stat.label }}</span>
              <span class="text-[10px]" :style="{ color: stat.trend > 0 ? '#34D399' : '#F87171' }">{{ stat.trend > 0 ? '↑' : '↓' }}{{ Math.abs(stat.trend) }}%</span>
            </div>
            <div class="text-2xl font-semibold" style="color: #EDEDEF; letter-spacing: -0.03em">{{ stat.value }}</div>
            <!-- 微型进度条 -->
            <div class="mt-3 h-[2px] rounded-full" style="background: rgba(255,255,255,0.06)">
              <div class="h-full rounded-full" :style="{ width: stat.progress + '%', background: 'linear-gradient(90deg, #6366F1, #A855F7)' }"></div>
            </div>
          </div>
        </div>

        <!-- 工作项列表 -->
        <div class="rounded-lg" style="background: #0A0A0B; border: 1px solid rgba(255,255,255,0.06)">
          <div class="px-4 py-3 flex items-center justify-between" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
            <h2 class="text-sm font-medium" style="color: #EDEDEF; letter-spacing: -0.01em">工作项</h2>
            <span class="text-[10px] px-2 py-0.5 rounded-full" style="background: rgba(99,102,241,0.1); color: #A5B4FC">{{ tasks.length }} 项</span>
          </div>
          <div class="divide-y" style="border-color: rgba(255,255,255,0.04)">
            <div v-for="task in tasks" :key="task.id"
              class="px-4 py-3 flex items-center gap-3 transition-all duration-150 cursor-pointer"
              onmouseenter="this.style.background='rgba(255,255,255,0.02)'" onmouseleave="this.style.background='transparent'"
              style="border-bottom: 1px solid rgba(255,255,255,0.04)">
              <!-- 状态指示器 -->
              <div class="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                :style="task.status === 'done' ? 'background: rgba(52,211,153,0.15); color: #34D399' : task.status === 'progress' ? 'background: rgba(251,191,36,0.15); color: #FBBF24' : 'background: rgba(255,255,255,0.06); color: #525252'">
                <svg v-if="task.status === 'done'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12l5 5L20 7"/></svg>
                <svg v-else-if="task.status === 'progress'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" stroke-dasharray="14 42" stroke-dashoffset="0"/></svg>
                <div v-else class="w-1.5 h-1.5 rounded-full" style="background: currentColor"></div>
              </div>
              <span class="flex-1 text-[13px]" :style="task.status === 'done' ? 'color: #8A8F98; text-decoration: line-through' : 'color: #EDEDEF; letter-spacing: -0.01em'">{{ task.title }}</span>
              <span class="text-[11px] tabular-nums" style="color: #525252">{{ task.time }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded" :style="task.priority === 'high' ? 'background: rgba(248,113,113,0.1); color: #F87171' : task.priority === 'mid' ? 'background: rgba(251,191,36,0.1); color: #FBBF24' : 'background: rgba(255,255,255,0.04); color: #525252'">{{ task.priority === 'high' ? 'P0' : task.priority === 'mid' ? 'P1' : 'P2' }}</span>
            </div>
          </div>
        </div>

        <!-- 最近提交 -->
        <div class="rounded-lg" style="background: #0A0A0B; border: 1px solid rgba(255,255,255,0.06)">
          <div class="px-4 py-3" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
            <h2 class="text-sm font-medium" style="color: #EDEDEF; letter-spacing: -0.01em">最近提交</h2>
          </div>
          <div class="px-4 py-2 space-y-1.5">
            <div v-for="commit in commits" :key="commit.hash" class="flex items-center gap-2 py-1.5 text-[12px] font-mono">
              <span class="px-1.5 py-0.5 rounded text-[10px]" style="background: rgba(99,102,241,0.1); color: #A5B4FC">{{ commit.hash }}</span>
              <span style="color: #8A8F98">{{ commit.message }}</span>
              <span class="ml-auto text-[10px]" style="color: #525252">{{ commit.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const menuItems = [
  { label: '仪表盘', icon: '◉', active: false },
  { label: '项目列表', icon: '◈', active: false },
  { label: '任务看板', icon: '◫', active: false, badge: '3' },
  { label: '周报填写', icon: '◧', active: true },
  { label: '团队管理', icon: '◆', active: false },
  { label: '设置', icon: '⚙', active: false },
]

const stats = ref([
  { label: '已完成', value: 12, trend: 15, progress: 80 },
  { label: '进行中', value: 3, trend: -10, progress: 45 },
  { label: '提交数', value: 28, trend: 22, progress: 70 },
])

const tasks = ref([
  { id: 1, title: '完成用户认证模块重构', status: 'done', time: '2d', priority: 'high' },
  { id: 2, title: '优化首页加载性能', status: 'done', time: '1d', priority: 'mid' },
  { id: 3, title: '修复数据导出Bug', status: 'done', time: '0.5d', priority: 'high' },
  { id: 4, title: '编写单元测试用例', status: 'progress', time: '1d', priority: 'mid' },
  { id: 5, title: 'API文档更新', status: 'progress', time: '0.5d', priority: 'low' },
  { id: 6, title: '新功能需求评审', status: 'todo', time: '-', priority: 'low' },
])

const commits = ref([
  { hash: 'a3f2b1c', message: 'refactor: 重构认证中间件', time: '2h ago' },
  { hash: 'e7d4c2a', message: 'fix: 修复导出空数据问题', time: '4h ago' },
  { hash: 'b9f1e3d', message: 'perf: 首页懒加载优化', time: '6h ago' },
  { hash: 'c2a8d5f', message: 'test: 添加认证模块测试', time: '1d ago' },
])

let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshTimer = setInterval(() => {
    stats.value[0].value = 12 + Math.floor(Math.random() * 3)
    stats.value[2].value = 28 + Math.floor(Math.random() * 5)
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
