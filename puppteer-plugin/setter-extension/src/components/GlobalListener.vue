<template>
  <div
    :class="{ 'rect-box': true, pointervisible: rectBoxPointerVisible }"
    ref="rectBoxRef"
  ></div>
</template>

<script setup lang="ts">
import { Ref, computed, onMounted, ref } from 'vue';
import { addClass } from '../util/dom';
import { throttle } from 'lodash';
import { DomService } from '../util/selector';
import { sendMessage } from '@/util/service';

const props = defineProps({
  tool: {
    type: String,
    default: () => 'link',
  },
  selectSimilar: {
    type: Boolean,
    default: () => false,
  },
  userDoDataLastType: {
    type: String,
    default: () => [],
  },
});

const emits = defineEmits([
  'addUserDoData',
  'addHiddenData',
  'clickAndWaitNavigator',
]);

// 鼠标跟随框
const rectBoxRef: any = ref(null);
const rectDomEl: any = ref();
const rectBoxPointerVisible = ref(false);
const rectBoxMove = () => {
  document.body.addEventListener(
    'mousemove',
    (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      rectDomEl.value = el;
      if (el.tagName === 'A' && (el as HTMLAnchorElement).target === '_blank') {
        (el as HTMLAnchorElement).target = '_self';
      }
      const rectData = el.getBoundingClientRect();
      (rectBoxRef.value as HTMLElement).style.top = rectData.top + 'px';
      (rectBoxRef.value as HTMLElement).style.left = rectData.left + 'px';
      (rectBoxRef.value as HTMLElement).style.width = rectData.width + 'px';
      (rectBoxRef.value as HTMLElement).style.height = rectData.height + 'px';
    },
    false
  );
};

const toolActive = computed(() => props.tool);
const selectSimilar = computed(() => props.selectSimilar);
// 跟随框事件
const userDoDataLastType: any = computed(() => props.userDoDataLastType);

const recordUserRect = async () => {
  let newSelector = null;
  if (selectSimilar.value) {
    newSelector = DomService.getSelectorWithClass(rectDomEl.value);
  } else {
    const simpleSelect = DomService.getSelectorSimple(rectDomEl.value);
    newSelector = DomService.getSelectorWithNthUniq(
      simpleSelect,
      rectDomEl.value
    );
  }
  if (toolActive.value === 'text') {
    addClass(newSelector, 'puppeteer_sunsilent_light_text');
    emits('addUserDoData', {
      type: 'getText',
      label: '',
      multiple: selectSimilar.value,
      slot: true,
      data: newSelector,
    });
  } else if (toolActive.value === 'snapshot') {
    addClass(newSelector, 'puppeteer_sunsilent_light_element_snapshot');
    emits('addUserDoData', {
      type: 'getElementSnapshot',
      label: '',
      multiple: selectSimilar.value,
      slot: true,
      data: newSelector,
    });
  } else if (toolActive.value === 'link') {
    const rectDomElRect = rectDomEl.value.getBoundingClientRect();
    rectDomEl.value.className =
      rectDomEl.value.className + ` puppeteer_sunsilent_light_click_navigator`;
    // 通过 readystatechange 判断是否需要等待 load 事件
    // 有些网站会有不断的http请求，这时可以只需要等待 load 事件，不需要等待 networkidle0
    emits('addUserDoData', {
      type: 'clickAndWaitNavigator',
      slot: true,
      urlChange: true,
      waitForNavigation: {
        timeout: 10 * 1000,
        waitUntil: ['load', 'networkidle0'],
      },
      data: {
        screenX: rectDomElRect.left + rectDomElRect.width / 2,
        screenY: rectDomElRect.top + rectDomElRect.height / 2,
      },
    });
    // 立即恢复rect的穿透性，防止pptr点在实心遮蔽层上
    rectBoxPointerVisible.value = false;
    emits('clickAndWaitNavigator', {
      screenX: rectDomElRect.left + rectDomElRect.width / 2,
      screenY: rectDomElRect.top + rectDomElRect.height / 2,
    });
  }
};

// 全局监听事件
const globalMouse = () => {
  const emitMouse = (evt: any) => {
    const buttons: any = { 0: 'none', 1: 'left', 2: 'middle', 3: 'right' };
    const event = evt;
    const types: any = {
      mousedown: 'mousePressed',
      mouseup: 'mouseReleased',
      mousewheel: 'mouseWheel',
      touchstart: 'mousePressed',
      touchend: 'mouseReleased',
      touchmove: 'mouseWheel',
      mousemove: 'mouseMoved',
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
      event.type !== 'mousewheel' &&
      buttons[event.which] === 'none' &&
      event.type !== 'mousemove'
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
      button: event.type === 'mousewheel' ? 'none' : buttons[event.which],
      clickCount: 1,
    };
    if (event.type === 'mousewheel') {
      data.deltaX = event.wheelDeltaX || 0;
      data.deltaY = event.wheelDeltaY || event.wheelDelta;
    }
    // if (['mousedown'].includes(event.type)) {
    //   emits('addUserDoData', {
    //     type: 'click',
    //     slot: false,
    //   });
    // }
    emits('addHiddenData', {
      type: 'mouse',
      data,
    });
  };
  document.body.addEventListener('mousedown', throttle(emitMouse, 200), false);
  document.body.addEventListener('mouseup', throttle(emitMouse, 200), false);
  document.body.addEventListener('mousemove', throttle(emitMouse, 200), false);
};
const globalWhell = () => {
  function scrollFunction(e: any) {
    emits('addHiddenData', {
      type: 'scroll',
      data: {
        deltaY: e.deltaY,
        pageX: e.pageX,
        pageY: e.pageY,
      },
    });
    if (userDoDataLastType.value !== 'scroll') {
      emits('addUserDoData', {
        type: 'scroll',
        slot: false,
      });
    }
  }
  window.onwheel = scrollFunction;
  window.addEventListener('mouseWheel', scrollFunction, false);
};
const globalKeyDown = () => {
  const emitKeyEvent = (event: any) => {
    // 阻止原页面监听事件
    event.stopPropagation();
    // 由于鼠标移入可能会导致样式改变，所以按住shift键之后rect变为无法穿透的遮蔽层
    if (event.type === 'keydown' && (event.shiftKey || event.key === 'Shift')) {
      rectBoxPointerVisible.value = true;
    } else if (
      event.type === 'keyup' &&
      (event.shiftKey || event.key === 'Shift')
    ) {
      rectBoxPointerVisible.value = false;
    }
    // 剔除特殊键
    if (
      [
        'Control',
        'Shift',
        'Alt',
        'Meta',
        'CapsLock',
        'Tab',
        'F11',
        'F12',
      ].includes(event.key)
    ) {
      return false;
    }
    // 自定义组合键
    const isCombination = combinationKey(
      event.type,
      event.code,
      event.shiftKey
    );
    if (isCombination) return;
    let type;
    // if (event.keyCode === 8) {
    // // Backspace
    //   event.preventDefault();
    // }
    switch (event.type) {
      case 'keydown':
        type = 'keyDown';
        break;
      case 'keyup':
        type = 'keyUp';
        break;
      case 'keypress':
        type = 'char';
        break;
      default:
        return;
    }
    const text =
      type === 'char' ? String.fromCharCode(event.charCode) : undefined;
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
    emits('addHiddenData', {
      type: 'keyevent',
      data,
    });
    if (userDoDataLastType.value !== 'keyevent') {
      emits('addUserDoData', {
        type: 'keyevent',
        slot: false,
      });
    }
  };
  document.body.addEventListener('keydown', emitKeyEvent, true);
  document.body.addEventListener('keyup', emitKeyEvent, true);
  document.body.addEventListener('keypress', emitKeyEvent, true);
};
const globalWindow = () => {
  window.open = (url: any): any => {
    location.href = url;
  };
};
// 自定义组合键 Shift+Q Shift+W Shift+A
const combinationKey = (type: string, code: string, shiftKey: boolean) => {
  if (type === 'keydown' && code === 'KeyW' && shiftKey) {
    // loopSelectType();
    return true;
  } else if (code === 'KeyW' && shiftKey) {
    return true;
  }
  if (type === 'keydown' && code === 'KeyQ' && shiftKey) {
    // loopToolsActive();
    return true;
  } else if (code === 'KeyQ' && shiftKey) {
    return true;
  }
  if (type === 'keydown' && code === 'KeyA' && shiftKey) {
    recordUserRect();
    return true;
  } else if (code === 'KeyA' && shiftKey) {
    return true;
  }
  if (type === 'keydown' && code === 'KeyZ' && shiftKey) {
    // showTools();
    return true;
  } else if (code === 'KeyA' && shiftKey) {
    return true;
  }
  return false;
};

const initGlobalListener = () => {
  rectBoxMove();
  globalWhell();
  globalKeyDown();
  globalMouse();
  globalWindow();
};
onMounted(async () => {
  initGlobalListener();
});
</script>
