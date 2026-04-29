<template>
  <div class="min-h-screen flex">
    <!-- Left Side - Visual -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-accent via-accent-secondary to-accent">
      <div class="absolute inset-0 dot-pattern opacity-10"></div>
      <div class="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1s"></div>
      
      <div class="relative z-10 flex flex-col justify-center px-16 text-white">
        <h1 class="text-5xl font-display font-bold mb-6 opacity-0 animate-fade-in-up">NovaBlog</h1>
        <p class="text-xl opacity-80 mb-8 opacity-0 animate-fade-in-up animate-delay-100">
          全栈博客平台，记录技术成长
        </p>
        <div class="space-y-4 opacity-0 animate-fade-in-up animate-delay-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span>AI智能对话助手</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <span>Markdown博客系统</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-2.1-2.86L17.5 17l-1.4-1.86A3 3 0 0014 14H9a3 3 0 00-2.1.86L5.5 17l-2.4.14A3 3 0 001 20v2h5m7-4v4m-4-4v4m8-4v4m-12 0v4"/>
              </svg>
            </div>
            <span>实时社区互动</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="flex-1 flex items-center justify-center px-8 lg:px-16 bg-background">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden mb-8 text-center">
          <router-link to="/" class="inline-flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-xl">N</div>
            <span class="font-display font-bold text-2xl text-foreground">NovaBlog</span>
          </router-link>
        </div>

        <div class="opacity-0 animate-fade-in-up">
          <h2 class="text-3xl font-display font-bold text-foreground mb-2">欢迎回来</h2>
          <p class="text-muted-foreground mb-8">登录您的账户继续探索</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5 opacity-0 animate-fade-in-up animate-delay-100">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">邮箱地址</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="your@email.com"
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">密码</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="input"
            />
          </div>

          <div v-if="error" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full !py-3.5"
          >
            <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>登录</span>
          </button>
        </form>

        <div class="mt-8 text-center opacity-0 animate-fade-in-up animate-delay-200">
          <p class="text-sm text-muted-foreground">
            还没有账户？
            <router-link to="/register" class="text-accent font-medium hover:underline">立即注册</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const res = await authStore.login(email.value, password.value)
    if (res.code === 200) {
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      error.value = res.message
    }
  } catch {
    error.value = '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
