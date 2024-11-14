import puppeteer from 'puppeteer-core';
import { clearUserDataDirExitType, initLogger } from '../util/tools';
import { resolve } from 'path';
const IS_DEV = process.argv[1].includes('setting.ts');
const DEV_EXTENSION_PATH = resolve(__dirname, '../../setter-extension/setter-dist');
const PRO_EXTENSION_PATH = resolve(__dirname, './setter-dist');
const EXTENSION_PATH = IS_DEV ? DEV_EXTENSION_PATH : PRO_EXTENSION_PATH;

// 初始化日志
initLogger();

async function initBrowser(props: any) {
  const launchParams: any = {
    executablePath: props.chromePath,
    headless: 'new',
    defaultViewport: props.size || {
      width: 1920,
      height: 1080,
    },
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--start-fullscreen',
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--remote-allow-origins=*',
    ],
  };
  if (props.chromeDataPath) {
    await clearUserDataDirExitType(props.chromeDataPath);
    launchParams.userDataDir = props.chromeDataPath;
  }
  const browser = await puppeteer.launch(launchParams);

  const [page] = await browser.pages();
  await page.setContent(
    '<!DOCTYPE html><html><head><meta charset=utf-8><title>欢迎使用拾荒木偶</title><style>html,body{height: 100%; overflow: hidden;}</style></head><body><div style="font-size: 56px; height: 100%; display: flex; align-items: center; justify-content: center;">欢迎使用拾荒木偶</div></body></html>',
  );

  browser.on('disconnected', (target) => {
    // browser意外退出
  });
  return browser.wsEndpoint();
}

async function activeTargetPage(props: any, pageId: string) {
  const launchParams: any = {
    executablePath: props.chromePath,
    headless: 'new',
    defaultViewport: props.size || {
      width: 1920,
      height: 1080,
    },
    browserWSEndpoint: props.wsEndpoint,
  };
  const browser = await puppeteer.connect(launchParams);
  const pages = await browser.pages();
  const targetPage = pages.find((item: any) => {
    return item.target()._targetId === pageId;
  });
  targetPage!.bringToFront();
  return browser.wsEndpoint();
}

async function closeTargetPage(props: any, pageId: string) {
  const launchParams: any = {
    executablePath: props.chromePath,
    headless: 'new',
    defaultViewport: props.size || {
      width: 1920,
      height: 1080,
    },
    browserWSEndpoint: props.wsEndpoint,
  };
  const browser = await puppeteer.connect(launchParams);
  const pages = await browser.pages();
  const targetPage = pages.find((item: any) => {
    return item.target()._targetId === pageId;
  });
  targetPage!.close();
  return browser.wsEndpoint();
}

process.on('message', async (args: any) => {
  try {
    if (args.type === 'initBrowser') {
      const result = await initBrowser(args.params);
      process.send &&
        process.send({
          type: 'wsEndpoint',
          data: result,
        });
    } else if (args.type === 'activeTargetPage') {
      const result = await activeTargetPage(args.params, args.params.pageId);
      process.send &&
        process.send({
          type: 'activeTargetPage',
          data: result,
        });
    } else if (args.type === 'closeTargetPage') {
      const result = await closeTargetPage(args.params, args.params.pageId);
      process.send &&
        process.send({
          type: 'closeTargetPage',
          data: result,
        });
    }
  } catch (e: any) {
    process.send &&
      process.send({
        type: 'error',
        data: e.message,
      });
    process.exit();
  }
});
