<template>
  <!-- CSDN风格布局 -->
  <div class="h-screen flex flex-col" style="background: #f4f5f5">
    <!-- 顶部导航栏 - CSDN风格 -->
    <header class="h-12 flex items-center px-4 flex-shrink-0" style="background: #fff; border-bottom: 1px solid #e8e8ed">
      <!-- Logo -->
      <div class="flex items-center gap-2 mr-8 cursor-pointer" @click="$router.push('/')">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="6" fill="#FC5531"/>
          <text x="5" y="20" fill="white" font-size="14" font-weight="bold" font-family="Arial">C</text>
        </svg>
        <h1 class="text-base font-bold" style="color: #222226; letter-spacing: -0.01em">CSDN</h1>
      </div>

      <!-- 搜索栏 - CSDN核心元素 -->
      <div class="flex-1 max-w-xl mx-4">
        <div class="flex items-center rounded-lg overflow-hidden" style="border: 1px solid #e8e8ed; background: #f9f9f9">
          <input v-model="searchKeyword" placeholder="搜索博客、技术文章..."
            class="flex-1 px-3 py-1.5 text-sm bg-transparent focus:outline-none"
            style="color: #222226; caret-color: #FC5531" />
          <button class="px-4 py-1.5 text-sm text-white" style="background: #FC5531">搜索</button>
        </div>
      </div>

      <!-- 顶部导航链接 - CSDN风格 -->
      <nav class="hidden lg:flex items-center gap-5 mr-6">
        <a v-for="item in topNavItems" :key="item.label"
          class="text-sm cursor-pointer transition-colors duration-150"
          :style="isActive(item.path) ? 'color: #FC5531; font-weight: 500' : 'color: #555666'"
          @click="$router.push(item.path)">
          {{ item.label }}
        </a>
      </nav>

      <!-- 右侧操作区 -->
      <div class="flex items-center gap-3">
        <!-- 写博客按钮 -->
        <router-link to="/blog/write"
          class="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded text-sm text-white transition-all duration-150"
          style="background: #FC5531"
          onmouseenter="this.style.background='#E04B28'" onmouseleave="this.style.background='#FC5531'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          写博客
        </router-link>

        <!-- 用户区域 -->
        <div v-if="authStore.isLoggedIn" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium" style="background: #FC5531; color: white">
            {{ authStore.user?.nickname?.charAt(0) || 'U' }}
          </div>
          <span class="text-sm hidden sm:inline" style="color: #222226">{{ authStore.user?.nickname }}</span>
          <button @click="authStore.logout(); $router.push('/login')" class="text-xs" style="color: #999aaa" onmouseenter="this.style.color='#FC5531'" onmouseleave="this.style.color='#999aaa'">退出</button>
        </div>
        <router-link v-else to="/login" class="text-sm" style="color: #FC5531">登录</router-link>

        <!-- 移动端菜单 -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden p-1.5 rounded" style="color: #555666">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </div>
    </header>

    <!-- 移动端侧边菜单 -->
    <div v-if="mobileMenuOpen" class="lg:hidden fixed inset-0 z-40" @click.self="mobileMenuOpen = false">
      <div class="absolute inset-y-0 right-0 w-64 shadow-xl p-4" style="background: #fff">
        <nav class="space-y-1">
          <a v-for="item in topNavItems" :key="item.label" @click="mobileMenuOpen = false; $router.push(item.path)"
            class="block px-3 py-2.5 text-sm rounded-lg cursor-pointer"
            :style="isActive(item.path) ? 'color: #FC5531; font-weight: 500; background: #fff5f2' : 'color: #555666'">
            {{ item.label }}
          </a>
        </nav>
      </div>
    </div>

    <!-- 主内容区 - CSDN两栏布局 -->
    <main class="flex-1 overflow-hidden">
      <div class="h-full max-w-[1400px] mx-auto flex gap-5 p-4">
        <!-- 左侧内容区 -->
        <div class="flex-1 overflow-y-auto rounded-lg" style="background: #fff">
          <router-view />
        </div>
        <!-- 右侧边栏 - CSDN风格 -->
        <aside class="w-72 flex-shrink-0 overflow-y-auto space-y-4 hidden xl:block">
          <!-- 个人信息卡片 -->
          <div class="rounded-lg p-4" style="background: #fff; border: 1px solid #e8e8ed">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style="background: linear-gradient(135deg, #FC5531, #F09850); color: white">
                {{ authStore.user?.nickname?.charAt(0) || 'U' }}
              </div>
              <div>
                <div class="text-sm font-medium" style="color: #222226">{{ authStore.user?.nickname || '未登录' }}</div>
                <div class="text-xs" style="color: #999aaa">码龄3年</div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center" style="border-top: 1px solid #e8e8ed; padding-top: 10px; margin-top: 2px">
              <div><div class="text-sm font-bold" style="color: #222226">128</div><div class="text-[10px]" style="color: #999aaa">原创</div></div>
              <div><div class="text-sm font-bold" style="color: #222226">1.2w</div><div class="text-[10px]" style="color: #999aaa">粉丝</div></div>
              <div><div class="text-sm font-bold" style="color: #222226">856</div><div class="text-[10px]" style="color: #999aaa">获赞</div></div>
            </div>
          </div>
          <!-- 热门文章 -->
          <div class="rounded-lg p-4" style="background: #fff; border: 1px solid #e8e8ed">
            <h3 class="text-sm font-bold mb-3" style="color: #222226">热门文章</h3>
            <div class="space-y-2.5">
              <div v-for="(article, i) in hotArticles" :key="i" class="flex items-start gap-2 cursor-pointer group">
                <span class="text-xs font-bold flex-shrink-0 mt-0.5" :style="{ color: i < 3 ? '#FC5531' : '#999aaa' }">{{ i + 1 }}</span>
                <span class="text-xs line-clamp-2 group-hover:underline" style="color: #555666">{{ article }}</span>
              </div>
            </div>
          </div>
          <!-- 推荐标签 -->
          <div class="rounded-lg p-4" style="background: #fff; border: 1px solid #e8e8ed">
            <h3 class="text-sm font-bold mb-3" style="color: #222226">推荐标签</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in recommendTags" :key="tag" class="text-xs px-2 py-1 rounded cursor-pointer" style="background: #f4f5f5; color: #555666" onmouseenter="this.style.background='#fff5f2';this.style.color='#FC5531'" onmouseleave="this.style.background='#f4f5f5';this.style.color='#555666'">{{ tag }}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@modules/auth/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)
const searchKeyword = ref('')

// CSDN风格导航 - 隐藏摸鱼内容，用技术名词伪装
const topNavItems = [
  { path: '/blog', label: '首页' },
  { path: '/blog', label: '博客' },
  { path: '/novel', label: '资料' },
  { path: '/video', label: '课程' },
  { path: '/ai', label: 'AI' },
  { path: '/game', label: '工具' },
  { path: '/chat', label: '社区' },
]

const hotArticles = [
  '深入理解Vue3响应式原理与Proxy机制',
  'TypeScript高级类型体操实战指南',
  'Vite构建优化：从30s到3s的蜕变',
  'Node.js高并发架构设计实践',
  'Redis缓存策略与常见坑点总结',
  '前端微服务架构落地经验分享',
  'Docker多阶段构建最佳实践',
]

const recommendTags = ['Vue3', 'TypeScript', 'React', 'Node.js', 'Python', 'Docker', 'Redis', '算法', '架构', '微服务']

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>
