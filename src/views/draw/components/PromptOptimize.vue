<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NInput, NModal } from 'naive-ui'

interface Props {
  optimizePrompt: string
}
const props = defineProps<Props>()
const emit = defineEmits(['close', 'submit'])

const prompt = ref(props.optimizePrompt)
const loading = ref(false)
const visible = ref(true)
const disabled = computed(() => !prompt.value)

const handleClose = () => {
  prompt.value = ''
  emit('close')
}
const handleSubmit = () => {
  emit('submit', prompt.value)
}
</script>

<template>
  <NModal :show="visible" style="width: 90%; max-width: 640px">
    <div class="p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4">
        <header class="space-y-2">
          <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
            优化后的提示词
          </h2>
        </header>
        <div>
          <NInput
            v-model:value="prompt"
            placeholder="请输入提示词"
            clearable
            size="large"
            type="textarea"
            style="width: 100%"
          />
        </div>
        <div>
          <NButton
            block
            type="primary"
            :loading="loading"
            @click="handleClose"
          >
            放弃优化
          </NButton>
        </div>
        <div
          class="mt-4"
        >
          <NButton
            block
            type="primary"
            :disabled="disabled"
            :loading="loading"
            @click="handleSubmit"
          >
            使用优化后的prompt生成图片
          </NButton>
        </div>
      </div>
    </div>
  </NModal>
</template>
