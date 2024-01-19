export const formatOperateType = (type: string): string => {
  const map: { [key: string]: string } = {
    getText: '获取文本',
    getElementSnapshot: '截取元素',
    clickAndWaitNavigator: '点击跳转',
    clickElement: '点击元素',
    getAttribute: '提取属性',
    snapshotFullScreen: '全页截图',
    snapshotCurrentScreen: '当前窗口截图',
    delay: '延迟',
    mouse: '鼠标事件',
    scroll: '滚动事件',
    keyDown: '键盘按下',
    keyUp: '键盘松开',
    char: '键盘输入',
    keyevent: '键盘事件',
  };
  return map[type];
};
