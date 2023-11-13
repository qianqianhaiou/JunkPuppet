import path, { resolve } from 'path';
import puppeteer from 'puppeteer-core';

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

function findIndexFromGlobalData(index: number) {
  for (let i = 0; i < GlobalData.length; i++) {
    if (GlobalData[i].index === index) {
      return i;
    }
  }
  return -1;
}

// 设置时，需将Chrome正受到自定测试软件的控制关闭掉！
// 设置时，需将Chrome正受到自定测试软件的控制关闭掉！
// 设置时，需将Chrome正受到自定测试软件的控制关闭掉！
const IS_DEV = process.argv[1].includes('setting.ts');
const DEV_EXTENSION_PATH = path.resolve(
  __dirname,
  '../../setter-extension/setter-dist'
);
const PRO_EXTENSION_PATH = path.resolve(__dirname, './setter-dist');
const EXTENSION_PATH = IS_DEV ? DEV_EXTENSION_PATH : PRO_EXTENSION_PATH;

const GlobalData: any = [];
const initExcScript = (page: any) => {
  page.on('load', async () => {
    await page.evaluate(() => {
      if (!(window as Window)._silentListen) {
        (window as Window)._silentListen = true;
        window.addEventListener('message', (e) => {
          (window as any)._silentSendData(e.data);
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

async function init(props: ISetting) {
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
    // process.exit();
    process.send && process.send('close');
  });
  const [page] = await browser.pages();
  return new Promise(async (resolve, reject) => {
    try {
      await page.exposeFunction('_silentSendData', async (data: any) => {
        if (!data) return;
        const dataJson = JSON.parse(data);
        if (dataJson.type === 'finishSetting') {
          // await writeFile(DATA_PATH, JSON.stringify(GlobalData));
          // await browser.close();
          resolve(GlobalData);
        } else if (dataJson.type === 'clickAndWaitNavigator') {
          page.mouse.click(dataJson.data.screenX, dataJson.data.screenY);
          GlobalData.push(dataJson);
        } else if (dataJson.type === 'updateData') {
          const gIndex = findIndexFromGlobalData(dataJson.data.index);
          if (gIndex >= 0) {
            if (dataJson.data.type === 'json') {
              GlobalData[gIndex] = dataJson.data.data;
            } else if (dataJson.data.type === 'form') {
              if (dataJson.data.data.clickDelay) {
                GlobalData[gIndex].clickDelay = dataJson.data.data.clickDelay;
              } else if (dataJson.data.data.getTextLabel) {
                GlobalData[gIndex].getTextLabel =
                  dataJson.data.data.getTextLabel;
              } else if (dataJson.data.data.snapshotName) {
                GlobalData[gIndex].snapshotName =
                  dataJson.data.data.snapshotName;
              } else if (dataJson.data.data.delay) {
                GlobalData[gIndex].delay = dataJson.data.data.delay;
              }
            }
          }
        } else if (dataJson.type === 'deleteData') {
          const gIndex = findIndexFromGlobalData(dataJson.data.index);
          GlobalData.splice(gIndex, 1);
        } else {
          GlobalData.push(dataJson);
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
      process.send && process.send(result);
    }
    process.exit();
  } catch (e) {
    process.send && process.send(e);
  }
});
