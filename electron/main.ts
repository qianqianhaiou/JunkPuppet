import { app, BrowserWindow, Menu, Tray } from "electron";
import { join } from "node:path";
import {
  initEnv,
  initDirectory,
  initGlobalSetting,
  initFiles,
  initCronScripts,
} from "./init";
import { initRoutes } from "./routes";

function createWindow() {
  const iconPath = join(process.env.VITE_PUBLIC, "robot.png");
  const win: BrowserWindow | null = new BrowserWindow({
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
      webSecurity: false,
    },
    width: 1200,
    height: 800,
    titleBarStyle: "hidden",
  });
  win.webContents.openDevTools();
  if (process.env["VITE_DEV_SERVER_URL"]) {
    win.loadURL(process.env["VITE_DEV_SERVER_URL"]);
  } else {
    win.loadFile(join(process.env.DIST, "index.html"));
  }
  const appTray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "JunkPuppet",
      click: function () {
        win.show();
      },
    },
    {
      label: "Exit",
      click: function () {
        app.quit();
      },
    },
  ]);
  appTray.on("double-click", () => {
    win.show();
  });
  appTray.setToolTip("拾荒木偶");
  appTray.setContextMenu(contextMenu);
}
app.whenReady().then(async () => {
  // 初始化环境变量
  await initEnv();
  // 初始化全局设置
  await initGlobalSetting();
  if (process.env.IS_SET !== "noset") {
    // 初始化数据文件夹
    await initDirectory();
    // 初始化文件
    await initFiles();
    // 初始化定时任务
    await initCronScripts();
  }
  // 初始化通信路由
  initRoutes();

  createWindow();
  app.on("activate", () => {
    // 在 macOS 系统内, 如果没有已开启的应用窗口
    // 点击托盘图标时通常会重新创建一个新窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
