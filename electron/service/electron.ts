import { app, BrowserWindow, dialog } from 'electron';

// 选择一个文件夹
export const selectDir = async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled) {
    return '';
  } else {
    return result.filePaths[0];
  }
};
// 选择一个文件
export const selectFile = async () => {
  const result = await dialog.showOpenDialog({ properties: ['openFile'] });
  if (result.canceled) {
    return '';
  } else {
    return result.filePaths[0];
  }
};
// 最小化窗口
export const minimizeWindow = async () => {
  const reuslt = BrowserWindow.getAllWindows();
  reuslt.length && reuslt[0].minimize();
};
// 最大化窗口
export const maxWindow = async () => {
  const reuslt = BrowserWindow.getAllWindows();
  reuslt.length && reuslt[0].maximize();
};
// 取消最大化窗口
export const unMaxWindow = async () => {
  const reuslt = BrowserWindow.getAllWindows();
  reuslt.length && reuslt[0].unmaximize();
};
// 隐藏electron应用程序
export const closeApp = async () => {
  const reuslt = BrowserWindow.getAllWindows();
  reuslt.length && reuslt[0].hide();
};
// 重启electron应用程序
export const relaunchElectron = async () => {
  app.relaunch();
  app.exit();
};
