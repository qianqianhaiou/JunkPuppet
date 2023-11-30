<template>
  <Drawer
    :open="true"
    placement="right"
    title="内置工具箱"
    :width="500"
    :footer="null"
    :getContainer="false"
    :zIndex="2147483647"
    @close="emits('handleChangeFnModalVisible', false)"
    :style="{ position: 'absolute' }"
  >
    <Space>
      <Button @click="addBuiltInEvent('snapshotFullScreen')">
        <template #icon>
          <CameraOutlined></CameraOutlined>
        </template>
        截取全屏幕
      </Button>
      <Button @click="addBuiltInEvent('snapshotCurrentScreen')">
        <template #icon>
          <CameraOutlined></CameraOutlined>
        </template>
        截取当前屏幕</Button
      >
      <Button @click="addBuiltInEvent('delay')">
        <template #icon>
          <ClockCircleOutlined></ClockCircleOutlined>
        </template>
        添 加 等 待</Button
      >
    </Space>
  </Drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Drawer, Space } from 'ant-design-vue';
import { CameraOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';
const emits = defineEmits(['addUserDoData', 'handleChangeFnModalVisible']);

// 添加内置功能
const addBuiltInEvent = (name: string, data?: object) => {
  if (name === 'snapshotFullScreen') {
    emits('addUserDoData', {
      type: 'snapshotFullScreen',
      label: '',
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
      label: '',
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
