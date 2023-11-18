import { message } from "antd";

async function FetchData(path: string, params: any) {
  try {
    console.log("API: " + path);
    const result = await window.SSAPI[path](params);
    return result;
  } catch (e: any) {
    message.error(e.message);
  }
}

export const getGlobalSetting = async (params: any) => {
  return FetchData("getGlobalSetting", params);
};
export const setGlobalSetting = async (params: any) => {
  return FetchData("setGlobalSetting", params);
};
export const getTaskList = async (params: any) => {
  return FetchData("getTaskList", params);
};
export const getTaskDataDetail = async (params: any) => {
  return FetchData("getTaskDataDetail", params);
};
export const addTask = async (params: any) => {
  return FetchData("addTask", params);
};
export const updateTask = async (params: any) => {
  return FetchData("updateTask", params);
};
export const deleteTask = async (params: any) => {
  return FetchData("deleteTask", params);
};
export const getTaskConfigDetail = async (params: any) => {
  return FetchData("getTaskConfigDetail", params);
};
export const updateTaskMockData = async (params: any) => {
  return FetchData("updateTaskMockData", params);
};

export const getRecentLogs = async () => {
  return FetchData("getRecentLogs", {});
};

export const startSetting = async (params: any) => {
  return FetchData("startSetting", params);
};
export const startPlay = async (params: any) => {
  return FetchData("startplay", params);
};
export const debugPlay = async (params: any) => {
  return FetchData("debugPlay", params);
};
export const selectDir = async (params: any) => {
  return FetchData("selectDir", params);
};
export const selectFile = async (params: any) => {
  return FetchData("selectFile", params);
};
export const closeApp = async (params: any) => {
  return FetchData("closeApp", params);
};
export const minimizeWindow = async (params: any) => {
  return FetchData("minimizeWindow", params);
};
export const maxWindow = async (params: any) => {
  return FetchData("maxWindow", params);
};
export const getDataDistInfo = async (params: any) => {
  return FetchData("getDataDistInfo", params);
};
export const unMaxWindow = async (params: any) => {
  return FetchData("unMaxWindow", params);
};
export const deleteTaskDataDb = async (params: any) => {
  return FetchData("deleteTaskDataDb", params);
};
