import { join } from 'node:path';
import { fswriteFile, fsreadFile } from '../utils/file';
import { relaunchElectron } from './electron';
import { type } from 'os';
import { getDrives } from 'diskinfo';
import { existsSync } from 'fs';
import axios from 'axios';
import { app, shell } from 'electron';
import { fork } from 'node:child_process';
import { sortBy } from 'lodash';

// 设置全局设置
export const setGlobalSetting = async (params: any) => {
  const target: any = {};
  Object.entries(params).map((item: any) => {
    target[item[0].toUpperCase()] = item[1];
  });
  target['DATA_PATH_SNAPSHOT'] = join(target['DATA_PATH'], 'Snapshots');
  target['DATA_PATH_JSON'] = join(target['DATA_PATH'], 'JSON');
  target['DATA_PATH_DB'] = join(target['DATA_PATH'], 'Database');
  target['DATA_PATH_CHROME_DATA'] = join(target['DATA_PATH'], 'ChromeData', 'Default');
  target['DATA_PATH_LOG'] = join(target['DATA_PATH'], 'Logs');
  await fswriteFile(process.env.GLOBAL_SETTING_CONFIG_PATH, JSON.stringify(target));
  relaunchElectron();
};
// 获取全局设置
export const getGlobalSetting = async () => {
  if (process.env.IS_SET === 'set') {
    return await fsreadFile(process.env.GLOBAL_SETTING_CONFIG_PATH);
  }
  return null;
};

// 获取数据盘信息
export const getDataDistInfo = async () => {
  return new Promise((res, rej) => {
    let MOUNTED = '';
    if (type() === 'Windows_NT') {
      MOUNTED = process.env.DATA_PATH.slice(0, 2).toLowerCase();
    } else if (type() === 'Linux') {
      MOUNTED = '/';
    } else {
      rej('未知系统');
    }
    getDrives(function (err: any, aDrives: any) {
      if (err) rej(err);
      const data = aDrives.filter((item: any) => item.mounted.toLowerCase() === MOUNTED)[0];
      delete data.filesystem;
      data.system = type();
      res(data);
    });
  });
};

//打开指定连接
export const openTargetUrl = async (url: string) => {
  shell.openExternal(url);
};
//打开Browser实例指定页面
export const openTargetPage = async (pageId: string) => {
  const { host } = new URL(global.wsEndpoint);
  shell.openExternal(`http://${host}/devtools/inspector.html?ws=${host}/devtools/page/${pageId}`);
};
// active指定tab
export const activeTargetPage = async (pageId: string) => {
  try {
    const ChildProcess = global.managerProcess;
    ChildProcess.send({
      type: 'activeTargetPage',
      params: {
        chromePath: process.env.CHROME_PATH,
        wsEndpoint: global.wsEndpoint,
        pageId,
      },
    });
    return new Promise((resolve, reject) => {
      ChildProcess.once('message', async (msg: any) => {
        if (msg.type === 'activeTargetPage') {
          resolve('sucess');
        }
      });
    });
  } catch (e) {}
};
// 关闭指定页面
export const closeTargetPage = async (pageId: string) => {
  try {
    const ChildProcess = global.managerProcess;
    ChildProcess.send({
      type: 'closeTargetPage',
      params: {
        chromePath: process.env.CHROME_PATH,
        wsEndpoint: global.wsEndpoint,
        pageId,
      },
    });
    return new Promise((resolve, reject) => {
      ChildProcess.once('message', async (msg: any) => {
        if (msg.type === 'closeTargetPage') {
          resolve('sucess');
        }
      });
    });
  } catch (e) {}
};

// 获取browser实例信息
export const getBrowserInstanceInfo = async () => {
  const { host } = new URL(global.wsEndpoint);
  const result = await axios.get(`http://${host}/json`);
  return sortBy(result.data, (item) => item.id);
};

// 自动检测chrome/edge位置
export const searchChromePath = async () => {
  const defaultChromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const defaultEdgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const paths = [defaultChromePath, defaultEdgePath];
  return new Promise((res, rej) => {
    for (const item of paths) {
      if (existsSync(item)) {
        res(item);
        return true;
      }
    }
    res(null);
  });
};

export const quitApplication = () => {
  globalThis?.setterProcess?.kill();
  globalThis?.managerProcess?.kill();
  app.quit();
};
