import { resolve } from 'path';
import puppeteer, { ElementHandle } from 'puppeteer-core';
import { clearUserDataDirExitType, initLogger, waitTime } from '../util/tools';
import { selectBySelector } from '../service/select';
import { playClick } from '../service/emulate';

// 初始化日志
initLogger();

// 处理原始数据
const handleOperateListData = (data: any) => {
  const target: any = {
    operateListData: [],
    customFn: {}, // 将所有的customFn全部放在这里，通过function1 2 3 4来对应
    lifeHooks: {}, // 生命周期钩子
  };
  let fnCount = 0;
  structuredClone(data).forEach((item: any) => {
    if (item?.previousLimit?.type === 'customFn') {
      const functionName = `function${++fnCount}`;
      target.customFn[functionName] = item.previousLimit.customFn;
      item.previousLimit.customFn = functionName;
    }
    if (item?.operateData?.type === 'customFn') {
      const functionName = `function${++fnCount}`;
      target.customFn[functionName] = item.operateData.customFn;
      item.operateData.customFn = functionName;
    }
    target.operateListData.push(item);
  });
  return target;
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
  let operateListData: any[] = [];
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
    console.warn(operateListData);
    process.send &&
      process.send({
        type: 'finish',
        data: handleOperateListData(operateListData),
      });
    process.exit();
  });
  return new Promise(async (resolve, reject) => {
    try {
      await page.exposeFunction('_junkpuppet_send_data', async (data: any) => {
        const dataJson = JSON.parse(data);
        try {
          if (dataJson.type === 'finishSetting') {
            operateListData = operateListData.concat(dataJson.operateListData);
            await page.close();
            resolve('');
          } else if (dataJson.type === 'clickAndWaitNavigator') {
            const oldUrl = page.url();
            // click selector
            await playClick(page, { selector: dataJson.data.selector });

            await waitTime(0.5);
            const newUrl = page.url();
            if (oldUrl === newUrl) {
              for (let i = dataJson.operateListData.length - 1; i > 0; i++) {
                if (dataJson.operateListData[i].type === 'clickAndWaitNavigator') {
                  dataJson.operateListData[i]['urlChange'] = false;
                  break;
                }
              }
            }
            // 通过 readystatechange 判断是否需要等待 load 事件
            operateListData = operateListData.concat(dataJson.operateListData);
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
