export const LIFE_HOOKS = ['onBeforeFirstNavigate', 'onAfterQueue', 'onBeforeEachClickNavigate'];

export const NAVIGATOR_WAITUTIL = {
  load: '页面load事件触发',
  domcontentloaded: '页面DOMContentLoaded事件触发',
  networkidle0: '不再有网络连接',
  networkidle2: '只有2个网络连接',
};

export const MOUSEKEY_EVENTS: any = {
  mouse: {
    mousePressed: '鼠标按下',
    mouseReleased: '鼠标松开',
    mouseWheel: '鼠标滚动',
    mouseMoved: '鼠标移动',
  },
  keyevent: {
    keyDown: '键盘按下',
    keyUp: '键盘松开',
    char: '键入字符',
  },
  scroll: '页面滚动',
};
