import { resolve } from 'path';
import puppeteer, { ElementHandle } from 'puppeteer-core';
import { clearUserDataDirExitType, initLogger, waitTime } from '../util/tools';
import { selectBySelector } from '../service/select';
import { playClick } from '../service/emulate';

const IS_DEV = process.argv[1].includes('setting.ts');
const DEV_EXTENSION_PATH = resolve(__dirname, '../../setter-extension/setter-dist');
const PRO_EXTENSION_PATH = resolve(__dirname, './setter-dist');
const EXTENSION_PATH = IS_DEV ? DEV_EXTENSION_PATH : PRO_EXTENSION_PATH;

// 初始化日志
initLogger();

// 初始化通信通道
const initExcScript = (page: any) => {
  // 当页面domcontentloaded事件触发才可以接受到postMessage，与插件run_at: document_end配合
  page.on('domcontentloaded', async () => {
    await page.evaluate(() => {
      if (!window._silentListen) {
        window._silentListen = true;
        window.addEventListener('message', (e) => {
          if (!e || !e.data) return;
          const message = JSON.parse(e.data);
          (window as any)._silentSendData(message);
        });
      }
      window.open = ((url: string) => {
        location.href = url;
        return false;
      }) as any;
      // 还差一个遍历A标签更改 _blank -> self
    });
  });
};

async function init(props: TaskSetterData) {
  const launchParams: any = {
    defaultViewport: props.size || {
      width: 1920,
      height: 1080,
    },
    browserWSEndpoint: props.wsEndpoint,
    executablePath: props.chromePath,
  };
  const browser = await puppeteer.connect(launchParams);
  if (!browser) return;
  let userDoData: any[] = [];
  const page = await browser.newPage();
  const targetId = (page.target() as any)._targetId;
  if (targetId) {
    process.send &&
      process.send({
        type: 'review',
        data: {
          targetId: targetId,
        },
      });
  }
  page.on('close', (target) => {
    process.send &&
      process.send({
        type: 'finish',
        data: {
          builtInData: userDoData,
          customFn: {},
        },
      });
    process.exit();
  });
  return new Promise(async (resolve, reject) => {
    try {
      await page.exposeFunction('_silentSendData', async (dataJson: any) => {
        // 令牌粗筛
        if (dataJson['author'] && dataJson['author'] !== 'qianqianhaiou') {
          return false;
        }
        try {
          if (dataJson.type === 'finishSetting') {
            userDoData = userDoData.concat(dataJson.data);
            await page.close();
            resolve('');
          } else if (dataJson.type === 'clickAndWaitNavigator') {
            const oldUrl = page.url();
            // click selector
            await playClick(page, { selector: dataJson.data.selector });

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
