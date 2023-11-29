<template>
  <div>
    <div>
      <Form
        ref="formRef"
        :model="form"
        name="basic"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
        @finish="submit"
      >
        <template
          v-if="
            [
              'getText',
              'getElementSnapshot',
              'snapshotFullScreen',
              'snapshotCurrentScreen',
            ].includes(data.type)
          "
        >
          <FormItem label="标题文本" name="label">
            <div v-if="status === 'info'">{{ form.label }}</div>
            <Input v-else-if="status === 'edit'" v-model:value="form.label" />
          </FormItem>
        </template>
        <template v-if="['getText', 'getElementSnapshot'].includes(data.type)">
          <FormItem
            label="iframeIndex"
            name="iframeIndex"
            :rules="[{ required: true, message: '请输入iframeIndex' }]"
          >
            <div v-if="status === 'info'">{{ form.iframeIndex }}</div>
            <Input
              v-else-if="status === 'edit'"
              v-model:value="form.iframeIndex"
            />
          </FormItem>
          <FormItem
            label="选择器"
            name="selector"
            :rules="[{ required: true, message: '请输入选择器' }]"
          >
            <div v-if="status === 'info'">{{ form.selector }}</div>
            <Textarea
              v-else-if="status === 'edit'"
              v-model:value="form.selector"
              :rows="3"
            />
          </FormItem>
        </template>
        <template v-if="['delay'].includes(data.type)">
          <FormItem
            label="延迟时长"
            name="delay"
            :rules="[{ required: true, message: '请输入延迟时长' }]"
          >
            <div v-if="status === 'info'">{{ form.delay }}</div>
            <InputNumber
              v-else-if="status === 'edit'"
              v-model:value="form.delay"
              :min="100"
              :max="120000"
              :precision="0"
              :step="1000"
              addon-after="ms"
            />
          </FormItem>
        </template>

        <FormItem label=" ">
          <Space style="justify-content: flex-end; width: 100%">
            <template v-if="status === 'info'">
              <Button type="primary" @click="handleEdit">
                <template #icon>
                  <EditOutlined />
                </template>
                编辑
              </Button>
              <Button danger>
                <template #icon>
                  <DeleteOutlined />
                </template>
                删除</Button
              >
            </template>
            <template v-else-if="status === 'edit'">
              <Button type="primary" @click="submit">提交</Button>
              <Button type="default" @click="status = 'info'">取消</Button>
            </template>
          </Space>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref } from 'vue';
import {
  Form,
  FormItem,
  Input,
  Button,
  Textarea,
  InputNumber,
  Space,
} from 'ant-design-vue';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const data = computed(() => props.data);

const status = ref('info');

const form = reactive({
  label: '',
  iframeIndex: '',
  selector: '',
  delay: 1000,
});
const formRef = ref<any>(null);
const submit = () => {
  formRef.value
    .validate()
    .then(() => {
      let params: any = {};
      console.log(form);
      status.value = 'info';
    })
    .catch((error: any) => {
      console.log('error', error);
    });
};

const handleEdit = () => {
  status.value = 'edit';
};
const closeEditModel = () => {};

onBeforeMount(() => {
  form.label = data.value.label;
  form.iframeIndex = data.value?.data?.iframeIndex;
  form.selector = data.value?.data?.selector;
  form.delay = data.value?.delay;
});
</script>
