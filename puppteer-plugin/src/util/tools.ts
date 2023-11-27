import { readFile, writeFile } from "fs";
import { join } from "path";

export const asyncFor = <T = any>(
  items: T[],
  fn: (item: T, i: number) => Promise<any>,
  limit = 1
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

export const getCurrentTime = (seconds?: number) => {
  let date = new Date(seconds || Date.now());
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0") +
    " " +
    String(date.getHours()).padStart(2, "0") +
    "-" +
    String(date.getMinutes()).padStart(2, "0") +
    "-" +
    String(date.getSeconds()).padStart(2, "0")
  );
};

export async function cb2Async(fn: Function, ...params: any[]) {
  return new Promise<any>((resolve, reject) => {
    fn(...params, (err: any, result: any) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

export const fsreadFile = (path: string): Promise<string> => {
  return new Promise((res, rej) => {
    readFile(path, { encoding: "utf8" }, (err, data) => {
      if (err) rej(err);
      res(data);
    });
  });
};

export const fswriteFile = (
  path: string,
  data: string | NodeJS.ArrayBufferView
) => {
  return new Promise((res, rej) => {
    writeFile(path, data, { encoding: "utf8" }, (err) => {
      if (err) rej(err);
      res("");
    });
  });
};

/**
 * 当"Protocol error (Input.emulateTouchFromMouseEvent): Target closed" 时，可能是因为浏览器不正常关闭导致的，可以删掉userDataDir 用户数据即可解决
 * 
 * 也可以不删掉userDataDir 可以更改 userDataDir\default\Preferences   Preferences: 'Normal' 然后只读
 */
export const clearUserDataDirExitType = async (path: string) => {
  const preferencePath = join(path, '/Default/Preferences')
  const fsContent = await fsreadFile(preferencePath)
  const pConfig = JSON.parse(fsContent)
  pConfig['profile']['exit_type'] = 'Normal'
  await fswriteFile(preferencePath, JSON.stringify(pConfig))
}
