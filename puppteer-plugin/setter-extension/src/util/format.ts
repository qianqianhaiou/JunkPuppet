export const formatOperateType = (type: string): string => {
  const map: { [key: string]: string } = {
    getText: '提取文本',
    getAttribute: '提取属性',
    getElementSnapshot: '截取元素',
    clickAndWaitNavigator: '点击跳转',
    insertText: '输入文字',
    clickElement: '点击元素',
    customFn: '自定义函数',

    snapshotFullScreen: '截取全图',
    snapshotCurrentScreen: '截取当前屏幕',
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
