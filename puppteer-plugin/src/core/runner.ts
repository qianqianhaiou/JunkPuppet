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
  getTextBySelector,
  playClick,
  playKeyDown,
  playMouse,
  playScroll,
  snapshotFullScreen,
} from '../service/emulate';
import { initDir } from '../util/file';
import { injectHookWindowOpen, injectMouseFollwer } from '../service/inject';
import { deceptionDetection, modifyCookies } from '../service/modify';

// 初始化日志
initLogger();

async function startTask(props: TaskRunnerData) {
  const launchParams: any = {
    executablePath: props.chromePath,
    headless: props.headless,
    defaultViewport: props.size || {
      width: 1920,
      height: 1080,
    },
    slowMo: props.slowMo || 100,
    args: [
      '--allow-running-insecure-content',
      '--disable-web-security',
      '--start-fullscreen',
    ],
  };
  if (props.chromeDataPath) {
    await clearUserDataDirExitType(props.chromeDataPath);
    launchParams.userDataDir = props.chromeDataPath;
  }
  const browser = await puppeteer.launch(launchParams);
  if (!browser) {
    console.error('浏览器连接失败');
    return;
  }
  const [page] = await browser.pages();

  // 欺骗检测
  await deceptionDetection({
    page,
    browser,
  });

  // 拦截
  injectHookWindowOpen(page);

  // 修改cookies
  await modifyCookies({ page }, props.cookies, props.targetUrl);

  // 等待导航结束
  await Promise.all([
    page.waitForNavigation({
      waitUntil: ['load'],
    }),
    page.goto(props.targetUrl),
  ]);

  // cdp session
  const client = await page.target().createCDPSession();
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

  const mockData = JSON.parse(props.data);
  const customFnData = mockData.customFn;
  // 任务队列
  await asyncFor(mockData.builtInData, async (item) => {
    if (item.type === 'mouse') {
      await playMouse(client, item.data);
    } else if (item.type === 'keyevent') {
      await playKeyDown(client, item.data);
    } else if (item.type === 'scroll') {
      await playScroll(client, item.data);
      await waitTime(0.2);
    } else if (item.type === 'clickAndWaitNavigator') {
      const navigatorPromise = item.urlChange
        ? page.waitForNavigation(item.waitForNavigation)
        : page.waitForNetworkIdle();
      await Promise.all([navigatorPromise, playClick(page, item.data)]).catch(
        (e: any) => {
          console.warn(e?.message);
        }
      );
      await waitTime(1);
      if (!props.headless) {
        await injectMouseFollwer(page);
      }
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
      const data = await getTextBySelector(page, item.data);
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
      const functionString = customFnData[item.customFnName].functionString;
      const customFnResult = await customFn(
        { page, browser, client },
        functionString
      );
      if (customFnResult) {
        result.customResult.push(customFnResult);
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
    console.error(e?.message);
  } finally {
    process.exit();
  }
});
