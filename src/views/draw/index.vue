<!--
 * @Description:
 * @Author: 孙善鹏
 * @Date: 2023-05-14 11:04:14
 * @LastEditTime: 2023-05-31 21:14:33
 * @LastEditors: 孙善鹏
 * @Reference:
-->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { NButton, NImage, NInput, NSpin, NText, NTooltip, NUpload, NUploadDragger, useMessage } from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
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
    let lastPrompt = prompt.value
    if (imgUrl.value) {
      lastPrompt = `${imgUrl.value} ${prompt.value}`
    }
    const data = await fetchDraw<MidjourneyResponse>(lastPrompt)
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

// 文件上传
const previewFileList = ref<UploadFileInfo[]>([])
const imgUrl = ref<string>('')
const handleUploadFinish = ({
  file,
  event,
}: {
  file: UploadFileInfo
  event?: ProgressEvent
}) => {
  debugger
  console.log(event)
  const url = (event?.target as XMLHttpRequest)?.response as string
  if (!url) {
    ms.error('上传失败，请重新上传')
    return
  }
  imgUrl.value = url
  ms.success('上传成功')
  return file
}
</script>

<template>
  <div
    class="h-full dark:bg-[#24272e] transition-all"
    :class="[isMobile ? 'p-0' : 'p-4']"
  >
    <Menu />
    <div class="flex items-center">
      <div class="mr-2">
        <NUpload
          directory-dnd
          action="api/upload"
          :default-file-list="previewFileList"
          :max="1"
          list-type="image-card"
          @finish="handleUploadFinish"
          :on-remove="() => {
            imgUrl = ''
          }"
        >
          <NUploadDragger>
            <NText style="font-size: 16px">
              上传垫图（可选）
            </NText>
          </NUploadDragger>
        </NUpload>
      </div>
      <div class="md:w-11/12 w-10/12 mr-2">
        <NInput
          v-model:value="prompt"
          class="mr-3"
          type="textarea"
          placeholder="输入你的创意，如：a cat . 你也可以输入中文，然后点击优化来生成优秀的创意"
        />
      </div>
      <div class="mx-auto">
        <div>
          <NTooltip trigger="hover">
            <template #trigger>
              <NButton
                type="primary" :disabled="prompt === ''" :loading="optimizeLoading || loading" @click="handleOptimization"
              >
                优化
              </NButton>
            </template>
            将你的提示词根据Midjourney的模型进行优化
          </NTooltip>
        </div>
        <div class="mt-2">
          <NTooltip trigger="hover">
            <template #trigger>
              <NButton type="primary" :disabled="prompt === ''" :loading="optimizeLoading || loading" @click="handleSubmit('')">
                生成
              </NButton>
            </template>
            根据你的提示词直接生成图片
          </NTooltip>
        </div>
      </div>
    </div>
    <div class="flex mt-5 w-full lg:w-5/6 mx-auto">
      <NImage
        v-if="midjourney.image_url"
        :src="midjourney.image_url"
        style="width: 100%; height: 100%; object-fit: cover;"
      />
      <div v-if="loading" class="pt-40 mx-auto">
        <NSpin>
          <template #description>
            图片生成中，请稍后。。。
          </template>
        </NSpin>
      </div>
    </div>
    <PromptOptimize
      v-if="optimizePromptVisible"
      :optimize-prompt="optimizePrompt"
      @close="optimizePromptVisible = false"
      @submit="handleSubmit($event)"
    />
  </div>
</template>
