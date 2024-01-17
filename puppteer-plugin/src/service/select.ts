import { ElementHandle } from 'puppeteer-core';
import { InjectContexts } from '../types/Puppet';

export const selectBySelector = async (contexts: InjectContexts, selector: Selector) => {
	let target: ElementHandle<Element> | null = null;
	if (selector.iframeIndex >= 0) {
		const iframes = await contexts.page.$$('iframe');
		target = await iframes[selector.iframeIndex].$(selector.selector);
	} else {
		target = await contexts.page.$(selector.selector);
	}
	return target;
};
