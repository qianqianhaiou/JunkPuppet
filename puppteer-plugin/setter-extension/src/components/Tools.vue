<template>
  <FloatButtonGroup trigger="hover" type="default" :style="{ right: '36px', bottom: '200px' }">
    <template #icon>
      <CodeSandboxOutlined />
    </template>
    <FloatButton
      :type="toolsActive === 'text' ? 'primary' : 'default'"
      tooltip="提取文本"
      :onClick="() => setToolsActive('text')"
    >
      <template #icon>
        <FontSizeOutlined />
      </template>
    </FloatButton>
    <FloatButton
      :type="toolsActive === 'snapshot' ? 'primary' : 'default'"
      tooltip="截图元素"
      :onClick="() => setToolsActive('snapshot')"
    >
      <template #icon>
        <CameraOutlined />
      </template>
    </FloatButton>
    <FloatButton
      :type="toolsActive === 'link' ? 'primary' : 'default'"
      tooltip="点击跳转"
      :onClick="() => setToolsActive('link')"
    >
      <template #icon>
        <LinkOutlined />
      </template>
    </FloatButton>
    <FloatButton
      tooltip="选择相似"
      :type="selectSimilar ? 'primary' : 'default'"
      :onClick="handleChangeSelectSimilar"
    >
      <template #icon>
        <GroupOutlined />
      </template>
    </FloatButton>
    <FloatButton tooltip="操作列表" :onClick="handleOpenList">
      <template #icon>
        <OrderedListOutlined />
      </template>
    </FloatButton>
    <FloatButton tooltip="结束" :onClick="() => emits('finishSetting')">
      <template #icon>
        <PoweroffOutlined />
      </template>
    </FloatButton>
  </FloatButtonGroup>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { sendMessage } from '../util/service';
import { FloatButtonGroup, FloatButton, Modal } from 'ant-design-vue';
import {
  CodeSandboxOutlined,
  FontSizeOutlined,
  CameraOutlined,
  LinkOutlined,
  PoweroffOutlined,
  GroupOutlined,
  ToolOutlined,
  OrderedListOutlined,
} from '@ant-design/icons-vue';

const emits = defineEmits([
  'addUserDoData',
  'handleChangeSelectSimilar',
  'finishSetting',
  'handleUpdateTool',
  'handleChangeListVisible',
]);

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
</script>
