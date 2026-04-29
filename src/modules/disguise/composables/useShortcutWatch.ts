import { onMounted, onUnmounted } from 'vue'
import { useDisguiseStore } from '../stores/disguise'

export function useShortcutWatch() {
  const disguiseStore = useDisguiseStore()

  function handleKeydown(e: KeyboardEvent) {
    // Ctrl+Shift+D 快捷键
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault()
      disguiseStore.toggle()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}
