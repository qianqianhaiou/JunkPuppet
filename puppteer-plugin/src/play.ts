// import { startTask } from './core/runner';

import { fork } from 'child_process';
import path from 'path';

const ChildProcess = fork(path.resolve(__dirname, './core/runner.ts'), { stdio: 'inherit' });

ChildProcess.on('message', (msg) => {
  console.log(JSON.stringify(msg));
});
ChildProcess.on('result', (msg) => {
  console.log(JSON.stringify(msg));
});
ChildProcess.on('error', function (code) {
  console.log('exit error code: ' + code);
});
ChildProcess.on('close', function (code) {
  console.log('exit code: ' + code);
});
ChildProcess.stdout?.on('data', (data) => {
  console.log(data);
});
ChildProcess.send({
  type: 'StartRunning',
  params: {
    targetUrl: 'https://top.baidu.com/board?tab=realtime',
    parent: 'D:\\TestData\\Snapshots\\c2d21a48-ed8b-429f-bfef-e3753ace3a2a',
    cookies: [],
    chromePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    wsEndpoint: 'ws://127.0.0.1:61645/devtools/browser/5c1a9e3f-4ef1-4841-a18c-e47b0f58bdf9',
    slowMo: 100,
    chromeDataPath: 'D:\\TestData\\ChromeData\\Default3',
    data: '{"operateListData":[{"mainSelector":{"iframeIndex":-1,"selector":"body>div>div>main>div:nth-of-type(2)>div>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)","similar":false},"parentLimit":null,"previousLimit":null,"recordList":null,"operateData":{"type":"getElementSnapshot","label":"","name":"xxxxx"}}],"customFn":{},"lifeHooks":{}}',
  },
});
