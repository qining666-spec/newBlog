<template>
  <router-view />
</template>

<script setup lang="ts">
import { useDisguiseStore } from '@modules/disguise/stores/disguise'
import { useShortcutWatch } from '@modules/disguise/composables/useShortcutWatch'
import { useAutoDisguiseOnBlur } from '@modules/disguise/composables/useAutoDisguiseOnBlur'

useDisguiseStore() // 初始化伪装Store（全局单例）
useShortcutWatch()
useAutoDisguiseOnBlur()
</script>
