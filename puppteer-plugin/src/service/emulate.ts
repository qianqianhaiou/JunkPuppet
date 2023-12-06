import path from 'path';
import { Page, CDPSession, ElementHandle } from 'puppeteer-core';
import { v4 as uuidv4 } from 'uuid';
import { hookA } from '../util/dom';
import { selectBySelector } from './select';
import { injectFunction } from './inject';

export async function playClick(
  page: Page,
  data: {
    selector: Selector;
    screenX?: number;
    screenY?: number;
  }
) {
  await injectFunction({ page }, hookA);
  const target = await selectBySelector({ page }, data.selector);
  if (target) {
    await target.click();
  } else {
    throw new Error('没有找到点击跳转元素');
  }
  // await page.mouse.click(
  //   data.screenX,
  //   data.screenY
  // );
}
export async function playScroll(client: CDPSession, data: ScrollData) {
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: data.pageX,
    y: data.pageY,
    deltaY: data.deltaY,
    deltaX: 0,
  });
}
export async function playMouse(client: CDPSession, data: any) {
  await client.send('Input.emulateTouchFromMouseEvent', data);
}
export async function playKeyDown(client: CDPSession, data: any) {
  await client.send('Input.dispatchKeyEvent', data);
}
export async function getTextBySelector(page: Page, data: Selector) {
  const result: any = [];
  if (data.iframeIndex >= 0) {
    const iframes = await page.$$('iframe');
    const targets = await iframes[data.iframeIndex].$$(data.selector);
    for (const target of targets) {
      const text = await target.getProperty('innerText');
      const value = await text.jsonValue();
      result.push(value);
    }
  } else {
    const targets = await page.$$(data.selector);
    for (const target of targets) {
      const text = await target.getProperty('innerText');
      const value = await text.jsonValue();
      result.push(value);
    }
  }
  return result;
}
export async function getSnapshotBySelector(
  page: Page,
  data: Selector,
  parent: string
) {
  const result: any = [];
  if (data.iframeIndex >= 0) {
    const iframes = await page.$$('iframe');
    const targets = await iframes[data.iframeIndex].$$(data.selector);
    for (const target of targets) {
      const uid = uuidv4();
      await target.screenshot({
        path: path.join(parent, `${uid}.png`),
      });
      result.push(uid);
    }
  } else {
    const targets = await page.$$(data.selector);
    for (const target of targets) {
      const uid = uuidv4();
      await target.screenshot({
        path: path.join(parent, `${uid}.png`),
      });
      result.push(uid);
    }
  }
  return result;
}
export async function getCurrentScreenSnapshot(
  page: Page,
  data: CurrentScreenSnapshot,
  parent: string
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
