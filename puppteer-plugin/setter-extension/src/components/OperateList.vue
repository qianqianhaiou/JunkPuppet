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
      <div style="width: 100%; cursor: move; display: flex; align-items: center">
        <div style="padding: 0px 10px">
          <template v-if="bodyVisible">
            <UpOutlined @click="bodyVisible = false" />
          </template>
          <template v-else>
            <DownOutlined @click="bodyVisible = true" />
          </template>
        </div>
        当前页操作列表 （
        <span style="font-weight: bolder; margin-left: 2px; margin-right: 2px">
          {{ userDoData.length }}
        </span>
        条）
        <div style="height: 24px" v-if="bodyVisible">
          <Button
            style="
              height: 22px;
              padding-top: 0px;
              padding-bottom: 0px;
              font-size: 14px;
              line-height: 22px;
            "
            type="link"
            @click="handleChangeFnBoxVisible(true)"
          >
            内置工具
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref, CSSProperties, watch, watchEffect } from 'vue';
import { formatOperateType } from '@/util/format';
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
  const el: any = document.querySelector('#puppeteer-sunsilent-shadow-root')!.shadowRoot;
  return el;
};

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
