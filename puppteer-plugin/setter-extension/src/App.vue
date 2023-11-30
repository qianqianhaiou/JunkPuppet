<template>
  <div class="container" v-if="currentDocument === 'top'">
    <Tools
      @addUserDoData="addUserDoData"
      @handleChangeSelectSimilar="handleChangeSelectSimilar"
      @handleChangeFnModalVisible="handleChangeFnModalVisible"
      @finishSetting="finishSetting"
      @handleUpdateTool="handleUpdateTool"
      @handleChangeListVisible="handleChangeListVisible"
    ></Tools>
  </div>
  <GlobalListender
    :tool="tool"
    :selectSimilar="selectSimilar"
    :userDoDataLastType="userDoDataLastType"
    @addUserDoData="addUserDoData"
    @addHiddenData="addHiddenData"
    @clickAndWaitNavigator="clickAndWaitNavigator"
  ></GlobalListender>
  <Popup></Popup>
  <FnBoxModal
    v-if="fnModal"
    @addUserDoData="addUserDoData"
    @handleChangeFnModalVisible="handleChangeFnModalVisible"
  ></FnBoxModal>
  <OperateList
    v-if="listVisible"
    :userDoData="userDoData"
    @handleChangeListVisible="handleChangeListVisible"
    @handleDelete="handleDelete"
    @handleUpdate="handleUpdate"
  ></OperateList>
</template>
<script setup lang="ts">
import { nextTick, onMounted } from '@vue/runtime-core';
import { ref, reactive, Ref, computed } from 'vue';
import GlobalListender from './components/GlobalListener.vue';
import Popup from './components/Popup.vue';
import Tools from './components/Tools.vue';
import FnBoxModal from './components/FnBoxModal.vue';
import OperateList from './components/OperateList.vue';
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
  if (item.slot) {
    hiddenData.value.push({
      type: 'slot',
    });
  }
};

// 无感知数据，比如鼠标移动
const hiddenData = ref<any>([]);
const addHiddenData = (item: any) => {
  hiddenData.value.push(item);
};

// 工具箱工具
const tool = ref('link');
const handleUpdateTool = (ctool: string) => {
  tool.value = ctool;
};

// 操作列表
const listVisible = ref(false);
const handleChangeListVisible = (visible: boolean) => {
  listVisible.value = visible;
};
const handleDelete = (index: string) => {
  console.log(userDoData.value);
  userDoData.value.splice(index, 1);
  console.log(userDoData.value);
};
const handleUpdate = (index: string, data: any) => {
  console.log(data);
  data.map((item: any) => {
    userDoData.value[index][item[0]] = item[1];
  });
  console.log(userDoData.value);
};

// 内置函数弹框
const fnModal = ref<boolean>(false);
const handleChangeFnModalVisible = (visible: boolean) => {
  fnModal.value = visible;
};

const computedUserDoData = () => {
  const userDoDataArray = [...userDoData.value].filter((item) => item.slot);
  const hiddenDataArray = [...hiddenData.value];
  const length = hiddenDataArray.length;
  // 会丢掉最后几个鼠标移动到结束按钮的数据，无所谓的，不影响
  for (let i = 0; i < length; i++) {
    const item = hiddenDataArray[i];
    if (item.type === 'slot' && userDoDataArray.length) {
      const target = userDoDataArray.shift();
      hiddenDataArray[i] = target;
    }
  }
  return hiddenDataArray;
};

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
  userDoData.value = [];
  hiddenData.value = [];
};

// 结束设置
const finishSetting = () => {
  const target = computedUserDoData();
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
