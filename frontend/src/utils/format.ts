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
export const formatPreviousLimitType = (type: string): string => {
  if (!type) return '不设置';
  const map: { [key: string]: string } = {
    exist: '当某元素存在',
    inexistence: '当某元素不存在',
    customFn: '自定义函数',
  };
  return map[type];
};

export const formatLifeHookType = (type: string): string => {
  const map: { [key: string]: string } = {
    onBeforeFirstNavigate: '任务第一次导航前',
    onBeforeEachClickNavigate: '任务过程中每次导航前',
    onBeforeEachStep: '任务流每个步骤执行前',
    onAfterQueue: '所有任务流执行完成之后',
  };
  return map[type];
};
