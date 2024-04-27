import puppeteer from 'puppeteer-core';
import { initLogger } from '../util/tools';

// 初始化日志
initLogger();

async function startTask(props: any) {
  const launchParams: any = {
    executablePath: props.chromePath,
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    ignoreDefaultArgs: ['--enable-automation', '--start-maximized'],
  };
  let _injectContexts = {};
  {
    const browser = await puppeteer.launch(launchParams);
    browser.on('disconnected', (target) => {
      process.exit();
    });
    const [page] = await browser.pages();
    const client = await page.createCDPSession();
    _injectContexts = {
      browser,
      page,
      client,
    };
  }
  eval(`(async() => {${props.code}})()`);
}

process.on('message', async (args: any) => {
  try {
    if (args.type === 'start') {
      const result = await startTask(args.params);
      process.send &&
        process.send({
          type: 'result',
          data: result,
        });
    }
  } catch (e: any) {
    console.error(e?.message);
    process.exit();
  }
});
