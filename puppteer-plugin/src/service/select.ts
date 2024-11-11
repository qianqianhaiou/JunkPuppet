import { ElementHandle, Page } from 'puppeteer-core';
import { InjectContexts } from '../types/Puppet';

export const getElementHandlesBySelector = async (page: Page, selector: Selector) => {
  let target: ElementHandle<Element>[] = [];
  if (selector.parent) {
    const parents = (await getElementHandlesBySelector(page, selector.parent)) || [];
    for (let i = 0; i < parents.length; i++) {
      const handles = await parents[i].$$(selector.selector);
      target = target.concat(handles);
    }
  } else {
    if (selector.iframeIndex >= 0) {
      const iframes = await page.$$('iframe');
      target = (await iframes[selector.iframeIndex].$$(selector.selector)) || [];
    } else {
      target = (await page.$$(selector.selector)) || [];
    }
  }
  return target;
};
