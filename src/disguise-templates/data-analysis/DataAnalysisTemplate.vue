<template>
  <div class="flex h-full bg-white dark:bg-gray-900">
    <!-- 左侧筛选条件栏 -->
    <aside class="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <h2 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">筛选条件</h2>
      <div class="space-y-3">
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">时间范围</label>
          <div class="text-sm text-gray-700 dark:text-gray-300 mt-1">2024-01-01 ~ 2024-01-31</div>
        </div>
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">部门</label>
          <div class="text-sm text-gray-700 dark:text-gray-300 mt-1">技术部</div>
        </div>
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400">指标类型</label>
          <div class="text-sm text-gray-700 dark:text-gray-300 mt-1">全部</div>
        </div>
      </div>
    </aside>
    <!-- 主内容区 -->
    <main class="flex-1 overflow-y-auto p-6">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-4">数据分析报表</h1>
      <!-- 图表占位 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-48 flex items-center justify-center">
          <div class="text-center">
            <div class="text-3xl mb-2">📊</div>
            <p class="text-sm text-gray-500 dark:text-gray-400">趋势图</p>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-48 flex items-center justify-center">
          <div class="text-center">
            <div class="text-3xl mb-2">📈</div>
            <p class="text-sm text-gray-500 dark:text-gray-400">分布图</p>
          </div>
        </div>
      </div>
      <!-- 数据表格 -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th v-for="col in columns" :key="col" class="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rows" :key="i" class="border-b border-gray-100 dark:border-gray-800">
              <td v-for="(cell, j) in row" :key="j" class="px-4 py-2.5 text-gray-700 dark:text-gray-300">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const columns = ref(['指标名称', '本期值', '上期值', '环比', '同比'])
const rows = ref([
  ['页面访问量', '12,345', '10,890', '+13.4%', '+25.6%'],
  ['用户活跃数', '3,456', '3,210', '+7.7%', '+18.2%'],
  ['转化率', '2.8%', '2.5%', '+12.0%', '+16.7%'],
  ['平均停留时长', '4m32s', '3m58s', '+14.3%', '+22.1%'],
  ['跳出率', '35.2%', '38.1%', '-7.6%', '-12.3%'],
])

let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshTimer = setInterval(() => {
    rows.value = rows.value.map(row => {
      const newVal = Math.floor(10000 + Math.random() * 5000)
      return [row[0], newVal.toLocaleString(), row[2], row[3], row[4]]
    })
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
