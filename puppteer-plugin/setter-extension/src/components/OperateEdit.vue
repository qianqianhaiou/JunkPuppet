<template>
  <div class="edit-model" v-if="editVisible">
    <div class="edit-box">
      <div class="header">
        {{ translateOperate(userDoData[editTargetIndex].type) }}
      </div>
      <div class="body">
        <div class="simple" v-if="editType === 'simple'">
          <div class="form">
            <template v-if="userDoData[editTargetIndex].type === 'click'">
              <div>
                <span class="label">点击之后延迟：</span>
                <input v-model="editForm.clickDelay" type="text" />
                <span style="margin-left: 4px">ms</span>
              </div>
            </template>
            <template v-if="userDoData[editTargetIndex].type === 'getText'">
              <div>
                <span class="label">文本标题：</span>
                <input v-model="editForm.getTextLabel" type="text" />
              </div>
            </template>
            <template
              v-if="
                [
                  'snapshotFullScreen',
                  'snapshotCurrentScreen',
                  'getElementSnapshot',
                ].includes(userDoData[editTargetIndex].type)
              "
            >
              <div>
                <span class="label">截图名称：</span>
                <input v-model="editForm.snapshotName" type="text" />
              </div>
            </template>
            <template
              v-if="['delay'].includes(userDoData[editTargetIndex].type)"
            >
              <div>
                <span class="label">等待时长：</span>
                <input v-model="editForm.delay" type="text" />
                <span style="margin-left: 4px">ms</span>
              </div>
            </template>
          </div>
          <div class="type" @click="editType = 'detail'">编辑JSON</div>
        </div>
        <div class="detail" v-else>
          <textarea v-model="editForm.json" style="width: 285px; height: 150px">
          </textarea>
          <div class="type" @click="editType = 'simple'">编辑表单</div>
        </div>
      </div>
      <div class="footer">
        <div class="submit" @click="submitEdit">确定</div>
        <div class="cancel" @click="closeEditModel">取消</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { sendMessage } from '../util/service';
import { translateOperate } from '../util/translate';

const userDoData = ref<any>([]);

// 编辑模态框
const editVisible = ref(false);
const editTargetIndex = ref(0);
const editType = ref('simple');
const editForm = reactive({
  clickDelay: '',
  getTextLabel: '',
  snapshotName: '',
  delay: '',
  json: '',
});
const openEditModel = (index: number) => {
  const data = userDoData.value[index];
  editForm.delay = data.delay;
  editForm.clickDelay = data.clickDelay;
  editForm.getTextLabel = data.getTextLabel;
  editForm.snapshotName = data.snapshotName;
  console.log(userDoData.value[index]);
  editVisible.value = true;
  editTargetIndex.value = index;
  editForm.json = JSON.stringify(userDoData.value[index]);
};
const submitEdit = () => {
  let params: any = {};
  if (editType.value === 'simple') {
    params.type = 'form';
    if (userDoData.value[editTargetIndex.value].type === 'click') {
      userDoData.value[editTargetIndex.value].clickDelay = editForm.clickDelay;
      params.data = {
        clickDelay: editForm.clickDelay,
      };
    } else if (userDoData.value[editTargetIndex.value].type === 'getText') {
      userDoData.value[editTargetIndex.value].getTextLabel =
        editForm.getTextLabel;
      params.data = {
        getTextLabel: editForm.getTextLabel,
      };
    } else if (
      [
        'snapshotFullScreen',
        'snapshotCurrentScreen',
        'getElementSnapshot',
      ].includes(userDoData.value[editTargetIndex.value].type)
    ) {
      userDoData.value[editTargetIndex.value].snapshotName =
        editForm.snapshotName;
      params.data = {
        snapshotName: editForm.snapshotName,
      };
    } else if (
      ['delay'].includes(userDoData.value[editTargetIndex.value].type)
    ) {
      userDoData.value[editTargetIndex.value].delay = editForm.delay;
      params.data = {
        delay: editForm.delay,
      };
    }
  } else {
    try {
      JSON.parse(editForm.json);
    } catch (e) {
      alert('JSON格式不对');
      return false;
    }
    params.type = 'json';
    params.data = JSON.parse(editForm.json);
  }
  sendMessage({
    type: 'updateData',
    data: {
      index: userDoData.value[editTargetIndex.value].index,
      ...params,
    },
  });
  editVisible.value = false;
};
const closeEditModel = () => {
  editVisible.value = false;
};
</script>
