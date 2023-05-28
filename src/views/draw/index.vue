<!--
 * @Description:
 * @Author: 孙善鹏
 * @Date: 2023-05-14 11:04:14
 * @LastEditTime: 2023-05-28 12:24:57
 * @LastEditors: 孙善鹏
 * @Reference:
-->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { NButton, NImage, NInput, NSpin, useMessage } from 'naive-ui'
import PromptOptimize from './components/PromptOptimize.vue'
import Menu from '@/components/common/Menu/index.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { fetchDraw, mjOptimize } from '@/api'
interface MidjourneyResponse {
  task_id: string
  image_id: string
  image_url: string
  actions: []
}
const ms = useMessage()
const { isMobile } = useBasicLayout()
const prompt = ref<string>('')
const optimizePrompt = ref<string>('')
const optimizePromptVisible = ref<boolean>(false)
const loading = ref<boolean>(false)
const optimizeLoading = ref<boolean>(false)
const midjourneySource = (): MidjourneyResponse => {
  return reactive({
    task_id: '',
    image_id: '',
    image_url: '',
    actions: [],
  })
}

let midjourney: MidjourneyResponse = reactive(midjourneySource())

function handleSubmit(p: string) {
  if (p) {
    optimizePromptVisible.value = false
    prompt.value = p
  }

  onDraw()
}
async function handleOptimization() {
  optimizeLoading.value = true
  const data = await mjOptimize(prompt.value)
  optimizeLoading.value = false
  if (data?.data.text) {
    optimizePrompt.value = data.data.text
    optimizePromptVisible.value = true
  }
}
async function onDraw() {
  try {
    loading.value = true
    midjourney = reactive(midjourneySource())
    const data = await fetchDraw<MidjourneyResponse>(prompt.value)
    if (data.errorMessage) {
      ms.error(data.errorMessage)
      return
    }
    Object.assign(midjourney, data)
  }
  catch (e) {
    console.log(e)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="h-full dark:bg-[#24272e] transition-all"
    :class="[isMobile ? 'p-0' : 'p-4']"
  >
    <Menu />
    <div class="flex items-center">
      <NInput
        v-model:value="prompt"
        class="mr-3"
        type="textarea"
        placeholder="输入你的创意，如：a cat"
      />
      <div class=" mx-auto">
        <div>
          <NButton
            type="primary" :disabled="prompt === ''" :loading="optimizeLoading || loading" @click="handleOptimization"
          >
            优化
          </NButton>
        </div>
        <div class="mt-2">
          <NButton type="primary" :disabled="prompt === ''" :loading="optimizeLoading || loading" @click="handleSubmit('')">
            生成
          </NButton>
        </div>
      </div>
    </div>
    <div class="flex mt-5 w-1/4 mx-auto">
      <NImage
        v-if="midjourney.image_url"
        :src="midjourney.image_url"
      />
      <NSpin v-if="loading">
        <template #description>
          图片生成中，请稍后。。。
        </template>
      </NSpin>
    </div>
    <PromptOptimize
      v-if="optimizePromptVisible"
      :optimize-prompt="optimizePrompt"
      @close="optimizePromptVisible = false"
      @submit="handleSubmit($event)"
    />
  </div>
</template>
