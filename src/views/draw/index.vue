<!--
 * @Description:
 * @Author: 孙善鹏
 * @Date: 2023-05-14 11:04:14
 * @LastEditTime: 2023-05-14 20:17:11
 * @LastEditors: 孙善鹏
 * @Reference:
-->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { NButton, NImage, NInput, NSpin } from 'naive-ui'
import Menu from '@/components/common/Menu/index.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { fetchDraw } from '@/api'
interface MidjourneyResponse {
  task_id: string
  image_id: string
  image_url: string
  actions: []
}
const { isMobile } = useBasicLayout()
const prompt = ref<string>('')
const loading = ref<boolean>(false)
const midjourneySource = (): MidjourneyResponse => {
  return reactive({
    task_id: '',
    image_id: '',
    image_url: '',
    actions: [],
  })
}

let midjourney: MidjourneyResponse = reactive(midjourneySource())

function handleSubmit() {
  onDraw()
}
async function onDraw() {
  try {
    loading.value = true
    midjourney = reactive(midjourneySource())
    const data = await fetchDraw<MidjourneyResponse>(prompt.value)
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
      <NButton type="info" :disabled="prompt === ''" :loading="loading" @click="handleSubmit">
        生成
      </NButton>
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
  </div>
</template>
