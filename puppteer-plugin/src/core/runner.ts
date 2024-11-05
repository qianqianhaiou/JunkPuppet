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
  playClick,
  playKeyDown,
  playMouse,
  playScroll,
  runLifeHook,
  snapshotFullScreen,
} from '../service/emulate';
import { initDir } from '../util/file';
import { injectHookWindowOpen, injectMouseFollwer } from '../service/inject';
import { deceptionDetection, modifyCookies } from '../service/modify';
import { LIFE_HOOKS } from '../util/const';

// 初始化日志
initLogger();

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
  const mockData = JSON.parse(props.data);
  const customFnData = mockData.customFn;

  // 连接浏览器
  const browser = await puppeteer.connect(launchParams);
  if (!browser) {
    console.error('浏览器连接失败');
    return;
  }

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
  await modifyCookies({ page }, props.cookies, props.targetUrl);

  // lifehook -> onBeforeFirstNavigate
  await runLifeHook({ page, browser, client }, customFnData, 'onBeforeFirstNavigate');

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

  // 鼠标跟随，调试模式使用
  if (!props.headless) {
    await injectMouseFollwer(page);
  }

  // 任务队列
  await asyncFor(mockData.operateListData, async (item) => {
    if (item.type === 'mouse') {
      await playMouse(client, item.data);
    } else if (item.type === 'keyevent') {
      await playKeyDown(client, item.data);
    } else if (item.type === 'scroll') {
      await playScroll(client, item.data);
      await waitTime(0.2);
    } else if (item.type === 'clickAndWaitNavigator') {
      // lifehook -> onBeforeEachClickNavigate
      await runLifeHook({ page, browser, client }, customFnData, 'onBeforeEachClickNavigate');
      const navigatorPromise = item.urlChange
        ? page.waitForNavigation(item.waitForNavigation)
        : page.waitForNetworkIdle();
      await Promise.all([navigatorPromise, playClick(page, item.data)]).catch((e: any) => {
        console.warn(e?.message);
      });
      await waitTime(1);
      if (!props.headless) {
        await injectMouseFollwer(page);
      }
    } else if (item.type === 'clickElement') {
      await playClick(page, item.data);
      await waitTime(0.2);
    } else if (item.type === 'getElementSnapshot') {
      const uids = await getSnapshotBySelector(page, item.data, props.parent);
      result.snapshots.push({
        type: 'getElementSnapshot',
        multiple: item.multiple,
        label: item.label || getCurrentTime(),
        uids: uids,
      });
    } else if (item.type === 'snapshotFullScreen') {
      const uid = await snapshotFullScreen(page, props.parent);
      result.snapshots.push({
        type: 'snapshotFullScreen',
        label: item.label || getCurrentTime(),
        uid,
      });
    } else if (item.type === 'snapshotCurrentScreen') {
      const uid = await getCurrentScreenSnapshot(page, item.data, props.parent);
      result.snapshots.push({
        type: 'snapshotCurrentScreen',
        label: item.label || getCurrentTime(),
        uid,
      });
    } else if (item.type === 'getText') {
      const data = await getAttributeBySelector(page, item.data, 'innerText');
      result.texts.push({
        label: item.label || getCurrentTime(),
        multiple: item.multiple,
        values: data,
      });
    } else if (item.type === 'getAttribute') {
      const data = await getAttributeBySelector(page, item.data, item.attribute);
      result.texts.push({
        label: item.label || getCurrentTime(),
        multiple: item.multiple,
        values: data,
      });
    } else if (item.type === 'delay') {
      const delay = Number(item.delay);
      if (!isNaN(delay)) {
        await waitTime(delay / 1000);
      }
    } else if (item.type === 'customFn') {
      if (!LIFE_HOOKS.includes(item.customFnName)) {
        const functionString = customFnData[item.customFnName].functionString;
        const customFnResult = await customFn({ page, browser, client }, functionString);
        if (customFnResult) {
          result.customResult.push(customFnResult);
        }
      }
    }
  });

  // lifehook -> onAfterQueue
  await runLifeHook({ page, browser, client }, customFnData, 'onAfterQueue');

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
