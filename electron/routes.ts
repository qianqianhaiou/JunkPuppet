import { ipcMain } from "electron";
import {
  startplayServer,
  getGlobalSetting,
  closeApp,
  minimizeWindow,
  selectDir,
  setGobalSetting,
  selectFile,
  addTask,
  updateTask,
  getTaskList,
  deleteTask,
  startSetting,
  getTaskConfigDetail,
  updateTaskMockData,
  getTaskDataDetail,
  startDebugServer,
  maxWindow,
  unmaxWindow,
  getDataDistInfo,
  deleteTaskDataDb,
  getLogByLine,
  getTaskTypes,
} from "./service";

export interface Route {
  path: string;
  callBack: (
    event: Electron.IpcMainInvokeEvent,
    ...args: any[]
  ) => Promise<any>;
}
const handlegetTaskList: Route["callBack"] = async (event, arg) => {
  return getTaskList(arg);
};
const handlegetTaskTypesList: Route["callBack"] = async (event, arg) => {
  return getTaskTypes(arg);
};

const handleGetTaskDataDetail: Route["callBack"] = async (event, arg) => {
  return getTaskDataDetail(arg);
};
const handleAddTask: Route["callBack"] = async (event, arg) => {
  return addTask(arg);
};
const handleUpdateTask: Route["callBack"] = async (event, arg) => {
  return updateTask(arg);
};
const handleDeleteTask: Route["callBack"] = async (event, arg) => {
  return deleteTask(arg);
};
const handleGetTaskConfigDetail: Route["callBack"] = async (event, arg) => {
  return getTaskConfigDetail(arg);
};
const handleUpdateTaskMockData: Route["callBack"] = async (event, arg) => {
  return updateTaskMockData(arg);
};

const handleStartSetting: Route["callBack"] = async (event, arg) => {
  return startSetting(arg);
};
const handleStartplayServer: Route["callBack"] = async (event, arg) => {
  return startplayServer(arg);
};
const handleStartDebugServer: Route["callBack"] = async (event, arg) => {
  return startDebugServer(arg);
};
const handleSetGlobalSetting: Route["callBack"] = async (event, arg) => {
  return setGobalSetting(arg);
};
const handleGetGlobalSetting: Route["callBack"] = async (event, arg) => {
  return getGlobalSetting();
};
const handleSelectDir: Route["callBack"] = async (event, arg) => {
  return selectDir();
};
const handleSelectFile: Route["callBack"] = async (event, arg) => {
  return selectFile();
};
const handleMinimizeWindow: Route["callBack"] = async (event, arg) => {
  return minimizeWindow();
};
const handleMaxWindow: Route["callBack"] = async (event, arg) => {
  return maxWindow();
};
const handleUnMaxWindow: Route["callBack"] = async (event, arg) => {
  return unmaxWindow();
};
const handleGetDataDistInfo: Route["callBack"] = async (event, arg) => {
  return getDataDistInfo();
};
const handleGetLogsByLine: Route["callBack"] = async (event, arg) => {
  return getLogByLine();
};
const handleCloseApp: Route["callBack"] = async (event, arg) => {
  return closeApp();
};
const handleDeleteTaskDataDb: Route["callBack"] = async (event, arg) => {
  return deleteTaskDataDb(arg);
};

export const routes: Route[] = [
  {
    path: "addTask",
    callBack: handleAddTask,
  },
  {
    path: "updateTask",
    callBack: handleUpdateTask,
  },
  {
    path: "deleteTask",
    callBack: handleDeleteTask,
  },
  {
    path: "getTaskList",
    callBack: handlegetTaskList,
  },
  {
    path: "getTaskTypes",
    callBack: handlegetTaskTypesList,
  },
  {
    path: "getTaskDataDetail",
    callBack: handleGetTaskDataDetail,
  },
  {
    path: "getTaskConfigDetail",
    callBack: handleGetTaskConfigDetail,
  },
  {
    path: "updateTaskMockData",
    callBack: handleUpdateTaskMockData,
  },
  {
    path: "startSetting",
    callBack: handleStartSetting,
  },
  {
    path: "startplay",
    callBack: handleStartplayServer,
  },
  {
    path: "debugPlay",
    callBack: handleStartDebugServer,
  },
  {
    path: "setGlobalSetting",
    callBack: handleSetGlobalSetting,
  },
  {
    path: "getGlobalSetting",
    callBack: handleGetGlobalSetting,
  },
  {
    path: "selectFile",
    callBack: handleSelectFile,
  },
  {
    path: "selectDir",
    callBack: handleSelectDir,
  },
  {
    path: "minimizeWindow",
    callBack: handleMinimizeWindow,
  },
  {
    path: "maxWindow",
    callBack: handleMaxWindow,
  },
  {
    path: "unMaxWindow",
    callBack: handleUnMaxWindow,
  },
  {
    path: "getDataDistInfo",
    callBack: handleGetDataDistInfo,
  },
  {
    path: "getRecentLogs",
    callBack: handleGetLogsByLine,
  },
  {
    path: "closeApp",
    callBack: handleCloseApp,
  },
  {
    path: "deleteTaskDataDb",
    callBack: handleDeleteTaskDataDb,
  },
];

export const initRoutes = () => {
  routes.map((route) => {
    ipcMain.handle(route.path, route.callBack);
  });
};
