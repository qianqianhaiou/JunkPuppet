<template>
  <Drawer
    :open="true"
    width="600"
    :getContainer="getModalContainer"
    placement="right"
    :maskClosable="false"
    :mask="false"
    @close="handleClose"
  >
    <template #title>
      <div ref="modalTitleRef" style="width: 100%; cursor: move">
        当前页操作列表
      </div>
    </template>
    <div style="color: #000">
      <template v-if="userDoData && userDoData.length">
        <Collapse v-model:active-key="activeKey" accordion>
          <CollapsePanel
            v-for="(item, index) in userDoData"
            :header="formatOperateType(item.type)"
            :key="index"
          >
            <OperateEdit
              :data="item"
              :dindex="index"
              @delete="handleDelete"
              @update="handleUpdate"
            ></OperateEdit>
          </CollapsePanel>
        </Collapse>
      </template>
      <template v-else>
        <Result status="404" title="没有操作" sub-title="当前没有操作"></Result>
      </template>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import {
  Button,
  Drawer,
  Collapse,
  CollapsePanel,
  Result,
} from 'ant-design-vue';
import { computed, ref } from 'vue';
import { useDraggable } from '@vueuse/core';
import { formatOperateType } from '@/util/format';
import OperateEdit from './OperateEdit.vue';

const props = defineProps({
  userDoData: {
    type: Object,
    default: () => [],
  },
});
const emits = defineEmits(['handleChangeListVisible', 'handleDelete', 'handleUpdate']);

const userDoData = computed(() => {
  return props.userDoData;
});

// 挂载点
const getModalContainer = () => {
  const el: any = document.querySelector(
    '#puppeteer-sunsilent-shadow-root'
  )!.shadowRoot;
  return el;
};

// 拖动

const activeKey = ref(undefined);
const handleDelete = (index: string) => {
  activeKey.value = undefined;
  emits('handleDelete', index);
};
const handleUpdate = (index: string, data: any) => {
  emits('handleUpdate', index, data);
}

const handleClose = () => {
  emits('handleChangeListVisible', false);
};
</script>

<style></style>
