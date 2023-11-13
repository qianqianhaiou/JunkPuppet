export const translateOperate = (type: string) => {
  switch(type) {
    case 'click' : {
      return '点击操作'
    }
    case 'clickAndWaitNavigator' : {
      return '点击跳转'
    }
    case 'getText' : {
      return '获取文本'
    }
    case 'getElementSnapshot' : {
      return '元素截图'
    }
    case 'snapshotFullScreen' : {
      return '全屏截图'
    }
    case 'snapshotCurrentScreen' : {
      return '当前屏幕截图'
    }
    case 'delay' : {
      return '等待延迟'
    }
    case 'mouse' : {
      return '鼠标移动'
    }
    case 'scroll' : {
      return '滚动操作'
    }
    case 'keyevent' : {
      return '键盘操作'
    }
  }
}