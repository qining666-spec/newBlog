<template>
  <div class="flex h-full bg-white dark:bg-gray-900">
    <!-- 侧边导航 -->
    <aside class="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <h2 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">目录</h2>
      <nav class="space-y-1">
        <div v-for="item in navItems" :key="item" class="text-sm text-gray-700 dark:text-gray-300 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
          {{ item }}
        </div>
      </nav>
    </aside>
    <!-- 主内容区 -->
    <main class="flex-1 p-8 overflow-y-auto">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">{{ title }}</h1>
      <div v-for="(para, i) in paragraphs" :key="i" class="mb-4">
        <p v-if="para.type === 'text'" class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ para.content }}</p>
        <pre v-else-if="para.type === 'code'" class="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm text-gray-800 dark:text-gray-200 overflow-x-auto"><code>{{ para.content }}</code></pre>
        <h3 v-else-if="para.type === 'heading'" class="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2">{{ para.content }}</h3>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const title = ref('深入响应性原理')
const navItems = ref([
  '什么是响应性？', '响应性变量', 'ref() 与 reactive()', '深层响应性',
  '计算属性', '侦听器', '副作用', '组合式函数', '最佳实践',
])
const paragraphs = ref<Array<{ type: string; content: string }>>([])

const contentPool = [
  { type: 'heading', content: '响应性系统概述' },
  { type: 'text', content: 'Vue 的响应性系统是基于 Proxy 实现的。当创建一个响应式对象时，Vue 会使用 Proxy 来拦截对对象的读取和修改操作，从而能够追踪依赖关系并在数据变化时触发更新。' },
  { type: 'code', content: 'const count = ref(0)\n\nwatchEffect(() => {\n  console.log(count.value)\n})\n\ncount.value++' },
  { type: 'text', content: '当 count.value 改变时，watchEffect 的回调函数会自动重新执行。这是因为 Vue 在执行回调时追踪了 count.value 的读取操作，建立了依赖关系。' },
  { type: 'heading', content: 'Proxy 代理机制' },
  { type: 'text', content: 'Vue 3 使用 ES6 Proxy 来实现响应性。Proxy 可以拦截对象上的多种操作，包括属性读取、属性设置、属性删除等。这使得 Vue 能够在属性被访问时收集依赖，在属性被修改时触发更新。' },
  { type: 'code', content: 'const reactive = (target) => {\n  return new Proxy(target, {\n    get(target, key, receiver) {\n      track(target, key)\n      return Reflect.get(target, key, receiver)\n    },\n    set(target, key, value, receiver) {\n      trigger(target, key)\n      return Reflect.set(target, key, value, receiver)\n    }\n  })\n}' },
  { type: 'text', content: '这种基于 Proxy 的实现方式相比 Vue 2 的 Object.defineProperty 有几个优势：可以检测属性的添加和删除、可以检测数组索引和长度的修改、性能更好。' },
]

let refreshTimer: ReturnType<typeof setInterval> | null = null

function refreshContent() {
  const shuffled = [...contentPool].sort(() => Math.random() - 0.5)
  paragraphs.value = shuffled.slice(0, 5 + Math.floor(Math.random() * 3))
}

onMounted(() => {
  refreshContent()
  refreshTimer = setInterval(refreshContent, 30000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
