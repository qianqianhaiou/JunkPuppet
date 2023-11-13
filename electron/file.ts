import { readFile, writeFile, existsSync, mkdir, stat } from "fs";

export const fsreadFile = (path: string): Promise<string> => {
  return new Promise((res, rej) => {
    readFile(path, { encoding: "utf8" }, (err, data) => {
      if (err) rej(err);
      res(data);
    });
  });
};

export const fsCheckFile = (path: string): Promise<string> => {
  return new Promise((res, rej) => {
    if (existsSync(path)) {
      res("");
    } else {
      writeFile(path, "", { encoding: "utf8" }, (err) => {
        if (err) rej(err);
        res("");
      });
    }
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

async function cb2Async(fn: Function, ...params: any[]) {
  return new Promise<any>((resolve, reject) => {
    fn(...params, (err: any, result: any) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

export async function initDir(path: string) {
  async function createSourceDir(dirPath: string) {
    if (!existsSync(dirPath)) {
      await cb2Async(mkdir, dirPath, { recursive: true});
    }
  }
  await createSourceDir(path);
}
