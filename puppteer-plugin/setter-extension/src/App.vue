<template>
  <div class="container" v-if="currentDocument === 'top'">
    <BoxModal
      @addUserDoData="addUserDoData"
      @handleChangeSelectSimilar="handleChangeSelectSimilar"
      @finishSetting="finishSetting"
    ></BoxModal>
  </div>
  <!-- <GlobalListender
    :tool="tool"
    :selectSimilar="selectSimilar"
    :userDoDataLastType="userDoDataLastType"
    @addUserDoData="addUserDoData"
    @addHiddenData="addHiddenData"
    @clickAndWaitNavigator="clickAndWaitNavigator"
  ></GlobalListender> -->
  <Popup :selectSimilar="selectSimilar" @addUserDoData="addUserDoData"></Popup>
  <MouseMoveBox ref="mouseMoveBoxRef"></MouseMoveBox>
  <!-- <OperateList
    v-if="listVisible"
    :userDoData="userDoData"
    @handleChangeListVisible="handleChangeListVisible"
    @handleDelete="handleDelete"
    @handleUpdate="handleUpdate"
    @addUserDoData="addUserDoData"
  ></OperateList> -->
</template>
<script setup lang="ts">
import { nextTick, onMounted, provide } from '@vue/runtime-core';
import { ref, reactive, Ref, computed } from 'vue';
import GlobalListender from './components/GlobalListener.vue';
import Popup from './components/Popup.vue';
import BoxModal from './components/BoxModal.vue';
import MouseMoveBox from './components/MouseMoveBox.vue';
// import OperateList from './components/OperateList.vue';
import { sendMessage } from './util/service';
const currentDocument = ref('top');

// 选择相似项
const selectSimilar = ref(false);
const handleChangeSelectSimilar = (similar: boolean) => {
  selectSimilar.value = similar;
};

// 全局元素选择
const globalSelectVisible = ref(false);
const handleChangeGlobalSelectVisible = (visible: boolean) => {
  globalSelectVisible.value = visible;
};
const mouseMoveBoxRef = ref(null);
const selectingResult = ref();
const setSelectingResult = (data: any) => {
  selectingResult.value = data;
};

provide('selectSimilar', selectSimilar);
provide('handleChangeSelectSimilar', handleChangeSelectSimilar);
provide('globalSelectVisible', globalSelectVisible);
provide('handleChangeGlobalSelectVisible', handleChangeGlobalSelectVisible);
provide('selectingResult', selectingResult);
provide('setSelectingResult', setSelectingResult);

// 用户操作数据
const userDoData = ref<any>([]);
const addUserDoData = (item: any) => {
  userDoData.value.push(item);
};

// 键鼠模拟数据
const mouseKeyData = ref<any>([]);
const addMouseKeyData = (item: any) => {
  mouseKeyData.value.push(item);
};

const computedUserDoData = () => {};

// 点击跳转  页面会刷新并出现数据断层，所有应该先保存之前的部分数据
const clickAndWaitNavigator = (data: any) => {
  const target = computedUserDoData();
  sendMessage({
    type: 'clickAndWaitNavigator',
    data: {
      ...data,
    },
    userDoData: target,
  });

  // 丢弃导航后 1s 内的操作数据，为了防止Puppeteer导航模拟的事件被记录
  setTimeout(() => {
    userDoData.value = [];
    mouseKeyData.value = [];
  }, 1000);
};

// 结束设置
const finishSetting = () => {
  const target = computedUserDoData();
  console.log(target);
  sendMessage({
    type: 'finishSetting',
    data: target,
  });
};

const init = () => {
  if (self === top) {
    currentDocument.value = 'top';
  } else {
    currentDocument.value = 'iframe';
  }
};
onMounted(async () => {
  init();
});
</script>
