import { createApp } from "vue";
import style from "./style.scss?inline";
import highlight from "./highlight.scss?inline";
import App from "./App.vue";

function initDom() {
  const TargetContainer = document.querySelector("html") as HTMLElement;
  let ShadowRootEl = document.querySelector("puppeteer-sunsilent-shadow-root");
  if (ShadowRootEl) ShadowRootEl.remove();
  ShadowRootEl = document.createElement("div");
  ShadowRootEl.id = "puppeteer-sunsilent-shadow-root";
  TargetContainer.appendChild(ShadowRootEl);
  const NewShadowRootEl = ShadowRootEl.attachShadow({ mode: "open" });
  const RealDom = document.createElement("div");
  RealDom.id = "puppeteer-sunsilent-box";
  const CSSStyle = document.createElement("style");
  CSSStyle.appendChild(document.createTextNode(style));
  const highLightStyle = document.createElement("style");
  highLightStyle.appendChild(document.createTextNode(highlight));
  document.head.appendChild(highLightStyle);
  NewShadowRootEl.appendChild(CSSStyle);
  NewShadowRootEl.appendChild(RealDom);
  createApp(App).mount(RealDom);
}
initDom();
