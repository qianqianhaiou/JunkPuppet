import { CronJob } from 'cron';
import { startplay } from './task';
import { taskListDb } from './db';

// 定时任务开关
export const triggerItemCron = async (script: any) => {
  if (script.auto) {
    // 停止定时任务
    const cron = global.cronList.get(script._id);
    if (cron) {
      cron.stop();
    }
    const database = await taskListDb();
    const result = database.chain.get('list').find({ _id: script._id }).value();
    if (result.mockDataId) {
      global.cronList.set(
        result._id.toString(),
        new CronJob(
          result.cron,
          async () => {
            const params = {
              targetUrl: result.targetUrl,
              _id: result._id,
              mockDataId: result.mockDataId,
              name: result.name,
              autoMail: result.autoMail || false,
              mail: result.mail,
            };
            await startplay(params);
          },
          null,
          true,
        ),
      );
    }
  } else {
    // 删除定时任务
    const cron = global.cronList.get(script._id);
    if (cron) {
      cron.stop();
      global.cronList.delete(script._id);
    }
  }
};

// 启动定时任务
export const turnOnCron = (script: any) => {
  if (script.cron && script.mockDataId) {
    global.cronList.set(
      script._id.toString(),
      new CronJob(
        script.cron,
        async () => {
          const params = {
            targetUrl: script.targetUrl,
            _id: script._id,
            mockDataId: script.mockDataId,
            name: script.name,
            autoMail: script.autoMail || false,
            mail: script.mail,
          };
          await startplay(params);
        },
        null,
        true,
      ),
    );
  }
};
