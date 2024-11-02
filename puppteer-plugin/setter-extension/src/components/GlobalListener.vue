<template></template>

<script setup lang="ts">
import { Ref, computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { addClass } from '../util/dom';
import { throttle } from '../util/tools';
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

const emits = defineEmits(['addUserDoData', 'addHiddenData', 'clickAndWaitNavigator']);

// 全局监听事件
const globalMouse = () => {
  const emitMouse = (evt: any) => {
    if (!evt.isTrusted) {
      return;
    }
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
      (event.type !== 'mousewheel' &&
        buttons[event.which] === 'none' &&
        event.type !== 'mousemove') ||
      buttons[event.which] === 'right'
    ) {
      // 过滤 右键 及 非正常鼠标事件
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
    if (e.target.id === 'puppeteer-sunsilent-shadow-root') {
      return false;
    }
    emits('addHiddenData', {
      type: 'scroll',
      data: {
        deltaY: e.deltaY,
        pageX: e.pageX,
        pageY: e.pageY,
      },
    });
  }
  window.onwheel = scrollFunction;
  window.addEventListener('mouseWheel', scrollFunction, false);
};
const globalKeyDown = () => {
  const emitKeyEvent = (event: any) => {
    // 阻止原页面监听事件
    event.stopPropagation();

    // 剔除特殊键
    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab', 'F11', 'F12'].includes(event.key)) {
      return false;
    }
    let type;
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
    const text = type === 'char' ? String.fromCharCode(event.charCode) : undefined;
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
  };
  document.body.addEventListener('keydown', emitKeyEvent, true);
  document.body.addEventListener('keyup', emitKeyEvent, true);
  document.body.addEventListener('keypress', emitKeyEvent, true);
};

const initGlobalListener = () => {
  globalWhell();
  globalKeyDown();
  globalMouse();
};
onMounted(() => {
  initGlobalListener();
});

onBeforeUnmount(() => {});
</script>
