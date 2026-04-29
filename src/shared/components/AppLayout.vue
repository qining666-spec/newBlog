<template>
  <div class="min-h-screen bg-background">
    <!-- Navigation -->
    <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-3 group">
            <div class="relative w-9 h-9 rounded-xl overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-accent to-accent-secondary"></div>
              <div class="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">N</div>
            </div>
            <span class="font-display font-bold text-xl text-foreground group-hover:text-accent transition-colors duration-200">NovaBlog</span>
          </router-link>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center gap-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="isActive(item.path) 
                ? 'text-accent bg-accent/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
            >
              {{ item.label }}
            </router-link>
          </nav>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="hidden md:flex items-center">
              <div class="relative group">
                <input
                  v-model="searchKeyword"
                  type="text"
                  placeholder="搜索..."
                  class="w-48 lg:w-64 pl-10 pr-4 py-2 text-sm rounded-xl bg-muted border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 focus:bg-card transition-all duration-200"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            <!-- Write Button -->
            <router-link to="/blog/write" class="btn-primary !px-4 !py-2 text-sm hidden sm:flex">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span>写文章</span>
            </router-link>

            <!-- User Menu -->
            <div v-if="authStore.isLoggedIn" class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-medium text-sm">
                {{ authStore.user?.nickname?.charAt(0) || 'U' }}
              </div>
              <button 
                @click="authStore.logout(); $router.push('/login')" 
                class="text-sm text-muted-foreground hover:text-accent transition-colors hidden sm:block"
              >
                退出
              </button>
            </div>
            <router-link v-else to="/login" class="btn-secondary !px-4 !py-2 text-sm">
              登录
            </router-link>

            <!-- Mobile Menu Toggle -->
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors">
              <svg class="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18'"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 -translate-y-4"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="mobileMenuOpen" class="lg:hidden fixed inset-x-0 top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-border shadow-lg">
        <nav class="max-w-7xl mx-auto px-4 py-4 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            @click="mobileMenuOpen = false"
            class="block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
            :class="isActive(item.path) 
              ? 'text-accent bg-accent/10' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
          >
            {{ item.label }}
          </router-link>
        </nav>
      </div>
    </Transition>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- Content Area -->
        <div class="flex-1 min-w-0">
          <router-view v-slot="{ Component }">
            <Transition
              enter-active-class="transition-all duration-500 ease-out"
              leave-active-class="transition-all duration-300 ease-in"
              enter-from-class="opacity-0 translate-y-4"
              leave-to-class="opacity-0"
              mode="out-in"
            >
              <component :is="Component" />
            </Transition>
          </router-view>
        </div>

        <!-- Sidebar -->
        <aside class="hidden xl:block w-80 flex-shrink-0 space-y-6">
          <!-- Profile Card -->
          <div class="card-elevated">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-xl">
                {{ authStore.user?.nickname?.charAt(0) || 'U' }}
              </div>
              <div>
                <div class="font-display font-semibold text-foreground">{{ authStore.user?.nickname || '未登录' }}</div>
                <div class="text-sm text-muted-foreground">{{ authStore.user?.email || '欢迎回来' }}</div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div class="text-center">
                <div class="text-2xl font-bold text-foreground">128</div>
                <div class="text-xs text-muted-foreground">文章</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-foreground">1.2k</div>
                <div class="text-xs text-muted-foreground">粉丝</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-foreground">856</div>
                <div class="text-xs text-muted-foreground">获赞</div>
              </div>
            </div>
          </div>

          <!-- Hot Articles -->
          <div class="card">
            <h3 class="font-display font-semibold text-foreground mb-4">热门文章</h3>
            <div class="space-y-3">
              <div
                v-for="(article, i) in hotArticles"
                :key="i"
                class="flex items-start gap-3 group cursor-pointer"
              >
                <span
                  class="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                  :class="i < 3 ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'"
                >
                  {{ i + 1 }}
                </span>
                <span class="text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                  {{ article }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="card">
            <h3 class="font-display font-semibold text-foreground mb-4">推荐标签</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in recommendTags"
                :key="tag"
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent transition-all duration-200 cursor-pointer"
              >
                {{ tag }}
              </span>
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

const navItems = [
  { path: '/blog', label: '首页' },
  { path: '/blog', label: '博客' },
  { path: '/novel', label: '资料' },
  { path: '/video', label: '课程' },
  { path: '/ai', label: 'AI助手' },
  { path: '/chat', label: '社区' },
  { path: '/game', label: '工具' },
]

const hotArticles = [
  'Vue3 Composition API 最佳实践指南',
  'TypeScript 类型体操实战技巧',
  'Vite 构建优化深度解析',
  'Node.js 高并发架构设计',
  'Redis 缓存策略全解析',
]

const recommendTags = ['Vue3', 'TypeScript', 'React', 'Node.js', 'Docker', 'Redis', '算法', '架构']

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>
