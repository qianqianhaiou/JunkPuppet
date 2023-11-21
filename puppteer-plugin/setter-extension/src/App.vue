<template>
  <div v-if="currentDocument === 'top'">
    <Tools
      @addUserDoData="addUserDoData"
      @handleChangeSelectSimilar="handleChangeSelectSimilar"
      @handleChangeFnModalVisible="handleChangeFnModalVisible"
      @finishSetting="finishSetting"
      @handleUpdateTool="handleUpdateTool"
    ></Tools>
  </div>
  <GlobalListender
    :tool="tool"
    :selectSimilar="selectSimilar"
    :userDoDataLastType="userDoDataLastType"
    @addUserDoData="addUserDoData"
    @addHiddenData="addHiddenData"
  ></GlobalListender>
  <Popup></Popup>
  <FnBoxModal
    v-if="fnModal"
    @addUserDoData="addUserDoData"
    @handleChangeFnModalVisible="handleChangeFnModalVisible"
  ></FnBoxModal>
</template>
<script setup lang="ts">
import { nextTick, onMounted } from '@vue/runtime-core';
import { ref, reactive, Ref, computed } from 'vue';
import GlobalListender from './components/GlobalListener.vue';
import Popup from './components/Popup.vue';
import Tools from './components/Tools.vue';
import FnBoxModal from './components/FnBoxModal.vue';
import { sendMessage } from './util/service';
const currentDocument = ref('top');

// 选择相似项
const selectSimilar = ref(false);
const handleChangeSelectSimilar = (similar: boolean) => {
  selectSimilar.value = similar;
};

// 用户操作数据
const userDoData = ref<any>([]);
const userDoDataLastType = computed(() =>
  userDoData.value.length
    ? userDoData.value[userDoData.value.length - 1].type
    : ''
);
const addUserDoData = (item: any) => {
  userDoData.value.push(item);
};

// 无感知数据，比如鼠标移动
const hiddenData = ref<any>([]);
const addHiddenData = (item: any) => {
  hiddenData.value.push(item);
};

// 工具箱工具
const tool = ref('');
const handleUpdateTool = (ctool: string) => {
  tool.value = ctool;
};

// 内置函数弹框
const fnModal = ref<boolean>(false);
const handleChangeFnModalVisible = (visible: boolean) => {
  fnModal.value = visible;
};

// 结束设置
const finishSetting = () => {
  sendMessage({
    type: 'finishSetting',
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
