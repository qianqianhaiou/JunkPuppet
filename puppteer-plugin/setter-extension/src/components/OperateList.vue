<template>
  <Drawer
    :open="true"
    width="600"
    title="当前页操作列表"
    :getContainer="getModalContainer"
    placement="right"
    @close="handleClose"
  >
    <div style="color: #000">
      <Collapse accordion>
        <CollapsePanel
          v-for="(item, index) in userDoData"
          :header="formatOperateType(item.type)"
          :key="index"
        >
          <div>{{ item }}</div>
          <Button type="link">编辑</Button>
        </CollapsePanel>
      </Collapse>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { Button, Drawer, Collapse, CollapsePanel } from 'ant-design-vue';
import { computed, ref } from 'vue';
import { formatOperateType } from '@/util/format';

const props = defineProps({
  userDoData: {
    type: Object,
    default: () => [],
  },
});
const emits = defineEmits(['handleChangeListVisible']);

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

const handleClose = () => {
  emits('handleChangeListVisible', false);
};
</script>

<style></style>