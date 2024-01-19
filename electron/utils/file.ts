import {
  readFile,
  writeFile,
  existsSync,
  mkdir,
  stat,
  readdir,
  unlink,
  rmdir,
  createReadStream,
  statSync,
  appendFile,
} from 'fs';
import { join } from 'path';
import { once } from 'events';
import { createInterface } from 'readline';
import { EOL } from 'os';

// 读文件
export const fsreadFile = (path: string): Promise<string> => {
  return new Promise((res, rej) => {
    readFile(path, { encoding: 'utf8' }, (err, data) => {
      if (err) rej(err);
      res(data);
    });
  });
};

// 检查文件，如果没有则会创建一个
export const fsCheckFile = (path: string): Promise<string> => {
  return new Promise((res, rej) => {
    if (existsSync(path)) {
      res('');
    } else {
      writeFile(path, '', { encoding: 'utf8' }, (err) => {
        if (err) rej(err);
        res('');
      });
    }
  });
};

// 写文件
export const fswriteFile = (path: string, data: string | NodeJS.ArrayBufferView) => {
  return new Promise((res, rej) => {
    writeFile(path, data, { encoding: 'utf8' }, (err) => {
      if (err) rej(err);
      res('');
    });
  });
};

async function cb2Async(fn: Function, ...params: any[]) {
  return new Promise<any>((resolve, reject) => {
    fn(...params, (err: any, result: any) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// 初始化文件夹
export async function initDir(path: string) {
  async function createSourceDir(dirPath: string) {
    if (!existsSync(dirPath)) {
      await cb2Async(mkdir, dirPath, { recursive: true });
    }
  }
  await createSourceDir(path);
}

// 删除文件
export async function deleteFile(url: string) {
  await cb2Async(unlink, url);
}

// 删除文件夹
export async function deleteDir(url: string) {
  return new Promise(async (resolve, rejected) => {
    if (existsSync(url)) {
      //判断给定的路径是否存在
      const files = await cb2Async(readdir, url);
      await Promise.all(
        files.map(async function (file: any) {
          const curPath = join(url, file);
          const fielStat = await cb2Async(stat, curPath);
          if (fielStat.isDirectory()) {
            await deleteDir(curPath);
          } else {
            await cb2Async(unlink, curPath);
          }
        }),
      );
      await cb2Async(rmdir, url);
      resolve(true);
    } else {
      resolve('路径不存在');
    }
  });
}

// 逐行读取文件
export async function readFileByLine(path: string, bufferSize = 1024 * 5) {
  const target: any = [];
  const rl = createInterface({
    input: createReadStream(path, {
      start: statSync(path).size - Math.min(statSync(path).size, bufferSize),
    }),
    crlfDelay: Infinity,
  });
  rl.on('line', (line: string) => {
    const timeType = line.match(/^(\[(.+)\])/g);
    if (timeType && timeType.length) {
      const tag = timeType[0].split(' ');
      const text = line.replace(timeType[0], '');
      target.push({
        time: tag[0],
        type: tag[1],
        message: text,
      });
    }
  });
  await once(rl, 'close');
  return target;
}

// 向文件末尾添加一行
export async function addToLine(path: string, text: string, log = 'info') {
  return new Promise((res, rej) => {
    const date = new Date().toISOString();
    appendFile(path, `[${date}] [${log.toUpperCase()}] ${text}${EOL}`, (err: any) => {
      if (err) rej(err);
      res(text);
    });
  });
}

// 读文件夹下所有文件名
export async function readDir(url: string): Promise<string[]> {
  return await cb2Async(readdir, url);
}
