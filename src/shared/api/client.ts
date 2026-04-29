import axios from 'axios'
import type { ApiResponse } from '@shared/types'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 自动注入JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 登录功能已禁用，不处理401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error)
  }
)

// 封装请求方法
export async function get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  const { data } = await apiClient.get<ApiResponse<T>>(url, { params })
  return data
}

export async function post<T>(url: string, body?: any, options?: { timeout?: number }): Promise<ApiResponse<T>> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, body, { timeout: options?.timeout })
  return data
}

export async function put<T>(url: string, body?: any): Promise<ApiResponse<T>> {
  const { data } = await apiClient.put<ApiResponse<T>>(url, body)
  return data
}

export async function patch<T>(url: string, body?: any): Promise<ApiResponse<T>> {
  const { data } = await apiClient.patch<ApiResponse<T>>(url, body)
  return data
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
  const { data } = await apiClient.delete<ApiResponse<T>>(url)
  return data
}

export async function upload<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export default apiClient
