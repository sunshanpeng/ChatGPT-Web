<!--
 * @Description:
 * @Author: 孙善鹏
 * @Date: 2023-05-14 12:27:51
 * @LastEditTime: 2023-05-14 15:18:38
 * @LastEditors: 孙善鹏
 * @Reference:
-->
<script lang="ts" setup>
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import { h, ref } from 'vue'
import { NIcon, NMenu, NCard } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
    ColorPaletteOutline as Draw,
    ChatboxEllipsesOutline as Chat
} from '@vicons/ionicons5'

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'Chat',
          }
        },
        { default: () => 'AI聊天' }
      ),
    key: 'chat',
    icon: renderIcon(Chat),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'Draw',
          }
        },
        { default: () => 'AI画画' }
      ),
    key: 'draw',
    icon: renderIcon(Draw),
  },
]
const activeKey = ref<string | null>(null)
</script>

<template> 
<NCard class="flex justify-center items-center pb-1 mb-2" style="--n-padding-bottom:0">
    <NMenu v-model:value="activeKey" mode="horizontal" :options="menuOptions" />
    </NCard>
</template>
