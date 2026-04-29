import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DisguiseState, DisguiseTemplateType, ModuleType, ModuleDisguiseConfig, TriggerConfig } from '@shared/types'

// 所有模块统一使用VSCode编辑器伪装
const DEFAULT_MODULE_CONFIGS: Record<ModuleType, ModuleDisguiseConfig> = {
  novel: { enabled: true, template: 'vscode', customTitle: 'App.vue - 项目代码 - Visual Studio Code', customFavicon: '/favicons/vscode.ico', transitionDuration: 150 },
  game: { enabled: true, template: 'vscode', customTitle: 'main.ts - 项目代码 - Visual Studio Code', customFavicon: '/favicons/vscode.ico', transitionDuration: 150 },
  video: { enabled: true, template: 'vscode', customTitle: 'router.ts - 项目代码 - Visual Studio Code', customFavicon: '/favicons/vscode.ico', transitionDuration: 150 },
  blog: { enabled: true, template: 'vscode', customTitle: 'store.ts - 项目代码 - Visual Studio Code', customFavicon: '/favicons/vscode.ico', transitionDuration: 150 },
  chat: { enabled: true, template: 'vscode', customTitle: 'helpers.ts - 项目代码 - Visual Studio Code', customFavicon: '/favicons/vscode.ico', transitionDuration: 150 },
}

const DEFAULT_TRIGGER_CONFIG: TriggerConfig = {
  shortcutKey: 'ctrl+shift+d',
  autoDisguiseOnBlur: false,
  blurDelay: 300,
}

const STORAGE_KEY = 'disguise-state'

function loadPersistedState(): Partial<DisguiseState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const useDisguiseStore = defineStore('disguise', () => {
  const persisted = loadPersistedState()

  // 初始化时始终以非伪装状态启动，避免刷新后仍被伪装覆盖
  const isDisguised = ref(false)
  const activeTemplate = ref<DisguiseTemplateType>('vscode')
  const moduleConfigs = ref<Record<ModuleType, ModuleDisguiseConfig>>(
    persisted?.moduleConfigs ?? { ...DEFAULT_MODULE_CONFIGS }
  )
  const triggerConfig = ref<TriggerConfig>(persisted?.triggerConfig ?? { ...DEFAULT_TRIGGER_CONFIG })

  // 原始标题和favicon
  const originalTitle = document.title
  const originalFavicon = document.querySelector('link[rel="icon"]')?.getAttribute('href') || '/favicon.svg'

  function toggle() {
    if (isDisguised.value) {
      deactivate()
    } else {
      activate()
    }
  }

  function activate() {
    isDisguised.value = true
    applyTabDisguise()
    persistState()
  }

  function deactivate() {
    isDisguised.value = false
    restoreTab()
    persistState()
  }

  function setModuleTemplate(module: ModuleType, template: DisguiseTemplateType) {
    moduleConfigs.value[module].template = template
    persistState()
  }

  function getModuleTemplate(module: ModuleType): DisguiseTemplateType {
    return moduleConfigs.value[module].template
  }

  function applyTabDisguise() {
    const currentModule = getCurrentModule()
    if (currentModule) {
      const config = moduleConfigs.value[currentModule]
      document.title = config.customTitle
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (favicon) {
        favicon.href = config.customFavicon
      }
    }
  }

  function restoreTab() {
    document.title = originalTitle
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) {
      favicon.href = originalFavicon
    }
  }

  function getCurrentModule(): ModuleType | null {
    const path = window.location.pathname
    if (path.startsWith('/novel')) return 'novel'
    if (path.startsWith('/game')) return 'game'
    if (path.startsWith('/video')) return 'video'
    if (path.startsWith('/blog')) return 'blog'
    if (path.startsWith('/chat')) return 'chat'
    return null
  }

  function persistState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isDisguised: isDisguised.value,
      activeTemplate: activeTemplate.value,
      moduleConfigs: moduleConfigs.value,
      triggerConfig: triggerConfig.value,
    }))
  }

  // 模块活动控制
  const moduleActivityPaused = ref<Record<ModuleType, boolean>>({
    novel: false,
    game: false,
    video: false,
    blog: false,
    chat: false,
  })

  function pauseModule(module: ModuleType) {
    moduleActivityPaused.value[module] = true
  }

  function resumeModule(module: ModuleType) {
    moduleActivityPaused.value[module] = false
  }

  function pauseAllModules() {
    ;(Object.keys(moduleActivityPaused.value) as ModuleType[]).forEach((m) => {
      moduleActivityPaused.value[m] = true
    })
  }

  function resumeAllModules() {
    ;(Object.keys(moduleActivityPaused.value) as ModuleType[]).forEach((m) => {
      moduleActivityPaused.value[m] = false
    })
  }

  return {
    isDisguised,
    activeTemplate,
    moduleConfigs,
    triggerConfig,
    moduleActivityPaused,
    toggle,
    activate,
    deactivate,
    setModuleTemplate,
    getModuleTemplate,
    pauseModule,
    resumeModule,
    pauseAllModules,
    resumeAllModules,
  }
})
