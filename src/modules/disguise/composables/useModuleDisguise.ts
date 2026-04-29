import { computed } from 'vue'
import { useDisguiseStore } from '../stores/disguise'
import type { ModuleType, DisguiseTemplateType } from '@shared/types'

/**
 * 模块级别的伪装组合式函数
 * 每个业务模块使用此函数获取自己的伪装状态
 */
export function useModuleDisguise(module: ModuleType) {
  const disguiseStore = useDisguiseStore()

  const isDisguised = computed(() => disguiseStore.isDisguised && disguiseStore.moduleConfigs[module].enabled)
  const template = computed<DisguiseTemplateType>(() => disguiseStore.moduleConfigs[module].template)
  const isPaused = computed(() => disguiseStore.moduleActivityPaused[module])

  return {
    isDisguised,
    template,
    isPaused,
  }
}
