<template>
  <div
    class="tools"
    ref="toolsRef"
    :style="{ top: `${toolsDomTop}px`, left: `${toolsDomLeft}px`, height: `${toolsDomHeight}px` }"
  >
    <div class="tools-header">
      <div class="move" @mousedown="handleStartMoving">
        <IconMove></IconMove>
      </div>
      <div class="header">
        <div class="title">
          <div class="robot">
            <IconRobot></IconRobot>
          </div>
          <div class="tabs">
            <div
              :class="{ tab: true, active: activeTab === 'selector' }"
              @click="activeTab = 'selector'"
            >
              元素选择
            </div>
            <div :class="{ tab: true, active: activeTab === 'tools' }" @click="activeTab = 'tools'">
              内置工具
            </div>
            <div :class="{ tab: true, active: activeTab === 'list' }" @click="activeTab = 'list'">
              操作列表
            </div>
          </div>
        </div>
        <div class="shutdown" title="结束" @click="emits('finishSetting')">结束</div>
      </div>
    </div>
    <!-- 元素选择 -->
    <template v-if="activeTab === 'selector'">
      <div class="tools-selector">
        <Selector ref="mainSelectorRef" :similarable="true" @change="mainSelectorChange"></Selector>
      </div>
      <div class="tools-setting">
        <div class="tools-tabs">
          <div
            :class="{ tab: true, active: activeSelectTab === 'element' }"
            @click="activeSelectTab = 'element'"
          >
            前置设置
          </div>
          <div
            :class="{ tab: true, active: activeSelectTab === 'operate' }"
            @click="activeSelectTab = 'operate'"
          >
            操作类型
          </div>
        </div>
        <div class="tools-main">
          <div class="element-tab" v-if="activeSelectTab === 'element'">
            <div class="form-item">
              <div class="label">父元素范围：</div>
              <!-- <select v-model="parentLimit.type" name="parentLimit" id="parentLimit">
                <option value="limit">限制父元素范围</option>
                <option value="">不限制</option>
              </select> -->
              <div style="display: flex; flex-direction: column">
                <!-- select 在devtools环境下有Bug，所以替换为了radio -->
                <div
                  v-for="item in [
                    { label: '不限制', value: '' },
                    { label: '限制父元素范围', value: 'limit' },
                  ]"
                  :key="item.value"
                >
                  <input
                    v-model="parentLimit.type"
                    type="radio"
                    name="parentLimitType"
                    :id="item.label"
                    :value="item.value"
                  />
                  <label :for="item.label">{{ item.label }}</label>
                </div>
              </div>
            </div>
            <div v-if="['limit'].includes(parentLimit.type)" class="selector">
              <Selector
                ref="parentSelectorRef"
                :similarable="false"
                @change="parentLimitChange"
              ></Selector>
            </div>

            <div class="form-item">
              <div class="label">设置前置条件：</div>
              <!-- <select v-model="previousLimit.type" name="previousLimit" id="previousLimit">
                <option value="exist">当某元素存在</option>
                <option value="inexistence">当某元素不存在</option>
                <option value="customFn">自定义函数</option>
                <option value="">不设置</option>
              </select> -->
              <div style="display: flex; flex-direction: column">
                <div
                  v-for="item in [
                    { label: '不设置', value: '' },
                    { label: '当某元素存在', value: 'exist' },
                    { label: '当某元素不存在', value: 'inexistence' },
                    { label: '自定义函数', value: 'customFn' },
                  ]"
                  :key="item.value"
                >
                  <input
                    v-model="previousLimit.type"
                    type="radio"
                    name="previousLimitType"
                    :id="item.label"
                    :value="item.value"
                  />
                  <label :for="item.label">{{ item.label }}</label>
                </div>
              </div>
            </div>
            <div v-if="['exist', 'inexistence'].includes(previousLimit.type)" class="selector">
              <Selector
                ref="previousSelectorRef"
                :similarable="false"
                @change="previousLimitSelectChange"
              ></Selector>
            </div>
            <textarea
              v-else-if="previousLimit.type === 'customFn'"
              v-model="previousLimit.customFn"
              id="customFn"
              cols="33"
              rows="12"
            ></textarea>
          </div>
          <div class="operate-tab" v-else-if="activeSelectTab === 'operate'">
            <div class="form-item">
              <div class="label">设置操作类型：</div>
              <!-- <select v-model="operateData.type" name="operate" id="operate">
                <optgroup label="操作类">
                  <option value="getElementSnapshot">截取元素</option>
                  <option value="clickAndWaitNavigator">点击跳转</option>
                  <option value="insertText">输入文字</option>
                  <option value="clickElement">点击元素</option>
                </optgroup>
                <optgroup label="提取类">
                  <option value="getText">提取文本</option>
                  <option value="getAttribute">提取属性</option>
                </optgroup>
                <optgroup label="自定义">
                  <option value="customFn">自定义函数</option>
                </optgroup>
              </select> -->
              <div style="display: flex; flex-direction: column">
                <div
                  v-for="item in [
                    { label: '提取文本', value: 'getText' },
                    { label: '提取属性', value: 'getAttribute' },
                    { label: '截取元素', value: 'getElementSnapshot' },
                    { label: '点击跳转', value: 'clickAndWaitNavigator' },
                    { label: '输入文字', value: 'insertText' },
                    { label: '点击元素', value: 'clickElement' },
                    { label: '自定义函数', value: 'customFn' },
                  ]"
                  :key="item.value"
                >
                  <input
                    v-model="operateData.type"
                    type="radio"
                    name="operateDataType"
                    :id="item.label"
                    :value="item.value"
                  />
                  <label :for="item.label">{{ item.label }}</label>
                </div>
              </div>
            </div>
            <template v-if="operateData.type === 'clickAndWaitNavigator'">
              <div class="form-item">
                <div>超时判定时长（ms）</div>
                <input
                  v-model="operateData.data.clickAndWaitNavigator.timeout"
                  type="number"
                  id="clickAndWaitNavigatorTimeout"
                  name="clickAndWaitNavigatorTimeout"
                  min="0"
                />
              </div>
              <div class="form-item">
                <div class="label">导航直到</div>
                <div>
                  <div
                    v-for="item in ['load', 'networkidle0', 'domcontentloaded', 'networkidle2']"
                    :key="item"
                  >
                    <input
                      v-model="operateData.data.clickAndWaitNavigator.waitUntil"
                      type="checkbox"
                      name="clickAndWaitNavigator"
                      :id="item"
                      :value="item"
                    />
                    <label :for="item">{{ item }}</label>
                  </div>
                </div>
              </div>
            </template>
            <template v-if="operateData.type === 'insertText'">
              <div class="form-item">
                <div class="label">输入字符</div>
                <input v-model="operateData.data.insertText" type="text" />
              </div>
            </template>
            <template v-if="operateData.type === 'clickElement'">
              <div class="form-item">
                <div class="label">键位</div>
                <div>
                  <div v-for="item in ['left', 'right', 'middle']" :key="item">
                    <input
                      v-model="operateData.data.clickElement.button"
                      type="radio"
                      name="clickElementButton"
                      :id="item"
                      :value="item"
                    />
                    <label :for="item">{{ item }}</label>
                  </div>
                </div>
              </div>
              <div class="form-item">
                <div class="label">点击次数</div>
                <input
                  v-model="operateData.data.clickElement.clickCount"
                  type="number"
                  id="clickElementclickCount"
                  name="clickElementclickCount"
                  min="1"
                />
              </div>
              <div class="form-item">
                <div class="label">按下收起停留时间</div>
                <input
                  v-model="operateData.data.clickElement.delay"
                  type="number"
                  id="clickElementclickCount"
                  name="clickElementclickCount"
                  min="0"
                />
              </div>
            </template>
            <template v-if="operateData.type === 'getText' && mainElement">
              <div>当前文本：{{ mainElement.innerText }}</div>
            </template>
            <template v-if="operateData.type === 'getAttribute'">
              <div>选择要提取的属性：</div>
              <div v-for="(item, index) in mainElementAttr" :key="item">
                <input
                  v-model="operateData.data.getAttribute"
                  type="radio"
                  name="getAttribute"
                  :id="item.name"
                  :value="item.name"
                />
                <label :for="item.name">
                  属性名：{{ item.name }}； 当前属性值：{{ item.value }}
                </label>
              </div>
            </template>
            <div v-if="operateData.type === 'customFn'">
              <textarea
                v-model="operateData.data.customFn"
                id="elementCustomFn"
                cols="33"
                rows="12"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <div class="tools-buttons">
        <div v-if="recordEnable" class="record-mouse-key-on" @click="handleStopListener">
          <IconRecordOff></IconRecordOff>
          <div>停止录制</div>
        </div>
        <div v-else class="record-mouse-key-off" @click="handleStartListener">
          <IconRecordOn></IconRecordOn>
          <div>录制键鼠操作</div>
        </div>
        <div
          v-if="recordDataList?.length || recordList?.length"
          class="record-tip"
          :style="{ color: recordEnable ? '#d81e06' : '#1677ff' }"
        >
          已录制 {{ recordDataList?.length || recordList?.length }} 条
        </div>
        <div class="next-step" @click="handleSaveAndJumpNext">下一步</div>
      </div>
    </template>
    <!-- 内置工具 -->
    <template v-else-if="activeTab === 'tools'">
      <div class="built-in">
        <div class="built-in-item" @click="handleAddBuiltInTools('delay')">
          {{ formatOperateType('delay') }}
        </div>
        <div class="built-in-item" @click="handleAddBuiltInTools('snapshotCurrentScreen')">
          {{ formatOperateType('snapshotCurrentScreen') }}
        </div>
        <div class="built-in-item" @click="handleAddBuiltInTools('snapshotFullScreen')">
          {{ formatOperateType('snapshotFullScreen') }}
        </div>
        <div class="built-in-item" @click="handleAddBuiltInTools('customFn')">
          {{ formatOperateType('customFn') }}
        </div>
      </div>
    </template>
    <!-- 操作列表 -->
    <template v-else-if="activeTab === 'list'">
      <div class="tools-list">
        <OperateListData></OperateListData>
      </div>
    </template>
    <!-- 轻提示 -->
    <div v-if="tipContent" class="message-tip">{{ tipContent }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onBeforeMount, inject, onBeforeUnmount } from 'vue';
import Selector from './Selector.vue';
import IconMove from './icons/Move.vue';
import { formatOperateType } from '../util/format';
import IconRobot from './icons/Robot.vue';
import IconRecordOn from './icons/RecordOn.vue';
import IconRecordOff from './icons/RecordOff.vue';
import OperateListData from './OperateListData.vue';
import { DomService } from '@/util/selector';
import { useGlobalListener } from '@/util/hooks';

const emits = defineEmits(['addOperateListData', 'finishSetting']);

// 操作设置弹窗
const activeTab = ref('selector'); // selector list
const activeSelectTab = ref('element'); // element operate
const toolsRef = ref(null);
const toolsDomTop = ref(15);
const toolsDomLeft = ref(window.innerWidth - 320 - 15);
const toolsDomHeight = ref(520);
const handleMoving = (e: MouseEvent) => {
  e.stopPropagation();
  toolsDomTop.value = e.y - 4;
  toolsDomLeft.value = e.x - 4;
};
const handleStartMoving = () => {
  document.documentElement.style.userSelect = 'none';
  document.documentElement.addEventListener('mousemove', handleMoving);
};

// 主元素选择器
const mainSelector = ref({
  iframeIndex: -1,
  selector: '',
  similar: false,
});
const mainSelectorRef = ref(null);
const mainElement = ref<any>(null);
const mainElementAttr: any = ref({});
const getSelectElementAttrs = () => {
  const element = DomService.getElementBySelector(mainSelector.value);
  mainElement.value = element;
  if (element) {
    const attrs = element.getAttributeNames() || [];
    mainElementAttr.value = attrs.map((item) => {
      const attrMaps: any = {
        class: 'className',
      };
      const value = element.getAttribute(item);
      return {
        name: attrMaps[item] || item,
        value,
      };
    });
  }
};
const mainSelectorChange = (selector: any) => {
  mainSelector.value = selector;
  console.log('main selector change', mainSelector.value);
  if (selector.selector) {
    getSelectElementAttrs();
  }
};

// 前置条件
const previousLimit = ref({
  type: '',
  selector: {
    iframeIndex: -1,
    selector: '',
    similar: false,
  },
  customFn: '',
});
const previousSelectorRef = ref(null);
const previousLimitSelectChange = (selector: any) => {
  previousLimit.value.selector = selector;
  console.log('previous selector change', selector);
};

// 父元素范围限制
const parentLimit = ref({
  type: '',
  selector: {
    iframeIndex: -1,
    selector: '',
  },
});
const parentSelectorRef = ref(null);
const parentLimitChange = (selector: any) => {
  parentLimit.value.selector = selector;
  console.log('parent selector change', selector);
};

// 操作类型
const operateData = ref({
  type: 'getText',
  label: '',
  data: {
    // 点击跳转 参数
    clickAndWaitNavigator: {
      timeout: 10 * 1000,
      waitUntil: ['load', 'networkidle0'],
      urlChange: true,
    },
    // 输入文字 参数
    insertText: '',
    // 点击元素 参数
    clickElement: {
      button: 'left',
      clickCount: 1,
      delay: 0,
    },
    // 提取类 参数
    getAttribute: '',
    customFn: '',
  },
});

// 键鼠数据录制
const recordEnable = ref(false);
const recordList = ref([]);
const { startListener, stopListener, clearEventList, recordDataList } = useGlobalListener();
const handleStartListener = () => {
  recordList.value = [];
  startListener();
  recordEnable.value = true;
};
const handleStopListener = () => {
  const result = stopListener();
  recordList.value = result;
  clearEventList();
  recordEnable.value = false;
};
// 内置工具添加
const handleAddBuiltInTools = (type: string) => {
  const data = {
    mainSelector: { iframeIndex: -1, selector: '', similar: false },
    parentLimit: null,
    previousLimit: null,
    operateData: {
      type: type,
      label: '',
      data: {},
    },
    recordList: [],
  };
  handleTip('添加成功');
  emits('addOperateListData', data);
};

// 清空表单
const selectorRefs = ref([mainSelectorRef, previousSelectorRef, parentSelectorRef]);
const resetFields = () => {
  activeTab.value = 'selector';
  activeSelectTab.value = 'element';
  mainSelector.value = { iframeIndex: -1, selector: '', similar: false };
  mainElement.value = null;
  mainElementAttr.value = {};
  parentLimit.value = {
    type: '',
    selector: {
      iframeIndex: -1,
      selector: '',
    },
  };
  previousLimit.value = {
    type: '',
    selector: {
      iframeIndex: -1,
      selector: '',
      similar: false,
    },
    customFn: '',
  };
  operateData.value = {
    type: 'getText',
    label: '',
    data: {
      // 点击跳转 参数
      clickAndWaitNavigator: {
        timeout: 10 * 1000,
        waitUntil: ['load', 'networkidle0'],
        urlChange: true,
      },
      // 输入文字 参数
      insertText: '',
      // 点击元素 参数
      clickElement: {
        button: 'left',
        clickCount: 1,
        delay: 0,
      },
      // 提取类 参数
      getAttribute: '',
      customFn: '',
    },
  };
  recordList.value = [];
  recordEnable.value = false;
  DomService.removeClass(
    {
      iframeIndex: -1,
      selector: '.puppeteer_sunsilent_light_selecting',
    },
    'puppeteer_sunsilent_light_selecting',
  );
  selectorRefs.value.forEach((selectorRef: any) => {
    if (selectorRef.value) {
      selectorRef.value.resetFields();
    }
  });
};
// 保存并下一步
const handleSaveAndJumpNext = () => {
  if (recordEnable.value) handleStopListener();
  const data = {
    mainSelector: mainSelector.value,
    parentLimit: parentLimit.value,
    previousLimit: previousLimit.value,
    operateData: operateData.value,
    recordList: recordList.value,
  };
  emits('addOperateListData', data);
  resetFields();
};

// 轻提示
const tipContent = ref('');
const tipTimer = ref<any>(null);
const handleTip = (content: string) => {
  tipContent.value = content;
  if (tipTimer.value) clearTimeout(tipTimer.value);
  tipTimer.value = setTimeout(() => {
    tipContent.value = '';
  }, 1000);
};

// 约定自定义函数需返回一个对象 null [] {}

onBeforeMount(() => {
  toolsDomHeight.value = Math.min(window.innerHeight, 520);
  document.documentElement.addEventListener('mouseup', () => {
    document.documentElement.style.userSelect = 'unset';
    document.documentElement.removeEventListener('mousemove', handleMoving);
  });
});

onBeforeUnmount(() => {
  if (tipTimer.value) clearTimeout(tipTimer.value);
});
</script>
