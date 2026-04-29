<template>
  <div class="h-full overflow-y-auto" style="background: #fff">
    <div class="max-w-3xl mx-auto px-8 py-8">
      <!-- 返回 -->
      <router-link to="/video" class="inline-flex items-center gap-1.5 text-xs mb-6" style="color: #999aaa" onmouseenter="this.style.color='#FC5531'" onmouseleave="this.style.color='#999aaa'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        返回课程列表
      </router-link>

      <!-- 技术文章标题 -->
      <h1 class="text-xl font-bold mb-2" style="color: #222226">{{ techTitle }}</h1>
      <div class="flex items-center gap-3 mb-6 text-xs" style="color: #999aaa">
        <span>前端架构组</span>
        <span>{{ techDate }}</span>
        <span class="px-1.5 py-0.5 rounded" style="background: #f0f7ff; color: #3178c6">{{ techTag }}</span>
      </div>

      <!-- 技术内容 - 占大部分 -->
      <div class="space-y-4" style="color: #222226; font-size: 15px; line-height: 1.8">
        <!-- 技术段落1 -->
        <p>在现代前端工程化体系中，组件化开发已成为标准范式。通过将UI拆分为独立、可复用的组件，我们能够显著提升开发效率和代码可维护性。Vue3的组合式API进一步强化了这一理念，使逻辑复用不再依赖mixin，而是通过composables实现。</p>

        <!-- 代码块1 -->
        <div class="rounded-lg overflow-hidden" style="border: 1px solid #e8e8ed">
          <div class="px-3 py-1.5 text-[10px] uppercase tracking-wider" style="background: #f4f5f5; color: #999aaa; border-bottom: 1px solid #e8e8ed">typescript</div>
          <pre class="px-3 py-2.5 text-xs overflow-x-auto" style="background: #f9fafb; color: #3178c6; font-family: 'Consolas', monospace; line-height: 1.6">import { ref, computed, onMounted } from 'vue'

export function useAsyncData&lt;T&gt;(fetcher: () => Promise&lt;T&gt;) {
  const data = ref&lt;T | null&gt;(null)
  const error = ref&lt;Error | null&gt;(null)
  const loading = ref(true)

  onMounted(async () => {
    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  })

  return { data, error, loading }
}</pre>
        </div>

        <!-- 架构图 -->
        <div class="rounded-lg overflow-hidden" style="border: 1px solid #e8e8ed">
          <svg viewBox="0 0 600 180" class="w-full" style="background: #f9fafb">
            <rect x="20" y="50" width="130" height="60" rx="8" fill="#fff5f2" stroke="#FC5531" stroke-width="1.5"/>
            <text x="85" y="85" text-anchor="middle" font-size="11" fill="#FC5531">Component</text>
            <line x1="150" y1="80" x2="220" y2="80" stroke="#e8e8ed" stroke-width="1.5"/>
            <rect x="220" y="50" width="130" height="60" rx="8" fill="#f0f7ff" stroke="#3178c6" stroke-width="1.5"/>
            <text x="285" y="85" text-anchor="middle" font-size="11" fill="#3178c6">Composable</text>
            <line x1="350" y1="80" x2="420" y2="80" stroke="#e8e8ed" stroke-width="1.5"/>
            <rect x="420" y="50" width="130" height="60" rx="8" fill="#f0f9eb" stroke="#67c23a" stroke-width="1.5"/>
            <text x="485" y="85" text-anchor="middle" font-size="11" fill="#67c23a">API Layer</text>
            <text x="300" y="155" text-anchor="middle" font-size="10" fill="#999aaa">图1: 组合式API数据流向</text>
          </svg>
        </div>

        <p>上述架构中，Component通过Composable获取数据，Composable内部封装了API调用、缓存策略和错误处理逻辑。这种分层设计使得每一层职责单一，便于独立测试和替换。当API接口变更时，只需修改API Layer，上层代码无需调整。</p>

        <!-- 技术段落2 -->
        <h2 class="text-base font-semibold mt-6 mb-2" style="color: #222226">性能优化策略</h2>
        <p>在大型应用中，性能优化是持续性的工作。以下是一些关键策略：虚拟滚动处理长列表、代码分割减少首屏加载体积、骨架屏提升感知速度、Service Worker实现离线缓存。每个策略都需要根据实际场景权衡投入产出比。</p>

        <!-- 代码块2 -->
        <div class="rounded-lg overflow-hidden" style="border: 1px solid #e8e8ed">
          <div class="px-3 py-1.5 text-[10px] uppercase tracking-wider" style="background: #f4f5f5; color: #999aaa; border-bottom: 1px solid #e8e8ed">typescript</div>
          <pre class="px-3 py-2.5 text-xs overflow-x-auto" style="background: #f9fafb; color: #3178c6; font-family: 'Consolas', monospace; line-height: 1.6">// 虚拟滚动核心逻辑
function getVisibleRange(
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number
) {
  const start = Math.floor(scrollTop / itemHeight)
  const end = Math.min(
    start + Math.ceil(containerHeight / itemHeight) + 1,
    totalItems
  )
  return { start, end }
}</pre>
        </div>

        <p>虚拟滚动的核心思想是只渲染可视区域内的DOM节点，通过计算滚动位置动态调整渲染范围。对于万级数据量的列表，可将DOM节点数从数万降至数十，显著减少内存占用和重排开销。</p>

        <!-- 视频嵌入 - 不起眼地放在技术内容中间 -->
        <div class="my-6">
          <h3 class="text-sm font-semibold mb-2" style="color: #222226">配套视频讲解</h3>
          <div class="rounded-lg overflow-hidden" style="border: 1px solid #e8e8ed; max-width: 360px">
            <div class="relative" style="padding-top: 56.25%">
              <!-- 本地视频播放器 -->
              <video v-if="isLocalVideo && video" :src="video.url" controls class="absolute inset-0 w-full h-full" style="background: #000"></video>
              <!-- 在线视频iframe -->
              <iframe v-else-if="embedUrl" :src="embedUrl" class="absolute inset-0 w-full h-full" frameborder="0" allowfullscreen style="filter: saturate(0.7) brightness(0.95)"></iframe>
              <div v-else class="absolute inset-0 flex items-center justify-center" style="background: #f4f5f5; color: #999aaa">
                <span class="text-xs">视频暂不可用</span>
              </div>
            </div>
          </div>
          <p class="text-xs mt-1.5" style="color: #999aaa">视频演示：{{ video?.title || '课程视频' }}</p>
        </div>

        <!-- 继续技术内容 -->
        <h2 class="text-base font-semibold mt-6 mb-2" style="color: #222226">状态管理最佳实践</h2>
        <p>Pinia作为Vue3官方推荐的状态管理方案，相比Vuex更加轻量和类型安全。其核心优势在于：完整的TypeScript支持、去除mutations的简化API、支持多个store实例、天然支持组合式API。在实际项目中，建议按业务领域划分store，避免单一巨型store导致维护困难。</p>

        <!-- 代码块3 -->
        <div class="rounded-lg overflow-hidden" style="border: 1px solid #e8e8ed">
          <div class="px-3 py-1.5 text-[10px] uppercase tracking-wider" style="background: #f4f5f5; color: #999aaa; border-bottom: 1px solid #e8e8ed">typescript</div>
          <pre class="px-3 py-2.5 text-xs overflow-x-auto" style="background: #f9fafb; color: #3178c6; font-family: 'Consolas', monospace; line-height: 1.6">import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref&lt;User | null&gt;(null)
  const isLoggedIn = computed(() => !!user.value)

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    user.value = res.data
  }

  function logout() {
    user.value = null
    localStorage.removeItem('token')
  }

  return { user, isLoggedIn, login, logout }
})</pre>
        </div>

        <p>Store之间的组合可以通过在composable中引用多个store实现，而非Vuex的modules嵌套。这种扁平化结构更符合函数式编程思想，也更容易进行tree-shaking优化。</p>

        <!-- 流程图 -->
        <div class="rounded-lg overflow-hidden" style="border: 1px solid #e8e8ed">
          <svg viewBox="0 0 600 160" class="w-full" style="background: #f9fafb">
            <rect x="30" y="50" width="110" height="50" rx="6" fill="#f0f7ff" stroke="#3178c6" stroke-width="1"/>
            <text x="85" y="80" text-anchor="middle" font-size="10" fill="#3178c6">User Action</text>
            <line x1="140" y1="75" x2="200" y2="75" stroke="#e8e8ed" stroke-width="1.5"/>
            <rect x="200" y="50" width="110" height="50" rx="6" fill="#fff5f2" stroke="#FC5531" stroke-width="1"/>
            <text x="255" y="80" text-anchor="middle" font-size="10" fill="#FC5531">Pinia Store</text>
            <line x1="310" y1="75" x2="370" y2="75" stroke="#e8e8ed" stroke-width="1.5"/>
            <rect x="370" y="50" width="110" height="50" rx="6" fill="#f0f9eb" stroke="#67c23a" stroke-width="1"/>
            <text x="425" y="80" text-anchor="middle" font-size="10" fill="#67c23a">API Request</text>
            <line x1="480" y1="75" x2="540" y2="75" stroke="#e8e8ed" stroke-width="1.5"/>
            <rect x="540" y="50" width="40" height="50" rx="6" fill="#fdf6ec" stroke="#e6a23c" stroke-width="1"/>
            <text x="560" y="80" text-anchor="middle" font-size="9" fill="#e6a23c">UI</text>
            <text x="300" y="140" text-anchor="middle" font-size="10" fill="#999aaa">图2: 状态管理数据流</text>
          </svg>
        </div>

        <h2 class="text-base font-semibold mt-6 mb-2" style="color: #222226">部署与监控</h2>
        <p>生产环境的部署流程应完全自动化。通过CI/CD流水线实现代码提交到上线的全链路自动化：代码检查、单元测试、构建打包、Docker镜像构建、K8s滚动更新。同时配合Sentry错误监控和Prometheus性能指标采集，确保线上问题能第一时间发现和定位。</p>

        <!-- 代码块4 -->
        <div class="rounded-lg overflow-hidden" style="border: 1px solid #e8e8ed">
          <div class="px-3 py-1.5 text-[10px] uppercase tracking-wider" style="background: #f4f5f5; color: #999aaa; border-bottom: 1px solid #e8e8ed">yaml</div>
          <pre class="px-3 py-2.5 text-xs overflow-x-auto" style="background: #f9fafb; color: #3178c6; font-family: 'Consolas', monospace; line-height: 1.6"># docker-compose.yml
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://db:5432/app
    healthcheck:
      test: curl -f http://localhost:3000/health
      interval: 30s
      retries: 3</pre>
        </div>

        <p>容器健康检查配置确保服务异常时自动重启，配合K8s的liveness/readiness探针，可实现零停机滚动更新。建议为每个服务配置资源限制（CPU/内存），避免单服务异常影响整个集群稳定性。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { get } from '@shared/api/client'
import type { VideoItem } from '@shared/types'

const route = useRoute()
const videoId = route.params.id as string
const video = ref<VideoItem | null>(null)

const techTitle = computed(() => {
  if (!video.value) return '前端工程化实践与性能优化'
  const titles = [
    '前端工程化实践与性能优化',
    '基于Vue3的状态管理架构设计',
    'TypeScript高级类型在业务中的应用',
    'Node.js微服务架构落地实践',
  ]
  // 根据视频id hash选标题
  const idx = videoId.charCodeAt(0) % titles.length
  return titles[idx]
})

const techDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const techTag = computed(() => {
  const tags = ['Vue3', 'TypeScript', 'Node.js', '架构']
  return tags[videoId.charCodeAt(0) % tags.length]
})

const embedUrl = computed(() => {
  if (!video.value) return undefined
  if (video.value.platform === 'bilibili') {
    const bvMatch = video.value.url.match(/BV[\w]+/)
    if (bvMatch) return `//player.bilibili.com/player.html?bvid=${bvMatch[0]}&autoplay=0`
  }
  if (video.value.platform === 'youtube') {
    const vid = video.value.url.match(/(?:v=|\/)([\w-]{11})/)?.[1]
    if (vid) return `https://www.youtube.com/embed/${vid}`
  }
  return undefined
})

const isLocalVideo = computed(() => {
  if (!video.value) return false
  return video.value.platform === 'local' || video.value.platform === 'other' || video.value.url.startsWith('/uploads/')
})

onMounted(async () => {
  const res = await get<VideoItem>(`/videos/${videoId}`)
  if (res.code === 200 && res.data) video.value = res.data
})
</script>
