import { createApp } from 'vue';
import style from '@/assets/styles/style.scss?inline';
import highlight from '@/assets/styles/highlight.scss?inline';
import App from './App.vue';

function initDom() {
  const TargetContainer = document.querySelector('html');
  let ShadowRootEl = document.querySelector('puppeteer-sunsilent-shadow-root');
  if (ShadowRootEl) ShadowRootEl.remove();
  ShadowRootEl = document.createElement('div');
  ShadowRootEl.id = 'puppeteer-sunsilent-shadow-root';
  TargetContainer!.appendChild(ShadowRootEl);
  const NewShadowRootEl = ShadowRootEl.attachShadow({ mode: 'open' });
  const RealDom = document.createElement('div');
  RealDom.id = 'puppeteer-sunsilent-box';

  // shadow内样式
  const CSSStyle = document.createElement('style');
  CSSStyle.appendChild(document.createTextNode(style));
  NewShadowRootEl.appendChild(CSSStyle);

  // shadow外样式
  const highLightStyle = document.createElement('style');
  highLightStyle.appendChild(document.createTextNode(highlight));
  document.head.appendChild(highLightStyle);

  NewShadowRootEl.appendChild(RealDom);
  createApp(App).mount(RealDom);
}

function initHack() {
  window.open = ((url: string) => {
    location.href = url;
    return false;
  }) as any;
  // 还差一个遍历A标签更改 _blank -> self
  Array.prototype.map.call(document.querySelectorAll('a'), ($el: HTMLAnchorElement) => {
    if (typeof $el.target === 'string') {
      // 过滤 svg 下的 a标签
      $el.target = '_self';
    }
  });
  // 有些A标签是实时生成的，得想办法处理
}
window._junkpuppet_send_data = true;
if (window._junkpuppet_send_data) {
  // 如果是设置模式，则初始化相关工具
  initDom();
}
initHack();
