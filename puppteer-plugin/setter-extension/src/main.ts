import { createApp } from 'vue';
import style from '@/assets/styles/style.scss?inline';
import highlight from '@/assets/styles/highlight.scss?inline';
import antdstyle from '@/assets/styles/antd-min.css?inline';
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

	// shadow内样式 antd style
	const antdCSSStyle = document.createElement('style');
	antdCSSStyle.appendChild(document.createTextNode(antdstyle));
	NewShadowRootEl.appendChild(antdCSSStyle);

	// const antdCSSStyleLink = document.createElement('link');
	// antdCSSStyleLink.setAttribute('rel', 'stylesheet');
	// antdCSSStyleLink.setAttribute('type', 'text/css');
	// antdCSSStyleLink.setAttribute('href', '/antd-min.css');
	// NewShadowRootEl.appendChild(antdCSSStyleLink);

	// shadow外样式
	const highLightStyle = document.createElement('style');
	highLightStyle.appendChild(document.createTextNode(highlight));
	document.head.appendChild(highLightStyle);

	NewShadowRootEl.appendChild(RealDom);
	createApp(App).mount(RealDom);
}
initDom();
