import { watch, onUnmounted } from 'vue'
import { useDocumentVisibility, useWindowFocus } from '@vueuse/core'
import { useDisguiseStore } from '../stores/disguise'

let debounceTimer: ReturnType<typeof setTimeout> | null = null

export function useAutoDisguiseOnBlur() {
  const disguiseStore = useDisguiseStore()
  const visibility = useDocumentVisibility()
  const focused = useWindowFocus()

  function onBlur() {
    if (disguiseStore.triggerConfig.autoDisguiseOnBlur && !disguiseStore.isDisguised) {
      disguiseStore.activate()
      disguiseStore.pauseAllModules()
    }
  }

  const stopWatch = watch(focused, (isFocused) => {
    if (!isFocused) {
      // 延迟触发，避免快速切换误触
      debounceTimer = setTimeout(onBlur, disguiseStore.triggerConfig.blurDelay)
    } else {
      // 窗口重新获得焦点时，清除待执行的伪装
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
      // 窗口重新获得焦点时自动恢复，解除伪装
      if (disguiseStore.isDisguised) {
        disguiseStore.deactivate()
        disguiseStore.resumeAllModules()
      }
    }
  })

  // 同时监听文档可见性变化
  const stopVisibilityWatch = watch(visibility, (vis) => {
    if (vis === 'hidden' && disguiseStore.triggerConfig.autoDisguiseOnBlur && !disguiseStore.isDisguised) {
      disguiseStore.activate()
      disguiseStore.pauseAllModules()
    }
  })

  onUnmounted(() => {
    stopWatch()
    stopVisibilityWatch()
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  })
}
