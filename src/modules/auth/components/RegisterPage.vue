<template>
  <div class="min-h-screen flex">
    <!-- Left Side - Visual -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-accent via-accent-secondary to-accent">
      <div class="absolute inset-0 dot-pattern opacity-10"></div>
      <div class="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1s"></div>
      
      <div class="relative z-10 flex flex-col justify-center px-16 text-white">
        <h1 class="text-5xl font-display font-bold mb-6 opacity-0 animate-fade-in-up">开始创作</h1>
        <p class="text-xl opacity-80 mb-8 opacity-0 animate-fade-in-up animate-delay-100">
          加入技术社区，分享你的见解
        </p>
        <div class="grid grid-cols-2 gap-4 opacity-0 animate-fade-in-up animate-delay-200">
          <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
            <div class="text-3xl font-bold mb-1">10k+</div>
            <div class="text-sm opacity-80">活跃用户</div>
          </div>
          <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
            <div class="text-3xl font-bold mb-1">50k+</div>
            <div class="text-sm opacity-80">技术文章</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Register Form -->
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
          <h2 class="text-3xl font-display font-bold text-foreground mb-2">创建账户</h2>
          <p class="text-muted-foreground mb-8">填写信息开始你的创作之旅</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5 opacity-0 animate-fade-in-up animate-delay-100">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">昵称</label>
            <input
              v-model="nickname"
              type="text"
              required
              placeholder="你的昵称"
              class="input"
            />
          </div>

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
              placeholder="至少6位字符"
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
            <span v-else>注册</span>
          </button>
        </form>

        <div class="mt-8 text-center opacity-0 animate-fade-in-up animate-delay-200">
          <p class="text-sm text-muted-foreground">
            已有账户？
            <router-link to="/login" class="text-accent font-medium hover:underline">立即登录</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const nickname = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    const res = await authStore.register(email.value, password.value, nickname.value)
    if (res.code === 200) {
      router.push('/')
    } else {
      error.value = res.message
    }
  } catch {
    error.value = '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
