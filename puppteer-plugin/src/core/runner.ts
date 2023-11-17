import path from 'path';
import puppeteer, { Page, CDPSession } from 'puppeteer-core';
import { v4 as uuidv4 } from 'uuid';
import { asyncFor, cb2Async } from '../util/tools';
import fs from 'fs';

// 初始化日志
function initLogger() {
  console.warn = (...data) => {
    const string = data.join(' ');
    process.send &&
      process.send({
        type: 'warn',
        data: string,
      });
  };
  console.error = (...data) => {
    const string = data.join(' ');
    process.send &&
      process.send({
        type: 'error',
        data: string,
      });
  };
}
initLogger();

async function waitTime(time: number) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res('');
    }, time * 1000);
  });
}
async function playClick(
  page: Page,
  data: { screenX: number; screenY: number }
) {
  await page.mouse.click(data.screenX, data.screenY);
}
async function playScroll(
  client: CDPSession,
  data: { pageX: number; pageY: number; deltaY: number }
) {
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: data.pageX,
    y: data.pageY,
    deltaY: data.deltaY,
    deltaX: 0,
  });
}
async function playMouse(client: CDPSession, data: any) {
  await client.send('Input.emulateTouchFromMouseEvent', data);
}
async function playKeyDown(client: CDPSession, data: any) {
  await client.send('Input.dispatchKeyEvent', data);
}
async function getTextBySelector(
  page: Page,
  data: {
    selector: string;
    iframeIndex: number;
  }
) {
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
async function getSnapshotBySelector(
  page: Page,
  data: {
    selector: string;
    iframeIndex: number;
  },
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
async function getCurrentScreenSnapshot(
  page: Page,
  data: {
    scrollTop: number;
    width: number;
    height: number;
  },
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
async function snapshotFullScreen(page: Page, parent: string) {
  const uid = uuidv4();
  await page.screenshot({
    path: path.join(parent, `${uid}.png`),
    fullPage: true,
  });
  return uid;
}

async function initDir(path: string) {
  async function createSourceDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      await cb2Async(fs.mkdir, dirPath);
    }
  }
  await createSourceDir(path);
}

const initExcScript = (page: Page) => {
  page.on('load', async () => {
    await page.evaluate(() => {
      (window as any).open = (url: string) => {
        location.href = url;
        return false;
      };
      Array.prototype.map.call(
        document.querySelectorAll('a'),
        ($el: HTMLAnchorElement) => {
          $el.target = '_self';
        }
      );
    });
  });
};

async function startTask(props: any) {
  const browser = await puppeteer.launch({
    executablePath: props.chromePath,
    headless: props.headless,
    defaultViewport: props.size || {
      width: 1920,
      height: 1080,
    },
    slowMo: props.slowMo || 100,
    devtools: !props.headless,
    args: [
      '--allow-running-insecure-content',
      '--disable-web-security',
      '--start-fullscreen',
    ],
    userDataDir: props.chromeDataPath,
  });
  if (!browser) {
    console.error('浏览器连接失败');
    return;
  }
  const [page] = await browser.pages();
  initExcScript(page);
  if (props.cookies.length) {
    for (const cookie of props.cookies) {
      page.setCookie({
        name: cookie.cookieName,
        value: cookie.cookieValue,
        url: props.targetUrl,
      });
    }
  }
  await Promise.all([
    page.waitForNavigation({
      waitUntil: ['networkidle0', 'load'],
    }),
    page.goto(props.targetUrl),
  ]);
  const client = await page.target().createCDPSession();
  const result: any = {
    texts: [],
    snapshots: [],
  };
  // 初始化截图文件夹
  await initDir(props.parent);
  await asyncFor(JSON.parse(props.data), async (item, index) => {
    if (item.type === 'mouse') {
      await playMouse(client, item.data);
    } else if (item.type === 'keyevent') {
      await playKeyDown(client, item.data);
    } else if (item.type === 'scroll') {
      await playScroll(client, item.data);
      await waitTime(0.2);
    } else if (item.type === 'clickAndWaitNavigator') {
      await Promise.all([
        page.waitForNavigation({
          timeout: 10 * 1000,
          waitUntil: ['networkidle0'],
        }),
        playClick(page, item.data),
      ]).catch((e) => {
        console.error(e.message);
      });
      await waitTime(1);
    } else if (item.type === 'getElementSnapshot') {
      const uids = await getSnapshotBySelector(page, item.data, props.parent);
      result.snapshots.push({
        type: 'getElementSnapshot',
        snapshotName: item.snapshotName || '',
        uids: uids,
      });
    } else if (item.type === 'snapshotFullScreen') {
      const uid = await snapshotFullScreen(page, props.parent);
      result.snapshots.push({
        type: 'snapshotFullScreen',
        snapshotName: item.snapshotName || '',
        uid,
      });
    } else if (item.type === 'snapshotCurrentScreen') {
      const uid = await getCurrentScreenSnapshot(page, item.data, props.parent);
      result.snapshots.push({
        type: 'snapshotCurrentScreen',
        snapshotName: item.snapshotName || '',
        uid,
      });
    } else if (item.type === 'getText') {
      const data = await getTextBySelector(page, item.data);
      result.texts.push({
        label: item.getTextLabel || '',
        value: data.join('  '),
      });
    } else if (item.type === 'delay') {
      const delay = Number(item.delay);
      if (!isNaN(delay)) {
        await waitTime(delay / 1000);
      }
    }
  });
  await browser.close();
  return result;
}

process.on('message', async (args: any) => {
  try {
    if (args.type === 'StartRunning') {
      const result = await startTask(args.params);
      process.send &&
        process.send({
          type: 'result',
          data: result,
        });
    }
  } catch (e: any) {
    console.error(e.message);
  } finally {
    process.exit();
  }
});
