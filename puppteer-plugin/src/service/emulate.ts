import path from 'path';
import { Page, CDPSession, ElementHandle } from 'puppeteer-core';
import { v4 as uuidv4 } from 'uuid';
import { hookA } from '../util/dom';
import { getElementHandlesBySelector } from './select';
import { injectFunction } from './inject';
import { InjectContexts } from '../types/Puppet';
import { waitTime } from '../util/tools';

export async function emulateClick(
  page: Page,
  selector: Selector,
  options?: { button: 'left'; clickCount: 1; delay: 0 },
) {
  await injectFunction({ page }, hookA);
  const elementHandles = await getElementHandlesBySelector(page, selector);
  if (!elementHandles.length) {
    throw new Error('没有找到点击跳转元素');
  }
  for (const elementHandle of elementHandles) {
    // 此方法将元素滚动到视野中，然后使用 page.mouse 单击元素的中心。 如果该元素从 DOM 中分离，则该方法将引发错误。
    await elementHandle.click(options);
    await waitTime(0.5);
  }
}
async function emulateScroll(client: CDPSession, data: ScrollData) {
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: data.pageX,
    y: data.pageY,
    deltaY: data.deltaY,
    deltaX: 0,
  });
}
async function emulateMouse(client: CDPSession, data: any) {
  await client.send('Input.emulateTouchFromMouseEvent', data);
}
async function emulateKeyDown(client: CDPSession, data: any) {
  await client.send('Input.dispatchKeyEvent', data);
}
export async function emulateMouseKeyData(client: CDPSession, data: any) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.type === 'mouse') {
      await emulateMouse(client, item.data);
    } else if (item.type === 'keyevent') {
      await emulateKeyDown(client, item.data);
    } else if (item.type === 'scroll') {
      await emulateScroll(client, item.data);
      await waitTime(0.2);
    }
  }
}

export async function clickElement(page: Page, selector: Selector) {
  await injectFunction({ page }, hookA);
  const elementHandles = await getElementHandlesBySelector(page, selector);
  if (!elementHandles.length) {
    throw new Error('没有找到点击跳转元素');
  }
  for (const elementHandle of elementHandles) {
    await elementHandle.click();
    await waitTime(0.5);
  }
}
export async function getAttributeBySelector(page: Page, data: Selector, attribute: string) {
  const result: string[] = [];
  const elementHandles = await getElementHandlesBySelector(page, data);
  for (let i = 0; i < elementHandles.length; i++) {
    const elementHandle = elementHandles[i];
    const attr: any = await elementHandle.getProperty(attribute);
    const value = (await attr.jsonValue()) || '';
    result.push(value);
  }
  return result;
}
export async function getSnapshotBySelector(page: Page, data: Selector, parent: string) {
  const result: string[] = [];
  const elementHandles = await getElementHandlesBySelector(page, data);
  for (let i = 0; i < elementHandles.length; i++) {
    const elementHandle = elementHandles[i];
    const uid = uuidv4();
    await elementHandle.screenshot({
      path: path.join(parent, `${uid}.png`),
    });
    result.push(uid);
  }
  return result;
}
export async function getCurrentScreenSnapshot(
  page: Page,
  data: CurrentScreenSnapshot,
  parent: string,
) {
  const uid = uuidv4();
  await page.screenshot({
    path: path.join(parent, `${uid}.png`),
    clip: {
      x: 0,
      y: data.scrollTop || 0,
      width: data.width,
      height: data.height,
    },
  });
  return uid;
}
export async function snapshotFullScreen(page: Page, parent: string) {
  const uid = uuidv4();
  await page.screenshot({
    path: path.join(parent, `${uid}.png`),
    fullPage: true,
  });
  return uid;
}
export async function customFn(_injectContexts: InjectContexts, _silent_exec_string: string) {
  if (_silent_exec_string) {
    return eval(`(async() => {${_silent_exec_string}})()`);
  } else {
    return Promise.resolve('');
  }
}
export async function runLifeHook(
  _injectContexts: InjectContexts,
  customFnData: any,
  label: string,
) {
  const _silent_exec_string = customFnData[label];
  if (_silent_exec_string) {
    return await customFn(_injectContexts, _silent_exec_string).catch((e: any) => {
      console.error(`LIFE_HOOK（${label}）: ` + e?.message);
    });
  } else {
    return Promise.resolve('');
  }
}
