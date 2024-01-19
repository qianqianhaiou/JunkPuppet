// import { startTask } from './core/runner';

import { fork } from 'child_process';
import path from 'path';

// startTask({
//   entryUrl:
//     'https://zhaoqize.github.io/puppeteer-api-zh_CN/#?product=Puppeteer&version=puppeteer-v19.8.5&show=api-pagewaitfornavigationoptions',
//   parent: 'ididid',
//   cookies: [
//     {
//       cookieName: '1',
//       cookieValue: '1',
//     },
//   ],
//   JSONUid: 'data',
//   _id: '',
// });
const ChildProcess = fork(path.resolve(__dirname, './core/setting.ts'));
ChildProcess.send('StartSetting');
ChildProcess.on('message', (msg) => {
  console.log(JSON.stringify(msg));
});
ChildProcess.on('error', function (code) {
  console.log('exit error code: ' + code);
});
ChildProcess.on('close', function (code) {
  console.log('exit code: ' + code);
});
