<template>
  <div class="tools" ref="toolsRef" :style="{ top: `${toolsDomTop}px`, left: `${toolsDomLeft}px` }">
    <div class="tools-header">
      <div class="move" @mousedown="handleStartMoving">
        <IconMove></IconMove>
      </div>
      <div class="scale">
        <IconMinimize></IconMinimize>
      </div>
    </div>
    <div @click="() => setToolsActive('text')">提取文本</div>
    <div @click="() => setToolsActive('snapshot')">截图元素</div>
    <div @click="() => setToolsActive('link')">点击跳转</div>
    <div @click="handleChangeSelectSimilar">选择相似</div>
    <div @click="handleOpenList">操作列表</div>
    <div @click="() => emits('finishSetting')">结束</div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onBeforeMount } from 'vue';
import { sendMessage } from '../util/service';
import IconMove from './icons/Move.vue';
import IconMinimize from './icons/Minimize.vue';

const emits = defineEmits([
  'addUserDoData',
  'handleChangeSelectSimilar',
  'finishSetting',
  'handleUpdateTool',
  'handleChangeListVisible',
]);

const toolsRef = ref(null);
const toolsDomTop = ref(15);
const toolsDomLeft = ref(window.innerWidth - 320 - 15);
const handleMoving = (e: MouseEvent) => {
  e.stopPropagation();
  toolsDomTop.value = e.y - 4;
  toolsDomLeft.value = e.x - 4;
};
const handleStartMoving = () => {
  document.documentElement.style.userSelect = 'none';
  document.documentElement.addEventListener('mousemove', handleMoving);
};

// 工具箱
const toolsActive = ref('link');
const setToolsActive = (item: string) => {
  toolsActive.value = item;
  emits('handleUpdateTool', item);
};

const handleOpenList = () => {
  emits('handleChangeListVisible', true);
};

// 选择相似
const selectSimilar = ref(false);
const handleChangeSelectSimilar = () => {
  selectSimilar.value = !selectSimilar.value;
  emits('handleChangeSelectSimilar', selectSimilar.value);
};

onBeforeMount(() => {
  document.documentElement.addEventListener('mouseup', () => {
    document.documentElement.style.userSelect = 'unset';
    document.documentElement.removeEventListener('mousemove', handleMoving);
  });
});
</script>
