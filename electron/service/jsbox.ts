import { fork } from 'child_process';

export const startManualJs = async (params: { code: string }) => {
  try {
    const ChildProcess = fork(`${process.env.SCRIPTS_PATH}/execute.js`);
    ChildProcess.send({
      type: 'start',
      params: {
        code: params.code,
        chromePath: process.env.CHROME_PATH,
      },
    });
    return new Promise((resolve, reject) => {
      const messageHandle = async (msg: any) => {
        if (msg.type === 'result') {
          ChildProcess.off('message', messageHandle);
          resolve(msg.data);
        } else if (msg.type === 'warn') {
          console.warn(`JS任务执行警告 - ` + JSON.stringify(msg.data));
        } else if (msg.type === 'error') {
          console.error(`JS任务执行出错 - ` + JSON.stringify(msg.data));
        }
      };
      ChildProcess.on('message', messageHandle);
      ChildProcess.once('error', function (code) {
        reject('exit error code: ' + code);
      });
      ChildProcess.once('close', function (code) {
        resolve('exit close code: ' + code);
      });
    });
  } catch (error: any) {
    console.log(`startManualJs start error：${error.message}`);
  }
};
