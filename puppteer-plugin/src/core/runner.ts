import puppeteer from 'puppeteer-core';
import {
  asyncFor,
  waitTime,
  clearUserDataDirExitType,
  getCurrentTime,
  initLogger,
} from '../util/tools';
import {
  customFn,
  getCurrentScreenSnapshot,
  getSnapshotBySelector,
  getAttributeBySelector,
  clickElement,
  emulateClick,
  runLifeHook,
  snapshotFullScreen,
  emulateMouseKeyData,
} from '../service/emulate';
import { initDir } from '../util/file';
import { injectHookWindowOpen, injectMouseFollwer } from '../service/inject';
import { deceptionDetection, modifyCookies } from '../service/modify';
import { LIFE_HOOKS } from '../util/const';
import { getElementHandlesBySelector } from '../service/select';

// 初始化日志
initLogger();

// 发送electron通知
const notification = (text: string) => {
  process.send &&
    process.send({
      type: 'notification',
      data: text,
    });
};
// 发送邮件通知
const sendMail = (to: string, subject: string, html: string) => {
  process.send &&
    process.send({
      type: 'sendMail',
      to: to,
      data: {
        subject,
        html,
      },
    });
};

async function startTask(props: TaskRunnerData) {
  const launchParams: any = {
    executablePath: props.chromePath,
    headless: 'new',
    defaultViewport: props.size || {
      width: 1920,
      height: 1080,
    },
    browserWSEndpoint: props.wsEndpoint,
    slowMo: props.slowMo || 100,
  };

  // 处理原始数据
  const { operateListData, customFn: customFnData, lifeHooks } = JSON.parse(props.data);

  // 连接浏览器
  const browser = await puppeteer.connect(launchParams);
  if (!browser) {
    console.error('浏览器连接失败');
    return;
  }

  const page = await browser.newPage();

  // cdp session
  const client = await page.createCDPSession();

  // 欺骗检测
  await deceptionDetection({
    page,
    browser,
  });

  // 拦截
  injectHookWindowOpen(page);

  // 修改cookies
  await modifyCookies({ page }, props.cookies);

  // lifehook -> onBeforeFirstNavigate
  await runLifeHook({ page, browser, client }, lifeHooks, 'onBeforeFirstNavigate');

  // 等待导航结束
  await Promise.all([
    page.waitForNavigation({
      waitUntil: ['load'],
    }),
    page.goto(props.targetUrl),
  ]);

  const result: TaskRunnerResult = {
    texts: [],
    snapshots: [],
    customResult: [],
  };

  // 初始化截图文件夹
  await initDir(props.parent);

  const injectContexts = { page, browser, client, notification, sendMail };
  // 任务队列
  await asyncFor(operateListData, async (item) => {
    await runLifeHook({ page, browser, client }, lifeHooks, 'onBeforeEachStep');

    if (item.recordList) {
      await emulateMouseKeyData(client, item.recordList);
    }

    // 有前置条件
    if (item.previousLimit) {
      // 自定义函数
      if (item.previousLimit.type === 'customFn') {
        const result = await customFn(injectContexts, customFnData[item.previousLimit.customFn]);
        if (!result) return false;
      } else {
        const elementHandles = await getElementHandlesBySelector(page, item.previousLimit.selector);
        if (item.previousLimit.type === 'exist') {
          if (!elementHandles.length) return false;
        } else {
          if (elementHandles.length) return false;
        }
      }
    }

    const mainSelector: Selector = {
      ...item.mainSelector,
      // 父元素限制
      parent: item.parentLimit ? item.parentLimit.selector : null,
    };

    if (item.operateData.type === 'getText') {
      const data = await getAttributeBySelector(page, mainSelector, 'innerText');
      result.texts.push({
        label: item.operateData.label || getCurrentTime(),
        similar: mainSelector.similar,
        values: data,
      });
    } else if (item.operateData.type === 'getAttribute') {
      const data = await getAttributeBySelector(page, mainSelector, item.operateData.getAttribute);
      result.texts.push({
        label: item.operateData.label || getCurrentTime(),
        similar: mainSelector.similar,
        values: data,
      });
    } else if (item.operateData.type === 'getElementSnapshot') {
      const uids = await getSnapshotBySelector(page, mainSelector, props.parent);
      result.snapshots.push({
        type: 'getElementSnapshot',
        similar: mainSelector.similar,
        label: item.operateData.label || getCurrentTime(),
        uids: uids,
      });
    } else if (item.operateData.type === 'snapshotFullScreen') {
      const uid = await snapshotFullScreen(page, props.parent);
      result.snapshots.push({
        type: 'snapshotFullScreen',
        label: item.operateData.label || getCurrentTime(),
        uids: [uid],
      });
    } else if (item.operateData.type === 'snapshotCurrentScreen') {
      const uid = await getCurrentScreenSnapshot(
        page,
        item.operateData.snapshotCurrentScreen,
        props.parent,
      );
      result.snapshots.push({
        type: 'snapshotCurrentScreen',
        label: item.label || getCurrentTime(),
        uids: [uid],
      });
    } else if (item.operateData.type === 'delay') {
      const delay = Number(item.operateData.delay);
      if (!isNaN(delay)) {
        await waitTime(delay / 1000);
      }
    } else if (item.operateData.type === 'customFn') {
      const functionString = customFnData[item.operateData.customFn];
      const customFnResult = await customFn(injectContexts, functionString);
      if (customFnResult) {
        result.customResult.push(customFnResult);
      }
    } else if (item.operateData.type === 'clickAndWaitNavigator') {
      await runLifeHook({ page, browser, client }, lifeHooks, 'onBeforeEachClickNavigate');
      const navigatorPromise = item.operateData.clickAndWaitNavigator.urlChange
        ? page.waitForNavigation(item.operateData.clickAndWaitNavigator.waitForNavigation)
        : page.waitForNetworkIdle();
      await Promise.all([navigatorPromise, emulateClick(page, mainSelector)]).catch((e: any) => {
        console.warn(e?.message);
      });
      await waitTime(1);
    } else if (item.operateData.type === 'clickElement') {
      await emulateClick(page, mainSelector, item.operateData.clickElement);
      await waitTime(0.2);
    } else if (item.operateData.type === 'insertText') {
      await emulateClick(page, mainSelector);
      await page.keyboard.sendCharacter(item.operateData.insertText);
    }
  });

  // lifehook -> onAfterQueue
  await runLifeHook({ page, browser, client }, lifeHooks, 'onAfterQueue');

  await page.close();
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
    console.error(e?.message);
  } finally {
    process.exit();
  }
});
