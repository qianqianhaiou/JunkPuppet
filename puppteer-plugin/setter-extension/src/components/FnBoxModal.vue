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
    rootClassName="fnbox_modal"
  >
    <Collapse v-model:active-key="activeKey" accordion>
      <CollapsePanel collapsible="header" :showArrow="false">
        <template #header>
          <div
            style="
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <div style="display: flex; align-items: center">
              <CameraOutlined style="font-size: 24px"></CameraOutlined>
              <span style="margin-left: 10px">截取全屏幕</span>
            </div>
            <div>
              <Button
                type="link"
                @click="(e) => addBuiltInEvent(e, 'snapshotFullScreen')"
              >
                添加
              </Button>
            </div>
          </div>
        </template>
        <div>截取整个网页的截图，包括网页主体滚动条可以滚动的地方。</div>
      </CollapsePanel>
      <CollapsePanel collapsible="header" :showArrow="false">
        <template #header>
          <div
            style="
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <div style="display: flex; align-items: center">
              <CameraOutlined style="font-size: 24px"></CameraOutlined>
              <span style="margin-left: 10px">截取当前屏幕</span>
            </div>
            <div>
              <Button
                type="link"
                @click="(e) => addBuiltInEvent(e, 'snapshotCurrentScreen')"
              >
                添加
              </Button>
            </div>
          </div>
        </template>
        <div>
          截取当前网页可视区的截图，及当前可以看到的地方，不包括滚动条。
        </div>
      </CollapsePanel>
      <CollapsePanel collapsible="header" :showArrow="false">
        <template #header>
          <div
            style="
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <div style="display: flex; align-items: center">
              <CameraOutlined style="font-size: 24px"></CameraOutlined>
              <span style="margin-left: 10px">添 加 等 待</span>
            </div>
            <div>
              <Button type="link" @click="(e) => addBuiltInEvent(e, 'delay')">
                添加
              </Button>
            </div>
          </div>
        </template>
        <div>添加等待时长，一般用于执行某个操作后需要等待的情况。</div>
      </CollapsePanel>
    </Collapse>
  </Drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Drawer, Space, Collapse, CollapsePanel } from 'ant-design-vue';
import { CameraOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';
const emits = defineEmits(['addUserDoData', 'handleChangeFnModalVisible']);

const activeKey = ref();
// 添加内置功能
const addBuiltInEvent = (e: any, name: string, data?: object) => {
  e.stopPropagation();
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
