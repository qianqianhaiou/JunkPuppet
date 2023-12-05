import path, { resolve } from 'path';
import puppeteer from 'puppeteer-core';
import { clearUserDataDirExitType } from '../util/tools';

interface Window {
  open: Function;
  _silentListen?: boolean;
}
interface ISetting {
  targetUrl: string;
  chromePath: string;
  headless: boolean;
  size?: {
    width: number;
    height: number;
  };
  chromeDataPath: string;
}

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

const IS_DEV = process.argv[1].includes('setting.ts');
const DEV_EXTENSION_PATH = path.resolve(
  __dirname,
  '../../setter-extension/setter-dist'
);
const PRO_EXTENSION_PATH = path.resolve(__dirname, './setter-dist');
const EXTENSION_PATH = IS_DEV ? DEV_EXTENSION_PATH : PRO_EXTENSION_PATH;

let userDoData: any[] = [];

// 初始化通信通道
const initExcScript = (page: any) => {
  // 当页面domcontentloaded事件触发才可以接受到postMessage，与插件run_at: document_end配合
  page.on('domcontentloaded', async () => {
    await page.evaluate(() => {
      if (!(window as Window)._silentListen) {
        (window as Window)._silentListen = true;
        window.addEventListener('message', (e) => {
          if (!e || !e.data) return;
          const message = JSON.parse(e.data);
          (window as any)._silentSendData(message);
        });
      }
      (window as Window).open = (url: string) => {
        location.href = url;
        return false;
      };
      // 还差一个遍历A标签更改 _blank -> self
    });
  });
};

async function waitTime(time: number) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res('');
    }, time * 1000);
  });
}

async function init(props: ISetting) {
  if (props.chromeDataPath) {
    await clearUserDataDirExitType(props.chromeDataPath);
  }
  const browser = await puppeteer.launch({
    executablePath: props.chromePath,
    headless: props.headless,
    defaultViewport: props.size || {
      width: 1920,
      height: 1080,
    },
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--start-fullscreen',
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
    userDataDir: props.chromeDataPath,
  });
  if (!browser) return;
  browser.on('disconnected', (target) => {
    process.send &&
      process.send({
        type: 'finish',
        data: userDoData,
      });
    process.exit();
  });
  const [page] = await browser.pages();
  return new Promise(async (resolve, reject) => {
    try {
      await page.exposeFunction('_silentSendData', async (dataJson: any) => {
        if (dataJson['author'] && dataJson['author'] !== 'qianqianhaiou') {
          return false;
        }
        try {
          if (dataJson.type === 'finishSetting') {
            userDoData = userDoData.concat(dataJson.data);
            await browser.close();
            resolve('');
          } else if (dataJson.type === 'clickAndWaitNavigator') {
            const oldUrl = page.url();
            await page.mouse.click(
              dataJson.data.screenX,
              dataJson.data.screenY
            );
            await waitTime(0.5);
            const newUrl = page.url();
            if (oldUrl === newUrl) {
              for (let i = dataJson.userDoData.length - 1; i > 0; i++) {
                if (dataJson.userDoData[i].type === 'clickAndWaitNavigator') {
                  dataJson.userDoData[i]['urlChange'] = false;
                  break;
                }
              }
            }
            // 通过 readystatechange 判断是否需要等待 load 事件
            userDoData = userDoData.concat(dataJson.userDoData);
          }
        } catch (e: any) {
          console.warn(e.message);
        }
      });
      initExcScript(page);
      await page.goto(props.targetUrl);
    } catch (e) {
      reject(e);
    }
  });
}

process.on('message', async (args: any) => {
  try {
    if (args.type === 'StartSetting') {
      const result = await init(args.params);
    }
  } catch (e: any) {
    console.error(e?.message);
  }
});
