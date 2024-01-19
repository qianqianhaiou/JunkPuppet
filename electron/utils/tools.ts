import { existsSync } from 'fs';

// 判断全局设置文件是否存在
export const hasGlobalSetting = () => {
  return existsSync(process.env.GLOBAL_SETTING_CONFIG_PATH);
};
// 转换时间
export const tranlateDate = (date: any) => {
  let data = new Date(date);
  return (
    data.getFullYear() +
    '-' +
    String(data.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(data.getDate()).padStart(2, '0') +
    'T' +
    String(data.getHours()).padStart(2, '0') +
    ':' +
    String(data.getMinutes()).padStart(2, '0') +
    ':' +
    String(data.getSeconds()).padStart(2, '0')
  );
};
