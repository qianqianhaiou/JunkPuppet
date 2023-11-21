<template>
  <Modal
    v-model:open="modalVisible"
    title="Basic"
    :footer="null"
    :getContainer="getModalContainer"
    :zIndex="2147483647"
    @cancel="emits('handleChangeFnModalVisible', false)"
  >
    <Button @click="addBuiltInEvent('snapshotFullScreen')">截取全屏幕</Button>
    <Button @click="addBuiltInEvent('snapshotCurrentScreen')"
      >截取当前屏幕</Button
    >
    <Button @click="addBuiltInEvent('delay')">添加等待</Button>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Modal } from 'ant-design-vue';

const emits = defineEmits(['addUserDoData', 'handleChangeFnModalVisible']);

const modalVisible = ref(true);
const getModalContainer = () => {
  const el: any = document.querySelector(
    '#puppeteer-sunsilent-shadow-root'
  )!.shadowRoot;
  return el;
};

// 添加内置功能
const addBuiltInEvent = (name: string, data?: object) => {
  if (name === 'snapshotFullScreen') {
    emits('addUserDoData', {
      type: 'snapshotFullScreen',
      slot: true,
      data: {},
    });
  } else if (name === 'delay') {
    emits('addUserDoData', {
      type: 'delay',
      slot: true,
      delay: 1000,
    });
  } else if (name === 'snapshotCurrentScreen') {
    emits('addUserDoData', {
      type: 'snapshotCurrentScreen',
      slot: true,
      data: {
        scrollTop: document.documentElement.scrollTop,
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }
};
</script>
