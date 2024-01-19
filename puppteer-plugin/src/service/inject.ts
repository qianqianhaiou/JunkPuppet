import { EvaluateFunc, Page } from 'puppeteer-core';
import { InjectContexts } from '../types/Puppet';
import { emulateMouseMove, hookWindowOpen } from '../util/dom';

// 注入指定函数至页面中执行
export const injectFunction = async (contexts: InjectContexts, fn: string | EvaluateFunc<[]>) => {
  const result = await contexts.page.evaluate(fn);
  return result;
};

// 注入 鼠标跟随 事件  调试模式使用
export const injectMouseFollwer = async (page: Page) => {
  await injectFunction({ page }, emulateMouseMove);
};

// 注入 拦截window.open事件 改为 location.href
export const injectHookWindowOpen = (page: Page) => {
  page.on('load', async () => {
    await injectFunction({ page }, hookWindowOpen);
  });
};
