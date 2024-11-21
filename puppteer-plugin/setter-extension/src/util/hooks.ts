import { throttle } from './tools';
import { ref } from 'vue';
export const useGlobalListener = () => {
  const operateList: any = ref([]);

  const handleMouseEvent = throttle((evt: any) => {
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
    operateList.value.push({
      type: 'mouse',
      data,
    });
  }, 200);
  const handleWhellEvent = (evt: any) => {
    if (evt.target.id === 'puppeteer-sunsilent-shadow-root') {
      return false;
    }
    operateList.value.push({
      type: 'scroll',
      data: {
        deltaY: evt.deltaY,
        pageX: evt.pageX,
        pageY: evt.pageY,
      },
    });
  };
  const hadleKeyEvent = (event: any) => {
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
    operateList.value.push({
      type: 'keyevent',
      data,
    });
  };

  const startListener = () => {
    // mouse
    document.body.addEventListener('mousedown', handleMouseEvent, false);
    document.body.addEventListener('mouseup', handleMouseEvent, false);
    document.body.addEventListener('mousemove', handleMouseEvent, false);

    // whell
    window.onwheel = handleWhellEvent;
    window.addEventListener('mouseWheel', handleWhellEvent, false);

    // keyboard
    document.body.addEventListener('keydown', hadleKeyEvent, true);
    document.body.addEventListener('keyup', hadleKeyEvent, true);
    document.body.addEventListener('keypress', hadleKeyEvent, true);
  };
  const stopListener = () => {
    document.body.removeEventListener('mousedown', handleMouseEvent, false);
    document.body.removeEventListener('mouseup', handleMouseEvent, false);
    document.body.removeEventListener('mousemove', handleMouseEvent, false);

    window.onwheel = () => {};
    window.removeEventListener('mouseWheel', handleWhellEvent, false);

    document.body.removeEventListener('keydown', hadleKeyEvent, true);
    document.body.removeEventListener('keyup', hadleKeyEvent, true);
    document.body.removeEventListener('keypress', hadleKeyEvent, true);
    return operateList.value;
  };
  const clearEventList = () => {
    operateList.value = [];
  };

  return { startListener, stopListener, clearEventList, recordDataList: operateList };
};
