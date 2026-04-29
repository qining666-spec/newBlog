import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthTokens } from '@shared/types'
import { get, post, patch } from '@shared/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const res = await post<{ user: User; tokens: AuthTokens }>('/auth/login', { email, password })
      if (res.code === 200 && res.data) {
        user.value = res.data.user
        localStorage.setItem('accessToken', res.data.tokens.accessToken)
        localStorage.setItem('refreshToken', res.data.tokens.refreshToken)
        localStorage.setItem('userId', res.data.user.id)
      }
      return res
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, nickname: string) {
    loading.value = true
    try {
      const res = await post<{ user: User; tokens: AuthTokens }>('/auth/register', { email, password, nickname })
      if (res.code === 200 && res.data) {
        user.value = res.data.user
        localStorage.setItem('accessToken', res.data.tokens.accessToken)
        localStorage.setItem('refreshToken', res.data.tokens.refreshToken)
        localStorage.setItem('userId', res.data.user.id)
      }
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    try {
      const res = await get<User>('/auth/me')
      if (res.code === 200 && res.data) {
        user.value = res.data
        localStorage.setItem('userId', res.data.id)
      }
    } catch {
      // token无效
      logout()
    }
  }

  async function updateProfile(data: { nickname?: string; avatar?: string; preferences?: any }) {
    const res = await patch<User>('/auth/me', data)
    if (res.code === 200 && res.data) {
      user.value = res.data
    }
    return res
  }

  function logout() {
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  return {
    user,
    loading,
    isLoggedIn,
    isAdmin,
    login,
    register,
    fetchMe,
    updateProfile,
    logout,
  }
})
