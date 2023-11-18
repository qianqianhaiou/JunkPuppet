<template>
  <div v-if="currentDocument === 'top'" class="container" ref="containerRef">
    <div ref="headerRef" class="header">
      <div class="check-button" @click="showTools">工具箱</div>
    </div>
    <div ref="bodyRef" class="body" v-if="toolsVisible">
      <div class="body-tools">
        <div v-if="userDoData.length" class="finish tool" @click="showBoxDetail">{{ boxDetail ? '收起' : '展开' }}设置</div>
        <div class="divider"></div>
        <div v-for="(item, index) of toolsSelectOption" :key="item"
          :class="{ tool: true, active: toolsActive === (index + 1) }" @click="setToolsActive(index + 1)">{{ item }}
        </div>
        <div class="divider"></div>
        <div class="radio">
          <OpenClose :name="['唯一', '相似']" :activeName="currentSelectType" @change="selectypeChange"></OpenClose>
        </div>
        <div class="divider"></div>
        <div class="tool" @click="addBuiltInEvent('snapshotFullScreen')">截取全屏</div>
        <div class="tool" @click="addBuiltInEvent('snapshotCurrentScreen')">截取当前屏幕</div>
        <div class="tool" @click="addBuiltInEvent('delay')">添加等待</div>
        <div class="divider"></div>
        <div class="tool danger" @click="finishSetting">结束</div>
      </div>
      <div class="body-list" v-if="boxDetail">
        <template v-for="(item, index) in userDoData" :key="index">
          <div class="body-list-item">
            <div class="left">
              <span class="index">{{ (index + 1) + '. ' }}</span>
              <div>{{ translateOperate(item.type) }}</div>
            </div>
            <template v-if="!['mouse', 'keyevent', 'scroll'].includes(item.type)">
              <div class="center" @click="openEditModel(index)">编辑</div>
              <div class="right" @click="deleteOperate(index)">X</div>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
  <div :class="{ 'rect-box': true, 'pointervisible': rectBoxPointerVisible }" ref="rectBoxRef">
  </div>
  <div ref="popupRef" class="popup-box" v-show="popupVisible">
    <div class="pop-item">设为下一层页面</div>
    <!-- <div class="pop-item">进入下一层页面</div> -->
  </div>
  <div class="edit-model" v-if="editVisible">
    <div class="edit-box">
      <div class="header"> {{ translateOperate(userDoData[editTargetIndex].type) }} </div>
      <div class="body">
        <div class="simple" v-if="editType === 'simple'">
          <div class="form">
            <template v-if="userDoData[editTargetIndex].type === 'click'">
              <div>
                <span class="label">点击之后延迟：</span>
                <input v-model="editForm.clickDelay" type="text">
                <span style="margin-left: 4px">ms</span>
              </div>
            </template>
            <template v-if="userDoData[editTargetIndex].type === 'getText'">
              <div>
                <span class="label">文本标题：</span>
                <input v-model="editForm.getTextLabel" type="text">
              </div>
            </template>
            <template
              v-if="['snapshotFullScreen', 'snapshotCurrentScreen', 'getElementSnapshot'].includes(userDoData[editTargetIndex].type)">
              <div>
                <span class="label">截图名称：</span>
                <input v-model="editForm.snapshotName" type="text">
              </div>
            </template>
            <template v-if="['delay'].includes(userDoData[editTargetIndex].type)">
              <div>
                <span class="label">等待时长：</span>
                <input v-model="editForm.delay" type="text">
                <span style="margin-left: 4px">ms</span>
              </div>
            </template>
          </div>
          <div class="type" @click="editType = 'detail'">编辑JSON</div>
        </div>
        <div class="detail" v-else>
          <textarea v-model="editForm.json" style="width: 285px; height: 150px;">
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
import { nextTick, onMounted } from "@vue/runtime-core";
import { ref, reactive, Ref } from 'vue'
import { DomService } from './util/selector'
import { addClass } from './util/dom'
import { sendMessage } from './util/service'
import { translateOperate } from './util/translate'
import { throttle } from './util/tools'
import OpenClose from './components/OpenClose.vue'
const containerRef: any = ref(null)
const headerRef: any = ref(null)
const currentDocument = ref('top')

// 编辑模态框
const editVisible = ref(false)
const editTargetIndex = ref(0)
const editType = ref('simple')
const editForm = reactive({
  clickDelay: '',
  getTextLabel: '',
  snapshotName: '',
  delay: '',
  json: '',
})
const openEditModel = (index: number) => {
  const data = userDoData.value[index]
  editForm.delay = data.delay
  editForm.clickDelay = data.clickDelay
  editForm.getTextLabel = data.getTextLabel
  editForm.snapshotName = data.snapshotName
  console.log(userDoData.value[index])
  editVisible.value = true
  editTargetIndex.value = index
  editForm.json = JSON.stringify(userDoData.value[index])
}
const submitEdit = () => {
  let params: any = {}
  if (editType.value === 'simple') {
    params.type = 'form'
    if (userDoData.value[editTargetIndex.value].type === 'click') {
      userDoData.value[editTargetIndex.value].clickDelay =  editForm.clickDelay
      params.data = {
        clickDelay: editForm.clickDelay
      }
    } else if (userDoData.value[editTargetIndex.value].type === 'getText') {
      userDoData.value[editTargetIndex.value].getTextLabel =  editForm.getTextLabel
      params.data = {
        getTextLabel: editForm.getTextLabel
      }
    } else if (['snapshotFullScreen', 'snapshotCurrentScreen', 'getElementSnapshot'].includes(userDoData.value[editTargetIndex.value].type)) {
      userDoData.value[editTargetIndex.value].snapshotName =  editForm.snapshotName
      params.data = {
        snapshotName: editForm.snapshotName
      }
    } else if (['delay'].includes(userDoData.value[editTargetIndex.value].type)) {
      userDoData.value[editTargetIndex.value].delay =  editForm.delay
      params.data = {
        delay: editForm.delay
      }
    }
  } else {
    try {
      JSON.parse(editForm.json)
    } catch (e) {
      alert('JSON格式不对')
      return false
    }
    params.type = 'json'
    params.data = JSON.parse(editForm.json)
  }
  sendMessage({
    type: 'updateData',
    data: {
      index: userDoData.value[editTargetIndex.value].index,
      ...params
    }
  })
  editVisible.value = false
}
const closeEditModel = () => {
  editVisible.value = false
}


// 鼠标跟随框
const rectBoxRef: any = ref(null)
const rectDomEl: any = ref()
const rectBoxPointerVisible = ref(false)
const rectBoxMove = () => {
  document.body.addEventListener('mousemove', (e: MouseEvent) => {
    const el = (e.target as HTMLElement);
    rectDomEl.value = el
    const rectData = el.getBoundingClientRect();
    (rectBoxRef.value as HTMLElement).style.top = rectData.top + 'px';
    (rectBoxRef.value as HTMLElement).style.left = rectData.left + 'px';
    (rectBoxRef.value as HTMLElement).style.width = rectData.width + 'px';
    (rectBoxRef.value as HTMLElement).style.height = rectData.height + 'px';
  }, false)
}

// 跟随框事件
const userDoData: any = ref([])
const currentIndex: Ref<number> = ref(0)
const recordUserRect = async () => {
  let newSelector = null
  if (currentSelectType.value === '唯一') {
    const simpleSelect = DomService.getSelectorSimple(rectDomEl.value)
    newSelector = DomService.getSelectorWithNthUniq(simpleSelect, rectDomEl.value)
  } else {
    newSelector = DomService.getSelectorWithClass(rectDomEl.value)
  }
  // 去掉选择器的重新性
  // for (const item of userDoData.value) {
  //   if (toolsActive.value === 2 && item.type === 'getText' && item.data.iframeIndex === newSelector.iframeIndex && item.data.selector === newSelector.selector) {
  //     return false
  //   } else if (toolsActive.value === 3 && item.type === 'getElementSnapshot' && item.data.iframeIndex === newSelector.iframeIndex && item.data.selector === newSelector.selector) {
  //     return false
  //   } else if (toolsActive.value === 4 && item.type === 'clickAndWaitNavigator' && rectDomEl.value.className.includes('puppeteer_sunsilent_light_click_navigator')) {
  //     return false
  //   }
  // }
  console.log('newSelector: ', newSelector)
  if (toolsActive.value === 2) {
    addClass(newSelector, 'puppeteer_sunsilent_light_text')
    currentIndex.value += 1
    userDoData.value.push({
      index: currentIndex.value,
      type: 'getText',
      data: newSelector
    });
    sendMessage({
      type: 'getText',
      index: currentIndex.value,
      data: newSelector
    })
  } else if (toolsActive.value === 3) {
    addClass(newSelector, 'puppeteer_sunsilent_light_element_snapshot')
    currentIndex.value += 1
    userDoData.value.push({
      index: currentIndex.value,
      type: 'getElementSnapshot',
      data: newSelector
    });
    sendMessage({
      type: 'getElementSnapshot',
      index: currentIndex.value,
      data: newSelector
    })
  } else if (toolsActive.value === 4) {
    const rectDomElRect = rectDomEl.value.getBoundingClientRect()
    rectDomEl.value.className = rectDomEl.value.className + ` puppeteer_sunsilent_light_click_navigator`
    currentIndex.value += 1
    userDoData.value.push({
      index: currentIndex.value,
      type: 'clickAndWaitNavigator',
      data: {
        screenX: (rectDomElRect.left + rectDomElRect.width / 2),
        screenY: (rectDomElRect.top + rectDomElRect.height / 2)
      }
    });
    // 立即恢复rect的穿透性，防止pptr点在实心遮蔽层上
    rectBoxPointerVisible.value = false
    sendMessage({
      type: 'clickAndWaitNavigator',
      index: currentIndex.value,
      data: {
        screenX: (rectDomElRect.left + rectDomElRect.width / 2),
        screenY: (rectDomElRect.top + rectDomElRect.height / 2)
      }
    })
  } else {
    console.log('default')
  }
}

// popup弹出框
const popupVisible = ref(false)
const popupRef: any = ref(null)
const showPopupBox = ($el: HTMLElement) => {
  popupVisible.value = true
  nextTick(() => {
    const elClientRect = $el.getBoundingClientRect()
    const popupBoxRect = popupRef.value.getBoundingClientRect()
    popupRef.value.style.top = (elClientRect.top - popupBoxRect.height) + 'px'
    popupRef.value.style.left = (elClientRect.left + (elClientRect.width / 2) - (popupBoxRect.width / 2)) + 'px'
  })
}
const globalAListener = () => {
  popupRef.value.addEventListener('mouseenter', () => {
    popupVisible.value = true
  })
  popupRef.value.addEventListener('mouseleave', () => {
    popupVisible.value = false
  })
  Array.prototype.map.call(document.querySelectorAll('a'), ($el: HTMLAnchorElement) => {
    $el.target = '_self'
    $el.addEventListener('mouseenter', (event: MouseEvent) => {
      showPopupBox($el)
      event.stopPropagation();
    })
    $el.addEventListener('mouseleave', (event: MouseEvent) => {
      popupVisible.value = false;
      event.stopPropagation();
    })
  })
}

// 全局监听事件
const globalMouse = () => {
  const emitMouse = (evt: any) => {
    const buttons: any = { 0: "none", 1: "left", 2: "middle", 3: "right" };
    const event = evt;
    const types: any = {
      mousedown: "mousePressed",
      mouseup: "mouseReleased",
      mousewheel: "mouseWheel",
      touchstart: "mousePressed",
      touchend: "mouseReleased",
      touchmove: "mouseWheel",
      mousemove: "mouseMoved",
    };
    function getModifiersForEvent(event: any) {
      return (
        (event.altKey ? 1 : 0) |
        (event.ctrlKey ? 2 : 0) |
        (event.metaKey ? 4 : 0) |
        (event.shiftKey ? 8 : 0)
      );
    }
    if (!(event.type in types)) {
      return;
    }
    if (
      event.type !== "mousewheel" &&
      buttons[event.which] === "none" &&
      event.type !== "mousemove"
    ) {
      return;
    }
    const x = event.clientX;
    const y = event.clientY;
    const data: any = {
      type: types[event.type],
      x,
      y,
      modifiers: getModifiersForEvent(event),
      button: event.type === "mousewheel" ? "none" : buttons[event.which],
      clickCount: 1,
    };

    if (event.type === "mousewheel") {
      data.deltaX = event.wheelDeltaX || 0;
      data.deltaY = event.wheelDeltaY || event.wheelDelta;
    }
    currentIndex.value += 1
    sendMessage(
      {
        type: "mouse",
        index: currentIndex.value,
        data,
      }
    );
    // if (userDoData.value.length && userDoData.value[userDoData.value.length - 1].type !== 'mouse') {
    //   userDoData.value.push({
    //     index: currentIndex.value,
    //     type: 'mouse',
    //   });
    // }
  };
  document.body.addEventListener("mousedown", throttle(emitMouse, 200), false);
  document.body.addEventListener("mouseup", throttle(emitMouse, 200), false);
  document.body.addEventListener("mousemove", throttle(emitMouse, 200), false);
}
// const globalClick = () => {
//   document.body.addEventListener('click', async (e: any) => {
//     if (e.pointerType !== 'mouse') return
//     currentIndex.value += 1
//     userDoData.value.push({
//       index: currentIndex.value,
//       type: 'click',
//       data: {
//         screenX: e.screenX,
//         screenY: e.screenY
//       }
//     });
//     sendMessage({
//       type: 'click',
//       index: currentIndex.value,
//       data: {
//         screenX: e.screenX,
//         screenY: e.screenY
//       }
//     })
//   }, true)
// }
const globalWhell = () => {
  function scrollFunction(e: any) {
    currentIndex.value += 1
    sendMessage({
      type: "scroll",
      index: currentIndex.value,
      data: {
        deltaY: e.deltaY,
        pageX: e.pageX,
        pageY: e.pageY,
      },
    })
    if (userDoData.value.length && userDoData.value[userDoData.value.length - 1].type !== 'scroll') {
      userDoData.value.push({
        index: currentIndex.value,
        type: 'scroll',
      });
    }
  }
  window.onwheel = scrollFunction;
  window.addEventListener("mouseWheel", scrollFunction, false);
}
const globalKeyDown = () => {
  const emitKeyEvent = (event: any) => {
    // 阻止原页面监听事件
    event.stopPropagation();
    // 由于鼠标移入可能会导致样式改变，所以按住shift键之后rect变为无法穿透的遮蔽层
    if (event.type === 'keydown' && (event.shiftKey || event.key === 'Shift')) {
      rectBoxPointerVisible.value = true
    } else if (event.type === 'keyup' && (event.shiftKey || event.key === 'Shift')) {
      rectBoxPointerVisible.value = false
    }
    // 剔除特殊键
    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab', 'F11', 'F12'].includes(event.key)) {
      return false
    }
    // 自定义组合键
    const isCombination = combinationKey(event.type, event.code, event.shiftKey);
    if (isCombination) return;
    let type;
    // if (event.keyCode === 8) {
    // // Backspace
    //   event.preventDefault();
    // }
    switch (event.type) {
      case "keydown":
        type = "keyDown";
        break;
      case "keyup":
        type = "keyUp";
        break;
      case "keypress":
        type = "char";
        break;
      default:
        return;
    }
    const text =
      type === "char" ? String.fromCharCode(event.charCode) : undefined;
    const data = {
      type,
      text,
      unmodifiedText: text ? text.toLowerCase() : undefined,
      keyIdentifier: event.keyIdentifier,
      code: event.code,
      key: event.key,
      windowsVirtualKeyCode: event.keyCode,
      nativeVirtualKeyCode: event.keyCode,
      autoRepeat: false,
      isKeypad: false,
      isSystemKey: false,
    };
    currentIndex.value += 1
    sendMessage(
      {
        type: "keyevent",
        index: currentIndex.value,
        data,
      }
    );
    if (userDoData.value.length && userDoData.value[userDoData.value.length - 1].type !== 'keyevent') {
      userDoData.value.push({
        index: currentIndex.value,
        type: 'keyevent',
      });
    }
  };
  document.body.addEventListener("keydown", emitKeyEvent, true);
  document.body.addEventListener("keyup", emitKeyEvent, true);
  document.body.addEventListener("keypress", emitKeyEvent, true);
}
// 自定义组合键 Shift+Q Shift+W Shift+A
const combinationKey = (type: string, code: string, shiftKey: boolean) => {
  if (type === 'keydown' && code === 'KeyW' && shiftKey) {
    loopSelectType();
    return true
  } else if (code === 'KeyW' && shiftKey) {
    return true
  }
  if (type === 'keydown' && code === 'KeyQ' && shiftKey) {
    loopToolsActive();
    return true
  } else if (code === 'KeyQ' && shiftKey) {
    return true
  }
  if (type === 'keydown' && code === 'KeyA' && shiftKey) {
    recordUserRect();
    return true
  } else if (code === 'KeyA' && shiftKey) {
    return true
  }
  if (type === 'keydown' && code === 'KeyZ' && shiftKey) {
    showTools();
    return true
  } else if (code === 'KeyA' && shiftKey) {
    return true
  }
  return false
}

// 工具箱
const toolsVisible = ref(false)
const showTools = () => {
  toolsVisible.value = !toolsVisible.value
}
const toolsSelectOption = ref(['默认', '提取文本', '截取元素', '点击跳转'])
const toolsActive = ref(1)
const loopToolsActive = () => {
  if (toolsActive.value < 4) {
    toolsActive.value += 1
  } else {
    toolsActive.value = 1
  }
}
const setToolsActive = (item: number) => {
  toolsActive.value = item
}
// 
const addBuiltInEvent = (name: string, data?: object) => {
  if (name === 'snapshotFullScreen') {
    currentIndex.value += 1
    sendMessage(
      {
        type: "snapshotFullScreen",
        index: currentIndex.value,
      }
    );
    userDoData.value.push({
      index: currentIndex.value,
      type: 'snapshotFullScreen',
      data: {
      }
    });
  } else if (name === 'delay') {
    currentIndex.value += 1
    sendMessage(
      {
        type: "delay",
        index: currentIndex.value,
        delay: 1000
      }
    );
    userDoData.value.push({
      index: currentIndex.value,
      type: 'delay',
      delay: 1000
    });
  } else if (name === 'snapshotCurrentScreen') {
    currentIndex.value += 1
    sendMessage(
      {
        type: "snapshotCurrentScreen",
        index: currentIndex.value,
        data: {
          scrollTop: document.documentElement.scrollTop,
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    );
    userDoData.value.push({
      index: currentIndex.value,
      type: 'snapshotCurrentScreen',
      data: {
        scrollTop: document.documentElement.scrollTop,
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

}

// 选择器 唯一或相似
const currentSelectType = ref('唯一')
const loopSelectType = () => {
  if (currentSelectType.value === '唯一') {
    currentSelectType.value = '相似'
  } else {
    currentSelectType.value = '唯一'
  }
}
const selectypeChange = (e: string) => {
  currentSelectType.value = e
}

// 已操作事件列表
const boxDetail = ref(false)
const showBoxDetail = () => {
  boxDetail.value = !boxDetail.value
}
const deleteOperate = (index: number) => {
  
  sendMessage({
    type: 'deleteData',
    data: {
      index: userDoData.value[index].index
    }
  })
  console.log(userDoData.value[index])
  userDoData.value.splice(index, 1)
}

// 结束设置
const finishSetting = () => {
  currentIndex.value += 1
  sendMessage({
    type: 'finishSetting',
    index: currentIndex.value
  })
}
const init = () => {
  (containerRef.value as HTMLElement).style.maxHeight = window.innerHeight + 'px';
  if (self === top) {
    currentDocument.value = 'top'
  } else {
    currentDocument.value = 'iframe'
  }
}
const initGlobalListener = () => {
  rectBoxMove();
  // globalClick();
  globalWhell();
  globalKeyDown();
  globalAListener();
  globalMouse();
}
onMounted(async () => {
  init();
  initGlobalListener();
})
</script>
