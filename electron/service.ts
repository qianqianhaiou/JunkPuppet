import { fork } from "child_process";
import path, { join } from "node:path";
import { fswriteFile, fsreadFile, deleteFile, deleteDir } from "./file";
import { BrowserWindow, dialog } from "electron";
import { getDiskDetail, relaunchElectron } from "./util";
import { taskDataDb, taskListDb } from "./db";
import crypto from "crypto";
import { readLogByLine } from "./logger";

// 新增任务
export const addTask = async (params: any) => {
  const database = await taskListDb();
  if (database.chain.get("list").find({ name: params.name }).value()) {
    throw new Error("名称重复");
  }
  const datanow = Date.now();
  const uid = crypto.randomUUID();
  database.chain
    .get("list")
    .unshift({
      ...params,
      _id: uid,
      createdAt: datanow,
      updatedAt: datanow,
    })
    .value();
  database.chain.set("updatedAt", datanow).value();
  await database.write();
  return "ok";
};
// 编辑任务
export const updateTask = async (params: any) => {
  const database = await taskListDb();
  if (!params._id) {
    throw new Error("缺少任务ID");
  }
  const datanow = Date.now();
  database.chain
    .get("list")
    .find({ _id: params._id })
    .assign({
      ...params,
      updatedAt: datanow,
    })
    .value();
  database.chain.set("updatedAt", datanow).value();
  await database.write();
  return "ok";
};
// 删除任务
export const deleteTask = async (params: any) => {
  const database = await taskListDb();
  if (!params._id) {
    throw new Error("缺少任务ID");
  }
  // 删除定时任务
  const cron = global.cronList.get(params._id);
  if (cron) {
    cron.stop();
    global.cronList.delete(params._id);
  }
  const target = database.chain.get("list").find({ _id: params._id }).value();
  if (target.mockDataId) {
    // 删除截图文件夹
    await deleteDir(join(process.env.DATA_PATH_SNAPSHOT, params._id));
    // 删除JSON文件
    await deleteFile(
      join(process.env.DATA_PATH_JSON, `${target.mockDataId}.json`)
    );
    // 删除任务数据
    await deleteTaskDataDb({ taskId: params._id });
  }
  const datanow = Date.now();
  database.chain.get("list").remove({ _id: params._id }).value();
  database.chain.set("updatedAt", datanow).value();
  await database.write();
  return "ok";
};
// 获取任务列表
export const getTaskList = async (params: any) => {
  const database = await taskListDb();
  let result = null;
  if (params?.text) {
    result = database.chain
      .get("list")
      .filter((item) => item.name.includes(params.text))
      .value();
  } else {
    result = database.chain.get("list").value();
  }
  return result;
};
// 获取任务配置详情
export const getTaskConfigDetail = async (params: any) => {
  const database = await taskListDb();
  const result: any = database.chain
    .get("list")
    .find({ _id: params._id })
    .value();
  if (result.mockDataId) {
    const mockData = await fsreadFile(
      join(process.env.DATA_PATH_JSON, `${result.mockDataId}.json`)
    );
    return {
      ...result,
      mockData: mockData.replaceAll("\\", ""),
    };
  }
  return result;
};
// 修改模拟数据Json文件
export const updateTaskMockData = async (params: any) => {
  const fileName = `${params.uid}.json`;
  await fswriteFile(join(process.env.DATA_PATH_JSON, fileName), params.data);
  const database = await taskListDb();
  database.chain.set("updatedAt", Date.now()).value();
  await database.write();
  return "ok";
};
// 获取任务数据详情
export const getTaskDataDetail = async (params: any) => {
  const database = await taskDataDb();
  const result = database.chain
    .get("list")
    .filter({ taskId: params._id })
    .value();
  return result;
};

// 删除任务所产生的数据
export const deleteTaskDataDb = async (params: any) => {
  const datanow = Date.now();
  const database = await taskDataDb();
  database.chain
    .get("list")
    .remove({
      taskId: params.taskId,
    })
    .value();
  database.chain.set("updatedAt", datanow).value();
  await database.write();
  return true;
};

// 开始设置模拟数据
export const startSetting = async (params: any) => {
  try {
    const ChildProcess = fork(`${process.env.SCRIPTS_PATH}/setting.js`);
    ChildProcess.send({
      type: "StartSetting",
      params: {
        targetUrl: params.targetUrl,
        chromePath: process.env.CHROME_PATH,
        headless: false,
        chromeDataPath: process.env.DATA_PATH_CHROME_DATA,
      },
    });
    return new Promise((resolve, reject) => {
      ChildProcess.on("message", async (msg: string) => {
        if (msg === "close") {
          ChildProcess.kill();
          return;
        }
        const data = JSON.stringify(msg);
        const uid = params?.mockDataId || crypto.randomUUID();
        const fileName = `${uid}.json`;
        await fswriteFile(join(process.env.DATA_PATH_JSON, fileName), data);
        const datanow = Date.now();
        const database = await taskListDb();
        database.chain
          .get("list")
          .find({ _id: params._id })
          .assign({
            mockDataId: uid,
            updatedAt: datanow,
          })
          .value();
        database.chain.set("updatedAt", datanow).value();
        await database.write();

        resolve(fileName);
      });
      ChildProcess.on("error", function (code) {
        reject("exit error code: " + code);
      });
      ChildProcess.on("close", function (code) {
        resolve("exit close code: " + code);
      });
    });
  } catch (error: any) {
    console.log(`setter start error：${error.message}`);
  }
};
// 调试任务操作运行，放慢速度，可视化
export const startDebugServer = async (params: any) => {
  try {
    const ChildProcess = fork(`${process.env.SCRIPTS_PATH}/runner.js`);
    const data = await fsreadFile(
      join(process.env.DATA_PATH_JSON, `${params.mockDataId}.json`)
    );
    ChildProcess.send({
      type: "StartRunning",
      params: {
        targetUrl: params.targetUrl,
        parent: join(process.env.DATA_PATH_SNAPSHOT, params._id),
        cookies: [
          // {
          //   cookieName: "TrainingPlatform-sid",
          //   cookieValue:
          //     "s%3Aw9ATIUmSWzAU2q_hgkQXe2S2RJxGWx8m.kj4nh94Eo7wdjuVq6zDhApsLKFoIMKLHWzu3cyeK7wU",
          // },
        ],
        chromePath: process.env.CHROME_PATH,
        headless: false,
        slowMo: 100,
        chromeDataPath: process.env.DATA_PATH_CHROME_DATA,
        data: data,
      },
    });
    return new Promise((resolve, reject) => {
      ChildProcess.on("message", async (msg: any) => {
        if (msg.type === "result") {
          const database = await taskDataDb();
          const datanow = Date.now();
          const uid = crypto.randomUUID();
          database.chain
            .get("list")
            .unshift({
              ...msg.data,
              taskId: params._id,
              taskMockId: params.mockDataId,
              _id: uid,
              createdAt: datanow,
            })
            .value();
          database.chain.set("updatedAt", datanow).value();
          await database.write();
          resolve("sucess");
        } else if (msg.type === "log") {
          console.log(JSON.stringify(msg.data));
        }
      });
      ChildProcess.on("error", function (code) {
        reject("exit error code: " + code);
      });
      ChildProcess.on("close", function (code) {
        resolve("exit close code: " + code);
      });
    });
  } catch (error: any) {
    console.log(`runner start error：${error.message}`);
  }
};
// 开始模拟操作运行
export const startplayServer = async (params: any) => {
  try {
    const ChildProcess = fork(`${process.env.SCRIPTS_PATH}/runner.js`);
    const data = await fsreadFile(
      join(process.env.DATA_PATH_JSON, `${params.mockDataId}.json`)
    );
    console.log(params.name + " - 任务开始");
    ChildProcess.send({
      type: "StartRunning",
      params: {
        targetUrl: params.targetUrl,
        parent: join(process.env.DATA_PATH_SNAPSHOT, params._id),
        cookies: [
          // {
          //   cookieName: "TrainingPlatform-sid",
          //   cookieValue:
          //     "s%3Aw9ATIUmSWzAU2q_hgkQXe2S2RJxGWx8m.kj4nh94Eo7wdjuVq6zDhApsLKFoIMKLHWzu3cyeK7wU",
          // },
        ],
        chromePath: process.env.CHROME_PATH,
        headless: true,
        chromeDataPath: process.env.DATA_PATH_CHROME_DATA,
        data: data,
      },
    });
    return new Promise((resolve, reject) => {
      ChildProcess.on("message", async (msg: any) => {
        if (msg.type === "result") {
          const database = await taskDataDb();
          const datanow = Date.now();
          const uid = crypto.randomUUID();
          database.chain
            .get("list")
            .unshift({
              ...msg.data,
              taskId: params._id,
              taskMockId: params.mockDataId,
              _id: uid,
              createdAt: datanow,
            })
            .value();
          database.chain.set("updatedAt", datanow).value();
          await database.write();
          resolve("sucess");
        } else if (msg.type === "log") {
          console.log("task: " + JSON.stringify(msg.data));
        }
      });
      ChildProcess.on("error", function (code) {
        reject("exit error code: " + code);
      });
      ChildProcess.on("close", function (code) {
        resolve("exit close code: " + code);
      });
    });
  } catch (error: any) {
    console.log(`runner start error：${error.message}`);
  }
};

// 读取最近的几条日志
export const getLogByLine = async () => {
  return readLogByLine(join(process.env.DATA_PATH_LOG, "system.log"));
};

// 选择一个文件夹
export const selectDir = async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (result.canceled) {
    return "";
  } else {
    return result.filePaths[0];
  }
};
// 选择一个文件
export const selectFile = async () => {
  const result = await dialog.showOpenDialog({ properties: ["openFile"] });
  if (result.canceled) {
    return "";
  } else {
    return result.filePaths[0];
  }
};

// 获取数据盘信息
export const getDataDistInfo = async () => {
  return getDiskDetail();
};
// 设置全局设置
export const setGobalSetting = async (params: any) => {
  const target: any = {};
  Object.entries(params).map((item: any) => {
    target[item[0].toUpperCase()] = item[1];
  });
  target["DATA_PATH_SNAPSHOT"] = join(target["DATA_PATH"], "Snapshots");
  target["DATA_PATH_JSON"] = join(target["DATA_PATH"], "JSON");
  target["DATA_PATH_DB"] = join(target["DATA_PATH"], "Database");
  target["DATA_PATH_CHROME_DATA"] = join(
    target["DATA_PATH"],
    "ChromeData",
    "Default"
  );
  target["DATA_PATH_LOG"] = join(target["DATA_PATH"], "Logs");
  await fswriteFile(
    process.env.GLOBAL_SETTING_CONFIG_PATH,
    JSON.stringify(target)
  );
  relaunchElectron();
};
// 获取全局设置
export const getGlobalSetting = async () => {
  if (process.env.IS_SET === "set") {
    return await fsreadFile(process.env.GLOBAL_SETTING_CONFIG_PATH);
  }
  return null;
};
// 最小化窗口
export const minimizeWindow = () => {
  const reuslt = BrowserWindow.getAllWindows();
  reuslt.length && reuslt[0].minimize();
};
// 最大化窗口
export const maxWindow = () => {
  const reuslt = BrowserWindow.getAllWindows();
  reuslt.length && reuslt[0].maximize();
};
// 取消最大化窗口
export const unmaxWindow = () => {
  const reuslt = BrowserWindow.getAllWindows();
  reuslt.length && reuslt[0].unmaximize();
};

// 隐藏electron应用程序
export const closeApp = async () => {
  const reuslt = BrowserWindow.getAllWindows();
  reuslt.length && reuslt[0].hide();
};
