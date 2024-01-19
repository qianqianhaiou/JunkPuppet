import { join } from 'node:path';
import { fswriteFile, fsreadFile } from '../utils/file';
import { relaunchElectron } from './electron';

// 设置全局设置
export const setGobalSetting = async (params: any) => {
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
