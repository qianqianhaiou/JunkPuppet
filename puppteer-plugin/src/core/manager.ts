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
  browser.on('disconnected', (target) => {
    // browser意外退出
  });
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
    }
  } catch (e: any) {
    console.error(e?.message);
    process.exit();
  }
});
