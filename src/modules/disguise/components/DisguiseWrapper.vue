<template>
  <div class="relative">
    <Transition name="disguise" mode="out-in">
      <div v-if="isDisguised" key="disguise" class="absolute inset-0">
        <VscodeTemplate />
      </div>
      <div v-else key="real">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useModuleDisguise } from '../composables/useModuleDisguise'
import type { ModuleType } from '@shared/types'
import VscodeTemplate from '@disguise-templates/vscode/VscodeTemplate.vue'

const props = defineProps<{
  module: ModuleType
}>()

const { isDisguised } = useModuleDisguise(props.module)
</script>
