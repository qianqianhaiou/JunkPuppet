import { app } from "electron";
import { existsSync } from "fs";
import os from "os";
import diskinfo from "diskinfo";

// 获取全局设置文件
export const hasGlobalSetting = () => {
  return existsSync(process.env.GLOBAL_SETTING_CONFIG_PATH);
};
// 重启electron应用程序
export const relaunchElectron = () => {
  app.relaunch();
  app.exit();
};
// 获取系统磁盘
export async function getDiskDetail() {
  return new Promise((res, rej) => {
    let MOUNTED = "";
    if (os.type() === "Windows_NT") {
      MOUNTED = process.env.DATA_PATH.slice(0, 2).toLowerCase();
    } else if (os.type() === "Linux") {
      MOUNTED = "/";
    } else {
      rej("未知系统");
    }
    diskinfo.getDrives(function (err: any, aDrives: any) {
      if (err) rej(err);
      const data = aDrives.filter(
        (item: any) => item.mounted.toLowerCase() === MOUNTED
      )[0];
      delete data.filesystem;
      data.system = os.type();
      res(data);
    });
  });
}
// 转换时间
export const tranlateDate = (date: any) => {
  let data = new Date(date);
  return (
    data.getFullYear() +
    "-" +
    String(data.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(data.getDate()).padStart(2, "0") +
    "T" +
    String(data.getHours()).padStart(2, "0") +
    ":" +
    String(data.getMinutes()).padStart(2, "0") +
    ":" +
    String(data.getSeconds()).padStart(2, "0")
  );
};
