<template>
  <Modal
    ref="modalRef"
    :width="600"
    :open="true"
    :wrap-style="{ overflow: 'hidden', pointerEvents: 'none' }"
    :getContainer="getModalContainer"
    placement="right"
    :maskClosable="false"
    :mask="false"
    :bodyStyle="{
      maxHeight: '700px',
      minHeight: bodyVisible ? '500px' : '0px',
      overflowY: 'auto',
    }"
    :footer="null"
    :z-index="2147483646"
    @cancel="handleClose"
  >
    <div v-show="bodyVisible" style="color: #000; margin-top: 10px">
      <FnBoxModal
        v-if="fnBoxVisible"
        @handleChangeFnModalVisible="handleChangeFnBoxVisible(false)"
        @addUserDoData="addUserDoData"
      ></FnBoxModal>
      <template v-if="userDoData && userDoData.length">
        <Collapse v-model:active-key="activeKey" accordion>
          <CollapsePanel
            v-for="(item, index) in userDoData"
            :header="formatOperateType(item.type)"
            :collapsible="item.slot ? 'header' : 'disabled'"
            :show-arrow="false"
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
    <template #title>
      <div
        ref="modalTitleRef"
        style="width: 100%; cursor: move; display: flex; align-items: center"
      >
        <div style="padding: 0px 10px">
          <template v-if="bodyVisible">
            <UpOutlined @click="bodyVisible = false" />
          </template>
          <template v-else>
            <DownOutlined @click="bodyVisible = true" />
          </template>
        </div>
        当前页操作列表 （
        <span
          style="font-weight: bolder; margin-left: 2px; margin-right: 2px"
          >{{ userDoData.length }}</span
        >
        条）
        <div style="height: 24px" v-if="bodyVisible">
          <Button
            style="height: 22px; padding-top: 0px; padding-bottom: 0px; font-size: 14px; line-height: 22px;"
            type="link"
            @click="handleChangeFnBoxVisible(true)"
            >内置工具</Button
          >
        </div>
      </div>
    </template>
    <template #modalRender="{ originVNode }">
      <div :style="transformStyle">
        <component :is="originVNode" />
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import {
  Button,
  Drawer,
  Collapse,
  CollapsePanel,
  Result,
  Modal,
} from 'ant-design-vue';
import { computed, ref, CSSProperties, watch, watchEffect } from 'vue';
import { useDraggable } from '@vueuse/core';
import { formatOperateType } from '@/util/format';
import { UpOutlined, DownOutlined, CloseOutlined } from '@ant-design/icons-vue';
import OperateEdit from './OperateEdit.vue';
import FnBoxModal from './FnBoxModal.vue';

const props = defineProps({
  userDoData: {
    type: Object,
    default: () => [],
  },
});
const emits = defineEmits([
  'handleChangeListVisible',
  'handleDelete',
  'handleUpdate',
  'addUserDoData',
]);

const userDoData = computed(() => {
  return props.userDoData;
});

const bodyVisible = ref(true);

// 挂载点
const getModalContainer = () => {
  const el: any = document.querySelector(
    '#puppeteer-sunsilent-shadow-root'
  )!.shadowRoot;
  return el;
};

// 拖动
const modalTitleRef = ref<any>(null);
const { x, y, isDragging } = useDraggable(modalTitleRef);
const startX = ref<number>(0);
const startY = ref<number>(0);
const startedDrag = ref(false);
const transformX = ref(0);
const transformY = ref(0);
const preTransformX = ref(0);
const preTransformY = ref(0);
const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 });
watch([x, y], () => {
  if (!startedDrag.value) {
    startX.value = x.value;
    startY.value = y.value;
    const bodyRect = document.body.getBoundingClientRect();
    const titleRect = modalTitleRef.value.getBoundingClientRect();
    dragRect.value.right = bodyRect.width - titleRect.width;
    dragRect.value.bottom = bodyRect.height - titleRect.height;
    preTransformX.value = transformX.value;
    preTransformY.value = transformY.value;
  }
  startedDrag.value = true;
});
watch(isDragging, () => {
  if (!isDragging) {
    startedDrag.value = false;
  }
});
watchEffect(() => {
  if (startedDrag.value) {
    transformX.value =
      preTransformX.value +
      Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
      startX.value;
    transformY.value =
      preTransformY.value +
      Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
      startY.value;
  }
});
const transformStyle = computed<CSSProperties>(() => {
  return {
    transform: `translate(${transformX.value}px, ${transformY.value}px)`,
  };
});

// 内置工具
const fnBoxVisible = ref(false);
const handleChangeFnBoxVisible = (visible: boolean) => {
  fnBoxVisible.value = visible;
};

const addUserDoData = (data: any) => {
  emits('addUserDoData', data);
};

// edit
const activeKey = ref(undefined);
const handleDelete = (index: string) => {
  activeKey.value = undefined;
  emits('handleDelete', index);
};
const handleUpdate = (index: string, data: any) => {
  emits('handleUpdate', index, data);
};

const handleClose = () => {
  emits('handleChangeListVisible', false);
};
</script>

<style></style>
