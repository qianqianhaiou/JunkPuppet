import { resolve } from 'path';
import puppeteer, { ElementHandle } from 'puppeteer-core';
import { clearUserDataDirExitType, initLogger, waitTime } from '../util/tools';
import { selectBySelector } from '../service/select';
import { playClick } from '../service/emulate';

// 初始化日志
initLogger();

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
          // manualData: {},
          // apiData: {},
          builtInData: userDoData,
          customFn: {},
        },
      });
    process.exit();
  });
  return new Promise(async (resolve, reject) => {
    try {
      await page.exposeFunction('_junkpuppet_send_data', async (data: any) => {
        const dataJson = JSON.parse(data);
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
