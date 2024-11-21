<template>
  <div class="container" v-if="currentDocument === 'top'">
    <BoxModal
      @addOperateListData="addOperateListData"
      @handleChangeSelectSimilar="handleChangeSelectSimilar"
      @finishSetting="finishSetting"
    ></BoxModal>
  </div>
  <Popup :selectSimilar="selectSimilar" @addOperateListData="addOperateListData"></Popup>
  <MouseMoveBox></MouseMoveBox>
</template>
<script setup lang="ts">
import { onMounted, provide } from '@vue/runtime-core';
import { ref } from 'vue';
import Popup from './components/Popup.vue';
import BoxModal from './components/BoxModal.vue';
import MouseMoveBox from './components/MouseMoveBox.vue';
import { sendMessage } from './util/service';
import { formatOperateType } from './util/format';
import { DomService } from './util/selector';
import { waitTime } from './util/tools';
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

const formatOperateData = (data: any) => {
  let params: any = { type: data.type, label: data.label, name: formatOperateType(data.type) };
  if (data.type === 'clickAndWaitNavigator') {
    params.clickAndWaitNavigator = data.data.clickAndWaitNavigator;
  } else if (data.type === 'insertText') {
    params.insertText = data.data.insertText;
  } else if (data.type === 'clickElement') {
    params.clickElement = data.data.clickElement;
  } else if (data.type === 'getAttribute') {
    params.getAttribute = data.data.getAttribute;
  } else if (data.type === 'customFn') {
    params.customFn = data.data.customFn || '';
  } else if (data.type === 'delay') {
    params.delay = 1000;
  } else if (data.type === 'snapshotCurrentScreen') {
    params.snapshotCurrentScreen = {
      scrollTop: document.documentElement.scrollTop,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  } else if (data.type === 'snapshotFullScreen') {
  }
  return params;
};

// 操作列表
const operateListData = ref<any>([]);
provide('operateListData', operateListData);

const addOperateListData = async (data: any) => {
  operateListData.value.push({
    mainSelector: data.mainSelector,
    parentLimit: data.parentLimit?.type ? data.parentLimit : null,
    previousLimit: data.previousLimit?.type ? data.previousLimit : null,
    recordList: data.recordList?.length ? data.recordList : null,
    operateData: formatOperateData(data.operateData),
  });
  if (data.operateData.type === 'clickAndWaitNavigator') {
    clickAndWaitNavigator({
      selector: data.mainSelector,
    });
  } else if (data.operateData.type === 'clickElement') {
    clickElement({
      selector: data.mainSelector,
      clickElement: data.operateData.data.clickElement,
    });
  }
};

// 点击跳转  页面会刷新并出现数据丢失，所有应该先保存之前的部分数据
const clickAndWaitNavigator = (data: any) => {
  sendMessage({
    type: 'clickAndWaitNavigator',
    data: {
      ...data,
    },
    operateListData: operateListData.value,
  });
  operateListData.value = [];
};
const clickElement = (data: any) => {
  sendMessage({
    type: 'clickElement',
    data: {
      ...data,
    },
  });
};

// 结束设置
const finishSetting = () => {
  console.log(operateListData.value);
  sendMessage({
    type: 'finishSetting',
    operateListData: operateListData.value,
  });
};

const init = () => {
  if (self === top) {
    currentDocument.value = 'top';
  } else {
    currentDocument.value = 'iframe';
  }
};

const mockData = () => {
  operateListData.value = [
    {
      mainSelector: {
        iframeIndex: -1,
        selector: 'body>div>div>div>div>div>div>div>div>div>div>ul>li:nth-of-type(6)',
        similar: false,
      },
      parentLimit: {
        type: 'limit',
        selector: {
          iframeIndex: -1,
          selector: 'body>div>div>div>div>div>div>div>div>div>div>ul',
          similar: false,
        },
      },
      previousLimit: {
        type: 'exist',
        selector: {
          iframeIndex: -1,
          selector:
            'body>div>div>div>div>div>div>div>div>div>div:nth-of-type(2)>div>div:nth-of-type(1)>div:nth-of-type(1)>div>div:nth-of-type(2)>div:nth-of-type(7)>div:nth-of-type(1)',
          similar: false,
        },
        customFn: '',
      },
      recordList: null,
      operateData: {
        type: 'getText',
        label: '',
        name: '提取文本',
      },
    },
    {
      mainSelector: {
        iframeIndex: -1,
        selector: 'body>div>div>div>div>div>div>div>div>div>div>ul',
        similar: false,
      },
      parentLimit: null,
      previousLimit: null,
      recordList: null,
      operateData: {
        type: 'getElementSnapshot',
        label: '',
        name: '截取元素',
      },
    },
    {
      mainSelector: {
        iframeIndex: -1,
        selector:
          'body>div>div>div>div>div>div>div>div>div>div:nth-of-type(2)>div>div:nth-of-type(1)>div:nth-of-type(1)>div>div:nth-of-type(2)>div:nth-of-type(7)>div:nth-of-type(1)',
        similar: false,
      },
      parentLimit: null,
      previousLimit: null,
      recordList: null,
      operateData: {
        type: 'insertText',
        name: '输入文字',
        label: '',
        insertText: '234234342',
      },
    },
    {
      mainSelector: {
        iframeIndex: -1,
        selector:
          'body>div>div>div>div>div>div>div>div>div>div:nth-of-type(2)>div>div:nth-of-type(1)>div:nth-of-type(1)',
        similar: false,
      },
      parentLimit: null,
      previousLimit: null,
      recordList: null,
      operateData: {
        type: 'clickElement',
        label: '',
        name: '点击元素',
        clickElement: {
          button: 'right',
          clickCount: 1,
          delay: 0,
        },
      },
    },
    {
      mainSelector: {
        iframeIndex: -1,
        selector:
          'body>div>div>div>div>div>div>div>div>div>div:nth-of-type(2)>div>div:nth-of-type(1)>div:nth-of-type(1)',
        similar: false,
      },
      parentLimit: null,
      previousLimit: null,
      recordList: null,
      operateData: {
        type: 'getText',
        label: '',
        name: '提取文本',
      },
    },
    {
      mainSelector: {
        iframeIndex: -1,
        selector:
          'body>div>div>div>div>div>div>div>div>div>div:nth-of-type(2)>div>div:nth-of-type(1)>div:nth-of-type(1)>div>div:nth-of-type(2)>div:nth-of-type(7)>div:nth-of-type(2)',
        similar: false,
      },
      parentLimit: null,
      previousLimit: null,
      recordList: null,
      operateData: {
        type: 'getAttribute',
        label: '',
        name: '提取属性',
        getAttribute: ['class'],
      },
    },
    {
      mainSelector: {
        iframeIndex: -1,
        selector: 'body>div>div>div>div>div>div>div>div>div>div>ul',
        similar: false,
      },
      parentLimit: null,
      previousLimit: {
        type: 'customFn',
        selector: {
          iframeIndex: -1,
          selector: '',
          similar: false,
        },
        customFn: '123',
      },
      recordList: null,
      operateData: {
        type: 'customFn',
        label: '',
        name: '自定义函数',
        customFn: 'await f()',
      },
    },
    {
      mainSelector: {
        iframeIndex: -1,
        selector:
          'body>div>div>div>div>div>div>div>div>div>div:nth-of-type(2)>div>div:nth-of-type(1)>div:nth-of-type(1)>div>div:nth-of-type(2)>div:nth-of-type(7)>div:nth-of-type(2)',
        similar: false,
      },
      parentLimit: null,
      previousLimit: null,
      recordList: [
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1572,
            y: 435,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1127,
            y: 286,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1070,
            y: 318,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1147,
            y: 524,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 821,
            y: 373,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 962,
            y: 237,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 969,
            y: 233,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 897,
            y: 301,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 886,
            y: 305,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 977,
            y: 313,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1191,
            y: 248,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1090,
            y: 287,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'scroll',
          data: {
            deltaY: 100,
            pageX: 1081,
            pageY: 287,
          },
        },
        {
          type: 'scroll',
          data: {
            deltaY: 100,
            pageX: 1081,
            pageY: 288,
          },
        },
        {
          type: 'scroll',
          data: {
            deltaY: 100,
            pageX: 1081,
            pageY: 305,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1082,
            y: 287,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1221,
            y: 264,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1279,
            y: 254,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1282,
            y: 256,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1260,
            y: 307,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1267,
            y: 318,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1274,
            y: 299,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'scroll',
          data: {
            deltaY: -100,
            pageX: 1274,
            pageY: 599,
          },
        },
        {
          type: 'scroll',
          data: {
            deltaY: -100,
            pageX: 1274,
            pageY: 595,
          },
        },
        {
          type: 'scroll',
          data: {
            deltaY: -100,
            pageX: 1274,
            pageY: 558,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1274,
            y: 298,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseReleased',
            x: 1213,
            y: 248,
            modifiers: 0,
            button: 'left',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1146,
            y: 288,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1119,
            y: 296,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseReleased',
            x: 1104,
            y: 272,
            modifiers: 0,
            button: 'left',
            clickCount: 1,
          },
        },
        {
          type: 'keyevent',
          data: {
            type: 'keyDown',
            code: 'KeyW',
            key: 'w',
            windowsVirtualKeyCode: 87,
            nativeVirtualKeyCode: 87,
            autoRepeat: false,
            isKeypad: false,
            isSystemKey: false,
          },
        },
        {
          type: 'keyevent',
          data: {
            type: 'char',
            text: 'w',
            unmodifiedText: 'w',
            code: 'KeyW',
            key: 'w',
            windowsVirtualKeyCode: 119,
            nativeVirtualKeyCode: 119,
            autoRepeat: false,
            isKeypad: false,
            isSystemKey: false,
          },
        },
        {
          type: 'keyevent',
          data: {
            type: 'keyUp',
            code: 'KeyW',
            key: 'w',
            windowsVirtualKeyCode: 87,
            nativeVirtualKeyCode: 87,
            autoRepeat: false,
            isKeypad: false,
            isSystemKey: false,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1131,
            y: 277,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
        {
          type: 'mouse',
          data: {
            type: 'mouseMoved',
            x: 1533,
            y: 372,
            modifiers: 0,
            button: 'none',
            clickCount: 1,
          },
        },
      ],
      operateData: {
        type: 'customFn',
        name: '自定义函数',
        label: '',
        customFn: 'await aaaf()',
      },
    },
    {
      mainSelector: {
        iframeIndex: -1,
        selector: 'body>div>div>div>div>div>div>h3>a>div>div>p>span>span',
        similar: false,
      },
      parentLimit: null,
      previousLimit: null,
      recordList: null,
      operateData: {
        type: 'clickAndWaitNavigator',
        name: '点击跳转',
        label: '',
        clickAndWaitNavigator: {
          timeout: 10000,
          urlChange: true,
          waitUntil: ['load', 'networkidle0'],
        },
      },
    },
  ];
};

onMounted(async () => {
  init();
  // mockData();
});
</script>
