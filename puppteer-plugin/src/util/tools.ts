import { join } from 'path';
import { fsreadFile, fswriteFile } from './file';
import { existsSync } from 'fs';

/**
 * 异步队列
 */
export const asyncFor = <T = any>(
  items: T[],
  fn: (item: T, i: number) => Promise<any>,
  limit = 1,
): Promise<void> => {
  return new Promise((resolve) => {
    if (!items.length) return resolve();
    const [firstItems, restItems] = [items.slice(0, limit), items.slice(limit)];
    let runningItems: T[] = [];
    firstItems.forEach(handleItem);
    async function handleItem(item: T) {
      runningItems.push(item);
      await fn(item, items.indexOf(item)).catch((e) => {
        console.error(e);
      });
      runningItems = runningItems.filter((runItem) => {
        return runItem !== item;
      });
      const nextItem = restItems.shift();
      if (nextItem) {
        handleItem(nextItem);
      } else if (!runningItems.length) {
        resolve();
      }
    }
  });
};

/**
 * 格式化当前时间
 */
export const getCurrentTime = (seconds?: number) => {
  let date = new Date(seconds || Date.now());
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0') +
    ' ' +
    String(date.getHours()).padStart(2, '0') +
    ':' +
    String(date.getMinutes()).padStart(2, '0') +
    ':' +
    String(date.getSeconds()).padStart(2, '0')
  );
};

/**
 * callBack To Async
 */
export async function cb2Async(fn: Function, ...params: any[]) {
  return new Promise<any>((resolve, reject) => {
    fn(...params, (err: any, result: any) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

/**
 * 等待 秒
 */
export async function waitTime(time: number) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res('');
    }, time * 1000);
  });
}

/**
 * 初始化日志通信
 */
export const initLogger = () => {
  console.warn = (...data) => {
    const string = data.join(' ');
    process.send &&
      process.send({
        type: 'warn',
        data: string,
      });
  };
  console.error = (...data) => {
    const string = data.join(' ');
    process.send &&
      process.send({
        type: 'error',
        data: string,
      });
  };
};

/**
 * 删除浏览器不正常关闭标记
 *
 * 当"Protocol error (Input.emulateTouchFromMouseEvent): Target closed" 时，可能是因为浏览器不正常关闭导致的，可以删掉userDataDir 用户数据即可解决
 *
 * 也可以不删掉userDataDir 可以更改 userDataDir\default\Preferences   Preferences: 'Normal' 然后只读
 */
export const clearUserDataDirExitType = async (path: string) => {
  const preferencePath = join(path, '/Default/Preferences');
  if (existsSync(preferencePath)) {
    const fsContent = await fsreadFile(preferencePath);
    const pConfig = JSON.parse(fsContent);
    pConfig['profile']['exit_type'] = 'Normal';
    await fswriteFile(preferencePath, JSON.stringify(pConfig));
  }
};
