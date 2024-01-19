import { readFile, writeFile, existsSync, mkdir } from 'fs';
import { cb2Async } from './tools';

// 读文件
export const fsreadFile = (path: string): Promise<string> => {
  return new Promise((res, rej) => {
    readFile(path, { encoding: 'utf8' }, (err, data) => {
      if (err) rej(err);
      res(data);
    });
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

// 初始化文件夹
export async function initDir(path: string) {
  async function createSourceDir(dirPath: string) {
    if (!existsSync(dirPath)) {
      await cb2Async(mkdir, dirPath);
    }
  }
  await createSourceDir(path);
}
