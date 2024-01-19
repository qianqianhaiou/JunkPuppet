/**
 * 拦截 A 标签的 _blank 改为  _self
 */
export const hookA = () => {
  // 遍历A标签更改 _blank -> self
  Array.prototype.map.call(document.querySelectorAll('a'), ($el: HTMLAnchorElement) => {
    if ($el.target === '_blank') {
      $el.target = '_self';
    }
  });
};

/**
 * 拦截 window.open 改为 location.href
 */
export const hookWindowOpen = () => {
  (window as any).open = (url: string) => {
    location.href = url;
    return false;
  };
};

/**
 * 增加鼠标跟随事件，调试模式使用
 */
export const emulateMouseMove = () => {
  const el = document.createElement('div');
  el.style.position = 'fixed';
  el.style.width = '20px';
  el.style.height = '20px';
  el.style.top = '0px';
  el.style.left = '0px';
  el.style.pointerEvents = 'none';
  el.style.backgroundColor = '#f1f1f1';
  el.style.zIndex = '2147483647';
  el.style.borderRadius = '50%';
  el.style.border = '4px solid red';
  el.id = '_sunsilent_arrow';
  document.body.appendChild(el);
  document.documentElement.addEventListener('mousemove', (e) => {
    el.style.left = e.clientX - 10 + 'px';
    el.style.top = e.clientY - 10 + 'px';
  });
};
