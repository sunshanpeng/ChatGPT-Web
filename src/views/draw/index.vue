<!--
 * @Description:
 * @Author: 孙善鹏
 * @Date: 2023-05-14 11:04:14
 * @LastEditTime: 2023-05-14 17:11:40
 * @LastEditors: 孙善鹏
 * @Reference:
-->
<script setup lang="ts">
import { ref, reactive } from "vue";
import Menu from "@/components/common/Menu/index.vue";
import { NInput, NButton, NImage, NSpin, enUS } from 'naive-ui';
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { fetchDraw } from "@/api";
interface MidjourneyResponse {
    task_id: string
    image_id: string
    image_url: string
    actions: []
}
const { isMobile } = useBasicLayout()
const prompt = ref<string>("");
const loading = ref<boolean>(false)



let midjourney: MidjourneyResponse = reactive({

})

function handleSubmit() {
  onDraw();
}
async function onDraw() {
    try {
        loading.value = true
         midjourney = reactive({})
        const data = await fetchDraw<MidjourneyResponse>(prompt.value)
        midjourney = reactive(data)
    }catch(e) {
        console.log(e)
    }
    finally {
        loading.value = false
    }
};
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
        type="textarea"
        placeholder="输入你的创意，如：a cat"
      />
      <NButton class="ml-5" type="info" @click="handleSubmit" :disabled="prompt === ''">生成</NButton>
    </div>
    <div class="flex mt-5 w-1/4 mx-auto">
            <NImage
            v-if="midjourney.image_url"
              :src="midjourney.image_url"
            ></NImage>
      <NSpin v-if="loading">
        <template #description> 图片生成中，请稍后。。。 </template>
      </NSpin>
    </div>
  </div>
</template>
