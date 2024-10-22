import { app, BrowserWindow, Menu, Tray, Notification } from 'electron';
import { join } from 'node:path';
import log4js from 'log4js';
import {
  initEnv,
  initDirectory,
  initGlobalSetting,
  initFiles,
  initCronScripts,
  initBrowserInstance,
} from './utils/init';
import { initRoutes } from './routers';
import { initLogger } from './service/logger';
import { tranlateDate } from './utils/tools';
import axios from 'axios';

function createWindow() {
  const iconPath = join(process.env.VITE_PUBLIC, 'robot.png');
  const win: BrowserWindow | null = new BrowserWindow({
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: false,
    },
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
  });
  // Electron窗口单例
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', () => {
      if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
        win.show();
      }
    });
  }
  // load 前端
  if (!app.isPackaged) {
    win.loadURL('http://localhost:7777');
  } else {
    win.loadFile(join(process.env.DIST, 'index.html'));
  }
  // init Menu
  const appTray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'JunkPuppet',
      click: function () {
        win.show();
      },
    },
    {
      label: 'relaunch',
      click: function () {
        app.relaunch();
        app.exit();
      },
    },
    {
      label: 'devtools',
      click: function () {
        win.webContents.toggleDevTools();
      },
    },
    {
      label: 'Exit',
      click: function () {
        app.quit();
      },
    },
  ]);
  appTray.on('double-click', () => {
    win.show();
  });
  appTray.setToolTip('拾荒木偶');
  appTray.setContextMenu(contextMenu);
  return win;
}
app.setAppUserModelId('JunkPuppet-拾荒木偶');
app
  .whenReady()
  .then(async () => {
    let logger: log4js.Logger | null = null;
    // 初始化环境变量
    await initEnv();
    // 初始化全局设置
    await initGlobalSetting();
    if (process.env.IS_SET !== 'noset') {
      // 初始化数据文件夹
      await initDirectory();
      // 初始化文件
      await initFiles();
      // 初始化日志记录
      logger = await initLogger(join(process.env.DATA_PATH_LOG, 'system.log'));
      // 初始化browser实例
      await initBrowserInstance();
      // 初始化定时任务
      await initCronScripts();
    }
    // 初始化通信路由
    initRoutes();

    const win = createWindow();
    // 建立日志通道
    if (logger) {
      let loggerCount = 0;
      console.log = (...data) => {
        loggerCount++;
        const string = data.join(' ');
        logger!.info(string);
        const time = tranlateDate(Date.now());
        win.webContents.send('onLog', {
          time: `[${time}]`,
          type: '[INFO]',
          message: ` system - ${string}`,
          index: 'realtime-' + loggerCount,
        });
      };
      console.warn = (...data) => {
        loggerCount++;
        const string = data.join(' ');
        logger!.warn(string);
        const time = tranlateDate(Date.now());
        win.webContents.send('onLog', {
          time: `[${time}]`,
          type: '[WARN]',
          message: ` system - ${string}`,
          index: 'realtime-' + loggerCount,
        });
      };
      console.error = (...data) => {
        loggerCount++;
        const string = data.join(' ');
        logger!.error(string);
        const time = tranlateDate(Date.now());
        win.webContents.send('onLog', {
          time: `[${time}]`,
          type: '[ERROR]',
          message: ` system - ${string}`,
          index: 'realtime-' + loggerCount,
        });
      };
    }
    app.on('activate', () => {
      // 在 macOS 系统内, 如果没有已开启的应用窗口
      // 点击托盘图标时通常会重新创建一个新窗口
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  })
  .catch((e) => {
    console.log(e);
    new Notification({ body: e }).show();
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
